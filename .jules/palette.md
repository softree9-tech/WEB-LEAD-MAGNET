# Palette's Journal - Softree Lead Engine

## 2025-05-14 - Sidebar Accessibility and Semantic Buttons
**Learning:** The dashboard sidebar used icon-only elements with `onClick` handlers but without semantic `<button>` tags, making them inaccessible to keyboard users and screen readers. Additionally, toggle buttons lacked `aria-pressed` state, and some icon/label pairings were misleading (e.g., using a Logout icon for "Return to Top").
**Action:** Wrap icon-only interactive elements in `<button>` with `aria-label` and `title`. Add `aria-pressed` to toggle buttons. Replace misleading icons with more appropriate ones (e.g., `ChevronUp` for scroll-to-top). Use a shared CSS class (`nav-btn-reset`) for consistent button styling resets.

## 2025-05-15 - Keyboard Accessible Mega-Menus
**Learning:** Hover-based mega-menus are inaccessible to keyboard users. Using `onMouseEnter/onMouseLeave` alone prevents keyboard navigation.
**Action:** Add `onFocus` and `onBlur` handlers to the menu container. Use `e.currentTarget.contains(e.relatedTarget)` in `onBlur` to prevent the menu from closing when focus moves between items within the same menu. Add `focus-visible` rings to provide clear feedback for keyboard users without affecting mouse users.
