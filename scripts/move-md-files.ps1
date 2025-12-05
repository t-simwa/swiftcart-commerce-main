# PowerShell script to move .md files to docs folder (except README.md)
# This can be run manually or integrated into your workflow

param(
    [string]$Path = "."
)

$docsFolder = Join-Path $Path "docs"

# Create docs folder if it doesn't exist
if (-not (Test-Path $docsFolder)) {
    New-Item -ItemType Directory -Path $docsFolder -Force | Out-Null
    Write-Host "Created docs folder"
}

# Find all .md files except README.md and files already in docs folder
$mdFiles = Get-ChildItem -Path $Path -Recurse -Filter "*.md" -File | 
    Where-Object { 
        $_.Name -ne "README.md" -and 
        $_.FullName -notlike "*\node_modules\*" -and
        $_.FullName -notlike "*\docs\*" -and
        $_.FullName -notlike "*\.git\*"
    }

if ($mdFiles.Count -eq 0) {
    Write-Host "No .md files found to move (excluding README.md and files in docs folder)"
    exit 0
}

foreach ($file in $mdFiles) {
    $destPath = Join-Path $docsFolder $file.Name
    
    # If file with same name exists in docs, add directory prefix
    if (Test-Path $destPath) {
        $dirName = $file.Directory.Name
        if ($dirName -eq $Path -or $dirName -eq ".") {
            $dirName = "root"
        }
        $newName = "${dirName}_$($file.Name)"
        $destPath = Join-Path $docsFolder $newName
    }
    
    Move-Item -Path $file.FullName -Destination $destPath -Force
    Write-Host "Moved: $($file.FullName) -> $destPath"
}

Write-Host "`nDone! Moved $($mdFiles.Count) file(s) to docs folder"

