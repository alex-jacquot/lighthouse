import type { WithContext, BreadcrumbList, Article, Organization, WebSite } from 'schema-dts';

export function breadcrumbList(items: { name: string; url: string }[]): string {
    const jsonld: WithContext<BreadcrumbList> = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: it.name,
            item: it.url,
        })),
    };
    return JSON.stringify(jsonld);
}

export function article(data: {
    headline: string;
    description: string;
    url: string;
    image: string[];
    datePublished: string;
    dateModified: string;
    authorName: string;
    publisherName: string;
}): string {
    const jsonld: WithContext<Article> = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.headline,
        description: data.description,
        mainEntityOfPage: data.url,
        image: data.image,
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        author: { '@type': 'Person', name: data.authorName },
        publisher: { '@type': 'Organization', name: data.publisherName },
    };
    return JSON.stringify(jsonld);
}

export function organization(data: { name: string; url: string; sameAs?: string[] }): string {
    const jsonld: WithContext<Organization> = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: data.name,
        url: data.url,
        sameAs: data.sameAs,
    };
    return JSON.stringify(jsonld);
}

export function website(data: { name: string; url: string }): string {
    const jsonld: WithContext<WebSite> = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.name,
        url: data.url,
    };
    return JSON.stringify(jsonld);
}

export function JsonLd({ json }: { json: string }) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
