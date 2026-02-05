import { redirect } from 'next/navigation';
import { auth } from '../../../auth';
import { buildPageMeta } from '@/lib/seo/meta';
import { ProfileScreen } from '@/screens/profile/screen';

export function generateMetadata() {
    return buildPageMeta({
        title: 'Your profile | Lighthouse',
        description: 'Manage your Lighthouse profile and avatar.',
        path: '/profile',
        allowIndex: false,
    });
}

export default async function Page() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login?callbackUrl=/profile');
    }

    return <ProfileScreen />;
}

