---
description: Install and configure the Interactor AI widget
---

# Install Interactor AI Widget

Use this workflow only when the user asks to add or update the Interactor widget.

## Steps

1. Confirm the Interactor reference
   - Ask the user for the Interactor ID, reference, or alias if it is not already provided.
   - Do not guess the reference.

2. Add embed assets
   - Add the embed script and stylesheet to the app's document head.

   ```html
   <script type="module" crossorigin src="https://embed.interactor.ai/assets/index.js"></script>
   <link rel="stylesheet" crossorigin href="https://embed.interactor.ai/assets/index.css" />
   ```

3. Initialize the widget
   - Initialize with the user-provided reference.
   - Keep the floating action button visible unless the user requests a custom trigger.

   ```html
   <script>
     window.addEventListener('load', () => {
       window.interactor.initialize('INTERACTOR_REFERENCE', {
         type: 'mobile',
         isOpen: false,
         isFabVisible: true
       });
     });
   </script>
   ```

4. Add TypeScript declarations when needed
   - If the project uses TypeScript, add the `Window` interface extension in an existing declaration file or a focused global declaration file.

   ```ts
   interface Window {
     interactor: {
       initialize: (
         reference: string,
         options?: {
           type?: 'mobile' | 'sidebar';
           isOpen?: boolean;
           isFabVisible?: boolean;
           onOpen?: (layout: HTMLElement) => void;
           onClose?: () => void;
           fabConfig?: unknown;
         }
       ) => void;
       modal: {
         open: () => void;
         close: () => void;
         toggle: () => void;
         getIsOpened: () => boolean;
       };
       button: {
         show: () => void;
         hide: () => void;
         toggle: () => void;
         getIsVisible: () => boolean;
       };
       message: {
         send: (message: string, options?: { shouldOpenChat: boolean }) => Promise<void>;
       };
       fabPresets?: {
         concierge: unknown;
         simple: unknown;
       };
     };
   }
   ```

5. Verify
   - Start or reuse the dev server.
   - Confirm the widget loads and the expected trigger appears.
