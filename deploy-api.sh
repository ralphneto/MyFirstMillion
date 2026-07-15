#!/usr/bin/env bash
# Deploy da API .NET no AWS LightSail via Docker
# Uso: source .env.deploy && ./deploy-api.sh

set -euo pipefail

export PATH="/c/Program Files/Docker/Docker/resources/bin:$PATH"

DOCKER_IMAGE="ralphneto/myfirstmillion-api:latest"
CONTAINER_NAME="myfirstmillion-api"
SSH_ALIAS="Lightsail"

GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:?Defina GOOGLE_CLIENT_ID no .env.deploy}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:?Defina GOOGLE_CLIENT_SECRET no .env.deploy}"
DB_CONNECTION="${DB_CONNECTION:?Defina DB_CONNECTION no .env.deploy}"
JWT_KEY="${JWT_KEY:?Defina JWT_KEY no .env.deploy}"

echo "==> [1/3] Build da imagem Docker..."
cd "$(dirname "$0")/MyFirstMillionAPI"
docker build -t "$DOCKER_IMAGE" .

echo "==> [2/3] Push para Docker Hub..."
docker push "$DOCKER_IMAGE"

echo "==> [3/3] Deploy no servidor LightSail..."
ssh "$SSH_ALIAS" bash -s << EOF
  set -e
  echo "  -> Parando container antigo..."
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm   $CONTAINER_NAME 2>/dev/null || true

  echo "  -> Baixando nova imagem..."
  docker pull $DOCKER_IMAGE

  echo "  -> Iniciando container..."
  docker run -d \
    -p 8081:8080 \
    --name $CONTAINER_NAME \
    --restart always \
    -v myfirstmillion-dp-keys:/app/dp-keys \
    -e ASPNETCORE_ENVIRONMENT=Production \
    -e Google__ClientId="$GOOGLE_CLIENT_ID" \
    -e Google__ClientSecret="$GOOGLE_CLIENT_SECRET" \
    -e "ConnectionStrings__DefaultConnection=$DB_CONNECTION" \
    -e Jwt__Key="$JWT_KEY" \
    -e Jwt__Issuer="MyFirstMillionAPI" \
    -e Jwt__Audience="MyFirstMillionSPA" \
    $DOCKER_IMAGE

  echo "  -> Container em execucao:"
  docker ps --filter name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
EOF

echo ""
echo "Deploy da API concluido! API disponivel em https://www.myfirstmillion.com.br/api"
