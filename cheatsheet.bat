@echo off
REM Change directory to where server.exe is located
cd /d D:\Users\Dylan\Documents\Cyber_Pew_Pew\My\Webapp\dist

REM Start the server.exe
start "" server.exe

REM Wait for 2 seconds
timeout /t 2 /nobreak

REM Open Chrome with the URL
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" http://localhost:5000

REM Close the Command Prompt window
exit
