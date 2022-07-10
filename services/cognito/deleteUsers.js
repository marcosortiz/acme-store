
import config from 'config';
import {
    CognitoIdentityProviderClient, AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { SecretsManagerClient, GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';

const REGION = config.get("aws.region");
const USER_POOL_ID = config.get("cognito.userPoolId");

// a client can be shared by different commands.
const client = new CognitoIdentityProviderClient({ region: REGION });
const smClient = new SecretsManagerClient({ region: REGION });

async function getSecretValue(secretName) {
    try {
        const command = new GetSecretValueCommand({
            SecretId: secretName,
        });
        const response = await smClient.send(command);
        return response.SecretString;
    } catch (error) {
        console.log('error getting user password', error);
    }
}

async function deleteUser(username) {
    try {
        const command = new AdminDeleteUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
        });
        console.log(`Deleting ${username} user ...`);
        const response = await client.send(command);
    } catch (error) {
        console.log('error deleting user', error);
    }
}

const adminSecret = JSON.parse(await getSecretValue(config.get('cognito.adminUserSecretName')));
let adminUsername = adminSecret.username;
const readOnlySecret = JSON.parse(await getSecretValue(config.get('cognito.readOnlyUserSecretName')));
let readOnlyUsername = readOnlySecret.username;
await deleteUser(adminUsername);
await deleteUser(readOnlyUsername);




