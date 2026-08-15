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
