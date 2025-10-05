import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { user } from "@/server/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const profileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const userProfile = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        api_key: user.api_key,
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

    // Remove the api_key property from the returned user profile object
    const { api_key, ...userProfileWithoutApiKey } = userProfile[0];

    const result = {
      ...userProfileWithoutApiKey,
      hasApiKey: api_key !== null && api_key !== "",
    };
    return result;
  }),

  getApiKey: protectedProcedure.query(async ({ ctx }) => {
    const userApiKey = await ctx.db
      .select({
        api_key: user.api_key,
      })
      .from(user)
      .where(eq(user.id, ctx.session.user.id))
      .limit(1);

    if (!userApiKey[0]) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      api_key: userApiKey[0].api_key,
    };
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
            headers: await headers(),
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

  updateApiKey: protectedProcedure
    .input(
      z.object({
        api_key: z.string().min(1, "API key is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { api_key } = input;

      // Update user's API key
      await ctx.db
        .update(user)
        .set({
          api_key,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.session.user.id));

      return { success: true };
    }),
});
