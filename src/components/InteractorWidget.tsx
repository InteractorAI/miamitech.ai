import React, { useEffect } from 'react';

declare global {
    interface Window {
        interactor: any;
    }
}

export const InteractorWidget: React.FC = () => {
    useEffect(() => {
        // Check if script is already loaded
        if (document.getElementById('interactor-script')) return;

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://embed.interactor.ai/assets/index.css';
        link.crossOrigin = '';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.id = 'interactor-script';
        script.type = 'module';
        script.src = 'https://embed.interactor.ai/assets/index.js';
        script.crossOrigin = '';

        script.onload = () => {
            // Initialize after load
            if (window.interactor) {
                window.interactor.initialize('miamitech', {
                    type: 'mobile',
                    isOpen: false,
                    isFabVisible: true
                });
            }
        };

        document.head.appendChild(script);
    }, []);

    return null; // Renderless component, just logic
};
