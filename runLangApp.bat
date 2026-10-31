@echo off
cd /d "%~dp0"

start "Node Server" cmd /k "node app.js"

timeout /t 2 /nobreak >nul

start "" "http://localhost:3000"