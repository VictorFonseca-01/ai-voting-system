@echo off
echo.
echo 🚀 SUBINDO MELHORIAS AGORA! 🏁
echo ------------------------------------------------
echo.

echo ⚙️ Adicionando arquivos...
git add .

echo 📦 Criando commit automático...
git commit -m "Auto-update: Melhorias solicitadas pelo usuário 💎"

echo 🚀 Enviando para o Railway...
git push origin main

echo.
echo ✅ TUDO PRONTO! Seu site está sendo atualizado. 🎯
echo Fechando em 3 segundos...
timeout /t 3
exit
