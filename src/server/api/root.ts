import { interviewRouter } from "@/server/api/routers/interview";
import { profileRouter } from "@/server/api/routers/profile";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { messageRouter } from "@/server/api/routers/message";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  interview: interviewRouter,
  profile: profileRouter,
  message: messageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
