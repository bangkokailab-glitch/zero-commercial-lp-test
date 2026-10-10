# Secret 9 sample LPs — version 3

Mobile-first editable samples for the fictional duvet cleaning service ふとん便. These sources belong to the existing ZERO test repository. Production is outside this task.

## Review surfaces

- `index.html`: standalone sample gallery.
- `lp-a.html`, `lp-b.html`, `lp-c.html`: complete convenience, cleanliness and family LPs.
- `lp-a-after.html`: the same completed A LP, with an illustrated three-step procedure.
- `lp-a-before.html`: a dedicated comparison variant. Only the procedure content is replaced by the exact original long paragraph.
- `fv-a.html`, `fv-b.html`: identical first-view layout, photograph, price, conditions and CTA; H1 text only differs.
- `design-study.html`: generated standard and type-emphasis concepts, with major lower-section guides.
- `figure-01.html`, `figure-02.html`, `figure-03.html`: editable article diagrams. Figure 04 stays at its existing approved version.
- `renders/`: seven browser-rendered LP/FV JPEGs and measured section geometry. Normal A and After have identical JPEG hashes.

## Design decisions

The left standard concept was selected for each of A/B/C. One pine-green and warm-ivory brand, natural rectangular photos, a shared typographic wordmark and matte buttons are used throughout. The approved first views stay fixed. The lower sections use three distinct compositions: A illustrates the customer's journey; B shows washing, drying and a final check; C combines two duvets with a date-free calendar and the approximate return time. The collection bag stays ivory across the photos and guides.

Normal A and After are identical outside the document title. Before differs only inside the procedure section, with a shared minimum height. B and C use a compact three-step journey. Preparation FAQs use native, working details/summary controls; the first question is open. Pricing and all service conditions remain together in the price section, in addition to the hero summary.

Generated originals are kept in `assets/`; Japanese text, prices and conditions are editable HTML, typeset with the licensed Morisawa Shingo stylesheet. Only photo regions from generated design compositions are exposed with CSS crops. No image font or font binary is extracted. Prompts and asset hashes are recorded separately.

The primary CTA goes to the explicit fictional-service note at `#order`. There is no form, payment or submission. Secondary links go to `#price`. A small mobile CTA appears after the first view and hides at the final note. The interactive page reserves footer space. The full-page export hides that fixed control and removes the reserved space.

## Export

Open a standalone page on the test domain with `?export=2`, set browser viewport to 780px wide, wait for `html[data-font-audit]`, and capture a full-page screenshot through the approved browser tool. This renders the 390px mobile design at twice the resolution. Keep real-size 390px and 360px screenshots for quality review.

Rebuild LP HTML with `python3 build-designs.py`. After saving the seven browser renders and `renders/layout-metadata.json`, run `python3 build-figures.py`. Crop geometry is computed from the dedicated Before LP's measured process section.

For article diagrams, open `figure-01.html` through `figure-03.html` with `?export=2`. Use a 1900px viewport for PC (950px display width) or a 684px viewport for SP (342px display width). Wait for the font audit and image loading, then capture the full page. The output is JPEG, even if a browser tool's default filename suggests another extension.

Figure 02 SP is 18347px tall. A single full-page capture produced repeated content and was rejected. Capture consecutive 4000px-high clips at y=0, 4000, 8000, 12000 and 16000 (the last clip is 2347px high). Use `swift stitch-screenshots.swift output.jpg tile-0.jpg ... tile-4.jpg` to join their pixels without resizing or retouching, then inspect each segment and the four joins. The individual browser clips and capture audit are kept in the task QA directory.

The six delivery files are `../../performance-media/secret09-fig{01,02,03}-{pc,sp}-v3.jpg`. Their actual dimensions are written to the three article `picture` elements. Existing article copy, alternative text, figure 04, other chapters, CSS and JavaScript remain unchanged. The obsolete v2 AVIF source in figure 01 is removed so browsers select the new PC image.

Generated originals, editable HTML/CSS, generation prompts and image hashes are retained in this directory. Review evidence is summarized in `REVIEW.md`; detailed real-size screenshots and audits remain with the task's `secret09-revision-v3/qa` records.

## Comparison checks

Figure 01 must remain identical outside H1. Figure 03 retains the exact original long paragraph in Before and the previously approved short text in After: ネットで予約／自宅から発送／自宅で受け取る. The former proposed constraint that After body concatenation equal the long paragraph was removed; the intended comparison is shortening and structuring the same procedure. Only the procedure section may differ, and both A variants use the same section height.

Final visual approval requires completed standalone LPs at 390px and 360px, actual Shingo font audit, and independent review. Generated guides alone are not completion evidence.
