import Link from 'next/link';

export function LoginScreen() {
    return (
        <main className="mx-auto max-w-sm px-4 py-16">
            <h1 className="font-heading text-2xl font-bold">Log in</h1>
            <p className="mt-2 text-muted-foreground">
                Sign-in and auth will be implemented here.
            </p>
            <Link href="/" className="mt-6 inline-block text-accent hover:underline">
                ← Back to home
            </Link>
        </main>
    );
}
