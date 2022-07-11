import config from 'config';
import { getSecretValue } from './src/secret.js'
import { deleteUser } from './src/cognito.js'

const adminSecret = JSON.parse(await getSecretValue(config.get('cognito.adminUserSecretName')));
let adminUsername = adminSecret.username;
const readOnlySecret = JSON.parse(await getSecretValue(config.get('cognito.readOnlyUserSecretName')));
let readOnlyUsername = readOnlySecret.username;
await deleteUser(adminUsername);
await deleteUser(readOnlyUsername);




