# Folder Rename Instructions

The frontend folder has been successfully renamed to `swiftcart-frontend`.

The backend folder rename is pending because the folder is currently in use.

## ✅ Completed
- ✅ `frontend/` → `swiftcart-frontend/`
- ✅ Updated `package.json` scripts
- ✅ Updated `README.md`
- ✅ Updated `.gitignore`
- ✅ Updated documentation files

## ⚠️ Pending: Backend Folder Rename

The `backend/` folder needs to be renamed to `swiftcart-backend/`, but it's currently locked by a process.

### To Complete the Rename:

**Option 1: Close processes and rename (Recommended)**

1. **Close any processes using the backend folder:**
   - Close VS Code or your IDE
   - Stop any running dev servers (`Ctrl+C` in terminals)
   - Close any file explorers with the backend folder open

2. **Rename the folder:**
   ```powershell
   Move-Item -Path "backend" -Destination "swiftcart-backend" -Force
   ```

**Option 2: Manual copy and delete**

1. Copy all contents from `backend/` to `swiftcart-backend/`
2. Verify all files are copied (especially the `src/` folder)
3. Delete the old `backend/` folder

**Option 3: Use File Explorer**

1. Close VS Code/IDE
2. Open File Explorer
3. Right-click `backend` folder → Rename → `swiftcart-backend`

## After Renaming

Once the rename is complete, verify:

```bash
# Check folder exists
Test-Path "swiftcart-backend"
Test-Path "swiftcart-frontend"

# Test scripts
npm run dev:backend
npm run dev:frontend
```

All scripts and documentation have been updated to use the new folder names.

