import '../index.css';
import type { Metadata } from 'next';
import { InteractorWidget } from '../components/InteractorWidget';

export const metadata: Metadata = {
    title: 'miamitech.ai — Community Concierge & Index',
    description: 'The AI concierge and index for the Miami tech and startup ecosystem. Discover investors, coworking spaces, ambassadors, news sources, and more.',
    alternates: {
        canonical: 'https://miamitech.ai',
    },
    openGraph: {
        type: 'website',
        url: 'https://miamitech.ai',
        title: 'miamitech.ai — Community Concierge & Index',
        description: 'The AI concierge and index for the Miami tech and startup ecosystem. Discover investors, coworking spaces, ambassadors, news sources, and more.',
        siteName: 'miamitech.ai',
        images: [
            {
                url: 'https://miamitech.ai/og-image.png',
                width: 1200,
                height: 630,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'miamitech.ai — Community Concierge & Index',
        description: 'The AI concierge and index for the Miami tech and startup ecosystem. Discover investors, coworking spaces, ambassadors, news sources, and more.',
        images: ['https://miamitech.ai/og-image.png'],
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
                </div>
            </body>
        </html>
    );
}
