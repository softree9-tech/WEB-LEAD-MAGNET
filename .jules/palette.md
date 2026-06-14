# Palette's Journal - Softree Lead Engine

## 2025-05-14 - Sidebar Accessibility and Semantic Buttons
**Learning:** The dashboard sidebar used icon-only elements with `onClick` handlers but without semantic `<button>` tags, making them inaccessible to keyboard users and screen readers. Additionally, toggle buttons lacked `aria-pressed` state, and some icon/label pairings were misleading (e.g., using a Logout icon for "Return to Top").
**Action:** Wrap icon-only interactive elements in `<button>` with `aria-label` and `title`. Add `aria-pressed` to toggle buttons. Replace misleading icons with more appropriate ones (e.g., `ChevronUp` for scroll-to-top). Use a shared CSS class (`nav-btn-reset`) for consistent button styling resets.

## 2025-05-15 - Declarative Feedback and Accessibility
**Learning:** Feedback mechanisms (like "Copied!" status) were implemented using imperative DOM manipulation (), which is brittle in React and invisible to screen readers.
**Action:** Use React state for interaction feedback and implement `aria-live="polite"` on feedback elements to ensure accessibility for assistive technologies. Prefer semantic icons from the design system over raw SVG strings.

## 2025-05-15 - Declarative Feedback and Accessibility
**Learning:** Feedback mechanisms (like "Copied!" status) were implemented using imperative DOM manipulation (`innerHTML`), which is brittle in React and invisible to screen readers.
**Action:** Use React state for interaction feedback and implement `aria-live="polite"` on feedback elements to ensure accessibility for assistive technologies. Prefer semantic icons from the design system over raw SVG strings.
