import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { prisma } from '@/server/db';

export const createTRPCContext = async () => {
    return { prisma };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;
export const router = t.router;
export const publicProcedure = t.procedure;
