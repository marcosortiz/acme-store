#!/bin/bash
mydir="${0%/*}"
CONFIG_PATH=$mydir/../config
COGNITO_SCRIPT_PATH=$mydir/../src/cognito

NODE_CONFIG_DIR=$CONFIG_PATH node $COGNITO_SCRIPT_PATH/index.js
