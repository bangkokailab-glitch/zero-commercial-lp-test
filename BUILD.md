# LP asset build

The editable CSS and JavaScript remain in `service/lp/`. Inline source blocks from the original page are kept in `service/lp/source-inline/`.

After changing a CSS or JavaScript source, run:

```sh
npm ci
npm run build
```

Commit both the source changes and regenerated `service/lp/page-bundle.css` / `page-bundle.js`. GitHub Pages serves these generated files directly; it does not run npm automatically.

`service/lp/asset-bundle.config.json` preserves the original CSS cascade and JavaScript dependency order. Do not edit the generated bundles directly. When adding a source, add it to this manifest in the appropriate order.

Original artwork is retained. `service/lp/performance-media/` contains lossless WebP delivery versions and the cropped-content SVG banner (the visible SVG pixels were compared against the original). The approved purchased font remains served unchanged by Morisawa.

When deploying a new build, update the bundle query strings in `service/lp/index.html` together so returning visitors load the new assets. Keep the preview site's `noindex,nofollow` and production canonical unchanged. Deployment to `zero-s.jp` requires separate approval.
