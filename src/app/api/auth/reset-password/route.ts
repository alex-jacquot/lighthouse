import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/server/db';

const resetSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {
                error: 'Invalid data',
                details: parsed.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const { token, password } = parsed.data;

    const tokenRecord = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return NextResponse.json(
            {
                error: 'Reset link is invalid or has expired',
            },
            { status: 400 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: tokenRecord.userId },
            data: { passwordHash },
        }),
        prisma.passwordResetToken.deleteMany({
            where: { userId: tokenRecord.userId },
        }),
    ]);

    return NextResponse.json(
        {
            success: true,
        },
        { status: 200 }
    );
}

