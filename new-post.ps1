param(
    [Parameter(Mandatory=$true)]
    [string]$Title
)

$date = Get-Date -Format "yyyy-MM-dd"
$slug = $Title -replace '[^\w\u4e00-\u9fff]+', '-' -replace '-$',''
$slug = $slug.ToLower()
$filename = "E:\bk\blog\content\posts\$slug.md"

if (Test-Path $filename) {
    Write-Host "File exists: $filename" -ForegroundColor Yellow
    exit 1
}

# Use Python to write file with correct UTF-8 encoding
$pyScript = @"
import os
content = '''---
title: "$Title"
date: $date
tags: []
categories: []
summary: ""
ShowToc: true
TocOpen: true
---

## 引言

在这里写正文内容...

## 总结

- 要点1
- 要点2
'''
with open(r"$($filename -replace '\\','/')", 'w', encoding='utf-8') as f:
    f.write(content)
"@

$pyFile = "$env:TEMP\create_post.py"
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($pyFile, $pyScript, $utf8)
python $pyFile
Remove-Item $pyFile -Force

Write-Host "Created: $filename" -ForegroundColor Green
Start-Process "code" -ArgumentList $filename
