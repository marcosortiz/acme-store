#!/bin/bash
mydir="${0%/*}"

echo '===== Copying config ... ====='
AURORA_PARAMS=$(cat $mydir/../../../config/default.json | jq '.aurora')
AURORA_HOST=$(echo $AURORA_PARAMS | jq -r '.host')
AURORA_PORT=$(echo $AURORA_PARAMS | jq -r '.port')
AURORA_USERNAME=$(echo $AURORA_PARAMS | jq -r '.username')
AURORA_PASSWORD=$(echo $AURORA_PARAMS | jq -r '.password')
AURORA_DATABASE='acme_store_orders'

# Writing config file
mkdir -p $mydir/../config

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
> $mydir/../config/config.json

echo '===== Installing npm packages ... ====='
cd $mydir/.. && npm install


# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# fails if db exists
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# NODE_ENV=production npx sequelize-cli db:create

echo '===== Migrationg db ... ====='
NODE_ENV=production npx sequelize-cli db:migrate

