
import config from 'config';
import {
    CognitoIdentityProviderClient, AdminCreateUserCommand,
    AdminSetUserPasswordCommand, AdminAddUserToGroupCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { SecretsManagerClient, GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';

const REGION = config.get("aws.region");
const USER_POOL_ID = config.get("cognito.userPoolId");

// a client can be shared by different commands.
const client = new CognitoIdentityProviderClient({ region: REGION });
const smClient = new SecretsManagerClient({ region: REGION });

async function createUser(username) {
    try {
        const command = new AdminCreateUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
        });
        console.log(`Creating ${username} user ...`);
        const response = await client.send(command);
    } catch (error) {
        console.log('error creating user', error);
    }
}

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

async function setUserPassword(username, password) {
    try {
        const command = new AdminSetUserPasswordCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
            Password: password,
            Permanent: true
        });
        console.log(`Setting ${username} password ...`);
        const response = await client.send(command);
    } catch (error) {
        console.log('error setting user password', error);
    }
}

async function addUserToGroup(username, group) {
    try {
        const command = new AdminAddUserToGroupCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
            GroupName: group
        });
        console.log(`Adding ${username} to ${group} group ...`);
        const response = await client.send(command);
    } catch (error) {
        console.log('error adding user to group', error);
    }
}

const adminSecret = JSON.parse(await getSecretValue(config.get('cognito.adminUserSecretName')));
let adminUsername = adminSecret.username;
let adminUserPassword = adminSecret.password;
let adminGroup = config.get("cognito.adminGroup");
await createUser(adminUsername);
await setUserPassword(adminUsername, adminUserPassword);
await addUserToGroup(adminUsername, adminGroup);

const readOnlySecret = JSON.parse(await getSecretValue(config.get('cognito.readOnlyUserSecretName')));
let readOnlyUsername = readOnlySecret.username;
let readOnlyUserPassword = readOnlySecret.password;
let readOnlyGroup = config.get("cognito.readOnlyGroup");
await createUser(readOnlyUsername);
await setUserPassword(readOnlyUsername, readOnlyUserPassword);
await addUserToGroup(readOnlyUsername, readOnlyGroup);