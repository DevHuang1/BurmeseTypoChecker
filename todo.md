# GitHub Push Checklist

- [x] Inspect the selected ExamBuddyBot repository and confirm that it contains unrelated work.
- [x] Confirm the approved approach: create a separate BurmeseTypoChecker repository.
- [x] Confirm the local project has no unintended generated build artifacts or secrets.
- [x] Remove the temporary JSX diagnostic helper from the committed project.
- [x] Prepare a safe standalone commit for the Burmese typo-checker project.
- [x] Create the new GitHub repository and push the main branch.
- [x] Confirm the pushed branch, commit, and repository URL.

## Burmese Typo Detection Tests

- [x] Inspect the existing test runner and identify a testable detection boundary.
- [x] Add a deterministic Burmese syllable typo-detection rule module.
- [x] Cover complex stacked consonants, kinzi forms, vowel signs, and invalid orderings.
- [x] Run type checks and the automated test suite.

## Curated Burmese Dictionary

- [x] Define dictionary outcomes for common, approved-uncommon, and unknown Burmese words.
- [x] Add a curated core lexicon and an approved-uncommon-word allowlist.
- [x] Classify tokens without suppressing structural typo findings.
- [x] Add dictionary-aware regression tests and run verification.

## Reviewed Domain Lexicons

- [x] Gather vocabulary from authoritative Burmese legal and medical references.
- [x] Add categorized legal and medical term lists with source metadata.
- [x] Extend dictionary classification to report the recognized domain.
- [x] Add legal and medical regression tests and run the full verification suite.

## Reusable Skill

- [x] Initialize the reusable Burmese typo-checker skill package.
- [x] Write concise workflow instructions and bundled references.
- [x] Validate the skill package and deliver its SKILL.md.

## Reusable Skill Sample Test

- [x] Define legal and medical sample passages with known domain terms, unknown terms, and structural errors.
- [x] Run the reusable skill workflow and inspect token classifications.
- [x] Report pass/fail findings and recommended refinements.

## Affix-Aware Tokenization

- [x] Define conservative supported Burmese particles and postpositions.
- [x] Implement base-term resolution while preserving original spans and structural issues.
- [x] Add attached legal and medical particle regression tests.
- [x] Run the full test, type-check, and build verification.

## Instant Scan Results

- [x] Inspect the current scanner layout and interaction state.
- [x] Add instant below-scanner typo results with page, line, and character locations.
- [x] Add responsive result-row interactions and correction metadata.
- [x] Verify the UI, tests, type checks, and production build.

## Scan Results Visibility Defect

- [x] Inspect the live preview, recent browser console output, and scanner interaction state.
- [x] Ensure results are hidden before a scan and visibly revealed after scanning completes.
- [x] Verify the scan button and result panel in the live preview at desktop and mobile sizes.

## Functional File and Image Scanning

- [x] Review the project OCR helper and choose supported upload formats.
- [x] Extract uploaded text and image OCR output into a scan-ready document model.
- [x] Generate structural and dictionary-aware Burmese findings with source locations.
- [x] Test text and image uploads, error states, and visible scan results.

## Editable Extracted Text

- [x] Inspect extracted-text state and current result synchronization.
- [x] Add direct editing controls with save and reset actions.
- [x] Re-scan edited content and refresh result locations.
- [x] Verify the edit, reset, and re-scan experience.

## Public Deployment Sync

- [x] Inspect the public deployment against the latest editable-text checkpoint.
- [x] Synchronize or restart the published site if it is stale.
- [x] Verify upload, extracted-text editing, save, reset, and re-scan from the public URL.

## PDF Worker Fix

- [x] Inspect the PDF extraction path and worker configuration.
- [x] Configure PDF.js GlobalWorkerOptions.workerSrc for browser builds.
- [x] Add PDF extraction regression coverage and verify TXT, DOCX, and image paths remain intact.
- [x] Rebuild, restart, and validate a real PDF scan.

## PDF Scan Feedback Fix

- [x] Inspect the PDF progress state and undefined-function error path.
- [x] Add a visible PDF extraction progress bar or loading animation.
- [x] Make PDF progress and error rendering safe when values are missing.
- [x] Verify successful PDF scans and regression coverage.

## Recurring PDF Runtime Error

- [x] Inspect the public PDF error and browser extraction compatibility path.
- [x] Add a compatibility-safe fallback for PDF text item collections.
- [x] Re-test a real public PDF scan and the full regression suite.

## Corrected Text Export

- [x] Inspect the existing extracted-text and export controls.
- [x] Add downloadable corrected TXT export.
- [x] Add newly generated corrected Burmese PDF export.
- [x] Verify exports use the latest saved corrections and pass regression checks.

## PDF Scan Regression During Export Work

- [x] Isolate the current `undefined is not a function` PDF scan failure.
- [x] Implement and test a minimal compatibility-safe PDF extraction path.
- [x] Re-verify browser PDF scanning before resuming corrected-text export.

## Corrected Burmese DOCX Export

- [x] Inspect the current TXT/PDF export implementation and available DOCX generation dependencies.
- [x] Add corrected Burmese DOCX generation with Noto Sans Myanmar font styling embedded in the document package.
- [x] Add the DOCX export control and success/error feedback to the extracted-text view.
- [x] Add automated coverage for DOCX package generation and Burmese text preservation.
- [x] Verify DOCX download in the browser, run tests/type checks/build, and publish the checkpoint.

## Recurring PDF Scan Error Reported Again

- [x] Verify the reported `undefined is not a function (near '...i of e...')` error no longer occurs on the published website.
- [x] Inspect browser and development logs to identify the remaining incompatible iterator or collection path.
- [x] Replace the failing runtime path with compatibility-safe indexed access and add regression coverage.
- [x] Re-test a real Burmese PDF scan on the published website, then run checks and publish the fix.

## Deep Scan Compatibility Regression

- [x] Test the supplied TypeScript-Baby-By-LwinMoePaing.pdf on the published build; it completed without the reported runtime error, so the exact failure was not reproduced after the compatibility fix.
- [x] Trace PDF, DOCX, TXT, and OCR extraction plus scan-location paths for remaining unsupported iterables or collection assumptions.
- [x] Centralize compatibility normalization and add targeted regression tests for the compatibility helper and PDF collection path.
- [x] Add scan-path regression tests for TXT, DOCX, and OCR/image inputs flowing into the scanner.
- [x] Verify real PDF, DOCX, TXT, and image scans in the browser with no `Scan needs attention` runtime error.
- [x] Save and publish the deep compatibility fix after the complete verification pass.

## Supplied PDF Regression: TypeScript-Baby-By-LwinMoePaing.pdf

- [x] Test the supplied PDF in the published site; it completed with 50 findings and no runtime error.
- [x] Inspect the supplied PDF metadata and extracted-text shape: 84 pages, 142,895 extracted characters, unencrypted PDF 1.7.
- [x] Apply the compatibility-safe collection and character normalization fix and cover the relevant PDF shape with regression tests.
- [x] Verify the supplied PDF completes scanning in the browser, run all checks, and publish the correction.

## PDF Finding Location Highlighting

- [x] Inspect the current selected-finding state, extracted-text rendering, and page/line/character metadata.
- [x] Add exact finding highlights in result cards, selected-finding detail, and the extracted-text PDF view with selected-finding focus and navigation.
- [x] Add regression coverage for exact finding source lengths, page transitions, selected highlight ranges, Burmese-safe line wrapping, and page-boundary content.
- [x] Verify the highlighting interaction in the browser, run 39 tests, TypeScript checks, and the production build.
- [x] Save and publish the completed PDF location-highlighting update.

## Scan Runtime Regression During PDF Highlight Work

- [x] Re-test the supplied TypeScript PDF on the current preview; it completed with 50 findings and the recurring runtime error was not reproduced.
- [x] Trace scan extraction, finding mapping, selected-finding rendering, and PDF highlight preparation for remaining iterable-sensitive operations.
- [x] Add regression coverage and remove remaining application-level iterator conversions from dictionary scanning and PDF export wrapping.
- [x] Re-run the supplied PDF, verify the exact-source highlight interaction, and complete automated checks.

## Live Web Interface Regression Reported Again

- [x] Check published version parity and reproduce the user-facing flow in a fresh session; the supplied PDF completed with 50 findings on the published site.
- [x] Inspect the current published session’s browser console, network activity, and deployment logs after the new rendering fix is published; no post-fix console errors were captured, 39 network responses were HTTP 200 with no 4xx/5xx/error entries, and production logs were clean.
- [x] Apply the native ES2015/Safari compatibility target and replace full-document per-character highlight DOM rendering with a bounded context window and shared source-character cache; retain the existing 39-test regression coverage.
- [x] Verify the exact live flow after publication, including 50 large-PDF results and focused extracted-text highlighting at P1 · L1 · Char 38.

## New Published Iterator Regression

- [x] Analyze the user-reported `d[Sm("iterator")] is not a function` failure and identify the remaining generic iterable fallback in collection normalization; the original broken session was not independently reproducible after the prior fix, but the corrected build was verified clean.
- [x] Trace every remaining iterator protocol access in scanner, extraction, highlighting, and export code; the application-level runtime access was isolated to `toIndexedArray` in `client/src/lib/compat.ts`.
- [x] Replace the failing path with compatibility-safe normalization and add a focused regression test; iterable-only values are now rejected without touching `Symbol.iterator`.
- [x] Re-run supported-format browser verification and publish the corrected build; published TXT, DOCX, PDF, and image OCR scans completed without the iterator error, and the image OCR result completed with zero findings.
