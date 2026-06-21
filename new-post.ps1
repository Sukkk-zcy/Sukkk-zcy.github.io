param(
    [Parameter(Mandatory=$true)]
    [string]$Title
)

$date = Get-Date -Format "yyyy-MM-dd"
$slug = $Title -replace '[^\w\u4e00-\u9fff]+', '-' -replace '-$',''
$slug = $slug.ToLower()
$filename = "E:\bk\blog\content\posts\$slug.md"
$template = "E:\bk\blog\templates\post.md"

if (Test-Path $filename) {
    Write-Host "File exists: $filename" -ForegroundColor Yellow
    exit 1
}

# Read template as UTF-8
$utf8 = New-Object System.Text.UTF8Encoding($false)
$templateContent = [System.IO.File]::ReadAllText($template, (New-Object System.Text.UTF8Encoding($false)))
$templateContent = $templateContent -replace '\{\{TITLE\}\}', $Title
$templateContent = $templateContent -replace '\{\{DATE\}\}', $date

# Write as UTF-8 without BOM
[System.IO.File]::WriteAllText($filename, $templateContent, $utf8)

Write-Host "Created: $filename" -ForegroundColor Green
Start-Process "code" -ArgumentList $filename
