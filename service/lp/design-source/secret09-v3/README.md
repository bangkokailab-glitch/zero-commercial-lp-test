# Secret 9 sample LPs — version 3

Mobile-first editable samples for the fictional duvet cleaning service ふとん便. These sources belong to the existing ZERO test repository. Production is outside this task.

## Review surfaces

- `index.html`: standalone sample gallery.
- `lp-a.html`, `lp-b.html`, `lp-c.html`: complete convenience, cleanliness and family LPs.
- `lp-a-after.html`: the same completed A LP, with an illustrated three-step procedure.
- `lp-a-before.html`: a dedicated comparison variant. Only the procedure content is replaced by the exact original long paragraph.
- `fv-a.html`, `fv-b.html`: identical first-view layout, photograph, price, conditions and CTA; H1 text only differs.
- `design-study.html`: generated standard and type-emphasis concepts, with major lower-section guides.

## Design decisions

The left standard concept was selected for each of A/B/C. One pine-green and warm-ivory brand, natural rectangular photos, a shared typographic wordmark and matte buttons are used throughout. The approved first views stay fixed. The lower sections use three distinct compositions: A illustrates the customer's journey; B shows washing, drying and a final check; C combines two duvets with a date-free calendar and the approximate return time. The collection bag stays ivory across the photos and guides.

Normal A and After are identical outside the document title. Before differs only inside the procedure section, with a shared minimum height. B and C use a compact three-step journey. Preparation FAQs use native, working details/summary controls; the first question is open. Pricing and all service conditions remain together in the price section, in addition to the hero summary.

Generated originals are kept in `assets/`; Japanese text, prices and conditions are editable HTML, typeset with the licensed Morisawa Shingo stylesheet. Only photo regions from generated design compositions are exposed with CSS crops. No image font or font binary is extracted. Prompts and asset hashes are recorded separately.

The primary CTA goes to the explicit fictional-service note at `#order`. There is no form, payment or submission. Secondary links go to `#price`. A small mobile CTA appears after the first view and hides at the final note. The interactive page reserves footer space. The full-page export hides that fixed control and removes the reserved space.

## Export

Open a standalone page on the test domain with `?export=2`, set browser viewport to 780px wide, wait for `html[data-font-audit]`, and capture a full-page screenshot through the approved browser tool. This renders the 390px mobile design at twice the resolution. Keep real-size 390px and 360px screenshots for quality review.

Rebuild HTML with `python3 build-designs.py`. Source-only publication is used to verify the licensed font on its authorized domain before replacing article diagrams. Main article/CSS/JS are unchanged at that stage.

## Comparison checks

Figure 01 must remain identical outside H1. Figure 03 retains the exact original long paragraph in Before and the previously approved short text in After: ネットで予約／自宅から発送／自宅で受け取る. The former proposed constraint that After body concatenation equal the long paragraph was removed; the intended comparison is shortening and structuring the same procedure. Only the procedure section may differ, and both A variants use the same section height.

Final visual approval requires completed standalone LPs at 390px and 360px, actual Shingo font audit, and independent review. Generated guides alone are not completion evidence.
