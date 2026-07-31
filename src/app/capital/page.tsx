import { CapitalIndex } from '../../components/CapitalIndex';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SHEET_CONFIG, mappers, parseSheetCSV } from '../../lib/googleSheets';

export const metadata = {
    title: 'Miami Tech Capital & Investors — MiamiTech.ai',
    description: 'A comprehensive index of venture capital, seed funds, and angel investors in the Miami tech ecosystem.',
    openGraph: {
        title: 'Miami Tech Capital & Investors — MiamiTech.ai',
        description: 'A comprehensive index of venture capital, seed funds, and angel investors in the Miami tech ecosystem.',
        url: 'https://miamitech.ai/capital',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Miami Tech Capital & Investors — MiamiTech.ai',
        description: 'A comprehensive index of venture capital, seed funds, and angel investors in the Miami tech ecosystem.',
        images: ['/og-image.png'],
    },
};

async function fetchCapitalData() {
    try {
        const url = `${SHEET_CONFIG.BASE_URL}&gid=${SHEET_CONFIG.TABS.VCs}`;
        const res = await fetch(url, { next: { revalidate: 60 } });
        const text = await res.text();
        return parseSheetCSV(text, mappers.capital, 4);
    } catch (e) {
        console.error('Failed to fetch capital data', e);
        return [];
    }
}

export default async function CapitalFocused() {
    const data = await fetchCapitalData();

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="site-spectrum h-1 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green shrink-0" />
            <header className="site-header flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <Link
                    href="/"
                    className="text-xs font-medium text-fg-muted hover:text-accent-pink transition-colors"
                >
                    ← Home
                </Link>
                <h1 className="text-sm font-semibold text-fg-primary tracking-tight">
                    Capital Index
                </h1>
                <div className="w-16 flex justify-end">
                    <ThemeToggle />
                </div>
            </header>

            {/* Full Capital view */}
            <div className="flex-1 min-h-0">
                <CapitalIndex data={data} loading={false} expanded />
            </div>
        </div>
    );
}
