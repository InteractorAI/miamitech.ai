# Repository Guidance

- During visual iteration, use the in-app browser at the user's viewport as the main feedback loop. Do not run `npm run build` after small copy/style/layout tweaks.
- Run `npm run build` before committing or shipping, after dependency/config/type-heavy edits, or when a build/runtime issue is suspected.
- `npm run build` wraps `next build` and restores the canonical `next-env.d.ts` route-type import after the build, including failed builds. If `next-env.d.ts` is still dirty afterward, inspect it as intentional config churn instead of auto-restoring it by hand.
- Browser automation hover checks can be flaky here. Treat user screenshots and real hover/tap reports as stronger evidence than failed synthetic hover attempts.
- Keep action semantics consistent: blue means external link, pink means Interactor/internal action. On touch/mobile, use explicit pink chat controls instead of hidden row-trigger behavior.
- Keep the main mobile tabs quiet and scannable. Do not add scrollspy/active-section tracking unless explicitly requested.
- To ship: push `main`, then run `npx vercel --prod --yes`. Confirm the production deploy aliases to `https://miamitech.ai`.
