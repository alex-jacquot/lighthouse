import Link from 'next/link';
import { auth, signOut } from '../../../auth';
import { cn } from '@/lib/utils';

function LighthouseLogo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('shrink-0', className)}
        >
            <path
                d="M16 4v24M8 12l8-8 8 8M12 28h8M10 16l6-6 6 6M14 22l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

interface SiteHeaderProps {
    className?: string;
}

export async function SiteHeader({ className }: SiteHeaderProps) {
    const session = await auth();
    const user = session?.user;

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md',
                className
            )}
            role="banner"
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground no-underline transition hover:opacity-90"
                    aria-label="Lighthouse — Home"
                >
                    <LighthouseLogo className="h-8 w-8 text-accent" aria-hidden />
                    <span className="font-heading text-xl">Lighthouse</span>
                </Link>
                <nav className="flex items-center gap-3" aria-label="Account">
                    {user ? (
                        <>
                            <span className="hidden text-sm text-muted-foreground sm:inline">
                                Signed in as{' '}
                                <span className="font-medium text-foreground">
                                    {user.name ?? (user as { username?: string }).username ?? 'User'}
                                </span>
                            </span>
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut({ redirectTo: '/' });
                                }}
                            >
                                <button
                                    type="submit"
                                    className="rounded-md px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-white/10 hover:text-foreground"
                                >
                                    Log out
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/90 transition hover:bg-white/10 hover:text-foreground"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-sm transition hover:bg-accent/90"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
