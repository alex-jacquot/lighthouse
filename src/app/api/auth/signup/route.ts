import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/server/db';

const signupSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(32, 'Username must be at most 32 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {
                error: 'Invalid data',
                details: parsed.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const { firstName, lastName, username, password } = parsed.data;

    const existing = await prisma.user.findUnique({
        where: { username },
    });

    if (existing) {
        return NextResponse.json(
            {
                error: 'Username is already taken',
            },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
        data: {
            firstName,
            lastName,
            username,
            passwordHash,
        },
    });

    return NextResponse.json(
        {
            success: true,
        },
        { status: 201 }
    );
}

