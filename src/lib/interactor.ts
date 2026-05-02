export function askInteractor(message: string) {
    if (typeof window === 'undefined') return;

    if (window.interactor?.message?.send) {
        window.interactor.message.send(message, { shouldOpenChat: true });
        return;
    }

    window.interactor?.modal?.open?.();
}

export function usesExplicitTouchActions() {
    if (typeof window === 'undefined') return false;
    return (
        window.innerWidth < 1024 ||
        window.matchMedia('(hover: none)').matches ||
        window.matchMedia('(pointer: coarse)').matches
    );
}
