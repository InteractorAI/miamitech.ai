'use client';
import { useState } from 'react';
import { Panel } from './TerminalBlock';
// import { useSpacesData } from '../hooks/useSheetData';
import type { CoffeeShopEntry, SpaceEntry } from '../lib/googleSheets';
import { Favicon } from './Favicon';
import { track } from '@vercel/analytics';
import { askInteractor } from '../lib/interactor';
import { InteractorAskIcon } from './InteractorAskIcon';

const PREVIEW_COUNT = 4;

type SpacesTab = 'cowork' | 'coffee';
type DirectoryItem = SpaceEntry | CoffeeShopEntry;

function isCoffeeShop(item: DirectoryItem): item is CoffeeShopEntry {
    return 'area' in item;
}

function getItemLocation(item: DirectoryItem) {
    return isCoffeeShop(item) ? item.area : item.location;
}

function getItemNote(item: DirectoryItem) {
    return isCoffeeShop(item) ? item.note : item.notes;
}

function getItemUrl(item: DirectoryItem) {
    return isCoffeeShop(item) ? item.url : item.url;
}

function getMapsUrl(item: DirectoryItem) {
    if (isCoffeeShop(item)) return item.url;
    const query = [item.name, item.location, 'Miami'].filter(Boolean).join(' ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function MapIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
        </svg>
    );
}

function GlobeIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
        </svg>
    );
}

export function SpacesDirectory({ initialData = [], coffeeShops = [] }: { initialData?: SpaceEntry[]; coffeeShops?: CoffeeShopEntry[] }) {
    const spaces = initialData;
    const [activeTab, setActiveTab] = useState<SpacesTab>('cowork');
    const [expanded, setExpanded] = useState(false);

    const activeItems: DirectoryItem[] = activeTab === 'coffee' ? coffeeShops : spaces;
    const activeLabel = activeTab === 'coffee' ? 'Coffee' : 'Co-work';
    const loading = activeItems.length === 0;
    const visible = expanded ? activeItems : activeItems.slice(0, PREVIEW_COUNT);
    const remaining = activeItems.length - PREVIEW_COUNT;

    const handleTabClick = (tab: SpacesTab) => {
        setActiveTab(tab);
        setExpanded(false);
        track('directory_tab_clicked', { category: 'Spaces', tab });
    };

    const handleAskClick = (e: React.MouseEvent, item: DirectoryItem) => {
        e.stopPropagation();
        const category = isCoffeeShop(item) ? 'Coffee Shops' : 'Spaces';
        track('directory_row_clicked', { category, title: item.name, from: 'ask_button' });
        askInteractor(`Tell me about ${item.name}${isCoffeeShop(item) ? ' coffee shop' : ''}`);
    };

    return (
        <Panel
            title="Spaces"
            noPadding
            action={
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                    {[
                        { id: 'cowork' as const, label: 'Co-work', count: spaces.length },
                        { id: 'coffee' as const, label: 'Coffee', count: coffeeShops.length },
                    ].map(tab => {
                        const selected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabClick(tab.id)}
                                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] transition-colors duration-150 whitespace-nowrap ${selected
                                    ? 'bg-bg-hover/30 text-fg-primary'
                                    : 'text-fg-muted hover:text-fg-secondary hover:bg-bg-hover'
                                    }`}
                                aria-pressed={selected}
                            >
                                <span>{tab.label}</span>
                                <span className="opacity-70">{tab.count}</span>
                            </button>
                        );
                    })}
                </div>
            }
        >
            <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
                {visible.map((item, idx) => {
                    const location = getItemLocation(item);
                    const note = getItemNote(item);
                    const url = getItemUrl(item);
                    const mapsUrl = getMapsUrl(item);
                    const category = isCoffeeShop(item) ? 'Coffee Shops' : 'Spaces';

                    return (
                    <div
                        key={`${activeTab}-${item.name}-${url || idx}`}
                        className="focus-row relative flex items-center justify-between px-5 py-3 border-b border-bg-border-subtle last:border-b-0 hover:bg-bg-hover transition-colors duration-100 group"
                    >
                        {url && (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                    track('directory_link_clicked', { category: isCoffeeShop(item) ? 'Coffee Shops' : 'Spaces', title: item.name, url, from: 'row' });
                                }}
                                className="absolute inset-0 z-10"
                                aria-label={`Open ${item.name}`}
                            />
                        )}
                        <div className="pointer-events-none flex items-center gap-2 min-w-0 flex-1">
                            {url && <Favicon url={url} />}
                            <div className="flex flex-col min-w-0 flex-1 min-[480px]:flex-row min-[480px]:items-baseline min-[480px]:gap-2">
                                <span className="text-sm font-medium text-fg-primary group-hover:text-accent-blue transition-colors truncate min-[480px]:shrink-0 min-[480px]:max-w-[65%] sm:max-w-[80%]">
                                    {item.name}
                                </span>
                                <span className="text-xs text-fg-muted truncate min-w-0 opacity-80">
                                    {location}{note && isCoffeeShop(item) ? ` · ${note}` : ''}
                                </span>
                            </div>
                        </div>
                        <div className="relative z-20 flex items-center gap-1.5 shrink-0 ml-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 transition-opacity duration-150">
                            <button
                                onClick={(e) => handleAskClick(e, item)}
                                className="min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-1 inline-flex items-center justify-center text-accent-pink active:scale-[0.98]"
                                aria-label={`Ask about ${item.name}`}
                                title="Ask Interactor"
                            >
                                <InteractorAskIcon />
                            </button>
                            {url && (
                                <>
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        track('directory_link_clicked', { category, title: item.name, url: mapsUrl, from: 'map_button' });
                                    }}
                                    className="min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-1 inline-flex items-center justify-center text-fg-muted hover:text-accent-blue transition-colors"
                                    title="Google Maps"
                                    aria-label={`Open ${item.name} on Google Maps`}
                                >
                                    <MapIcon />
                                </a>
                                {!isCoffeeShop(item) && (
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        track('directory_link_clicked', { category, title: item.name, url });
                                    }}
                                    className="min-h-9 min-w-9 lg:min-h-0 lg:min-w-0 p-2 lg:p-1 inline-flex items-center justify-center text-fg-muted hover:text-accent-blue transition-colors"
                                    title="Website"
                                    aria-label={`Open ${item.name} website`}
                                >
                                    <GlobeIcon />
                                </a>
                                )}
                                </>
                            )}
                        </div>
                    </div>
                    );
                })}
                {activeItems.length > PREVIEW_COUNT && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full px-5 py-2.5 text-[11px] font-medium text-fg-muted hover:text-accent-pink transition-colors duration-150 text-center"
                    >
                        {expanded ? `↑ Show fewer ${activeLabel.toLowerCase()}` : `↓ ${remaining} more ${activeLabel.toLowerCase()}`}
                    </button>
                )}
            </div>
        </Panel>
    );
}
