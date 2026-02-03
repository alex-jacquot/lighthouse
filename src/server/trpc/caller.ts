import { createCallerFactory } from '@/server/trpc/trpc';
import { createTRPCContext } from '@/server/trpc/trpc';
import { appRouter } from '@/server/trpc/root';

const createCaller = createCallerFactory(appRouter);

export async function createServerCaller() {
    const ctx = await createTRPCContext();
    return createCaller(ctx);
}
