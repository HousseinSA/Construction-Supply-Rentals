# Project Organization Rule

**Goal:** Ensure the project structure is consistent and maintainable.

**Checks:**
- Files are in correct directories according to project conventions
- No large monolithic files (split if necessary)
- Functions and classes are modular and reusable
- Proper naming of folders, files, and modules

**Git Integration:**
- Use `git status --porcelain` to list changed files
- Check all modified files for correct placement with `git diff $(git ls-files -m)`

**Output:**
- Highlight files in wrong folders
- Suggest reorganization or splitting large files