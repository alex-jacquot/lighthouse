import Link from 'next/link';

export function Hero() {
    return (
        <section
            className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:py-36"
            aria-labelledby="hero-heading"
        >
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
            <div className="mx-auto max-w-4xl text-center">
                <h1
                    id="hero-heading"
                    className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                >
                    Your beacon in the noise
                </h1>
                <p className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
                    Lighthouse is a social network built for real connection. Share what matters,
                    discover your community, and stay in the light.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link
                        href="/signup"
                        className="w-full rounded-lg bg-accent px-6 py-3 text-center font-medium text-accent-foreground shadow-md transition hover:bg-accent/90 sm:w-auto"
                    >
                        Get started
                    </Link>
                    <Link
                        href="/post-its"
                        className="w-full rounded-lg border border-border bg-background px-6 py-3 text-center font-medium text-foreground transition hover:bg-white/5 sm:w-auto"
                    >
                        Try post-its
                    </Link>
                </div>
            </div>
        </section>
    );
}
