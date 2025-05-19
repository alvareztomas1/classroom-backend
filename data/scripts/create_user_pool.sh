#!/bin/bash

# This script will create an user pool and user pool client using Cognito Local (https://github.com/jagregory/cognito-local).
# You MUST have the emulator running before running this script.

# ANSI color codes
BLUE='\x1b[38;5;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo -e "${BLUE}.env file not found. Make sure it exists before running.${NC}"
  exit 1
fi
COGNITO_PORT=${COGNITO_PORT:-9229}
echo -e "${BLUE}The Cognito port is:${NC} ${GREEN}${COGNITO_PORT}${NC}"

extract_value() {
  grep -o "\"$2\": *\"[^\"]*\"" <<< "$1" | awk -F'"' '{print $4}'
}

echo -e "${BLUE}Creating your User Pool...${NC}"

user_pool_response=$(aws --endpoint http://localhost:${COGNITO_PORT} cognito-idp create-user-pool --pool-name UserPoolLocal --query 'UserPool.{Id:Id}' --output json)
user_pool_id=$(extract_value "$user_pool_response" "Id")

echo -e "${BLUE}Creating your User Pool Client...${NC}"

user_pool_client_response=$(aws --endpoint http://localhost:${COGNITO_PORT} cognito-idp create-user-pool-client --user-pool-id $user_pool_id --client-name UserPoolClientLocal --query 'UserPoolClient.{Id:ClientId}' --output json)
user_pool_client_id=$(extract_value "$user_pool_client_response" "Id")

echo -e ""
echo -e "${BLUE}User Pool created with ID:${NC} ${GREEN}$user_pool_id${NC}"
echo -e "${BLUE}User Pool Client created with ID:${NC} ${GREEN}$user_pool_client_id${NC}"
echo -e ""
echo -e "${BLUE}Adding/updating environment variables in your .env file...${NC}"
echo -e ""

update_env_var() {
  local var_name=$1
  local var_value=$2

  if grep -q "^$var_name=" .env; then
    sed -i "s|^$var_name=.*|$var_name=$var_value|" .env
    echo -e "${BLUE}Updated ${var_name}=${NC} ${GREEN}${var_value}${NC}"
  else
    echo "$var_name=$var_value" >> .env
    echo -e "${BLUE}Added ${var_name}=${NC} ${GREEN}${var_value}${NC}"
  fi
}

if ! grep -q "# AWS Cognito Local" .env; then
  echo -e "\n# AWS Cognito Local" >> .env
fi

update_env_var "COGNITO_USER_POOL_ID" "$user_pool_id"
update_env_var "COGNITO_CLIENT_ID" "$user_pool_client_id"
update_env_var "COGNITO_ENDPOINT" "http://0.0.0.0:${COGNITO_PORT}"
update_env_var "COGNITO_ISSUER" "http://0.0.0.0:${COGNITO_PORT}/$user_pool_id"

echo -e "${BLUE}You can configure your user pool and user pool client manually by going to ${NC}${GREEN}data/docker/volumes/cognito${NC}${BLUE}.${NC}"
echo -e "${BLUE}Remember to restart the cognito-local server if doing so! :).${NC}"
