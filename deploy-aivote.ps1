# Script de Automação de Deploy - AIVote 🚀

$commitMessage = Read-Host "Digite a mensagem do commit (ou deixe vazio para 'update: melhorias gerais')"
if (-not $commitMessage) { $commitMessage = "update: melhorias gerais" }

Write-Host "--- Iniciando Deploy Automático ---" -ForegroundColor Cyan

# 1. Adicionar alterações
Write-Host "> Adicionando arquivos..."
git add .

# 2. Commit
Write-Host "> Criando commit: $commitMessage"
git commit -m "$commitMessage"

# 3. Push
Write-Host "> Enviando para o Railway..."
git push origin main

Write-Host "--- Deploy Concluído com Sucesso! ---" -ForegroundColor Green
Write-Host "O Railway iniciará o build automaticamente agora."
pause
