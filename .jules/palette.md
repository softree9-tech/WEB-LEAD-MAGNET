# Palette's Journal - Softree Lead Engine

## 2025-05-14 - Sidebar Accessibility and Semantic Buttons
**Learning:** The dashboard sidebar used icon-only elements with `onClick` handlers but without semantic `<button>` tags, making them inaccessible to keyboard users and screen readers. Additionally, toggle buttons lacked `aria-pressed` state, and some icon/label pairings were misleading (e.g., using a Logout icon for "Return to Top").
**Action:** Wrap icon-only interactive elements in `<button>` with `aria-label` and `title`. Add `aria-pressed` to toggle buttons. Replace misleading icons with more appropriate ones (e.g., `ChevronUp` for scroll-to-top). Use a shared CSS class (`nav-btn-reset`) for consistent button styling resets.

## 2025-05-22 - Declarative UI Feedback for Copy-to-Clipboard
**Learning:** Using imperative DOM manipulation (like `innerHTML`) for feedback in React components breaks the declarative nature of the framework and makes it harder to manage state, especially in lists. Accessibility attributes like `aria-live` should be used to notify screen readers of status changes.
**Action:** Always use React state to trigger UI feedback and include `aria-live="polite"` for non-disruptive status updates.
