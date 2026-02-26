import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '../../../auth';
import { buildPageMeta } from '@/lib/seo/meta';
import { AddFriendScreen } from '@/screens/add-friend/screen';

export function generateMetadata() {
    return buildPageMeta({
        title: 'Add friends | Lighthouse',
        description: 'Find and add your friends on Lighthouse.',
        path: '/add-friend',
        allowIndex: false,
    });
}

export default async function Page() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login?callbackUrl=/add-friend');
    }

    return (
        <Suspense fallback={null}>
            <AddFriendScreen />
        </Suspense>
    );
}

