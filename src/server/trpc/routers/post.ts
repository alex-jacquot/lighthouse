import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '@/server/trpc/trpc';
import { auth } from '../../../../auth';

const postCategorySchema = z.enum(['general', 'tech', 'life', 'art', 'random']);

const createPostSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required').max(2000),
    imageUrl: z.string().url().nullable().optional(),
    category: postCategorySchema.default('general'),
});

const listPostsInputSchema = z.object({
    category: postCategorySchema.or(z.literal('all')).optional().default('all'),
});

export const postRouter = router({
    list: publicProcedure.input(listPostsInputSchema).query(async ({ ctx, input }) => {
        const where =
            input.category === 'all'
                ? { state: 'active' }
                : { state: 'active', category: input.category };

        const posts = await ctx.prisma.post.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        imageUrl: true,
                    },
                },
            },
        });

        return posts;
    }),

    create: publicProcedure.input(createPostSchema).mutation(async ({ ctx, input }) => {
        const session = await auth();

        if (!session?.user?.id) {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const post = await ctx.prisma.post.create({
            data: {
                title: input.title,
                description: input.description,
                imageUrl: input.imageUrl ?? null,
                category: input.category,
                authorId: session.user.id,
            },
        });

        return post;
    }),
});

