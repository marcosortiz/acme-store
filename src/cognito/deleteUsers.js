
import config from 'config';
import {
    CognitoIdentityProviderClient, AdminDeleteUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const REGION = config.get("aws.REGION");
const USER_POOL_ID = config.get("cognito.USER_POOL_ID");

// a client can be shared by different commands.
const client = new CognitoIdentityProviderClient({ region: REGION });

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

let adminUsername = config.get("users.admin.username");
let readOnlyUsername = config.get("users.readonly.username");
await deleteUser(adminUsername);
await deleteUser(readOnlyUsername);




