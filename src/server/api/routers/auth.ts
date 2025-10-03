import { auth } from "@/lib/auth";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { APIError } from "better-auth";
import z from "zod/v4";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const response = await auth.api.signInEmail({
          body: {
            email: input.email,
            password: input.password,
          },
        });
        return response;
      } catch (error) {
        if (error instanceof APIError) {
          // Extract the detailed error message from Better Auth
          let errorMessage = 'Invalid email or password';
          
          // Better Auth APIError contains the message in the error.message property
          if (error.message) {
            errorMessage = error.message;
          }
          
          // If body contains additional error details, use them
          if (error.body && typeof error.body === 'object') {
            const body = error.body as Record<string, unknown>;
            if ('message' in body && typeof body.message === 'string') {
              errorMessage = body.message;
            }
          }

          throw new TRPCError({
            code: error.statusCode === 401 ? 'UNAUTHORIZED' : 'BAD_REQUEST',
            message: errorMessage,
          });
        }
        
        // Handle unexpected errors
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during login',
        });
      }
    }),
});
