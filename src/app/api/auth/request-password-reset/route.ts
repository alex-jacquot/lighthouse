import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';

const requestSchema = z.object({
    username: z.string().min(1, 'Username is required'),
});

const RESET_TOKEN_TTL_MINUTES = 60;

export async function POST(request: Request) {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {
                error: 'Invalid data',
                details: parsed.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const { username } = parsed.data;

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        return NextResponse.json(
            {
                success: true,
            },
            { status: 200 }
        );
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
        data: {
            token,
            userId: user.id,
            expiresAt,
        },
    });

    return NextResponse.json(
        {
            success: true,
            token,
        },
        { status: 200 }
    );
}

