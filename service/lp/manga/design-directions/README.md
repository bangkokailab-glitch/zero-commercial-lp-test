# Design direction review gallery

This directory is a standalone review gallery. It does not modify or replace the approved manga LP.

## Expected artwork

Place twelve WebP images in `assets/`:

- `A-explanation.webp`, `A-pricing.webp`, `A-ads.webp`, `A-line.webp`
- `B-explanation.webp`, `B-pricing.webp`, `B-ads.webp`, `B-line.webp`
- `C-explanation.webp`, `C-pricing.webp`, `C-ads.webp`, `C-line.webp`

All artwork is shown at its native aspect ratio. There is no viewport-height fitting, forced screen-sized canvas, or image cropping. On desktop, A/B/C are displayed side by side with a maximum 390px column width. Below 900px, direction tabs switch one full-width direction at a time while preserving the current section and relative reading position. The section navigation jumps to the same content across all directions.

`headings.html` is a live HTML typography proof for the approved eleven headings, with 390px / 360px controls. All headings use one font-size rule; long headings never shrink independently. All have two explicit lines except 「私たちについて」. It uses the existing LP's Morisawa CSS URL and font-family names. Image lettering is a visual proposal, not live webfont text.

Ad screens are disclosed as illustrative mockups. LINE controls shown in artwork are not working booking or messaging controls. Artwork links open the full source image; no service actions or external ad clicks are triggered.

Publishing and final artwork verification are owned by the parent task. This gallery alone is not a production LP implementation.
