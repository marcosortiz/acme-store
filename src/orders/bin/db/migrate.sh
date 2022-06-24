#!/bin/bash
mydir="${0%/*}"
CONFIG_FILE=$mydir/../../config/default.json

export DB_CONFIG=$(cat $CONFIG_FILE | jq '.db')
export PGHOST=$(echo $DB_CONFIG | jq -r '.host')
export PGPORT=$(echo $DB_CONFIG | jq -r '.port')
export PGUSER=$(echo $DB_CONFIG | jq -r '.username')
export PGPASSWORD=$(echo $DB_CONFIG | jq -r '.password')
export PGDATABASE=postgres
export DB_NAME=$(echo $DB_CONFIG | jq -r '.database')

npm run db:migrate up