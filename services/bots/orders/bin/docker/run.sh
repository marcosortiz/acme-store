#!/bin/bash
mydir="${0%/*}"

export TAG_NAME=acme-store-orders-bot
CONFIG_FILE=$mydir/../../config/default.json
export CONFIG=$(cat $CONFIG_FILE | jq '.')
export REGION=${REGION=$(echo $CONFIG | jq -r '.aws.region')}
export ENDPOINT=${ENDPOINT=$(echo $CONFIG | jq -r '.api.endpoint')}
export USER_POOL_ID=${USER_POOL_ID=$(echo $CONFIG | jq -r '.cognito.userPoolId')}
export CLIENT_ID=${CLIENT_ID=$(echo $CONFIG | jq -r '.cognito.ClientId')}
export IDENTITY_POOL_ID=${IDENTITY_POOL_ID=$(echo $CONFIG | jq -r '.cognito.identityPoolId')}
export USERNAME=${USERNAME=$(echo $CONFIG | jq -r '.cognito.username')}
export PASSWORD=${PASSWORD=$(echo $CONFIG | jq -r '.cognito.password')}

docker run --env REGION --env ENDPOINT --env USER_POOL_ID --env CLIENT_ID --env IDENTITY_POOL_ID --env USERNAME --env PASSWORD -t -i $TAG_NAME