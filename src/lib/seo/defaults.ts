export const site = {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://lighthouse.example.com',
    siteName: 'Lighthouse',
    defaultImages: ['/og-default.png'],
    social: {} as Record<string, string>,
};
