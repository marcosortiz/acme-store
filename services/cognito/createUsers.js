
import config from 'config';
import { createUser, setUserPassword, addUserToGroup } from './src/cognito.js'
import { getSecretValue } from './src/secret.js'

const REGION = config.get("aws.region");
const USER_POOL_ID = config.get("cognito.userPoolId");

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