#!/bin/bash
mydir="${0%/*}"
CONFIG_FILE=$mydir/../../config/default.json

export DB_CONFIG=$(cat $CONFIG_FILE | jq '.db')
export PGHOST=${PGHOST=$(echo $DB_CONFIG | jq -r '.host')}
export PGPORT=${PGPORT=$(echo $DB_CONFIG | jq -r '.port')}
export PGUSER=${PGUSER=$(echo $DB_CONFIG | jq -r '.username')}
export PGPASSWORD=${PGPASSWORD=$(echo $DB_CONFIG | jq -r '.password')}
export PGDATABASE=postgres
export DB_NAME=${DB_NAME=$(echo $DB_CONFIG | jq -r '.database')}

echo "Dropping database \"$DB_NAME\" ..."
psql -f $mydir/drop-db.sql -v dbname=$DB_NAME