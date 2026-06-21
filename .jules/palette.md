# Palette's Journal - Softree Lead Engine

## 2025-05-14 - Sidebar Accessibility and Semantic Buttons
**Learning:** The dashboard sidebar used icon-only elements with `onClick` handlers but without semantic `<button>` tags, making them inaccessible to keyboard users and screen readers. Additionally, toggle buttons lacked `aria-pressed` state, and some icon/label pairings were misleading (e.g., using a Logout icon for "Return to Top").
**Action:** Wrap icon-only interactive elements in `<button>` with `aria-label` and `title`. Add `aria-pressed` to toggle buttons. Replace misleading icons with more appropriate ones (e.g., `ChevronUp` for scroll-to-top). Use a shared CSS class (`nav-btn-reset`) for consistent button styling resets.

## 2025-05-15 - React State vs direct DOM for UI Feedback
**Learning:** Using `innerHTML` to provide UI feedback (like "Copied!") is non-idiomatic in React, bypasses the virtual DOM, and creates accessibility gaps. It makes the UI harder to maintain and test.
**Action:** Use React state (e.g., `copiedIndex`) and a `useEffect` with a timeout for temporary UI states. This allows for semantic rendering, better accessibility with `aria-live="polite"`, and idiomatic use of component libraries like lucide-react.
