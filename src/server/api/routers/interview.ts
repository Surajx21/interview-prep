import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { interviewSession } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import z from "zod/v4";

export const interviewRouter = createTRPCRouter({
  startInterview: protectedProcedure
    .input(
      z.object({
        difficulty: z.enum(["easy", "medium", "hard"]),
        type: z.enum(["technical", "hr", "aptitude"]),
        language: z.enum([
          "javascript",
          "python",
          "java",
          "cpp",
          "react",
          "nodejs",
          "sql",
          "system-design",
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db
        .insert(interviewSession)
        .values({
          difficulty: input.difficulty,
          language: input.language,
          type: input.type,
          userId: ctx.session.user.id,
        })
        .returning({ id: interviewSession.id });

      return {
        message: "Interview started successfully",
        sessionId: result[0]!.id,
      };
    }),

  getInterviewHistory: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select()
      .from(interviewSession)
      .where(eq(interviewSession.userId, ctx.session.user.id))
      .orderBy(desc(interviewSession.startedAt));

    return result;
  }),

  getInterviewSession: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(interviewSession)
        .where(eq(interviewSession.id, input.id));

      return result[0];
    }),
});
