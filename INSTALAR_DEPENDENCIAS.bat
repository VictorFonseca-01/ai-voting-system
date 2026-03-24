@echo off
title AI VOTE 2026 - INSTALAR DEPENDENCIAS
echo 📦 INSTALANDO NOVAS BIBLIOTECAS (pptxgenjs, html-to-image)...
echo ----------------------------------------------------
echo.

cd ai-voting-frontend

echo ⚙️ Executando npm install...
call npm install

echo.
echo ✅ SUCESSO! As bibliotecas de geracao de apresentacao foram instaladas.
echo.
echo 🚀 Agora voce pode iniciar o sistema normalmente (INICIAR_LOCAL.bat).
echo.
pause
exit
