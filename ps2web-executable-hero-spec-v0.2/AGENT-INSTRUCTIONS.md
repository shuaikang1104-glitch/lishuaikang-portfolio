# PS2Web Executable Hero Benchmark v0.2

## Read order
1. `hero.executable-spec.json`
2. `reference.png`

## Non-negotiable implementation rules
- Render at exactly **1920×1136**, DPR 1.
- `css.leftPx/topPx/widthPx/heightPx` are **final viewport coordinates**, not suggestions.
- Every rendered leaf uses `position:absolute`. Do **not** add parent offsets a second time.
- Structural groups must not create Flex/Grid flow, padding, margins, centering, or auto sizing.
- Do not put the composition in a scrollable card/container. `html`, `body`, and the benchmark root are 1920×1136 with margin 0 and overflow hidden.
- Text must not wrap merely because its visual bounds are narrow. Use `white-space: pre`; preserve explicit line breaks only.
- Use the exact specified font. If unavailable, STOP and report it.
- Use `typography.fontSizePx` as the executable benchmark font size. Do not reinterpret Photoshop transforms.
- Shapes use the explicit fill/stroke/border-radius values.
- Do not redesign, normalize, optimize, or infer responsive behavior.
- `reference.png` is only the final visual ground truth for validation; do not replace numeric geometry by eyeballing.

## One-pass benchmark
Implement once, capture exactly 1920×1136, and report pixel diff. Do not start iterative visual correction automatically.
