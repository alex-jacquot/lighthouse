import type { Metadata } from 'next';
import { site } from './defaults';

export interface BuildMetaInput {
    title: string;
    description: string;
    path: string;
    images?: string[];
    allowIndex?: boolean;
}

export function buildPageMeta(input: BuildMetaInput): Metadata {
    const url = new URL(input.path, site.baseUrl).toString();
    const index = !!input.allowIndex;

    return {
        metadataBase: new URL(site.baseUrl),
        title: input.title,
        description: input.description,
        alternates: { canonical: url },
        robots: { index, follow: true },
        openGraph: {
            title: input.title,
            description: input.description,
            url,
            siteName: site.siteName,
            type: 'website',
            images: input.images ?? site.defaultImages,
        },
        twitter: {
            card: 'summary_large_image',
            title: input.title,
            description: input.description,
            images: input.images ?? site.defaultImages,
        },
    };
}
