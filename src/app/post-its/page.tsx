import { Suspense } from 'react';
import { buildPageMeta } from '@/lib/seo/meta';

export const dynamic = 'force-dynamic';
import { breadcrumbList, JsonLd } from '@/lib/seo/jsonld';
import { site } from '@/lib/seo/defaults';
import { createServerCaller } from '@/server/trpc/caller';
import { PostItsScreen } from '@/screens/post-its/screen';

export function generateMetadata() {
    return buildPageMeta({
        title: 'Post-it notes | Lighthouse',
        description: 'Create and manage post-it notes.',
        path: '/post-its',
        allowIndex: true,
    });
}

export default async function Page() {
    const caller = await createServerCaller();
    const initialPostIts = await caller.postIt.list();
    const breadcrumbs = breadcrumbList([
        { name: 'Home', url: new URL('/', site.baseUrl).toString() },
        { name: 'Post-it notes', url: new URL('/post-its', site.baseUrl).toString() },
    ]);
    return (
        <Suspense fallback={null}>
            <JsonLd json={breadcrumbs} />
            <PostItsScreen initialPostIts={initialPostIts} />
        </Suspense>
    );
}
