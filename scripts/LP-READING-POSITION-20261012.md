# Navigation and reload behavior

- Fresh document navigation starts at the first view, including URLs with an old section fragment. Query parameters are preserved. Explicit in-page links continue to move to their target.
- Reload keeps the current reading content and its viewport offset. It also restores open secret/pricing panels, FAQ details, and the selected manual-swipe card.
- A bookmark is stored only in the current browser history entry. No cookies, cross-tab storage, form fields, or personal information are collected. Unrelated history state is preserved.
- Native back/forward cache restoration is retained. When a history entry reloads a document, its own bookmark can restore its content.
- Font/image layout changes are corrected for up to eight seconds; any reading/navigation interaction ends the correction. There is no continuous scroll loop.
- If no bookmark exists, reload uses native browser restoration. Script failure retains readable content and native restoration.

## Implementation

`preview-start.js` is the source of the early head policy. `scripts/build-lp-assets.cjs` synchronizes it into `index.html` so fragment/reset decisions happen before page parsing. `reading-position.js` runs after the normal deferred UI initializers. Existing accordion controls restore their own internal state without animation or focus movement. Manual-swipe controls restore the same card, including its variable height.

No copy, layout, image quality, or CSS changes were made. The new deferred code is included in the existing bundle, with no additional network request.

## Verification

Task-workspace checks: `outputs/reading-position-20261012/verify.cjs` (local files under the licensed origin; `--live` for the test site).

Test widths: 1440px, 390px, 360px. Cases: fresh URL with fragment, secret text, deep strategy section, mobile FAQ, nested request-flow panel, third carousel card, explicit price link, new URL, and preservation of unrelated history state. Reloaded content offsets differ by less than one pixel in the local runs. Browser script errors and horizontal overflow are checked as well.

Reference APIs: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming/type and https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration

Publication scope remains the GitHub test site only. Production is unchanged.
