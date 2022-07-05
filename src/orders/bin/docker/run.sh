#!/bin/bash
mydir="${0%/*}"

export TAG_NAME=acme-store-orders
CONFIG_FILE=$mydir/../../config/default.json
export DB_CONFIG=$(cat $CONFIG_FILE | jq '.db')
export PGHOST=${PGHOST=$(echo $DB_CONFIG | jq -r '.host')}
export PGPORT=${PGPORT=$(echo $DB_CONFIG | jq -r '.port')}
export PGUSER=${PGUSER=$(echo $DB_CONFIG | jq -r '.username')}
export PGPASSWORD=${PGPASSWORD=$(echo $DB_CONFIG | jq -r '.password')}
export PGDATABASE=${PGDATABASE=$(echo $DB_CONFIG | jq -r '.database')}

docker run --env PGHOST --env PGPORT --env PGUSER --env PGPASSWORD --env PGDATABASE -t -i -p 49160:3000 $TAG_NAME