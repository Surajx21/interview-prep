import { createTRPCRouter, protectedProcedure } from "../trpc";
import { messageSchema, messagePartsSchema, type UIMessage } from "@/server/db/schema";
import { asc, eq, max } from "drizzle-orm";
import z from "zod/v4";

// Helper function to get the next sequence number for an interview session
async function getNextSequenceNumber(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  interviewSessionId: string
): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const [maxSequenceResult] = await db
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .select({ maxSeq: max(messageSchema.sequenceNumber) })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .from(messageSchema)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .where(eq(messageSchema.interviewSessionId, interviewSessionId));
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
  return (maxSequenceResult?.maxSeq ?? 0) + 1;
}

export const messageRouter = createTRPCRouter({
  getMessages: protectedProcedure
    .input(
      z.object({
        interviewSessionId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const messages = await ctx.db
        .select()
        .from(messageSchema)
        .where(eq(messageSchema.interviewSessionId, input.interviewSessionId))
        .orderBy(asc(messageSchema.sequenceNumber), asc(messageSchema.createdAt));
      
      // Convert database messages back to UIMessage format
      return messages.map((msg) => ({
        id: msg.uiMessageId,
        role: msg.role,
        parts: msg.parts as UIMessage['parts'],
        metadata: msg.metadata as UIMessage['metadata'],
      }));
    }),

  insertUIMessage: protectedProcedure
    .input(
      z.object({
        interviewSessionId: z.string(),
        uiMessage: z.object({
          id: z.string(),
          role: z.enum(["user", "assistant", "system"]),
          parts: z.array(z.object({
            type: z.enum(["text", "reasoning", "source-url", "image", "tool", "tool-result"]),
            text: z.string().optional(),
            url: z.string().optional(),
            metadata: z.record(z.string(), z.unknown()).optional(),
          })),
          metadata: z.record(z.string(), z.unknown()).optional(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Get the next sequence number for this interview session
      const nextSequenceNumber = await getNextSequenceNumber(ctx.db, input.interviewSessionId);

      // Insert the main message
      const [message] = await ctx.db
        .insert(messageSchema)
        .values({
          uiMessageId: input.uiMessage.id,
          interviewSessionId: input.interviewSessionId,
          role: input.uiMessage.role,
          parts: input.uiMessage.parts,
          metadata: input.uiMessage.metadata,
          sequenceNumber: nextSequenceNumber,
        })
        .returning({ id: messageSchema.id });

      if (!message) {
        throw new Error("Failed to insert message");
      }

      // Insert individual parts for better querying
      const messageParts = input.uiMessage.parts.map((part, index) => ({
        messageId: message.id,
        type: part.type,
        content: part.text ?? part.url ?? '',
        order: index,
        metadata: part.metadata,
      }));

      if (messageParts.length > 0) {
        await ctx.db.insert(messagePartsSchema).values(messageParts);
      }

      return { id: message.id, uiMessageId: input.uiMessage.id };
    }),

  // Legacy method for backward compatibility
  insertMessage: protectedProcedure
    .input(
      z.object({
        interviewSessionId: z.string(),
        content: z.string(),
        role: z.enum(["user", "assistant", "system"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Get the next sequence number for this interview session
      const nextSequenceNumber = await getNextSequenceNumber(ctx.db, input.interviewSessionId);
      const uiMessageId = `legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const [message] = await ctx.db
        .insert(messageSchema)
        .values({
          uiMessageId,
          interviewSessionId: input.interviewSessionId,
          role: input.role,
          parts: [{ type: "text", text: input.content }],
          metadata: null,
          sequenceNumber: nextSequenceNumber,
        })
        .returning({ id: messageSchema.id });

      if (!message) {
        throw new Error("Failed to insert message");
      }

      return { id: message.id, uiMessageId };
    }),
});
