import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '../../../../auth';
import { prisma } from '@/server/db';

const profileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(32, 'Username must be at most 32 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    imageUrl: z.string().url('Invalid image URL').nullable().optional(),
});

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            firstName: true,
            lastName: true,
            username: true,
            imageUrl: true,
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
}

export async function PATCH(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            {
                error: 'Invalid data',
                details: parsed.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const { firstName, lastName, username, imageUrl } = parsed.data;

    const existingWithUsername = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
    });

    if (existingWithUsername && existingWithUsername.id !== session.user.id) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: {
            firstName,
            lastName,
            username,
            imageUrl: imageUrl ?? null,
        },
        select: {
            firstName: true,
            lastName: true,
            username: true,
            imageUrl: true,
        },
    });

    return NextResponse.json(updated, { status: 200 });
}

