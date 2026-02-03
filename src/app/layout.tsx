import type { Metadata } from 'next';
import { Outfit, DM_Sans } from 'next/font/google';
import { TRPCProvider } from '@/trpc/query-client';
import { SiteHeader } from '@/components/site-header/site-header';
import '@/app/globals.css';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Lighthouse',
    description: 'A social network — share and connect.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${outfit.variable} ${dmSans.variable}`} suppressHydrationWarning>
            <body
                className="min-h-screen bg-background font-sans text-foreground antialiased"
                suppressHydrationWarning
            >
                <TRPCProvider>
                    <SiteHeader />
                    {children}
                </TRPCProvider>
            </body>
        </html>
    );
}
