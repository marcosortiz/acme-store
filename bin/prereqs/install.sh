#!/bin/bash
mydir="${0%/*}"

echo '================================================================================'
echo "Installing prereqs"
echo '================================================================================'
sudo yum update -y
sudo yum install -y jq postgresql