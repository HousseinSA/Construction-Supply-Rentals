# Functional Correctness Rule

**Goal:** Ensure all code works as intended and is free of obvious runtime errors.

**Checks:**
- Validate that all critical functions are tested
- Detect undefined variables or missing return statements
- Check for potential runtime errors or edge cases
- Verify dependencies are up-to-date and safe

**Git Integration:**
- Use `git diff $(git ls-files -m)` to see changes in all modified files
- Check if code changes introduce new errors

**Output:**
- List of untested or risky code
- Suggestions for missing checks or error handling