# ZERO LP: quality-preserving loading and rendering pass

Scope: local preview and `bangkokailab-glitch/zero-commercial-lp-test` only.
Baseline: `53de76e`. No production deployment.

## Preserved

- No photographs, SVG artwork, AVIF/WebP/JPEG/PNG images, image dimensions,
  copy, Morisawa font families, section geometry, or animation timings changed.
- The current strategy A diagram, its mobile three-column topology, nine
  cards/nine arrows, and shared campaign/strategy background remain intact.
- Native picture source selection, image fallbacks, mobile accordions, manual
  swipe controls, reduced-motion behavior and no-JavaScript content remain.

## Changes

- Give the existing first-view background poster preload and deferred page
  script high fetch priority. Avoid adding extra image/font downloads.
- Do not eagerly download hidden desktop navigation icons on phones or the
  distant secret-cover logo. Their originals and dimensions are unchanged.
- Exclude unused WOW, lazysizes and picturefill from this page's bundle.
  Current motion uses the existing IntersectionObserver/WAAPI controllers;
  current lazy images and picture elements use native browser support.
  This also removes WOW's unused 50ms timer and subtree mutation observer.
- Exclude obsolete marketing-flow/secret-10-only CSS and JS, and the old
  purpose-slider controller (its grids explicitly use manual-swipe instead).
  Original source files remain available; the comparison page is unaffected.
- Coalesce gallery load/resize/font-triggered geometry work into animation
  frames, and batch reads before writes. Keep clones, 18px/sec speed and
  offscreen pause/resume semantics unchanged.
- Batch shared-background/CTA positioning reads before writes; do not write
  unchanged transforms or repeatedly add pinning classes.
- Remux `images/mv.mp4` with stream copy and `+faststart`, without re-encoding.
  Cache-version the six current background references and keep visibility
  playback matching query-versioned URLs.

## Deterministic size and quality checks

- CSS bundle: 338,946 -> 329,359 bytes (raw/minified).
- JS bundle: 231,093 -> 195,864 bytes (raw/minified; about 15% smaller).
- These are file sizes, not a claim of an equivalent whole-page speed gain.
- Video: 226,586 -> 226,605 bytes. Metadata moved from byte 220,453 to byte 32.
- All 451 encoded packet records and all 451 decoded frame records, including
  timestamps, are identical. H.264 High/yuv420p, 480x320, SAR 71:60, 29.97fps,
  duration about 15.04837 seconds, no audio: all unchanged.
- Original video SHA256:
  `c95fe34fbe6f1b7a71bb88edc80a4d0d3639bd8a029d143e2aff4d25ca242248`
- Faststart video SHA256:
  `78c2d2d46ad214623a049daa8be7a8e3f17ae1ffb559cbad82fb4cef3b63c628`
- Matching decoded-frame record SHA256:
  `9201c80cddc2a65894b1c71a02aca237fb0916eee3cc91a75a4d33d866bbc205`

## Validation and maintenance

- Build with `node scripts/build-lp-assets.cjs`; use source files for edits.
- Compare 1440px, 390px and 360px section bounds, authored image sources and
  dimensions, visible copy and actually loaded licensed Morisawa faces.
- Exercise strategy layout/motion, TOC keyboard/pointer operation, accordions,
  gallery movement and shared-video boundary continuity.
- Cold-cache timing uses a simulated 1.6Mbps/150ms/4x CPU mobile profile and
  10Mbps/40ms/1x CPU desktop profile. CDN/network timings vary; local localhost
  font delivery is not equivalent to licensed public-domain delivery.
- Do not further compress artwork, change font kits or use estimated-height
  content virtualization merely to improve a score: those can alter approved
  appearance, anchor positions or diagram layout.
- Before reporting deployment, compare public HTML/CSS/JS/video hashes with
  local files and verify the actual public page at PC/mobile widths.
