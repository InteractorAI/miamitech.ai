'use client';

import { FormEvent, useEffect, useState } from 'react';
import { track } from '@vercel/analytics';
import { Panel } from './TerminalBlock';
import { CloseIcon } from './CloseIcon';

const STORAGE_KEY = 'miamitech.follow.profile';

type FollowProfile = {
    displayName: string;
    email: string;
    phone: string;
    emailOptIn: boolean;
    smsOptIn: boolean;
    followedAt: string;
};

type SubmitState = 'idle' | 'submitting' | 'error';

function getFirstName(displayName: string) {
    return displayName.trim().split(/\s+/)[0] || displayName;
}

function readProfile() {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as FollowProfile;
        if (!parsed?.displayName || !parsed?.email) return null;
        return parsed;
    } catch {
        return null;
    }
}

function saveProfile(profile: FollowProfile) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function clearProfile() {
    window.localStorage.removeItem(STORAGE_KEY);
}

type FollowMiamiTechProps = {
    variant?: 'panel' | 'button';
    className?: string;
};

export function FollowMiamiTech({ variant = 'panel', className = '' }: FollowMiamiTechProps) {
    const [profile, setProfile] = useState<FollowProfile | null>(null);
    const [open, setOpen] = useState(false);
    const [submitState, setSubmitState] = useState<SubmitState>('idle');
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [smsOptIn, setSmsOptIn] = useState(false);

    useEffect(() => {
        const saved = readProfile();
        if (!saved) return;

        setProfile(saved);
        setName(saved.displayName);
        setEmail(saved.email);
        setPhone(saved.phone);
        setSmsOptIn(saved.smsOptIn);
    }, []);

    useEffect(() => {
        if (!open) return;

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [open]);

    const openModal = (from: 'follow' | 'update') => {
        track('follow_modal_opened', { from });
        setSubmitState('idle');
        setError('');
        setOpen(true);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitState('submitting');
        setError('');

        try {
            const response = await fetch('/api/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, smsOptIn }),
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json?.error || 'Could not save your follow yet.');
            }

            saveProfile(json.follower);
            setProfile(json.follower);
            track('follow_saved', {
                resend: json.integrations?.resend || 'unknown',
                sms_opt_in: Boolean(json.follower?.smsOptIn),
            });

            setOpen(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Could not save your follow yet.';
            setError(message);
            setSubmitState('error');
            track('follow_save_failed');
        }
    };

    const handleUnfollow = async () => {
        if (!profile?.email) return;

        const confirmed = window.confirm('Remove your follow record and stop MiamiTech.ai updates?');
        if (!confirmed) return;

        setIsDeleting(true);
        setSubmitState('idle');
        setError('');

        try {
            const response = await fetch('/api/follow', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile.email }),
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json?.error || 'Could not remove your follow yet.');
            }

            clearProfile();
            setProfile(null);
            setName('');
            setEmail('');
            setPhone('');
            setSmsOptIn(false);
            setOpen(false);
            track('follow_removed', {
                resend: json.integrations?.resend || 'unknown',
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Could not remove your follow yet.';
            setError(message);
            track('follow_remove_failed');
        } finally {
            setIsDeleting(false);
        }
    };

    const modal = open && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-fade-in" />

                    <form
                        onSubmit={handleSubmit}
                        className="relative w-full max-w-sm overflow-hidden rounded-xl border border-bg-border bg-bg-card shadow-2xl animate-scale-in"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="h-1.5 bg-gradient-to-r from-accent-pink via-accent-blue to-accent-green" />

                        <div className="flex items-center justify-between border-b border-bg-border p-4">
                            <div>
                                <h2 className="text-[15px] font-bold tracking-tight text-fg-primary">Follow MiamiTech.ai</h2>
                                <p className="mt-1 text-xs text-fg-muted">Love our updates, or leave anytime.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-bg-border text-fg-muted transition-colors duration-150 hover:bg-bg-hover hover:text-fg-primary"
                                aria-label="Close"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="space-y-3 px-5 py-5">
                            <label className="block">
                                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-fg-muted">Name</span>
                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    autoComplete="name"
                                    required
                                    className="h-10 w-full rounded-md border border-bg-border bg-bg-primary px-3 text-sm text-fg-primary outline-none transition-colors placeholder:text-fg-muted focus:border-accent-pink"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-fg-muted">Email</span>
                                <input
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoComplete="email"
                                    inputMode="email"
                                    type="email"
                                    required
                                    className="h-10 w-full rounded-md border border-bg-border bg-bg-primary px-3 text-sm text-fg-primary outline-none transition-colors placeholder:text-fg-muted focus:border-accent-pink"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-fg-muted">
                                    Phone {smsOptIn ? '' : <span className="normal-case tracking-normal">(optional)</span>}
                                </span>
                                <input
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    autoComplete="tel"
                                    inputMode="tel"
                                    type="tel"
                                    required={smsOptIn}
                                    className="h-10 w-full rounded-md border border-bg-border bg-bg-primary px-3 text-sm text-fg-primary outline-none transition-colors placeholder:text-fg-muted focus:border-accent-pink"
                                />
                            </label>

                            <label className="flex items-start gap-2 rounded-md border border-bg-border bg-bg-primary/60 p-3 text-xs leading-relaxed text-fg-secondary">
                                <input
                                    type="checkbox"
                                    checked={smsOptIn}
                                    onChange={(event) => setSmsOptIn(event.target.checked)}
                                    className="mt-0.5 h-4 w-4 accent-[#e040fb]"
                                />
                                <span>Text me occasional MiamiTech.ai updates</span>
                            </label>

                            {error && (
                                <p className="rounded-md border border-accent-pink bg-accent-pink/10 px-3 py-2 text-xs text-fg-primary">
                                    {error}
                                </p>
                            )}

                        </div>

                        <div className="border-t border-bg-border p-4">
                            <button
                                type="submit"
                                disabled={submitState === 'submitting' || isDeleting}
                                className="h-10 w-full rounded-md bg-accent-pink px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-pink/90 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
                            >
                                {submitState === 'submitting' ? 'Saving...' : profile ? 'Save Contact' : 'Follow'}
                            </button>
                            {profile && (
                                <button
                                    type="button"
                                    onClick={handleUnfollow}
                                    disabled={isDeleting || submitState === 'submitting'}
                                    className="mt-3 w-full text-center text-[11px] font-medium text-fg-muted transition-colors duration-150 hover:text-accent-pink disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isDeleting ? 'Leaving...' : 'Unfollow MiamiTech.ai'}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            );

    if (variant === 'button') {
        return (
            <>
                <button
                    onClick={() => openModal(profile ? 'update' : 'follow')}
                    className={className}
                >
                    {profile ? 'Following' : 'Follow'}
                </button>
                {modal}
            </>
        );
    }

    return (
        <Panel title="Follow">
            <div className="space-y-4">
                {profile ? (
                    <>
                        <div>
                            <p className="text-sm font-semibold text-fg-primary">Hi, {getFirstName(profile.displayName)}.</p>
                            <p className="mt-1 text-sm leading-relaxed text-fg-secondary">
                                You're set to receive occasional updates about events and more.
                            </p>
                        </div>
                        <button
                            onClick={() => openModal('update')}
                            className="w-full rounded-md border border-bg-border px-3 py-2 text-[11px] font-medium text-fg-secondary transition-all duration-200 hover:bg-bg-hover hover:text-accent-pink"
                        >
                            Update Contact
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-sm leading-relaxed text-fg-secondary">
                            Get occassional Miami tech signal in your inbox. Never spam, leave anytime.
                        </p>
                        <button
                            onClick={() => openModal('follow')}
                            className="w-full rounded-md border border-accent-pink/50 px-3 py-2 text-[11px] font-medium text-fg-secondary transition-all duration-200 hover:border-accent-pink hover:bg-bg-hover hover:text-fg-primary active:scale-[0.98]"
                        >
                            Follow MiamiTech.ai
                        </button>
                    </>
                )}
            </div>

            {modal}
        </Panel>
    );
}
