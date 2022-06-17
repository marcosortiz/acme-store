import { Amplify, Auth, API } from 'aws-amplify';
import config from 'config';
const REGION = config.get("aws.region");
const USER_POOL_ID = config.get("cognito.userPoolId");
const CLIENT_ID = config.get("cognito.ClientId");
const IDENTITY_POOL_ID = config.get("cognito.identityPoolId");
const API_ENDPOINT = config.get("api.endpoint");


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
          // return { Authorization : 'token' } 
          // Alternatively, with Cognito User Pools use this:
          return { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}` }
          // return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
        }
      }
    ]
  }
});

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
    console.log(`Getting ${path} ...`)
    const resp = await sendApiGetRequest(path);
    console.log(resp);
  } catch (err) {
    let code = err.response.status;
    let text = err.response.statusText;
    console.error(`Error getting ${path}: ${code} - ${text}`);
  }
}

async function getDeals() {
  await acmeStoreGet('/deals'); 
}

async function getOrders() {
  await acmeStoreGet('/orders'); 
}

let adminUsername = config.get("users.admin.username");
let adminUserPassword = config.get("users.admin.password");
await signIn(adminUsername, adminUserPassword);
await getDeals();
await getOrders();
await signOut(adminUsername);
console.log('--------------------------------------------------------------------------------');
let readOnlyUsername = config.get("users.readonly.username");
let readOnlyUserPassword = config.get("users.readonly.password");
await signIn(readOnlyUsername, readOnlyUserPassword);
await getDeals();
await getOrders();
await signOut(readOnlyUsername);