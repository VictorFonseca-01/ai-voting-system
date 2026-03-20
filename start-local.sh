#!/bin/bash
# ============================================================
#  AI VOTING SYSTEM — Script de inicialização
#  Uso: ./start.sh
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      ⚡ AI VOTING SYSTEM             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# Verifica se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale em: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verifica se Docker Compose está disponível
if ! docker compose version &> /dev/null 2>&1 && ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado."
    exit 1
fi

# Usa 'docker compose' (v2) ou 'docker-compose' (v1)
COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
fi

echo -e "${YELLOW}🔨 Construindo e iniciando os containers...${NC}"
echo -e "   (primeira vez pode demorar 3-5 minutos)"
echo ""

$COMPOSE_CMD up --build -d

echo ""
echo -e "${GREEN}✅ Sistema iniciado com sucesso!${NC}"
echo ""
echo -e "   🌐 Frontend:  ${CYAN}http://localhost:3000${NC}"
echo -e "   🔌 Backend:   ${CYAN}http://localhost:8080${NC}"
echo -e "   🗄️  Banco:     ${CYAN}localhost:5432${NC}"
echo ""
echo -e "${YELLOW}📋 Comandos úteis:${NC}"
echo "   Ver logs:          docker compose logs -f"
echo "   Parar tudo:        docker compose down"
echo "   Parar + apagar DB: docker compose down -v"
echo ""
