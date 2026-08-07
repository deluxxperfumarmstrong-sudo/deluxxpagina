---
version: alpha
name: Deluxx Perfum
description: Dark, metallic, masculine-premium design system for the Deluxx Perfum online fragrance store.
colors:
  background: "#3A3A3D"
  surface: "#2A2A2C"
  surface-raised: "#232325"
  surface-metallic: "#55555A"
  on-background: "#F5F5F5"
  on-surface: "#EDEDED"
  on-surface-muted: "#C4C4C8"
  border: "#55555A"
  border-subtle: "#48484C"
  primary: "#FFFFFF"
  on-primary: "#0A0A0A"
  accent: "#D42328"
  accent-hover: "#B81C21"
  on-accent: "#FFFFFF"
  accent-text: "#F0898E"
  success: "#3EA05B"
  warning: "#D6A527"
  error: "#D42328"
  info: "#5A8CC2"

typography:
  display:
    fontFamily: "Anton, 'Archivo Black', sans-serif"
    fontSize: 4rem
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: -0.01em
  h1:
    fontFamily: "Anton, 'Archivo Black', sans-serif"
    fontSize: 2.75rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0em
  h2:
    fontFamily: "Anton, 'Archivo Black', sans-serif"
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: 0em
  h3:
    fontFamily: "'Archivo', sans-serif"
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.01em
  body:
    fontFamily: "'Archivo', sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  body-emphasis:
    fontFamily: "'Archivo', sans-serif"
    fontSize: 1rem
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: 0em
  caption:
    fontFamily: "'Archivo', sans-serif"
    fontSize: 0.8125rem
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.03em
    fontFeature: "uppercase"
  label-outline:
    fontFamily: "'Archivo', sans-serif"
    fontSize: 1rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.08em
    fontFeature: "uppercase"

rounded:
  none: 0px
  sm: 2px
  md: 4px
  full: 999px

spacing:
  1: 4px
  2: 8px
  3: 16px
  4: 24px
  5: 32px
  6: 48px
  7: 64px
  8: 96px
  9: 128px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-emphasis}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "#E8E8E8"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-emphasis}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-primary-disabled:
    backgroundColor: "{colors.border}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-emphasis}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-accent:
    backgroundColor: "transparent"
    textColor: "{colors.accent-text}"
    typography: "{typography.label-outline}"
    rounded: "{rounded.none}"
    padding: "15px 31px"
  button-accent-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label-outline}"
    rounded: "{rounded.none}"
    padding: "16px 32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-emphasis}"
    rounded: "{rounded.none}"
    padding: "15px 31px"
  card-product:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "{spacing.4}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
    height: 48px
  input-field-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
    height: 48px
  badge-price:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.h3}"
    rounded: "{rounded.none}"
    padding: "0"
  chip-tag:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "6px 14px"
  nav-bar:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    typography: "{typography.body-emphasis}"
    rounded: "{rounded.none}"
    padding: "24px 48px"
---

# Deluxx Perfum Design System

## Overview

Deluxx Perfum is a dark, masculine, premium online fragrance store. The logo sets the tone directly: a black-to-metallic-gray gradient background, bold condensed white wordmark "DELUXX," and a fine red outline "PERFUM" flanked by wave flourishes. The product should feel like walking into a dimly lit, high-end boutique — confident, minimal, a little industrial, never loud. This is not a playful or colorful brand: avoid pastel accents, rounded-friendly UI, or dense information layouts that undercut the sense of exclusivity. The single accent color (red) must stay rare and deliberate — it marks price, call-to-action, or a limited flourish, never a whole surface.

## Colors

The palette is almost monochrome by design, mirroring the logo's black-to-metallic-gray gradient. `background` (#3A3A3D) is that same brushed metallic gray, not black — the app's base plane reads like the right side of the logo's gradient. `surface` and `surface-raised` sit darker than background (#2A2A2C → #232325) so cards and panels recede into shadow against the gray field, while `surface-metallic` (#55555A) sits lighter, reserved for highlight/hover states — think brushed metal catching light. `primary` is pure white (#FFFFFF), used for the wordmark-style headlines and primary actions, echoing the logo's bold white "DELUXX." `accent` (#D42328) is the exact temperature of the logo's red outline — reserved for price emphasis, primary CTAs on hover, sale badges, and the occasional outlined label treatment that mirrors the "PERFUM" wordmark. `accent` is a *fill* color: it only meets WCAG AA when it sits behind white text (`on-accent`), so it belongs on solid backgrounds and hover states, not as standalone text or a border on top of `background`/`surface`. `accent-text` (#F0898E) is the same red hue lightened until it clears 4.5:1 on both `background` and `surface` — use it whenever accent-colored text or a border needs to sit directly on the page at rest (outline-button copy and border, badges, inline links, price/seña callouts). Semantic colors (`success`, `warning`, `info`) are desaturated enough not to compete with the red accent; `error` intentionally reuses the accent red since this brand only needs one "urgent" color. All body text pairs (`on-background`, `on-surface`) are verified at WCAG AA against their respective backgrounds.

## Typography

Headlines use a heavy, condensed display face (Anton or Archivo Black) to match the logo's bold blocky "DELUXX" lettering — tight line-height, near-zero letter-spacing, always used sparingly for maximum impact (product names, hero statements, section titles). Body copy switches to Archivo, a neutral grotesque, so long-form content (descriptions, checkout, legal) stays legible and doesn't fight the display face for attention. `label-outline` is a dedicated uppercase, wide-tracked style reserved for the red-accent moments that echo the "PERFUM" outline treatment — used on outline buttons and limited-edition tags, never on dense body text.

## Layout

Spacing follows an editorial, generous scale (4 / 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128px) — closer to a luxury lookbook than a dense commerce grid. Product grids should breathe: fewer items per row with more surrounding negative space signals exclusivity over volume. Section transitions use the largest steps (64–128px) to create clear pacing between hero, featured collection, and footer. Never compress spacing to fit more content — if a screen feels crowded, cut content before cutting space.

## Elevation & Depth

No soft drop shadows — they read as generic SaaS, not luxury retail. Depth comes from tonal layering (surface-raised, darkest, → surface → background → surface-metallic, lightest) and 1px hairline borders (`border`, `border-subtle`), the same way the logo achieves depth through gradient and metallic texture rather than cast shadow. Reserve subtle borders for card edges and dividers; use surface-tier shifts, not shadows, to lift modals and popovers off the page.

## Shapes

Sharp corners throughout (0–4px), matching the angular geometry of the "DELUXX" wordmark. `rounded.none` is the default for buttons, inputs, cards, and nav — deliberate and architectural. `rounded.full` exists only for small tag/chip elements, a controlled nod to the logo's wave flourishes, and should never be used on primary surfaces or buttons. This contrast (sharp structure, one rounded exception) is intentional — don't blur it by rounding everything "a little."

## Components

`button-primary` is solid white on black (inverted from body text) — the highest-contrast, highest-priority action per screen (Add to Cart, Checkout). `button-accent` is the outline treatment lifted straight from the logo's "PERFUM" wordmark: transparent background, red text and border, filling solid red only on hover — use for secondary emphasis (View Collection, Notify Me). `button-ghost` is text-only for tertiary actions inside dense areas like filters. `card-product` uses `surface` background with a 2px radius (the one place a hint of softness is allowed, since it's photography-heavy) and generous internal padding (`spacing.4`) around product imagery. `input-field` stays sharp-cornered and dark, with a visible border on focus rather than a glow, consistent with the no-shadow depth strategy. `badge-price` is unstyled typography (`h3` weight in white) — the price should read like a headline, not a pill. `chip-tag` is the sole fully-rounded component, used for scent-family or size filters. `nav-bar` sits flush against `background` with generous horizontal padding (48px), keeping the header feeling like gallery signage rather than a toolbar.

## Do's and Don'ts

**Do:**
- Keep the red accent rare — one CTA or price per view, never a full section tinted red.
- Use the condensed display face only for short, high-impact strings (product names, section titles) — never body paragraphs.
- Let product photography and negative space carry the page; UI chrome should recede.
- Keep corners sharp everywhere except the explicitly rounded chip/tag component.
- Build depth with tonal surface steps and hairline borders, not shadows.

**Don't:**
- Don't introduce a second accent hue (no blues, golds, or pastels) — it dilutes the mono-plus-red identity.
- Don't round buttons, cards, inputs, or nav elements — it reads as generic e-commerce, not this brand.
- Don't use soft drop shadows or glows — they contradict the flat-metallic depth language.
- Don't cram product grids tight to fit more items — density kills the luxury read.
- Don't set body copy or long descriptions in the display face — it hurts legibility and cheapens the headline impact.
