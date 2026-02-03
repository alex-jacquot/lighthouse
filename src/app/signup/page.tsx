import { buildPageMeta } from '@/lib/seo/meta';
import { SignupScreen } from '@/screens/signup/screen';

export function generateMetadata() {
    return buildPageMeta({
        title: 'Sign up | Lighthouse',
        description: 'Create your Lighthouse account.',
        path: '/signup',
        allowIndex: false,
    });
}

export default function Page() {
    return <SignupScreen />;
}
