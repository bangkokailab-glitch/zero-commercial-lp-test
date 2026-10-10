# ZERO commercial LP performance pass (test site only)

## Preserved

- Approved text, purchased Morisawa font delivery, image dimensions and compositions.
- Existing JPEG/WebP/PNG artwork remains unchanged as the picture fallback.
- CTA motion, scroll entrances and background video playback while visible.
- Test-site noindex/nofollow and production canonical URL.

## Delivery changes

- 59 high-resolution artwork alternatives: AVIF quality 85, 4:4:4, original pixel dimensions.
- Only alternatives saving at least 20% are selected; 9 unhelpful conversions retain their original format.
- Selected originals total 43,108,710 bytes; selected AVIFs total 8,635,168 bytes (80.0% smaller).
- This is the sum of all selected PC/mobile/density variants, **not initial page transfer**.
- AVIF encoding is high quality, not lossless. Source hashes and dimensions are recorded in the manifest.
- Existing `<picture>` media queries and density descriptors remain; unsupported browsers select originals.
- The 17-item works strip loads within 600px instead of all images competing at startup. SVG placeholders preserve PC/mobile ratios; noscript has an original-image fallback.
- Nearby lazy images return to normal priority; visible pending images receive high priority.
- Offscreen campaign strips pause without resetting their timeline; visible strips keep the original speed.
- Slick visibility control also observes initialization, avoiding a cached-page event-order race.

## Verification

- Bundle build and `git diff --check`.
- Chromium desktop 1440px and mobile 390px/360px: all 120 secret-content image dimensions match the previous page; no broken images, horizontal overflow or JS errors.
- AVIF used where supported; unsupported-type simulation restores original assets with no broken images.
- JavaScript-disabled fallback remains readable and includes the works images.
- Works requests at startup: 0; all 17 originals and cloned slides load on approach. Gallery height unchanged before/after loading.
- All five decorative background videos advance while visible and pause offscreen.
- Existing CTA text/arrow timing and floating-button motion retained.
- Sample comparisons of large headline, small text and diagram artwork checked at source size.

## Maintenance

Run `node scripts/optimize-lp-images.cjs` with `sharp` installed, or set `ZERO_IMAGE_TOOLS` to an existing node_modules directory. The script preserves originals and caches results by source hash/settings. Update the matching AVIF `<source>` when replacing an original image; do not leave an older AVIF ahead of revised artwork. Rebuild CSS/JS with `npm run build` after editing source modules.
