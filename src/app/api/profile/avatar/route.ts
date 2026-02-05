import { NextResponse } from 'next/server';
import { uploadAvatar } from '@/server/images';

const MAX_SIZE_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Avatar file is required.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Avatar must be an image.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json({ error: 'Avatar must be smaller than 2MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        const result = await uploadAvatar({
            fileBuffer: buffer,
            filename: file.name,
        });

        return NextResponse.json({ url: result.url }, { status: 200 });
    } catch (error) {
        console.error('Failed to upload avatar', error);
        return NextResponse.json({ error: 'Failed to upload avatar.' }, { status: 500 });
    }
}

