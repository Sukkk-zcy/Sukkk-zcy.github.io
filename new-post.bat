@echo off
chcp 65001 >nul
set /p title="Title: "
if "%title%"=="" (
    echo Empty title!
    pause
    exit /b 1
)
powershell -ExecutionPolicy Bypass -File "%~dp0new-post.ps1" -Title "%title%"
pause
