import { Suspense } from 'react';
import { buildPageMeta } from '@/lib/seo/meta';
import { LoginScreen } from '@/screens/login/screen';

export function generateMetadata() {
    return buildPageMeta({
        title: 'Log in | Lighthouse',
        description: 'Log in to your Lighthouse account.',
        path: '/login',
        allowIndex: false,
    });
}

export default function Page() {
    return (
        <Suspense fallback={null}>
            <LoginScreen />
        </Suspense>
    );
}
