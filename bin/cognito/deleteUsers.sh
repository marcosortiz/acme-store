#!/bin/bash
mydir="${0%/*}"
CONFIG_PATH=$mydir/../../config
SCRIPT_PATH=$mydir/../../services/cognito

NODE_CONFIG_DIR=$CONFIG_PATH node $SCRIPT_PATH/deleteUsers.js
