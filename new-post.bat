@echo off
setlocal enabledelayedexpansion

set /p title="输入文章标题: "
if "%title%"=="" (
    echo 标题不能为空
    pause
    exit /b 1
)

powershell -ExecutionPolicy Bypass -File "%~dp0new-post.ps1" -Title "%title%"
pause
