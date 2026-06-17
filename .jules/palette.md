# Palette's Journal - Softree Lead Engine

## 2025-05-14 - Sidebar Accessibility and Semantic Buttons
**Learning:** The dashboard sidebar used icon-only elements with `onClick` handlers but without semantic `<button>` tags, making them inaccessible to keyboard users and screen readers. Additionally, toggle buttons lacked `aria-pressed` state, and some icon/label pairings were misleading (e.g., using a Logout icon for "Return to Top").
**Action:** Wrap icon-only interactive elements in `<button>` with `aria-label` and `title`. Add `aria-pressed` to toggle buttons. Replace misleading icons with more appropriate ones (e.g., `ChevronUp` for scroll-to-top). Use a shared CSS class (`nav-btn-reset`) for consistent button styling resets.

## 2025-05-15 - Accessible Clipboard Feedback Pattern
**Learning:** Imperative DOM manipulation (e.g., `innerHTML`) for "Copied!" feedback is common in legacy code but breaks React's declarative model and is invisible to screen readers. Using React state for the "copied" status combined with `aria-live="polite"` on the button ensures both visual and assistive technology synchronization.
**Action:** Always use a state-driven approach for UI feedback. Prefer `aria-live="polite"` on buttons that change text content after an action to ensure the new state is announced without interrupting the user flow.
