import { z } from 'zod';
import { router, publicProcedure } from '@/server/trpc/trpc';

const postItIdSchema = z.object({ id: z.string().cuid() });
const createPostItSchema = z.object({
    title: z.string().min(1).max(200),
    content: z.string().max(2000).optional().default(''),
    color: z.string().max(20).optional().default('yellow'),
});
const updatePostItSchema = createPostItSchema.partial();

export const postItRouter = router({
    list: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.postIt.findMany({
            orderBy: { updatedAt: 'desc' },
        });
    }),

    byId: publicProcedure.input(postItIdSchema).query(async ({ ctx, input }) => {
        const postIt = await ctx.prisma.postIt.findUnique({
            where: { id: input.id },
        });
        if (!postIt) return null;
        return postIt;
    }),

    create: publicProcedure.input(createPostItSchema).mutation(async ({ ctx, input }) => {
        return ctx.prisma.postIt.create({
            data: input,
        });
    }),

    update: publicProcedure
        .input(z.object({ id: z.string().cuid(), data: updatePostItSchema }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.postIt.update({
                where: { id: input.id },
                data: input.data,
            });
        }),

    delete: publicProcedure.input(postItIdSchema).mutation(async ({ ctx, input }) => {
        return ctx.prisma.postIt.delete({
            where: { id: input.id },
        });
    }),
});
