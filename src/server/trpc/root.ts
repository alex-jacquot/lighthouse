import { router } from '@/server/trpc/trpc';
import { postItRouter } from '@/server/trpc/routers/post-it';
import { postRouter } from '@/server/trpc/routers/post';

export const appRouter = router({
    postIt: postItRouter,
    post: postRouter,
});

export type AppRouter = typeof appRouter;
