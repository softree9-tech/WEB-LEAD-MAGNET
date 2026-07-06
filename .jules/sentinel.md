## 2025-05-15 - Path Traversal Protection with os.path.basename
**Vulnerability:** Path traversal in report-serving and deletion endpoints allowed unauthorized access to files outside the intended `data/pdfs` directory.
**Learning:** Joining user-supplied strings directly into file paths with `os.path.join` is insecure even if the framework performs some normalization. Linux handles `../../` payloads by resolving them to parent directories, which can expose sensitive application files like `main.py` or `.env`.
**Prevention:** Always sanitize filenames using `os.path.basename()` before joining them with a directory path. This strips all directory components and ensures the resulting path remains within the target directory.
