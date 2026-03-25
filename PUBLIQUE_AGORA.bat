@echo off
echo 🚀 Sincronizando: Elite 7.2.1 (Hotfix: Estabilidade de Renderização)...
git add .
git commit -m "💎 Sync: Elite 7.2.1 (Hotfix: Corrigindo crash de renderização e adicionando null-guards)"
git push origin HEAD --force
echo 🚀 Sucesso! Elite 7.2.1 (Hotfix) implantada. Limpe o cache do navegador (Ctrl+Shift+R).
pause
