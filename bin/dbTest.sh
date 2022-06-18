#!/bin/bash
mydir="${0%/*}"
CONFIG_PATH=$mydir/../config

AURORA_CONFIG=$(cat $CONFIG_PATH/default.json | jq '.aurora')
AURORA_HOST=$(echo $AURORA_CONFIG | jq -r '.host')
AURORA_PORT=$(echo $AURORA_CONFIG | jq -r '.port')
AURORA_USERNAME=$(echo $AURORA_CONFIG | jq -r '.username')
AURORA_PASSWORD=$(echo $AURORA_CONFIG | jq -r '.password')

psql --host=$AURORA_HOST --port=$AURORA_PORT --username=$AURORA_USERNAME --password --dbname=postgres