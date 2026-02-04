import { buildPageMeta } from '@/lib/seo/meta';
import { ResetPasswordScreen } from '@/screens/reset-password/screen';

interface PageProps {
    searchParams: Promise<{ token?: string }>;
}

export function generateMetadata() {
    return buildPageMeta({
        title: 'Reset password | Lighthouse',
        description: 'Choose a new password for your Lighthouse account.',
        path: '/reset-password',
        allowIndex: false,
    });
}

export default async function Page(props: PageProps) {
    const { token } = await props.searchParams;
    return <ResetPasswordScreen token={token ?? null} />;
}

