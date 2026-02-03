Cursor Rules — Fullstack TypeScript + Next.js (App Router)

    Save this file as CURSOR_RULES.md (or paste into Cursor → Settings → User Rules).

🎯 Priority Hierarchy

    Use TypeScript everywhere (strict). Prefer interfaces over types.

    Follow Next.js App Router and React Server Components (RSC) for data fetching and rendering.

    Adopt the screens pattern:
        page.tsx = routing + data fetching only
        UI lives in /screens/... subcomponents

    Functional & declarative programming (no classes).

    Performance first: minimize use client, useEffect, setState; use dynamic imports and preload pattern.

    Consistent UI with Shadcn UI, Radix, Tailwind v4 (mobile-first).

    Error handling, security, and accessibility by default.

    Readable, maintainable code: naming, formatting, early returns, guard clauses.

    Testing for critical paths (unit + integration).

🧑‍💻 Role & Expertise

Expert full-stack developer in TypeScript, JavaScript, Node.js, Prisma, PostgreSQL, GraphQL, Next.js (App Router), React, Zustand, Shadcn UI, Radix UI, Tailwind v4.
📐 Code Style & Structure

    Concise, technical TypeScript with real-world examples.
    Functional & declarative patterns only; avoid classes.
    Prefer iteration & modularization over duplication.
    Descriptive variable names with auxiliaries (isLoading, hasError).
    File order: exported component → subcomponents → helpers → static content → types.

📂 Project Structure (Screens Pattern)

    page.tsx handles only routing & server data fetching (RSC). No presentational JSX.

    UI lives under /screens/[page]/:
        screens/home/screen.tsx (main container)
        screens/home/hero.tsx
        screens/home/features.tsx

Example: app/home/page.tsx

import { Suspense } from 'react';
import { Screen } from '@/screens/home/screen';

export default async function Page() {
  const data = await getData(); // RSC data fetching
  return (
    <Suspense fallback={null}>
      <Screen data={data} />
    </Suspense>
  );
}

async function getData() {
  // server-side fetching only (no "use client")
  return {};
}

📏 Standard & TypeScript Rules

    Use TypeScript everywhere; prefer interfaces over type.

    Avoid enums; use maps or DB enum tables.

    Functional React components + TS interfaces.

    camelCase (vars/functions), PascalCase (components).

    No unused variables.

    Always === (never ==).

    Always handle error parameters.

    Indentation: 4 spaces. Single quotes for strings (unless escaping).

    Formatting:
        Space after keywords; space before function parentheses.
        Infix operators spaced; commas followed by a space.
        else on same line as closing brace.

    Conditionals:
        One-liners: no braces.
        Multi-line: use braces.
        Guard clauses and early returns; happy path last.

📛 Naming Conventions

    Directories: lowercase-with-dashes (e.g., components/auth-wizard).
    Favor named exports for components.

⚡ Performance & Optimization

    Minimize use client, useEffect, and setState; prefer RSC / SSR.
    Wrap client components with <Suspense fallback={...}>.
    Dynamic imports for non-critical components.
    Images: WebP, sizes/width/height, lazy loading.
    Route-based code splitting.
    PurgeCSS with Tailwind in production.
    Prioritize Web Vitals (LCP, CLS, FID).
    Implement preload pattern to avoid waterfalls.

🎨 UI & Styling

    Shadcn UI, Radix, Tailwind v4.
    Mobile-first responsive design.
    Minimize global CSS; prefer scoped / module styles.

🗂 State Management

    Zustand for global state.
    Lift state up when needed; use context for intermediate sharing (avoid deep prop drilling).
    Use nuqs for URL search parameter state.

📝 Forms & Validation

    Controlled components.
    react-hook-form for complex forms.
    Schema validation: Zod (preferred) or Joi.
    Validate client and server side.

🚨 Error Handling

    Handle errors & edge cases first.
    Early returns + guard clauses; avoid unnecessary else.
    Happy path last.
    User-friendly error messages + proper logging.
    Model expected errors as return values in Server Actions.

♿ Accessibility (a11y)

    Semantic HTML; proper ARIA attributes.
    Ensure keyboard navigation works.

🧪 Testing

    Unit tests: Jest + React Testing Library.
    Integration tests for critical flows.
    Snapshot tests sparingly.

🔒 Security

    Sanitize inputs; prevent XSS.
    Use dangerouslySetInnerHTML only with sanitized content.

🔄 Data Fetching

    Prefer RSC for fetching; avoid client-only rendering of primary content.
    Follow Next.js docs for Data Fetching, Rendering, Routing.
    Adhere to DB schema; use enum tables for predefined values.

🔎 SEO & Metadata
Metadata (per route)

    Implement generateMetadata for every route.
    Include at minimum: title, description (≤160 chars), canonical URL, robots, openGraph (title, description, url, images, type), twitter (card, title, description, images), alternates (e.g., languages).
    Centralize defaults in /lib/seo (e.g., buildPageMeta(params): Metadata).
    Prefer dynamic OG images (opengraph-image.tsx or ImageResponse).
    Use absolute canonical URLs; keep consistent trailing-slash policy.

Template: /lib/seo/meta.ts

import type { Metadata } from 'next';
import { site } from './defaults'; // baseUrl, siteName, defaultImages, etc.

type BuildMetaInput = {
  title: string;
  description: string;
  path: string;      // e.g., '/blog/my-post'
  images?: string[];
  allowIndex?: boolean;
};

export function buildPageMeta(input: BuildMetaInput): Metadata {
  const url = new URL(input.path, site.baseUrl).toString();
  const index = !!input.allowIndex;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: { index, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: site.siteName,
      type: 'website',
      images: input.images ?? site.defaultImages
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: input.images ?? site.defaultImages
    }
  };
}

JSON-LD & Structured Data

    Add JSON-LD to every applicable route.
    Use schema-dts for type-safe JSON-LD (WithContext<...>).
    Include BreadcrumbList on hierarchical pages.
    Article/blog pages: Article/BlogPosting with headline, description, datePublished, dateModified, author, publisher, mainEntityOfPage, image.
    Listing pages: CollectionPage or ItemList with itemListElement.
    Organization and WebSite JSON-LD at root (home), with sameAs and optional SearchAction.
    Render JSON-LD via <script type="application/ld+json"> with safe serialization (no HTML escaping issues).
    Use absolute URLs matching canonical; ensure image dimensions reflect real assets.

Template: /lib/seo/jsonld.ts

import type { WithContext, BreadcrumbList, Article } from 'schema-dts';

export function breadcrumbList(items: { name: string; url: string }[]) {
  const jsonld: WithContext<BreadcrumbList> = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.url
    }))
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
}) {
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
    publisher: { '@type': 'Organization', name: data.publisherName }
  };
  return JSON.stringify(jsonld);
}

RSC helper to render JSON-LD (server component):

export function JsonLd({ json }: { json: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

Robots

    Add robots.ts at the project root (and sub-apps if needed).
    Default noindex for all routes: robots: { index: false, follow: true }.
    Provide a utility flag allowIndex = false by default; routes must explicitly opt in.

Root app/robots.ts

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', index: false, follow: true }]
  };
}

Per-route opt-in (inside generateMetadata)

const meta = buildPageMeta({
  title: 'Page Title',
  description: 'Short descriptive summary.',
  path: '/some/path',
  allowIndex: true   // Explicit opt-in
});
export const generateMetadata = () => meta;

Breadcrumbs (UI)

    Provide visual breadcrumbs matching JSON-LD:
        <nav aria-label="Breadcrumb"> with the last item aria-current="page".
        Keep labels short and human-readable.

SEO Quality & Performance

    Avoid client-only rendering of critical content; prefer RSC/SSR.
    Lazy-load below-the-fold images; always set width/height or sizes to avoid CLS.
    One H1 per page; logical heading outline (h2, h3, …).
    Descriptive link text; canonical anchors; correct rel attributes for external links.
    Minimize duplicate titles/descriptions across routes.

Route Opt-in Criteria (Indexing)

A page can be indexed only if it:

    Provides unique title/description,
    Sets a canonical URL,
    Includes appropriate JSON-LD, and
    Explicitly sets robots: { index: true, follow: true }.

SEO Utilities (Recommended files)

    /lib/seo/defaults.ts — baseUrl, siteName, defaultImages, social.
    /lib/seo/meta.ts — buildPageMeta(input): Metadata.
    /lib/seo/jsonld.ts — helpers: breadcrumbList, article, collectionPage, organization, website.

🧭 Enforcement Hints

    If UI appears in page.tsx, move it into screens/[page]/screen.tsx and import.
    If an effect fetches data that can be fetched on the server, refactor to RSC.
    If enums are requested, suggest maps or DB enum tables.
    If "use client" is added to large files, split into small leaf components.
    If a route lacks generateMetadata, add it and wire to /lib/seo/meta.ts.
    If applicable JSON-LD is missing, add it via schema-dts types.
    If breadcrumbs are missing, add UI breadcrumbs and BreadcrumbList JSON-LD.
    Ensure robots.ts exists and defaults to noindex.
    If canonical/OG/Twitter tags are missing, populate from /lib/seo/defaults.ts.

✅ How to Use in Cursor

    Paste this file’s contents into Cursor → Settings → User Rules (or keep in your repo and reference it).

    When prompting, start with: “Follow the project rules in CURSOR_RULES.md. Use the screens pattern (page.tsx = data & routing only).”

    For new routes, ask Cursor to scaffold:
        generateMetadata, JSON-LD, breadcrumbs UI + JSON-LD, and verify robots defaults.

