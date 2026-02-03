import { cn } from '@/lib/utils';

interface FeatureItemProps {
    title: string;
    description: string;
    icon: string;
    className?: string;
}

function FeatureItem({ title, description, icon, className }: FeatureItemProps) {
    return (
        <div
            className={cn(
                'rounded-xl border border-border bg-card p-6 text-card-foreground transition hover:border-accent/30',
                className
            )}
        >
            <span className="text-2xl" aria-hidden>
                {icon}
            </span>
            <h3 className="mt-3 font-heading text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

const socialFeatures: FeatureItemProps[] = [
    {
        title: 'Connect meaningfully',
        description: 'Share updates, ideas, and moments with people who get you. No algorithmic noise—just your circle.',
        icon: '✨',
    },
    {
        title: 'Stay in the light',
        description: 'A place designed for clarity and kindness. We keep the feed focused and the community safe.',
        icon: '🔦',
    },
    {
        title: 'Your space, your rules',
        description: 'Control what you see and who sees you. Privacy and simplicity are built in, not bolted on.',
        icon: '🛡️',
    },
];

const techFeatures: FeatureItemProps[] = [
    {
        title: 'TypeScript & Next.js',
        description: 'Strict TypeScript and Next.js App Router with React Server Components for fast, type-safe experiences.',
        icon: '⚡',
    },
    {
        title: 'Performance first',
        description: 'Minimal client JS, dynamic imports, and Web Vitals (LCP, CLS, FID) as a priority everywhere.',
        icon: '📐',
    },
    {
        title: 'Shadcn & Tailwind',
        description: 'Consistent, accessible UI with Shadcn UI, Radix primitives, and Tailwind v4—mobile-first.',
        icon: '🎨',
    },
    {
        title: 'Forms & validation',
        description: 'Controlled forms with react-hook-form and Zod. Validated on client and server.',
        icon: '📝',
    },
    {
        title: 'Accessibility & SEO',
        description: 'Semantic HTML, ARIA, keyboard nav, and full metadata with JSON-LD and canonical URLs.',
        icon: '♿',
    },
    {
        title: 'Testing & security',
        description: 'Jest and React Testing Library for critical paths. Input sanitization and safe defaults.',
        icon: '🔒',
    },
];

export function Features() {
    return (
        <section
            className="border-t border-border bg-muted/20 px-4 py-16 sm:px-6 sm:py-20"
            aria-labelledby="features-heading"
        >
            <div className="mx-auto max-w-6xl">
                <h2 id="features-heading" className="sr-only">
                    Why Lighthouse and how it’s built
                </h2>

                <div className="text-center">
                    <p className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                        Why Lighthouse
                    </p>
                    <p className="mt-2 text-muted-foreground">
                        A social network that puts connection first.
                    </p>
                </div>
                <ul className="mt-10 grid gap-6 sm:grid-cols-3" role="list">
                    {socialFeatures.map((f) => (
                        <li key={f.title}>
                            <FeatureItem {...f} />
                        </li>
                    ))}
                </ul>

                <div className="mt-20 text-center">
                    <p className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                        Built with care
                    </p>
                    <p className="mt-2 text-muted-foreground">
                        Technical foundations from our CURSOR_RULES—quality you can rely on.
                    </p>
                </div>
                <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
                    {techFeatures.map((f) => (
                        <li key={f.title}>
                            <FeatureItem {...f} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
