# PS2Web Hero Benchmark — Agent Instructions

Implement the supplied Hero at exactly 1920×1136.

## Authority order
1. `hero.web-spec.reviewed.json` — geometry, typography facts, hierarchy, masks/clipping, render decisions.
2. `reference.png` — final visual ground truth and confirmation of intended crop/composition.

## Hard rules
- Do not redesign, optimize, simplify, center, auto-fit, or normalize the composition.
- Do not replace measured absolute geometry with generic Flex/Grid when that changes placement.
- Preserve intentional overflow/crop. The viewport is exactly 1920×1136.
- Render only elements whose `renderDecision.status` is `include`.
- IDs 18, 21, and 56 are intentionally included even though Photoshop reports them hidden; their contribution is confirmed by the reference PNG.
- Do not turn `transformScaledFontSizeEstimate*` into CSS font-size blindly. Use source font data, transform, local text geometry, and visual bounds together.
- Use exact fonts. If a required font is unavailable, stop and report the missing font; do not silently substitute.
- Do not invent missing assets or effects.

## Benchmark
First produce a deterministic 1920×1136 desktop render. Responsive/mobile behavior is out of scope.
