#!/bin/bash
mydir="${0%/*}"
CONFIG_PATH=$mydir/../config
mkdir -p $mydir/../config

# Getting CloudFormation stack outputs
STACKNAME=${1:-AcmeStoreCdkStack}
echo "Fetching $STACKNAME stack outputs ..."
CFN_OUTPUT=$(aws cloudformation describe-stacks --stack-name $STACKNAME --output json)
AURORA_ENDPOINT=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="auroraClusterEndpoint").OutputValue')
AURORA_PORT=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="auroraClusterPort").OutputValue')
AURORA_SECRET=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="auroraSecret").OutputValue')
COGNITO_IDENTITY_POOL=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="cognitoIdentityPoolId").OutputValue')
COGNITO_USER_POOL_ID=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="cognitoUserPoolId").OutputValue')
COGNITO_CLIENT_ID=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="cognitoClientId").OutputValue')
COGNITO_ADMIN_GROUP=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="cognitoAdminUserPoolGroup").OutputValue')
COGNITO_READONLY_GROUP=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="cognitoReadOnlyUserPoolGroup").OutputValue')
COGNITO_ADMIN_SECRET_NAME=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="cognitoAdminUserSecretName").OutputValue')
COGNITO_READONLY_SECRET_NAME=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="cognitoReadOnlyUserSecretName").OutputValue')
API_ENDPOINT=$(echo $CFN_OUTPUT | jq -r '.Stacks[].Outputs[] | select(.OutputKey=="apiEndpoint").OutputValue')

# Writing config file
jq --null-input \
  --arg auroraEndpoint $AURORA_ENDPOINT \
  --arg auroraPort $AURORA_PORT \
  --arg auroraSecret $AURORA_SECRET \
  --arg cognitoIdentityPool $COGNITO_IDENTITY_POOL \
  --arg cognitouserPool $COGNITO_USER_POOL_ID \
  --arg cognitoClientId $COGNITO_CLIENT_ID \
  --arg cognitoAdminUserPoolGroup $COGNITO_ADMIN_GROUP \
  --arg cognitoReadOnlyUserPoolGroup $COGNITO_READONLY_GROUP \
  --arg cognitoAdminUserSecretName $COGNITO_ADMIN_SECRET_NAME \
  --arg cognitoReadOnlyUserSecretName $COGNITO_READONLY_SECRET_NAME \
  --arg apiEndpoint $API_ENDPOINT \
'{
    "aws": {
      "region": "us-east-1",
    },
    "api": {
      "endpoint": $apiEndpoint,
    },
    "cognito": {
      "userPoolId": $cognitouserPool,
      "ClientId": $cognitoClientId,
      "identityPoolId": $cognitoIdentityPool, 
      "adminGroup": $cognitoAdminUserPoolGroup,
      "readOnlyGroup": $cognitoReadOnlyUserPoolGroup,
      "adminUserSecretName": $cognitoAdminUserSecretName,
      "readOnlyUserSecretName": $cognitoReadOnlyUserSecretName
    },
    "aurora": {
      "endpoint": $auroraEndpoint, 
      "port": $auroraPort, 
      "secret": $auroraSecret
    }
}' \
> $CONFIG_PATH/default.json
echo "Successfully saved the configurations into config/default.json."