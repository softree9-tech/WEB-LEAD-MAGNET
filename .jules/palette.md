# Palette's Journal - Softree Lead Engine

## 2025-05-14 - Sidebar Accessibility and Semantic Buttons
**Learning:** The dashboard sidebar used icon-only elements with `onClick` handlers but without semantic `<button>` tags, making them inaccessible to keyboard users and screen readers. Additionally, toggle buttons lacked `aria-pressed` state, and some icon/label pairings were misleading (e.g., using a Logout icon for "Return to Top").
**Action:** Wrap icon-only interactive elements in `<button>` with `aria-label` and `title`. Add `aria-pressed` to toggle buttons. Replace misleading icons with more appropriate ones (e.g., `ChevronUp` for scroll-to-top). Use a shared CSS class (`nav-btn-reset`) for consistent button styling resets.

## 2026-06-13 - Accessible Copy Feedback
**Learning:** Using React state for "Copy to Clipboard" feedback is more accessible and robust than direct DOM manipulation. Adding `aria-live="polite"` ensures screen reader users receive immediate confirmation of the action.
**Action:** Always favor declarative state for UI feedback. Use `copiedIndex` patterns for lists to provide targeted feedback.
