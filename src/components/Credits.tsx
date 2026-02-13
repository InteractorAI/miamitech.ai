import { useState, useEffect } from 'react';

interface Contributor {
    name: string;
    handle?: string;
}

const CONTRIBUTORS: Contributor[] = [
    { name: 'Michael Morgenstern', handle: '@M___Morgenstern' },
    { name: 'Auston Bunsen', handle: '@bunsen' },
    { name: 'Saif Ishoof', handle: '@saif305' },
    { name: 'David Notik', handle: '@davenotik' },
];

export function Credits() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="text-[11px] font-medium text-fg-muted hover:text-fg-secondary transition-colors duration-150 px-2 py-1 rounded-md hover:bg-bg-hover"
            >
                Contributors
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

                    <div
                        className="relative bg-bg-card border border-bg-border rounded-xl shadow-2xl max-w-xs w-full animate-scale-in overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="h-1 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green" />

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-fg-primary tracking-tight">
                                    Key Contributors
                                </h3>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="text-fg-muted hover:text-fg-primary transition-colors text-lg leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="max-h-64 overflow-y-auto">
                                {CONTRIBUTORS.map((c, i) => (
                                    <div
                                        key={i}
                                        className="py-3 px-2"
                                    >
                                        <div className="text-sm text-fg-primary">{c.name}</div>
                                        {c.handle && (
                                            <a
                                                href={`https://x.com/${c.handle.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={e => e.stopPropagation()}
                                                className="text-xs text-fg-muted hover:text-accent-blue transition-colors"
                                            >
                                                {c.handle}
                                            </a>
                                        )}
                                    </div>
                                ))}
                                <div className="py-3 px-2">
                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                            window.interactor?.message.send('I\'d like to be a contributor to miamitech.ai');
                                        }}
                                        className="text-sm text-fg-muted hover:text-accent-pink transition-colors italic"
                                    >
                                        Missing someone? Tell us →
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-bg-border">
                                <p className="text-[11px] text-fg-muted text-center leading-relaxed">
                                    Powered by{' '}
                                    <a
                                        href="https://interactor.ai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-fg-secondary hover:text-accent-blue transition-colors"
                                    >
                                        Interactor
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
