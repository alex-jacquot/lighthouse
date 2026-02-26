import { z } from 'zod';
import { router, publicProcedure } from '@/server/trpc/trpc';

const searchUsersInputSchema = z.object({
    query: z.string().min(1, 'Search term is required').max(100),
});

export const userRouter = router({
    search: publicProcedure.input(searchUsersInputSchema).query(async ({ ctx, input }) => {
        const trimmed = input.query.trim();

        if (!trimmed)
            return [];

        const users = await ctx.prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: trimmed, mode: 'insensitive' } },
                    { firstName: { contains: trimmed, mode: 'insensitive' } },
                    { lastName: { contains: trimmed, mode: 'insensitive' } },
                ],
            },
            orderBy: { createdAt: 'asc' },
            take: 20,
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
                createdAt: true,
            },
        });

        return users;
    }),
});

