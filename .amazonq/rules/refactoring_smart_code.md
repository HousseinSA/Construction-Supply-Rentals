# Refactoring & Smart Code Rule

**Goal:** Make code concise, modular, readable, and maintainable.

**Checks:**
- Detect duplicate code and suggest reusable functions
- Simplify nested logic or complex statements
- Ensure functions have single responsibility
- Suggest language-idiomatic improvements (Pythonic, JS-idiomatic, etc.)

**Git Integration:**
- Run `git diff $(git ls-files -m)` to check all modified files in one command
- Highlight repeated code or overly long functions

**Output:**
- Refactoring suggestions per file
- Warnings for overly complex code