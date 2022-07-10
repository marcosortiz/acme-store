import { Amplify, Auth, API } from 'aws-amplify';
import { SecretsManagerClient, GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import config from 'config';
const REGION = config.get("aws.region");
const USER_POOL_ID = config.get("cognito.userPoolId");
const CLIENT_ID = config.get("cognito.ClientId");
const IDENTITY_POOL_ID = config.get("cognito.identityPoolId");
const API_ENDPOINT = config.get("api.endpoint");

const smClient = new SecretsManagerClient({ region: REGION });

Amplify.configure({
  Auth: {
    identityPoolId: IDENTITY_POOL_ID,
    region: REGION,
    userPoolId: USER_POOL_ID,
    userPoolWebClientId: CLIENT_ID,
    mandatorySignIn: false,
  },
  API: {
    endpoints: [
      {
        name: "AcmeStore",
        endpoint: API_ENDPOINT,
        custom_header: async () => { 
          return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
        }
      }
    ]
  }
});

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

async function signIn(username, password) {
  try {

    console.log(`Signing is as ${username} ...`)
    const user = await Auth.signIn(username, password);
  } catch (error) {
    console.log('error signing in', error);
  }
}

async function signOut(username) {
  try {

    console.log(`Signing out as ${username} ...`)
    const user = await Auth.signOut(username);
  } catch (error) {
    console.log('error signing out', error);
  }
}

async function inspectCurrentSession() {
  Auth.currentSession().then(res => {
    let accessToken = res.getAccessToken();
    let jwt = accessToken.getJwtToken();
    console.log(`myAccessToken: ${JSON.stringify(accessToken)}`)
    let idToken = res.getIdToken();
    jwt = idToken.getJwtToken();
    console.log(`myIdToken: ${JSON.stringify(idToken)}`)
  });
}

function sendApiGetRequest(path) {
  return API.get('AcmeStore', path);
}

async function acmeStoreGet(path) {
  try{
    const resp = await sendApiGetRequest(path);
    console.error(`Cetting ${path}: 200 (OK)`);
  } catch (err) {
    let code = err.response.status;
    let text = err.response.statusText;
    console.error(`Getting ${path}: ${code} (${text})`);
  }
}

async function getDeals() {
  await acmeStoreGet('/deals'); 
}

async function getOrders() {
  await acmeStoreGet('/orders'); 
}

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