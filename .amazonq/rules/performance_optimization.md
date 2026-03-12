# Performance & Optimization Rule

**Goal:** Ensure code is efficient and resource-friendly.

**Checks:**
- Detect slow loops or memory-heavy operations
- Highlight repeated computations that can be cached
- Identify expensive database or API calls

**Git Integration:**
- Run `git diff $(git ls-files -m)` to review performance changes in all files
- Track newly added inefficient patterns
`
**Output:**
- Suggestions to optimize code
- Warnings for performance-heavy code blocks