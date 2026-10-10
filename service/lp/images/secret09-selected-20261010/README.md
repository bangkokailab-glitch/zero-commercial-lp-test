# Selected Secret 09 images — 2026-10-10

The user selected eight finished images for the existing test-site A/B-test chapter. Originals are preserved outside this deployment; source filenames and SHA-256 hashes are in `manifest.json`. WebP quality 94, original pixel dimensions, no new generation or visual redesign of the supplied art.

- Figure 01: A = pickup, B = clean. Both copy and design now differ, so the figure's condition labels and the following copy-only paragraph are updated to avoid claiming that only the headline changes.
- Figure 02: A = pickup → flow → care → offer; B = clean → care → flow → offer; C = family → family-detail → care → flow → offer.
- Figure 03: the original long procedure text is retained as Before; the selected flow image is After, matching A in Figure 02.
- Figure 04: selected compact metrics image. Desktop keeps the existing figure width. Mobile displays the two existing panels vertically using CSS viewports of the same image; no text or panels are discarded.

Article diagrams are now responsive HTML containing the selected assets rather than newly flattened giant screenshots. Reused artwork shares one URL, with lazy loading and explicit dimensions. The sample CTA artwork is not a real order form. Other chapters, the historical design-source previews, and production are unchanged.

Implementation stylesheet: `../../secret09-selected.css`. Render checks: desktop 1440px and mobile 390px / 360px.
