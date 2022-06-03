
import config from 'config';
import {
    CognitoIdentityProviderClient, AdminCreateUserCommand,
    AdminSetUserPasswordCommand, AdminAddUserToGroupCommand
} from "@aws-sdk/client-cognito-identity-provider";

const REGION = config.get("aws.REGION");
const USER_POOL_ID = config.get("cognito.USER_POOL_ID");
const CLIENT_ID = config.get("cognito.CLIENT_ID");
const IDENTITY_POOL_ID = config.get("cognito.IDENTITY_POOL_ID");

// a client can be shared by different commands.
const client = new CognitoIdentityProviderClient({ region: REGION });

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

let adminUsername = config.get("users.admin.username");
let adminUserPassword = config.get("users.admin.password");
let adminGroup = config.get("users.admin.group");
await createUser(adminUsername);
await setUserPassword(adminUsername, adminUserPassword);
await addUserToGroup(adminUsername, adminGroup);

let readOnlyUsername = config.get("users.readonly.username");
let readOnlyUserPassword = config.get("users.readonly.password");
let readOnlyGroup = config.get("users.readonly.group");
await createUser(readOnlyUsername);
await setUserPassword(readOnlyUsername, readOnlyUserPassword);
await addUserToGroup(readOnlyUsername, readOnlyGroup);