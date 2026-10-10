# Selected Secret 09 images — 2026-10-10

The user selected eight finished images for the existing test-site A/B-test chapter. Originals are preserved outside this deployment; source filenames and SHA-256 hashes are in `manifest.json`. WebP quality 94, original pixel dimensions, no new generation or visual redesign of the supplied art.

- Figure 01: A = pickup, B = clean. Both copy and design now differ, so the figure's condition labels and the following copy-only paragraph are updated to avoid claiming that only the headline changes.
- Figure 02: A = pickup → pickup-detail → flow → care → offer; B = clean → clean-detail → care → flow → offer; C = family → family-detail → care → flow → offer. The two user-selected benefit images sit immediately below the corresponding main images. All three columns contain five images with the same combined aspect ratio; no stretch, crop or spacer is used to equalize length.

Added benefit assets (2026-10-10): `pickup-detail.webp` from `codex-clipboard-ce9bb7d3-69ff-4594-8687-f3c38b24b355.png`; `clean-detail.webp` from `codex-clipboard-88b9a71f-9c5e-463e-8e3b-56536388b6c0.png`. Both preserve 1024 × 1536 pixels at WebP quality 94. User selected A2 and B2. Figure 01 and the three-step/four-step improvement comparison in Figure 03 remain unchanged.
- Figure 03 (updated): Before now uses the existing three-step flow from Figure 02. After uses the user-approved four-step card image, clarifying the supplied bag, home pickup and return estimate. Surrounding copy describes a hypothetical clarity improvement, not an observed failure or proven uplift. Figure 02 remains the baseline.

The additional `flow-four-steps.webp` uses the approved clipboard image (948 × 1659) at WebP quality 94, preserving dimensions and artwork. No generation, cropping or redesign. Its source and checksum are recorded in `flow-four-steps-manifest.json`.
- Figure 04: selected compact metrics image. Desktop keeps the existing figure width. Mobile displays the two existing panels vertically using CSS viewports of the same image; no text or panels are discarded.

Article diagrams are now responsive HTML containing the selected assets rather than newly flattened giant screenshots. Reused artwork shares one URL, with lazy loading and explicit dimensions. The sample CTA artwork is not a real order form. Other chapters, the historical design-source previews, and production are unchanged.

Implementation stylesheet: `../../secret09-selected.css`. Render checks: desktop 1440px and mobile 390px / 360px.
