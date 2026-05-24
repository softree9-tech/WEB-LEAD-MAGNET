# Palette's Journal - Softree Lead Engine

## 2025-05-14 - Sidebar Accessibility and Semantic Buttons
**Learning:** The dashboard sidebar used icon-only elements with `onClick` handlers but without semantic `<button>` tags, making them inaccessible to keyboard users and screen readers. Additionally, toggle buttons lacked `aria-pressed` state, and some icon/label pairings were misleading (e.g., using a Logout icon for "Return to Top").
**Action:** Wrap icon-only interactive elements in `<button>` with `aria-label` and `title`. Add `aria-pressed` to toggle buttons. Replace misleading icons with more appropriate ones (e.g., `ChevronUp` for scroll-to-top). Use a shared CSS class (`nav-btn-reset`) for consistent button styling resets.

## 2025-05-15 - Accessible Feedback and React State
**Learning:** Using direct `innerHTML` manipulation for "Copied!" feedback is fragile and inaccessible. Screen readers often miss these manual DOM updates, and it breaks the React declarative paradigm.
**Action:** Use React state (e.g., `copiedIndex`) combined with `role="status"` and `aria-live="polite"` for transient UI feedback. This ensures the feedback is announced to assistive technologies and remains synchronized with the component state.
