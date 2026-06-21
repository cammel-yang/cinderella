@echo off
REM Start the Minecraft server on Windows.
REM Adjust the memory below (-Xms / -Xmx) to taste, e.g. 4G.
setlocal
cd /d "%~dp0"

if not exist server.jar (
  echo Error: server.jar not found.
  echo Download it first - see README.md ^(Option A^).
  pause
  exit /b 1
)

java -Xms2G -Xmx2G -jar server.jar nogui

pause
