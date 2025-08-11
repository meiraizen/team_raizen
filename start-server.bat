@echo off
cd /d "%~dp0"
echo Starting Vite dev server in folder: %cd%
start cmd /k "npm run dev"

:: Wait for server to start (adjust time if needed)
timeout /t 5 >nul

:: Open default browser to Vite's default dev URL
start http://localhost:5173
