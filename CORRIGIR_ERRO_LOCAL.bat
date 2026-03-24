@echo off
title AI VOTE 2026 - CORRIGIR ERRO LOCAL
echo 🛠️  CORRIGINDO ERRO DE RUNTIME (HMR) NO LOCALHOST...
echo ----------------------------------------------------
echo.

cd ai-voting-frontend

echo 🧹 1. Removendo Caches do Webpack...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
)
if exist .eslintcache (
    del /f /q .eslintcache
)

echo ⚙️  2. Configurando variaveis de compatibilidade...
echo REACT_APP_SUPABASE_URL=https://nkutcrkiqfjuerzeazcc.supabase.co > .env
echo REACT_APP_SUPABASE_ANON_KEY=sb_publishable_XZxqzDP_c3AprBYk6j4yRA_Wg9ixawv >> .env
echo FAST_REFRESH=false >> .env
echo CHOKIDAR_USEPOLLING=true >> .env
echo WDS_SOCKET_PORT=3000 >> .env
echo WDS_SOCKET_HOST=127.0.0.1 >> .env
echo GENERATE_SOURCEMAP=false >> .env
echo HOST=0.0.0.0 >> .env
echo ESLINT_NO_DEV_ERRORS=true >> .env

echo.
echo ✅ CORRECAO APLICADA! 
echo.
echo 🚀 Agora, inicie o sistema novamente pelo script normal (INICIAR_LOCAL.bat).
echo.
pause
exit
