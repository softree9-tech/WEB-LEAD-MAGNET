# Palette's Journal - Softree Lead Engine

## 2025-05-14 - Sidebar Accessibility and Semantic Buttons
**Learning:** The dashboard sidebar used icon-only elements with `onClick` handlers but without semantic `<button>` tags, making them inaccessible to keyboard users and screen readers. Additionally, toggle buttons lacked `aria-pressed` state, and some icon/label pairings were misleading (e.g., using a Logout icon for "Return to Top").
**Action:** Wrap icon-only interactive elements in `<button>` with `aria-label` and `title`. Add `aria-pressed` to toggle buttons. Replace misleading icons with more appropriate ones (e.g., `ChevronUp` for scroll-to-top). Use a shared CSS class (`nav-btn-reset`) for consistent button styling resets.

## 2025-05-21 - Accessible Tooltips for Icon-only Buttons
**Learning:** When implementing custom tooltips for icon-only buttons that already have an 'aria-label', the tooltip text should have 'aria-hidden="true"' to prevent screen readers from announcing the description twice. Using :focus-within on the container ensures the tooltip remains visible during keyboard navigation.
**Action:** Use <span className="nav-tooltip" aria-hidden="true"> as a sibling to the button, and trigger visibility via :hover and :focus-within on a shared parent container.
