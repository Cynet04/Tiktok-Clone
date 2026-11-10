@echo off
title TikTok Clone - 10 Hour Infinite Loop
color 0B
echo ========================================================
echo STARTING TIKTOK CLONE DEVELOPMENT LOOP
echo If Kilo stops, this script will automatically restart it.
echo To stop everything, just close this black window.
echo ========================================================

:loop
echo.
echo [%time%] Starting new Kilo session...
kilo run --auto "You are in an infinite autonomous development loop building a TikTok Clone. Read TASKS.md and PROGRESS.md to see where you left off. Implement the next feature, test it, commit it (git add . && git commit -m 'feat: feature name' && git push), and immediately start the next feature. If you hit an error, try 3 times to fix it, then document it in PROGRESS.md and move to a different feature. Do not stop. Do not summarize. Keep looping indefinitely."

echo.
echo [%time%] Kilo stopped. Restarting in 10 seconds...
timeout /t 10
goto loop