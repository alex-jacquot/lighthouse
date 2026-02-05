import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { uploadAvatar } from '@/server/images';
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
    imageUrl: z.string().url().nullable().optional(),
});

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
    const contentType = request.headers.get('content-type') ?? '';

    let firstName: string;
    let lastName: string;
    let username: string;
    let password: string;
    let imageUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();

        const file = formData.get('avatar');
        if (file instanceof File) {
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: 'Avatar must be an image.' }, { status: 400 });
            }

            if (file.size > MAX_SIZE_BYTES) {
                return NextResponse.json({ error: 'Avatar must be smaller than 2MB.' }, { status: 400 });
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            try {
                const uploaded = await uploadAvatar({ fileBuffer: buffer, filename: file.name });
                imageUrl = uploaded.url;
            } catch (error) {
                console.error('Failed to upload avatar during signup', error);
                return NextResponse.json({ error: 'Failed to upload avatar.' }, { status: 500 });
            }
        }

        firstName = String(formData.get('firstName') ?? '');
        lastName = String(formData.get('lastName') ?? '');
        username = String(formData.get('username') ?? '');
        password = String(formData.get('password') ?? '');
    } else {
        const body = await request.json();
        firstName = String(body.firstName ?? '');
        lastName = String(body.lastName ?? '');
        username = String(body.username ?? '');
        password = String(body.password ?? '');
        imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl : null;
    }

    const parsed = signupSchema.safeParse({
        firstName,
        lastName,
        username,
        password,
        imageUrl,
    });

    if (!parsed.success) {
        return NextResponse.json(
            {
                error: 'Invalid data',
                details: parsed.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const existing = await prisma.user.findUnique({
        where: { username: parsed.data.username },
    });

    if (existing) {
        return NextResponse.json(
            {
                error: 'Username is already taken',
            },
            { status: 409 }
        );
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.create({
        data: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            username: parsed.data.username,
            passwordHash,
            imageUrl: parsed.data.imageUrl ?? 'https://placehold.co/256x256.png?text=User',
        },
    });

    return NextResponse.json(
        {
            success: true,
        },
        { status: 201 }
    );
}

