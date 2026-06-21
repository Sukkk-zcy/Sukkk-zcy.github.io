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
    Write-Host "文件已存在: $filename" -ForegroundColor Yellow
    exit 1
}

$content = Get-Content -Path $template -Raw -Encoding UTF8
$content = $content -replace '\{\{TITLE\}\}', $Title
$content = $content -replace '\{\{DATE\}\}', $date

$utf8Bom = New-Object System.Text.UTF8Encoding($true)
[System.IO.File]::WriteAllText($filename, $content, $utf8Bom)

Write-Host "已创建: $filename" -ForegroundColor Green
Start-Process "code" -ArgumentList $filename
