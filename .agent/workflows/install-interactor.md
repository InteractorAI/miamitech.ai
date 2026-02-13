---
description: Install and configure the Interactor AI agent based on the provided API documentation
---

# Install Interactor AI Agent

1. **Ask for Interactor ID**
   - The user must provide their Interactor ID (or "reference"/"alias") before proceeding.
   - Example: "Please provide the Interactor ID (reference) you would like to use."

2. **Add Assets to index.html**
   - Insert the following script and stylesheet links into the `<head>` of `index.html`.
   ```html
   <script type="module" crossorigin src="https://embed.interactor.ai/assets/index.js"></script>
   <link rel="stylesheet" crossorigin href="https://embed.interactor.ai/assets/index.css" />
   ```

3. **Initialize the Widget**
   - Add a script to initialize the widget. This can be in `index.html` or a main entry file (like `main.tsx` or `App.tsx` depending on the framework).
   - **Crucial**: Use the user-provided Interactor ID in place of `YOUR_INTERACTOR_ID`.
   ```html
   <script>
     window.addEventListener('load', () => {
       window.interactor.initialize('YOUR_INTERACTOR_ID', {
         type: 'mobile', // Default to mobile, but can be 'sidebar' if requested
         isOpen: false,
         isFabVisible: true
       });
     });
   </script>
   ```

4. **Add TypeScript Declarations (if applicable)**
   - If the project uses TypeScript, add the `Window` interface extension to a declaration file (e.g., `src/vite-env.d.ts` or `src/types/global.d.ts`).
   ```typescript
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
           fabConfig?: any;
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
         concierge: any;
         simple: any;
       };
     };
   }
   ```

5. **Verify Installation**
   - Check if the floating action button appears on the development server.
