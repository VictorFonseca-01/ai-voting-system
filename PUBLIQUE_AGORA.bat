@echo off
echo 💎 Sincronizando dados e subindo Versao de Elite para o Railway...
git add .
git commit -m "💎 Sync: Dashboard Data Integrity, Ranking Consolidation & Time Indicators [Elite v2.1]"
git push origin HEAD --force
echo 🚀 Sucesso! Verifique o Railway agora. Limpe o cache do navegador (Ctrl+Shift+R).
pause
