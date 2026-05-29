# Palette's Journal - Softree Lead Engine

## 2025-05-14 - Sidebar Accessibility and Semantic Buttons
**Learning:** The dashboard sidebar used icon-only elements with `onClick` handlers but without semantic `<button>` tags, making them inaccessible to keyboard users and screen readers. Additionally, toggle buttons lacked `aria-pressed` state, and some icon/label pairings were misleading (e.g., using a Logout icon for "Return to Top").
**Action:** Wrap icon-only interactive elements in `<button>` with `aria-label` and `title`. Add `aria-pressed` to toggle buttons. Replace misleading icons with more appropriate ones (e.g., `ChevronUp` for scroll-to-top). Use a shared CSS class (`nav-btn-reset`) for consistent button styling resets.

## 2025-05-15 - Accessible Feedback Patterns for Clipboard Actions
**Learning:** Using direct DOM manipulation (`innerHTML`) and `setTimeout` for UI feedback (like "Copied!") is brittle and bypasses React's state management, leading to potential race conditions and accessibility gaps. Screen readers often miss these temporal changes unless wrapped in an `aria-live` region.
**Action:** Implement a dedicated `CopyButton` component using React `useState` for visual feedback and `aria-live="polite"` to ensure the "Copied!" state is announced. Always prefer semantic state transitions over `innerHTML` for micro-interactions.
