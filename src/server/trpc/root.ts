import { router } from '@/server/trpc/trpc';
import { postItRouter } from '@/server/trpc/routers/post-it';

export const appRouter = router({
    postIt: postItRouter,
});

export type AppRouter = typeof appRouter;
