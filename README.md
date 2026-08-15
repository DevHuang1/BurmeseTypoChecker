# စာစစ် — Burmese Typo Checker

**စာစစ်** is a polished frontend workspace for reviewing Burmese text from files and images. It presents a clear editorial flow for uploading content, viewing scan progress, reviewing spelling, spacing, and punctuation suggestions, accepting corrections, and preparing an export.

## Included experience

The current prototype includes a Burmese-first review desk, document and image upload entry points, OCR-oriented image checking affordance, scan progress feedback, confidence-labelled issue cards, one-click correction decisions, original-text mode, and an editorial quality summary.

## Local development

Install dependencies and run the development server with:

```bash
pnpm install
pnpm dev
```

Run type checks with `pnpm check`, and create a production build with `pnpm build`.

## Technology

The project is built with React, TypeScript, Vite, Tailwind CSS, shadcn/ui primitives, and Lucide icons.

## Current scope

This repository contains the frontend experience, representative review states, and a conservative Burmese text-quality layer. The detection layer combines Unicode-structure checks with a small curated lexicon and an approved-uncommon-word allowlist, so structurally valid uncommon terms can be retained for review rather than automatically presented as typos. Production OCR, Burmese language-model analysis, document persistence, and corrected DOCX/PDF export integrations are intentionally not connected yet.
