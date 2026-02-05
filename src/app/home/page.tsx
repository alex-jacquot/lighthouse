import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '../../../auth';
import { buildPageMeta } from '@/lib/seo/meta';
import { HomeFeedScreen } from '@/screens/home-feed/screen';

export function generateMetadata() {
    return buildPageMeta({
        title: 'Home feed | Lighthouse',
        description: 'Browse posts from the Lighthouse community.',
        path: '/home',
        allowIndex: false,
    });
}

export default async function Page() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login?callbackUrl=/home');
    }

    return (
        <Suspense fallback={null}>
            <HomeFeedScreen />
        </Suspense>
    );
}

