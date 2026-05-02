# Repository Guidance

## Verification

- Do not run `npm run build` after every small visual or copy tweak.
- Prefer fast, targeted checks while iterating, such as browser refreshes, screenshots, `git diff --check`, or direct inspection of the affected component.
- Run `npm run build` when it is actually needed: before committing, before handoff for a larger/riskier change, after dependency/config/type-heavy edits, or when a runtime/build issue is suspected.
- `npm run build` rewrites `next-env.d.ts` to point at `./.next/types/routes.d.ts`; restore it to `./.next/dev/types/routes.d.ts` unless the generated change is intentionally part of the work.

## UX Iteration

- For mobile-width layout tweaks, verify in the in-app browser at the relevant viewport instead of treating a production build as the default feedback loop.
- Keep touch controls visible and readable; use color semantics consistently: blue for external links, pink for Interactor/internal actions.
