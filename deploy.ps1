$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "=== Step 1: Build ===" -ForegroundColor Cyan
Remove-Item -Path "E:\bk\blog\public" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "E:\bk\blog\resources" -Recurse -Force -ErrorAction SilentlyContinue
hugo -D --gc --minify --baseURL "https://sukkk-zcy.github.io/"

Write-Host "=== Step 2: Remove integrity hashes ===" -ForegroundColor Cyan
$files = Get-ChildItem -Path "E:\bk\blog\public" -Filter "*.html" -Recurse
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $content = $content -replace ' integrity="[^"]*"', ''
    Set-Content -Path $file.FullName -Value $content -NoNewline
}
Write-Host "Fixed $($files.Count) HTML files"

Write-Host "=== Step 3: Deploy ===" -ForegroundColor Cyan
Remove-Item -Path "E:\bk\deploy" -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "E:\bk\deploy" | Out-Null
Copy-Item -Path "E:\bk\blog\public\*" -Destination "E:\bk\deploy\" -Recurse -Force
if (Test-Path "E:\bk\blog\static") {
    Copy-Item -Path "E:\bk\blog\static\*" -Destination "E:\bk\deploy\" -Recurse -Force
}
New-Item -ItemType File -Force -Path "E:\bk\deploy\.nojekyll" | Out-Null
Set-Content -Path "E:\bk\deploy\.nojekyll" -Value "" -NoNewline

cd E:\bk\deploy
git init
git add .
git commit -m "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git remote add origin https://github.com/Sukkk-zcy/Sukkk-zcy.github.io.git 2>&1
git push -f origin master:gh-pages

Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host "Visit: https://sukkk-zcy.github.io/"
