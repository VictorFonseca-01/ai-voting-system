@echo off
echo 💎 Sincronizando dados e subindo Versão de Elite para o Railway...
git add .
git commit -m "💎 Sync: Fixed AI Ranking, Questionnaire Analytics & Simplified Security [Elite 5.0]"
git push origin HEAD --force
echo 🚀 Sucesso! Verifique o Railway agora. Limpe o cache do navegador (Ctrl+Shift+R).
pause
