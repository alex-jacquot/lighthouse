import { router } from '@/server/trpc/trpc';
import { postRouter } from '@/server/trpc/routers/post';
import { userRouter } from '@/server/trpc/routers/user';
import { commentRouter } from '@/server/trpc/routers/comment';

export const appRouter = router({
    post: postRouter,
    user: userRouter,
    comment: commentRouter,
});

export type AppRouter = typeof appRouter;
