# Scripts Directory

This directory contains utility scripts for the project.

## Move MD Files Scripts

### Purpose
These scripts automatically move all `.md` files (except `README.md`) to the `docs/` folder to keep documentation organized.

### Available Scripts

1. **`move-md-files.ps1`** - PowerShell script for Windows
   ```powershell
   .\scripts\move-md-files.ps1
   ```

2. **`move-md-files.sh`** - Bash script for Unix/Linux/Mac
   ```bash
   bash scripts/move-md-files.sh
   ```

### Git Pre-commit Hook

A git pre-commit hook has been installed at `.git/hooks/pre-commit` that automatically moves any newly staged `.md` files (except `README.md`) to the `docs/` folder before each commit.

**Note:** The hook only moves files that are being added (new files), not modified files. If you need to move existing `.md` files, use one of the manual scripts above.

### Manual Usage

If you need to manually move `.md` files:

**Windows (PowerShell):**
```powershell
.\scripts\move-md-files.ps1
```

**Unix/Linux/Mac (Bash):**
```bash
bash scripts/move-md-files.sh
```

### What Gets Moved

- All `.md` files in the project root and subdirectories
- Files in `node_modules/` are excluded
- Files already in `docs/` folder are excluded
- `README.md` files are never moved (they stay in their original locations)

### Conflict Resolution

If a file with the same name already exists in `docs/`, the script will add a directory prefix to avoid conflicts (e.g., `backend_SETUP.md`).

