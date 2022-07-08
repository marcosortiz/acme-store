#!/bin/bash
mydir="${0%/*}"
export TAG_NAME=acme-store-orders

docker build -t $TAG_NAME .