import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { interviewSession, interviewResult } from "@/server/db/schema";
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
        id: z.uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(interviewSession)
        .where(eq(interviewSession.id, input.id));

      return result[0];
    }),

  saveInterviewResult: protectedProcedure
    .input(
      z.object({
        interviewSessionId: z.string().uuid(),
        accuracyScore: z.number().min(0).max(100),
        communicationScore: z.number().min(0).max(100),
        problemSolvingScore: z.number().min(0).max(100),
        consistencyScore: z.number().min(0).max(100),
        overallScore: z.number().min(0).max(100),
        performanceSummary: z.string(),
        verdict: z.enum(["excellent", "good", "average", "needs_improvement"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Check if result already exists
      const existing = await ctx.db
        .select()
        .from(interviewResult)
        .where(eq(interviewResult.interviewSessionId, input.interviewSessionId));

      if (existing.length > 0) {
        // Update existing result
        const updated = await ctx.db
          .update(interviewResult)
          .set({
            accuracyScore: input.accuracyScore,
            communicationScore: input.communicationScore,
            problemSolvingScore: input.problemSolvingScore,
            consistencyScore: input.consistencyScore,
            overallScore: input.overallScore,
            performanceSummary: input.performanceSummary,
            verdict: input.verdict,
            updatedAt: new Date(),
          })
          .where(eq(interviewResult.interviewSessionId, input.interviewSessionId))
          .returning();

        return updated[0];
      }

      // Insert new result
      const result = await ctx.db
        .insert(interviewResult)
        .values({
          interviewSessionId: input.interviewSessionId,
          accuracyScore: input.accuracyScore,
          communicationScore: input.communicationScore,
          problemSolvingScore: input.problemSolvingScore,
          consistencyScore: input.consistencyScore,
          overallScore: input.overallScore,
          performanceSummary: input.performanceSummary,
          verdict: input.verdict,
        })
        .returning();

      // Update interview session to mark as completed
      await ctx.db
        .update(interviewSession)
        .set({
          isCompleted: true,
          endedAt: new Date(),
        })
        .where(eq(interviewSession.id, input.interviewSessionId));

      return result[0];
    }),

  getInterviewResult: protectedProcedure
    .input(
      z.object({
        interviewSessionId: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select()
        .from(interviewResult)
        .where(eq(interviewResult.interviewSessionId, input.interviewSessionId));

      return result[0] ?? null;
    }),
});
