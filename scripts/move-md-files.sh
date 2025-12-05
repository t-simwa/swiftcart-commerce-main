#!/bin/bash
# Bash script to move .md files to docs folder (except README.md)
# This can be run manually or integrated into your workflow

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DOCS_FOLDER="$PROJECT_ROOT/docs"

# Create docs folder if it doesn't exist
mkdir -p "$DOCS_FOLDER"

# Find all .md files except README.md and files already in docs folder
find "$PROJECT_ROOT" -type f -name "*.md" \
    ! -name "README.md" \
    ! -path "*/node_modules/*" \
    ! -path "*/docs/*" \
    ! -path "*/.git/*" | while read -r file; do
    
    filename=$(basename "$file")
    dest_path="$DOCS_FOLDER/$filename"
    
    # If file with same name exists in docs, add directory prefix
    if [ -f "$dest_path" ]; then
        dirname=$(dirname "$file" | sed "s|^$PROJECT_ROOT||" | tr '/' '_' | sed 's/^_//')
        if [ -z "$dirname" ] || [ "$dirname" = "." ]; then
            dirname="root"
        fi
        newname="${dirname}_${filename}"
        dest_path="$DOCS_FOLDER/$newname"
    fi
    
    mv "$file" "$dest_path"
    echo "Moved: $file -> $dest_path"
done

echo "Done! All .md files (except README.md) have been moved to docs folder"

