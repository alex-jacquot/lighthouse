import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '@/server/trpc/trpc';
import { auth } from '../../../../auth';

const createCommentSchema = z.object({
    postId: z.string().cuid(),
    content: z.string().min(1, 'Comment cannot be empty').max(500),
});

const listCommentsSchema = z.object({
    postId: z.string().cuid(),
});

const toggleCommentLikeSchema = z.object({
    commentId: z.string().cuid(),
});

export const commentRouter = router({
    listByPost: publicProcedure.input(listCommentsSchema).query(async ({ ctx, input }) => {
        const comments = await ctx.prisma.comment.findMany({
            where: { postId: input.postId, deletedAt: null },
            orderBy: { createdAt: 'asc' },
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

        return comments;
    }),

    create: publicProcedure.input(createCommentSchema).mutation(async ({ ctx, input }) => {
        const session = await auth();

        if (!session?.user?.id) {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const comment = await ctx.prisma.comment.create({
            data: {
                postId: input.postId,
                content: input.content,
                authorId: session.user.id,
            },
        });

        return comment;
    }),

    toggleLike: publicProcedure.input(toggleCommentLikeSchema).mutation(async ({ ctx, input }) => {
        const session = await auth();

        if (!session?.user?.id) {
            throw new TRPCError({ code: 'UNAUTHORIZED' });
        }

        const existing = await ctx.prisma.comment.findUnique({
            where: { id: input.commentId },
            include: {
                likedBy: {
                    where: { id: session.user.id },
                    select: { id: true },
                },
            },
        });

        if (!existing) {
            throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const alreadyLiked = existing.likedBy.length > 0;

        const updated = await ctx.prisma.comment.update({
            where: { id: input.commentId },
            data: alreadyLiked
                ? {
                      likesCount: { decrement: 1 },
                      likedBy: {
                          disconnect: { id: session.user.id },
                      },
                  }
                : {
                      likesCount: { increment: 1 },
                      likedBy: {
                          connect: { id: session.user.id },
                      },
                  },
        });

        return updated;
    }),
});

