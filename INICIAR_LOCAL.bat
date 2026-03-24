@echo off
title AI VOTING SYSTEM - LOCALHOST
echo.
echo 🚀 INICIANDO O SISTEMA AI VOTE 2026 (Safe Mode) 🚀
echo ----------------------------------------------------
echo.
echo ☁️  CONECTANDO AO SUPABASE...
echo 🔄 SINCRONIZANDO CÓDIGO (GIT PULL)...
git pull origin main
echo 🧹 LIMPANDO CACHE...
echo.

cd ai-voting-frontend

if not exist node_modules (
    echo 📦 Dependencias nao encontradas. Instalando...
    call npm install
)

echo ⚡ LANÇANDO LOCALHOST...
echo.

:: Abre o navegador (npm start ja faz isso, mas garantimos)
start http://localhost:3000

call npm start

pause
