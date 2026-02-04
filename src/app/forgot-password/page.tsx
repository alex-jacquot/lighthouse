import { buildPageMeta } from '@/lib/seo/meta';
import { ForgotPasswordScreen } from '@/screens/forgot-password/screen';

export function generateMetadata() {
    return buildPageMeta({
        title: 'Forgot password | Lighthouse',
        description: 'Reset your Lighthouse password.',
        path: '/forgot-password',
        allowIndex: false,
    });
}

export default function Page() {
    return <ForgotPasswordScreen />;
}

