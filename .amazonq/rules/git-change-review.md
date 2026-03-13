# Git Change Review Rule (Full Version)

## Purpose
Ensure that all code changes are carefully reviewed before generating a commit message.  
The goal is to fully understand the modifications, compare them with the original code, and detect any potential bugs that may break functionality or logic.

This rule enforces **reviewing the entire repository changes in one terminal command** instead of per-file inspection.

---

## Workflow

### 1. Inspect Repository in a Single Command
All Git inspection commands (status, diff, staged diff) must be **combined into one single shell command** and executed **only after explicit user approval**.

Example combined command:

```bash
git status && git diff && git diff --staged