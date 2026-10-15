# Dialogue-free manga backgrounds

2026-10-15: approved existing manga images were edited with the builtin image generation tool to remove speech balloons, their tails, and their text. The deleted areas were reconstructed as salon background or clothing. Existing originals remain in their original asset directories.

The images are used together with `comic-dialogue.css` and live HTML text. The shared `[data-speech-reveal]` controller reveals the balloon, tail and text together, in authored reading order. No empty white balloon should be visible before its dialogue appears. Character name labels are not added.

`story-cvr.webp` also removes the original outer and diagonal frame strokes so the page's shared frame treatment can be applied. Its approved Salon de Six comparison, CVR approximately 1.5 times, and qualifying text remain in the artwork.

All 15 clean images were visually inspected after generation. Final files were encoded as WebP without further image-content editing. Original generation paths and removal specifications are retained in the project `outputs/speech-unification/generation-manifest.json`.
