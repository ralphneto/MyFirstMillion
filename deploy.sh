#!/usr/bin/env bash
# Orquestrador de deploy do MyFirstMillion
# Uso: source .env.deploy && ./deploy.sh [api|frontend|all]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="${1:-all}"

case "$TARGET" in
  api)
    bash "$SCRIPT_DIR/deploy-api.sh"
    ;;
  frontend)
    bash "$SCRIPT_DIR/deploy-frontend.sh"
    ;;
  all)
    bash "$SCRIPT_DIR/deploy-api.sh"
    bash "$SCRIPT_DIR/deploy-frontend.sh"
    ;;
  *)
    echo "Uso: ./deploy.sh [api|frontend|all]"
    exit 1
    ;;
esac

echo ""
echo "=== Deploy concluido! ==="
echo "  API:      https://www.myfirstmillion.com.br/api/swagger"
echo "  Frontend: https://www.myfirstmillion.com.br"
