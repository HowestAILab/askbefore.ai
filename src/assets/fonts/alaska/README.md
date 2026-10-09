# Alaska webfonts

Brand typeface of Askbefore.AI. Each style exists as `.woff2` (served first) and `.woff` (fallback). The `.woff`
files are the originals; the `.woff2` files are lossless builds of them (identical glyph outlines, advances and kerning).

| File | Font (internal name) | CSS family | Used for |
| --- | --- | --- | --- |
| `alaska-light` | Alaska Light 3.000 | `Alaska Light` | body text, menu pills (`--font-body`) |
| `alaska-bold` | Alaska Bold 3.000 | `Alaska Bold` | buttons, CTA bars, labels, footer headings (`--font-heading`) |
| `alaska-expanded` | Alaska Expanded Contrast 3.000 | `Alaska Expanded` | the intro line on the Aanbod page (`--font-display-2`) |
| `alaska-expanded-bold` | AlaskaBeta-ExpBoldContrast 2.000 | `Alaska Expanded Bold` | headlines, section and card titles (`--font-display-1`) |

Notes

- `alaska-expanded-bold` is a *beta* cut with fewer glyphs (403 vs 539). It has no `→ ← ↗ ² ³ ½`. Do not use those
  characters in headlines, or ask the type foundry for a full 3.000 cut.
- The `@font-face` rules live in `src/styles/fonts.css`; the preloads in `src/layouts/Layout.astro`.
- To replace a font, overwrite the file here (keep the name). The build emits content-hashed URLs, so visitors get the
  new file immediately.
