import { NextResponse } from 'next/server';
import { uploadPostImage } from '@/server/images';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json({ error: 'Image must be smaller than 5MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        const result = await uploadPostImage({
            fileBuffer: buffer,
            filename: file.name,
        });

        return NextResponse.json({ url: result.url }, { status: 200 });
    } catch (error) {
        console.error('Failed to upload post image', error);
        return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
    }
}

