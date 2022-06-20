#!/bin/bash
mydir="${0%/*}"

echo '================================================================================'
echo 'Building src/cognito'
echo '================================================================================'
cd $mydir/../src/cognito && npm install

echo '================================================================================'
echo 'Building src/deals'
echo '================================================================================'
cd ../deals && npm install

echo '================================================================================'
echo 'Building src/orders'
echo '================================================================================'
cd ../orders && npm install
AURORA_PARAMS=$(cat ../../config/default.json | jq '.aurora')
AURORA_HOST=$(echo $AURORA_PARAMS | jq -r '.host')
AURORA_PORT=$(echo $AURORA_PARAMS | jq -r '.port')
AURORA_USERNAME=$(echo $AURORA_PARAMS | jq -r '.username')
AURORA_PASSWORD=$(echo $AURORA_PARAMS | jq -r '.password')
AURORA_DATABASE='acme_store_orders'

# Writing config file
mkdir -p ./config

jq --null-input \
  --arg auroraHost $AURORA_HOST \
  --arg auroraPort $AURORA_PORT \
  --arg auroraUsername $AURORA_USERNAME \
  --arg auroraPassword $AURORA_PASSWORD \
  --arg auroraDatabase $AURORA_DATABASE \
'{
    "production": {
      "host": $auroraHost, 
      "port": $auroraPort, 
      "username": $auroraUsername,
      "password": $auroraPassword,
      "dialect": "postgres",
      "database": $auroraDatabase
    }
}' \
> ./config/config.json

# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# fails if db exists
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# NODE_ENV=production npx sequelize-cli db:create

NODE_ENV=production npx sequelize-cli db:migrate

