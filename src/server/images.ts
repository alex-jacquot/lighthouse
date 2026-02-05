import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
    });
}

interface UploadAvatarInput {
    fileBuffer: Buffer;
    filename: string;
}

interface UploadAvatarResult {
    url: string;
}

export async function uploadAvatar(input: UploadAvatarInput): Promise<UploadAvatarResult> {
    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary environment variables are not configured.');
    }

    const result = await new Promise<UploadAvatarResult>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'lighthouse/avatars',
                resource_type: 'image',
                format: 'png',
                transformation: [
                    {
                        width: 256,
                        height: 256,
                        crop: 'fill',
                        gravity: 'face',
                        radius: 'max',
                    },
                ],
            },
            (error, uploadResult) => {
                if (error || !uploadResult?.secure_url) {
                    reject(error ?? new Error('Failed to upload avatar.'));
                    return;
                }

                resolve({ url: uploadResult.secure_url });
            }
        );

        stream.end(input.fileBuffer);
    });

    return result;
}

interface UploadPostImageInput {
    fileBuffer: Buffer;
    filename: string;
}

interface UploadPostImageResult {
    url: string;
}

export async function uploadPostImage(input: UploadPostImageInput): Promise<UploadPostImageResult> {
    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Cloudinary environment variables are not configured.');
    }

    const result = await new Promise<UploadPostImageResult>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'lighthouse/posts',
                resource_type: 'image',
                format: 'jpg',
                transformation: [
                    {
                        width: 1200,
                        height: 630,
                        crop: 'fill',
                        gravity: 'auto',
                    },
                ],
            },
            (error, uploadResult) => {
                if (error || !uploadResult?.secure_url) {
                    reject(error ?? new Error('Failed to upload post image.'));
                    return;
                }

                resolve({ url: uploadResult.secure_url });
            }
        );

        stream.end(input.fileBuffer);
    });

    return result;
}


