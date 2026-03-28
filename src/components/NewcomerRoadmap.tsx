'use client';

import { useState, useEffect, useRef } from 'react';
import { QUESTS, Quest } from '../lib/quests';
import Image from 'next/image';
import { track } from '@vercel/analytics';

function QuestInfoPopover({ quest, onClose }: { quest: Quest; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full mt-1 z-50 w-52 bg-bg-card border border-bg-border rounded-lg shadow-xl animate-scale-in overflow-hidden"
        >
            <div className="h-0.5 bg-gradient-to-r from-accent-pink to-accent-blue" />
            <div className="p-3">
                <p className="text-[11px] text-fg-secondary leading-relaxed mb-2">{quest.description}</p>
                <button
                    onClick={onClose}
                    className="text-[11px] font-medium text-fg-muted hover:text-fg-primary transition-colors"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}

function TrophyModal({ onClose, onShare }: { onClose: () => void; onShare: () => void }) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative bg-bg-card border border-bg-border rounded-xl shadow-2xl max-w-sm w-full animate-scale-in overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="h-1.5 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-fg-muted hover:text-fg-primary transition-colors text-lg leading-none p-1"
                >
                    ×
                </button>

                <div className="flex flex-col items-center text-center px-6 pt-6 pb-8">
                    <div className="relative w-52 h-52 mb-5">
                        <div className="absolute inset-0 bg-accent-pink/20 blur-3xl rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-accent-blue/15 blur-2xl rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                        <Image
                            src="/roadmap_trophy.png"
                            alt="Miami Tech Onboarded Trophy"
                            fill
                            className="object-contain relative z-10 drop-shadow-2xl"
                        />
                    </div>
                    <h3 className="text-lg font-bold text-fg-primary mb-1">You're in! 🌴</h3>
                    <p className="text-[13px] text-fg-secondary mb-6 leading-relaxed">
                        You&apos;ve completed all onboarding quests and are officially part of the movement.
                    </p>
                    <button
                        onClick={onShare}
                        className="w-full py-2.5 bg-bg-hover hover:bg-bg-border text-fg-primary rounded-lg font-medium transition-all border border-bg-border animate-led active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.085 4.126H5.117z" />
                        </svg>
                        Share on X
                    </button>
                </div>
            </div>
        </div>
    );
}

export function NewcomerRoadmap() {
    const [completedQuests, setCompletedQuests] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const [showTrophy, setShowTrophy] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('miamitech_quests');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCompletedQuests(parsed);
                if (parsed.length > 0 && parsed.length < QUESTS.length) {
                    setIsExpanded(true);
                }
            } catch { /* ignore */ }
        }
        setIsLoaded(true);
    }, []);

    const toggleQuest = (id: string) => {
        const newCompleted = completedQuests.includes(id)
            ? completedQuests.filter(q => q !== id)
            : [...completedQuests, id];

        setCompletedQuests(newCompleted);
        localStorage.setItem('miamitech_quests', JSON.stringify(newCompleted));

        if (!completedQuests.includes(id)) {
            track('quest_completed', { quest_id: id });
            // Auto-show trophy modal when all quests completed
            if (newCompleted.length === QUESTS.length) {
                setTimeout(() => setShowTrophy(true), 400);
            }
        }
    };

    const isAllCompleted = completedQuests.length === QUESTS.length;
    const progress = QUESTS.length > 0 ? (completedQuests.length / QUESTS.length) * 100 : 0;

    const handleShare = () => {
        track('share_trophy_clicked');
        const text = encodeURIComponent("I'm officially Miami Tech onboarded! 🌴🚀 Check out miamitech.ai #MiamiTech");
        const url = encodeURIComponent("https://miamitech.ai");
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    if (!isLoaded) return null;

    // --- Completed state: compact inline + trophy modal on demand ---
    if (isAllCompleted) {
        return (
            <div className="bg-bg-card">
                {showTrophy && <TrophyModal onClose={() => setShowTrophy(false)} onShare={handleShare} />}
                <button
                    onClick={() => setShowTrophy(true)}
                    className="w-full text-left group border-b border-bg-border shadow-sm shadow-accent-pink/5"
                >
                    <div className="px-5 h-[52px] flex items-center gap-3 hover:bg-bg-hover transition-colors">
                        <div className="relative w-7 h-7 shrink-0">
                            <Image src="/roadmap_trophy.png" alt="Trophy" fill className="object-contain relative z-10" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-fg-primary group-hover:text-accent-pink transition-colors">Miami Tech Onboarded</span>
                                <span className="text-[11px] text-accent-green font-bold">✓</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-medium text-fg-muted group-hover:text-fg-secondary transition-colors">View Trophy →</span>
                    </div>
                </button>
            </div>
        );
    }

    // --- Collapsed teaser bar ---
    if (!isExpanded) {
        return (
            <div className="bg-bg-card border-b border-bg-border">
                <button
                    onClick={() => { setIsExpanded(true); track('roadmap_expanded'); }}
                    className="w-full text-left group"
                >
                    <div className="px-5 h-[52px] flex items-center justify-between bg-gradient-to-r from-accent-pink/[0.04] to-transparent hover:bg-bg-hover transition-colors">
                        <div className="flex items-center gap-3">
                            <h2 className="text-[15px] font-semibold text-accent-green tracking-tight">New here?</h2>
                            <span className="text-[10px] text-accent-pink font-bold uppercase tracking-wider px-2 py-0.5 bg-accent-pink/10 rounded-full">Start Here</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {completedQuests.length > 0 && (
                                <span className="text-[11px] text-fg-muted font-medium">{completedQuests.length}/{QUESTS.length}</span>
                            )}
                            <svg className="w-4 h-4 text-fg-muted group-hover:text-fg-secondary transition-transform duration-200 group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </div>
                    {completedQuests.length > 0 && (
                        <div className="h-1 bg-bg-border/50">
                            <div className="h-full bg-gradient-to-r from-accent-pink to-accent-blue transition-all duration-700" style={{ width: `${progress}%` }} />
                        </div>
                    )}
                </button>
            </div>
        );
    }

    // --- Expanded quest list ---
    return (
        <div className="bg-bg-card">
            {showTrophy && <TrophyModal onClose={() => setShowTrophy(false)} onShare={handleShare} />}

            {/* Header */}
            <div className="px-5 h-[52px] flex items-center justify-between gap-2 border-b border-bg-border bg-bg-elevated/50 shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-accent-green tracking-tight">Start Here</h2>
                    <span className="text-xs text-fg-muted">{completedQuests.length}/{QUESTS.length}</span>
                </div>
                <button
                    onClick={() => setIsExpanded(false)}
                    className="text-fg-muted hover:text-fg-primary transition-colors"
                >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="18 15 12 9 6 15" />
                    </svg>
                </button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-bg-border">
                <div
                    className="h-full bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Quest list */}
            <div className="px-3 py-3 space-y-1.5">
                <p className="text-[11px] text-fg-muted leading-relaxed px-1 pb-1">Your quick-start guide to the Miami tech scene.</p>
                {QUESTS.map((quest) => {
                    const done = completedQuests.includes(quest.id);
                    return (
                        <div
                            key={quest.id}
                            className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-md border transition-all duration-200 cursor-pointer ${done
                                ? 'bg-accent-green/5 border-accent-green/20'
                                : 'bg-bg-hover/30 border-bg-border hover:border-fg-muted/30'
                                }`}
                            onClick={() => toggleQuest(quest.id)}
                        >
                            {/* Checkbox */}
                            <div className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border transition-all duration-200 ${done
                                ? 'bg-accent-green border-accent-green text-bg-card'
                                : 'border-bg-border group-hover:border-fg-muted/50'
                                }`}>
                                {done && (
                                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>

                            {/* Label */}
                            <span className={`flex-1 text-[13px] font-medium leading-tight transition-colors ${done ? 'text-accent-green line-through opacity-70' : 'text-fg-primary'
                                }`}>
                                {quest.label}
                            </span>

                            {/* Info icon */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActivePopover(activePopover === quest.id ? null : quest.id);
                                    }}
                                    className="flex items-center justify-center w-6 h-6 rounded-full text-fg-muted/50 hover:text-fg-secondary hover:bg-bg-hover transition-all duration-200"
                                    title="More info"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 16v-4M12 8h.01" />
                                    </svg>
                                </button>
                                {activePopover === quest.id && (
                                    <QuestInfoPopover quest={quest} onClose={() => setActivePopover(null)} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
