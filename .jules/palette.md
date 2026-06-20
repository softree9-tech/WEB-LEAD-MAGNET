# Palette's Journal - Softree Lead Engine

## 2025-05-14 - Sidebar Accessibility and Semantic Buttons
**Learning:** The dashboard sidebar used icon-only elements with `onClick` handlers but without semantic `<button>` tags, making them inaccessible to keyboard users and screen readers. Additionally, toggle buttons lacked `aria-pressed` state, and some icon/label pairings were misleading (e.g., using a Logout icon for "Return to Top").
**Action:** Wrap icon-only interactive elements in `<button>` with `aria-label` and `title`. Add `aria-pressed` to toggle buttons. Replace misleading icons with more appropriate ones (e.g., `ChevronUp` for scroll-to-top). Use a shared CSS class (`nav-btn-reset`) for consistent button styling resets.

## 2025-05-15 - State-Driven Clipboard Feedback
**Learning:** Using `innerHTML` manipulation on `event.currentTarget` for button feedback is brittle in React and often results in bugs if the user clicks child icons. It also lacks accessibility as screen readers aren't notified of the text change.
**Action:** Use React state (`copiedIndex` or similar) to manage button feedback and wrap feedback text in `aria-live="polite"` to ensure accessibility. Prefer reusable icons (e.g. `Check`) over raw SVG strings in templates.
