# Code Quality Rule

**Goal:** Ensure all code is clean, readable, and follows project style standards.

**Checks:**
- Consistent indentation, naming, and semicolons (or language-specific style guide)
- All functions, classes, and modules have documentation
- No unused variables or imports

**Git Integration:**
- Run `git status --porcelain` to list all modified files
- Run `git diff $(git ls-files -m)` to check changes in all modified files at once

**Output:**
- List of files violating style rules
- Suggestions to fix code formatting or missing documentation