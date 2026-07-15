#!/usr/bin/env bash
# Deploy do frontend Angular no AWS LightSail (Nginx)
# Uso: ./deploy-frontend.sh

set -euo pipefail

SSH_ALIAS="Lightsail"
REMOTE_TMP="/home/ubuntu/mfm-frontend"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SPA_DIR="$SCRIPT_DIR/MyFirstMillionSPA/my-first-million"
DIST_DIR="$SPA_DIR/dist/my-first-million/browser"

echo "==> [1/3] Build de producao do Angular..."
cd "$SPA_DIR"
npx ng build --configuration production

echo "==> [2/3] Enviando arquivos para o servidor..."
ssh "$SSH_ALIAS" "rm -rf $REMOTE_TMP && mkdir -p $REMOTE_TMP"
scp -r "$DIST_DIR/"* "$SSH_ALIAS:$REMOTE_TMP/"

echo "==> [3/3] Atualizando Nginx no servidor..."
ssh "$SSH_ALIAS" bash << 'REMOTE'
  set -e
  REMOTE_TMP="/home/ubuntu/mfm-frontend"
  NGINX_PATH="/var/www/myfirstmillion"

  echo "  -> Atualizando $NGINX_PATH..."
  sudo mkdir -p "$NGINX_PATH"
  sudo rm -rf "$NGINX_PATH"/*
  sudo cp -r "$REMOTE_TMP"/. "$NGINX_PATH/"
  sudo chown -R www-data:www-data "$NGINX_PATH"

  echo "  -> Validando configuracao do Nginx..."
  sudo nginx -t

  echo "  -> Reiniciando Nginx..."
  sudo systemctl restart nginx
  sudo systemctl is-active nginx
REMOTE

echo ""
echo "Deploy do frontend concluido! Acesse https://www.myfirstmillion.com.br"
