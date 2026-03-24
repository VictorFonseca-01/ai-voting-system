@echo off
echo 💎 Sincronizando dados e subindo Versao de Elite para o Railway...
git add .
git commit -m "💎 Sync: Dashboard, PPTX Report, Admin Fixes & Dependencies [Elite v2.0]"
git push origin HEAD --force
echo 🚀 Sucesso! Verifique o Railway agora. Limpe o cache do navegador (Ctrl+Shift+R).
pause
