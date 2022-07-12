import config from 'config';
import { getSecretValue } from './src/secret.js'
import { deleteUser } from './src/cognito.js'

const adminSecret = JSON.parse(await getSecretValue(config.get('cognito.adminUserSecretName')));
let adminUsername = adminSecret.username;
const readOnlySecret = JSON.parse(await getSecretValue(config.get('cognito.readOnlyUserSecretName')));
let readOnlyUsername = readOnlySecret.username;

try {
    await deleteUser(adminUsername);   
} catch (error) {
    if (error.name == 'UserNotFoundException') {
        console.error(error.message);
    }
}
try {
    await deleteUser(readOnlyUsername);   
} catch (error) {
    if (error.name === 'UserNotFoundException') {
        console.error(error.message);
    }
}




