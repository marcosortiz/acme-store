#!/bin/bash
mydir="${0%/*}"
CONFIG_PATH=$mydir/../../config
SCRIPT_PATH=$mydir/../../src/orders

NODE_CONFIG_DIR=$CONFIG_PATH node $SCRIPT_PATH/testConnection.js