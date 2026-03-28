import { AcceleratorsRegistry } from '../../components/AcceleratorsRegistry';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ThemeToggle';
import { SHEET_CONFIG, mappers, parseSheetCSV } from '../../lib/googleSheets';

export const metadata = {
    title: 'Miami Tech Accelerators & Incubators — MiamiTech.ai',
    description: 'A directory of tech accelerators, incubators, and startup programs in the Miami ecosystem.',
    openGraph: {
        title: 'Miami Tech Accelerators & Incubators — MiamiTech.ai',
        description: 'A directory of tech accelerators, incubators, and startup programs in the Miami ecosystem.',
        url: 'https://miamitech.ai/accelerators',
        images: ['/og-image.png'],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Miami Tech Accelerators & Incubators — MiamiTech.ai',
        description: 'A directory of tech accelerators, incubators, and startup programs in the Miami ecosystem.',
        images: ['/og-image.png'],
    },
};

async function fetchAcceleratorsData() {
    try {
        const url = `${SHEET_CONFIG.BASE_URL}&gid=${SHEET_CONFIG.TABS.Accelerators}`;
        const res = await fetch(url, { next: { revalidate: 60 } });
        const text = await res.text();
        return parseSheetCSV(text, mappers.accelerators, 1);
    } catch (e) {
        console.error('Failed to fetch accelerators data', e);
        return [];
    }
}

export default async function AcceleratorsFocused() {
    const data = await fetchAcceleratorsData();

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-3 bg-bg-card border-b border-bg-border shrink-0">
                <Link
                    href="/"
                    className="text-xs font-medium text-fg-muted hover:text-fg-primary transition-colors"
                >
                    ← Home
                </Link>
                <h1 className="text-sm font-semibold text-fg-primary tracking-tight">
                    Accelerators Index
                </h1>
                <div className="w-16 flex justify-end">
                    <ThemeToggle />
                </div>
            </header>

            {/* Full Accelerators view */}
            <div className="flex-1 min-h-0">
                <AcceleratorsRegistry initialData={data} loading={false} expanded />
            </div>
        </div>
    );
}
