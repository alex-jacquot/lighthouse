import Link from 'next/link';
import Image from 'next/image';
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
    const user = session?.user as
        | ({ id?: string; username?: string; image?: string | null; name?: string | null } | null)
        | undefined;

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md',
                className
            )}
            role="banner"
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground no-underline transition hover:opacity-90"
                        aria-label="Lighthouse — Landing"
                    >
                        <LighthouseLogo className="h-8 w-8 text-accent" aria-hidden />
                        <span className="font-heading text-xl">Lighthouse</span>
                    </Link>
                    <Link
                        href="/home"
                        className="hidden text-sm font-medium text-foreground/90 transition hover:text-foreground sm:inline-block"
                    >
                        Home
                    </Link>
                </div>
                <nav className="flex items-center gap-3" aria-label="Account">
                    {user ? (
                        <>
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1 text-sm text-foreground transition hover:border-border hover:bg-white/5"
                                aria-label="Your profile"
                            >
                                <span className="hidden text-sm text-muted-foreground sm:inline">
                                    {user.name ?? user.username ?? 'Your profile'}
                                </span>
                                <span className="relative inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted">
                                    {user.image ? (
                                        <Image
                                            src={user.image}
                                            alt="Profile picture"
                                            fill
                                            sizes="32px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                                            {(user.name ?? user.username ?? 'U')
                                                .slice(0, 2)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </span>
                            </Link>
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
