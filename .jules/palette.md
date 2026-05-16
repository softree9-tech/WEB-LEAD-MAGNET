## 2025-05-14 - Accessible Sidebar Navigation
**Learning:** Icon-only navigation without proper labels is inaccessible to screen readers and confusing for sighted users if icons are not universally recognized. Using semantic `<button>` tags with `aria-label` and `title` (or custom tooltips) significantly improves UX.
**Action:** Always wrap icon-only interactive elements in semantic `<button>` tags with descriptive `aria-label` and provide visual tooltips for clarity.
