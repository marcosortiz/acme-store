import config from 'config';
import { signIn, inspectCurrentSession, signOut } from './src/cognito.js'
import { getSecretValue } from './src/secret.js'

const adminSecret = JSON.parse(await getSecretValue(config.get('cognito.adminUserSecretName')));
const readOnlySecret = JSON.parse(await getSecretValue(config.get('cognito.readOnlyUserSecretName')));

let adminUsername = adminSecret.username;
let adminUserPassword = adminSecret.password;


try {
    await signIn(adminUsername, adminUserPassword);
    await inspectCurrentSession();
    await signOut(adminUsername);
    console.log('--------------------------------------------------------------------------------');
    let readOnlyUsername = readOnlySecret.username;
    let readOnlyUserPassword = readOnlySecret.password;
    await signIn(readOnlyUsername, readOnlyUserPassword);
    await inspectCurrentSession();
    await signOut(readOnlyUsername);
} catch (error) {
    if (error.name === 'UserNotFoundException') {
        console.error(error.message);
    }
}
