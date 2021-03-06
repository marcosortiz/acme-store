#!/bin/bash
mydir="${0%/*}"
CONFIG_FILE=$mydir/../../config/default.json

export CONFIG=$(cat $CONFIG_FILE | jq '.')
export REGION=${REGION=$(echo $CONFIG | jq -r '.aws.region')}
export ENDPOINT=${ENDPOINT=$(echo $CONFIG | jq -r '.api.endpoint')}
export USER_POOL_ID=${USER_POOL_ID=$(echo $CONFIG | jq -r '.cognito.userPoolId')}
export CLIENT_ID=${CLIENT_ID=$(echo $CONFIG | jq -r '.cognito.ClientId')}
export IDENTITY_POOL_ID=${IDENTITY_POOL_ID=$(echo $CONFIG | jq -r '.cognito.identityPoolId')}
export USERNAME=${USERNAME=$(echo $CONFIG | jq -r '.cognito.username')}
export PASSWORD=${PASSWORD=$(echo $CONFIG | jq -r '.cognito.password')}


node $mydir/../../index.mjs