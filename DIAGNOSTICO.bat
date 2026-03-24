@echo off
title DIAGNOSTICO DE SINCRONIZACAO
echo 🔍 VERIFICANDO AMBIENTE...
echo ----------------------------------------------------
echo 📁 PASTA ATUAL: %cd%
echo.
echo 🌿 BRANCH ATUAL:
git branch
echo.
echo 📝 ARQUIVOS MODIFICADOS (STATUS):
git status
echo.
echo 📤 REMOTO CONFIGURADO:
git remote -v
echo.
echo ----------------------------------------------------
echo ✅ FIM DO DIAGNOSTICO.
pause
