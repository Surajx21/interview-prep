import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { interviewSession, interviewResult } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
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

      const session = result[0];

      if (!session) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Interview session not found" });
      }

      if (session.userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return session;
    }),

  saveInterviewResult: protectedProcedure
    .input(
      z.object({
        interviewSessionId: z.uuid(),
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
      return await ctx.db.transaction(async (tx) => {
        // Verify the session belongs to the authenticated user before saving
        const [ownedSession] = await tx
          .select({ id: interviewSession.id })
          .from(interviewSession)
          .where(eq(interviewSession.id, input.interviewSessionId));

        if (!ownedSession) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Interview session not found" });
        }

        // Check if result already exists
        const existing = await tx
          .select()
          .from(interviewResult)
          .where(eq(interviewResult.interviewSessionId, input.interviewSessionId));

        let savedResult;

        if (existing.length > 0) {
          // Update existing result
          const updated = await tx
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

          savedResult = updated[0];
        } else {
          // Insert new result
          const result = await tx
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

          savedResult = result[0];
        }

        // Atomically mark the session as completed
        await tx
          .update(interviewSession)
          .set({
            isCompleted: true,
            endedAt: new Date(),
          })
          .where(eq(interviewSession.id, input.interviewSessionId));

        return savedResult;
      });
    }),

  getInterviewResult: protectedProcedure
    .input(
      z.object({
        interviewSessionId: z.uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Join with interviewSession to enforce ownership
      const result = await ctx.db
        .select({ result: interviewResult, userId: interviewSession.userId })
        .from(interviewResult)
        .innerJoin(
          interviewSession,
          eq(interviewResult.interviewSessionId, interviewSession.id),
        )
        .where(eq(interviewResult.interviewSessionId, input.interviewSessionId));

      if (!result[0]) return null;

      if (result[0].userId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return result[0].result;
    }),
});
