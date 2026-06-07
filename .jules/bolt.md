## 2025-05-14 - Selective Logic Updates vs Global Reformatting
**Learning:** Global Python reformatting (e.g., using 'black') creates massive diff noise that obscures intended performance optimizations, leading to difficult code reviews and potential rejection of sound improvements.
**Action:** Use targeted search-and-replace tools like 'replace_with_git_merge_diff' for logic-heavy PRs. Only reformat if specifically requested or if touching the entire file's architecture.
