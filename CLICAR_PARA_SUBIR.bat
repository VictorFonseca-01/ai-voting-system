@echo off
title AI VOTE 2026 - PRODUCTION DEPLOY
echo.
echo 🚀 ATUALIZANDO ECOSSISTEMA EM PRODUÇÃO...
echo ----------------------------------------------------
echo.

echo 🔍 Verificando alteracoes...
git add .

echo 📦 Empacotando melhorias...
git commit -m "Auto-update: Elite Audit & Supabase Consolidation 💎"

echo 🚀 Sincronizando com a Nuvem (Railway)...
git push origin main

echo.
echo ✅ SUCESSO! Seu sistema esta online e atualizado.
echo.
timeout /t 5
exit
