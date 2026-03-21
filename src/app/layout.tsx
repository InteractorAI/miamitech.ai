import '../index.css';
import type { Metadata } from 'next';
import { InteractorWidget } from '../components/InteractorWidget';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
    metadataBase: new URL('https://miamitech.ai'),
    title: 'MiamiTech.ai — Community Concierge & Index',
    description: 'The AI concierge and index for the Miami tech and startup ecosystem. Discover investors, coworking spaces, ambassadors, news sources, and more.',
    keywords: ['Miami Tech', 'Miami AI', 'Startup Ecosystem', 'Venture Capital', 'Coworking Spaces', 'Miami Founders', 'Tech Community', 'Miami Tech Investors', 'Miami Tech Ambassadors'],
    authors: [{ name: 'miamitech.ai Team' }],
    alternates: {
        canonical: 'https://miamitech.ai',
    },
    manifest: '/manifest.webmanifest',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.png',
        shortcut: '/favicon.png',
        apple: '/favicon.png',
    },
    openGraph: {
        type: 'website',
        url: 'https://miamitech.ai',
        title: 'MiamiTech.ai — Community Concierge & Index',
        description: 'The AI concierge and index for the Miami tech and startup ecosystem. Discover investors, coworking spaces, ambassadors, news sources, and more.',
        siteName: 'MiamiTech.ai',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'MiamiTech.ai — Miami Tech Ecosystem Index',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'MiamiTech.ai — Community Concierge & Index',
        description: 'The AI concierge and index for the Miami tech and startup ecosystem. Discover investors, coworking spaces, ambassadors, news sources, and more.',
        images: ['/og-image.png'],
    },
};

export const viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#f9fafb' },
        { media: '(prefers-color-scheme: dark)', color: '#0b0b0e' },
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function () {
                const savedTheme = localStorage.getItem('theme');
                const theme = savedTheme || 'dark'; // Always default to dark mode, override if user explicitly saved 'light'
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              })();
            `,
                    }}
                />
            </head>
            <body suppressHydrationWarning>
                <div id="root" className="h-[100dvh]">
                    {children}
                    <InteractorWidget />
                    <Analytics />
                </div>
            </body>
        </html>
    );
}
