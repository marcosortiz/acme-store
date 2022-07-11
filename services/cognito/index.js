import config from 'config';
import { getDeals, getOrders } from './src/api.js'
import {signIn, signOut} from './src/cognito.js'
import { getSecretValue } from './src/secret.js'

const adminSecret = JSON.parse(await getSecretValue(config.get('cognito.adminUserSecretName')));
const readOnlySecret = JSON.parse(await getSecretValue(config.get('cognito.readOnlyUserSecretName')));

let adminUsername = adminSecret.username;
let adminUserPassword = adminSecret.password;
await signIn(adminUsername, adminUserPassword);
await getDeals();
await getOrders();
await signOut(adminUsername);
console.log('--------------------------------------------------------------------------------');
let readOnlyUsername = readOnlySecret.username;
let readOnlyUserPassword = readOnlySecret.password;
await signIn(readOnlyUsername, readOnlyUserPassword);
await getDeals();
await getOrders();
await signOut(readOnlyUsername);