import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { user } from "@/server/db/schema";
import { auth } from "@/lib/auth";

export const profileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userProfile = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
      })
      .from(user)
      .where(eq(user.id, ctx.session.user.id))
      .limit(1);

    if (!userProfile[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found",
      });
    }

    return userProfile[0];
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        currentPassword: z.string().optional(),
        newPassword: z.string().min(8).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, currentPassword, newPassword } = input;
      let shouldRedirectToSignIn = false;

      // If updating password, use better-auth API
      if (newPassword && newPassword.trim() !== "") {
        if (!currentPassword || currentPassword.trim() === "") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Current password is required when setting a new password",
          });
        }

        try {
          await auth.api.changePassword({
            body: {
              newPassword,
              currentPassword,
              revokeOtherSessions: true,
            },
            headers: ctx.headers,
          });
          shouldRedirectToSignIn = true;
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Failed to change password. Please check your current password.",
          });
        }
      }

      // Update user profile
      const updateData: Partial<typeof user.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (name !== undefined) updateData.name = name;

      await ctx.db
        .update(user)
        .set(updateData)
        .where(eq(user.id, ctx.session.user.id));

      return { success: true, shouldRedirectToSignIn };
    }),
});
