# Burmese Typo Checker — Design Ideas

## Approach 1
**Theme Name:** Ink & Signal

**Very Brief Intro:** An editorial proofreading desk that treats Burmese text with care: warm paper surfaces, ink-dark structure, and vermilion review signals. Calm enough for long reading sessions, precise enough for professional QA.

**Probability:** 0.07

## Approach 2
**Theme Name:** Monsoon Atlas

**Very Brief Intro:** A brighter language workspace inspired by field notebooks and rainy-season maps, using soft greens, blue-gray layers, and annotated document trails. Friendly and exploratory rather than clinical.

**Probability:** 0.03

## Approach 3
**Theme Name:** Signal Room

**Very Brief Intro:** A high-contrast operations console for teams processing many documents, with deep graphite surfaces, electric chartreuse alerts, and dense inspection panels. Fast, technical, and intentionally utilitarian.

**Probability:** 0.06

# Chosen Approach: Ink & Signal

## Design Movement
Contemporary editorialism with Southeast Asian print-studio references: tactile paper, restrained ink, and proofing marks translated into a digital workspace.

## Core Principles
1. **Readable first:** Burmese text gets generous line-height, careful scale, and unhurried spacing.
2. **Proofing is visible:** issues are signaled with vermilion underlines, margin notes, and explicit confidence levels.
3. **Warm precision:** the interface feels crafted and humane, not like an opaque machine console.
4. **Asymmetric focus:** the main review canvas gets visual priority while navigation and context stay quiet.

## Color Philosophy
The base is warm ivory rather than sterile white, because proofreading belongs to paper and reading. Ink navy provides dependable contrast and structure. Vermilion is reserved for corrections and action, so it carries meaning instead of decoration. Dusty sage marks “healthy” and “approved” states without competing with the proofing signal.

## Layout Paradigm
A persistent left rail anchors the tool, while the main workspace uses a 12-column asymmetric composition: upload/review content on the left, compact quality summary and activity on the right. The first screen behaves like a desk: a clear work surface, contextual notes, and a single obvious next action.

## Signature Elements
- Vermilion proofing strokes and small margin annotations.
- Fine ruled-paper dividers and subtle paper grain.
- A compact “scan → inspect → export” progress language.

## Interaction Philosophy
Every action should reassure the user what the system understood. Uploading shows file identity, scanning shows an explicit progress state, and each flagged sentence offers a plain-language reason plus one-click acceptance. Avoid hidden automation; make correction choices reviewable.

## Animation
Use short, tactile transitions: cards lift by 2px on hover, proofing marks draw in over 180ms, and the scan indicator moves with a slow, steady pulse. Stagger major panels by 40ms. Respect reduced motion and never animate Burmese text itself.

## Typography System
Use **Noto Sans Myanmar** for Burmese content and **DM Sans** for English UI chrome. Headlines use DM Sans 700 with slightly tight tracking; Burmese review text uses Noto Sans Myanmar 400/500 at a generous 1.8 line-height. Labels are uppercase DM Sans at 0.12em tracking. Never use Inter.

## Brand Essence
A careful Burmese language QA workspace for writers, publishers, and teams who need corrections they can trust — not just errors they can count.

**Personality:** discerning, warm, exacting.

## Brand Voice
Headlines are direct and editorial. CTAs are verbs with a clear outcome. Microcopy explains what the system did and what the user can decide next.

Example lines:
- “Make every Burmese line publish-ready.”
- “Review the marks, keep the meaning.”

## Wordmark & Logo
Use the generated abstract mark: a compact Burmese-glyph loop fused with a proofreader check and vermilion correction stroke. Pair it with the wordmark “စာစစ်” in Burmese next to a small English descriptor “BURMESE TYPO CHECKER”; the mark must remain recognizable without the wordmark.

## Signature Brand Color
**Thanaka Vermilion — #C85A3F.** It is the color of a decisive editorial mark: visible, culturally warm, and used sparingly enough to remain ownable.
