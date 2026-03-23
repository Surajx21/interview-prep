import { createTRPCRouter, protectedProcedure } from "../trpc";
import { messageSchema, type UIMessage } from "@/server/db/schema";
import { asc, eq, max } from "drizzle-orm";
import type { db as dbType } from "@/server/db";
import z from "zod/v4";

type Db = typeof dbType;

// Helper function to get the next sequence number for an interview session
async function getNextSequenceNumber(
  db: Db,
  interviewSessionId: string,
): Promise<number> {
  const [maxSequenceResult] = await db
    .select({ maxSeq: max(messageSchema.sequenceNumber) })
    .from(messageSchema)
    .where(eq(messageSchema.interviewSessionId, interviewSessionId));

  return (maxSequenceResult?.maxSeq ?? 0) + 1;
}

export const messageRouter = createTRPCRouter({
  getMessages: protectedProcedure
    .input(
      z.object({
        interviewSessionId: z.uuid(),
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
        interviewSessionId: z.uuid(),
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

      return { id: message.id, uiMessageId: input.uiMessage.id };
    }),
});
