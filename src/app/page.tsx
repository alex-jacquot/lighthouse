import { Suspense } from 'react';
import { buildPageMeta } from '@/lib/seo/meta';
import { organization, website, JsonLd } from '@/lib/seo/jsonld';
import { site } from '@/lib/seo/defaults';
import { HomeScreen } from '@/screens/home/screen';

export function generateMetadata() {
    return buildPageMeta({
        title: 'Lighthouse',
        description: 'A social network — share and connect. Start with post-it notes.',
        path: '/',
        allowIndex: true,
    });
}

export default async function Page() {
    const orgJson = organization({
        name: site.siteName,
        url: site.baseUrl,
    });
    const siteJson = website({ name: site.siteName, url: site.baseUrl });
    return (
        <Suspense fallback={null}>
            <JsonLd json={orgJson} />
            <JsonLd json={siteJson} />
            <HomeScreen />
        </Suspense>
    );
}
