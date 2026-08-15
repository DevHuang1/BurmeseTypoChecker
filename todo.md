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
