
import { Amplify, Auth, API } from 'aws-amplify';
import config from 'config';

const REGION = config.get("aws.REGION");
const USER_POOL_ID = config.get("cognito.USER_POOL_ID");
const CLIENT_ID = config.get("cognito.CLIENT_ID");
const IDENTITY_POOL_ID = config.get("cognito.IDENTITY_POOL_ID");
const API_ENDPOINT = config.get("api.ENDPOINT");


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
          // return { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}` }
          return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
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

async function getDeals() {
  try {
    console.log('Getting deals ...')
    return API.get('AcmeStore', '/deals');
  } catch (error) {
    console.log('Error getting deals.', error);
  }
}

async function getOrders() {
  try {
    console.log('Getting orders ...')
    return API.get('AcmeStore', '/orders');
  } catch (error) {
    console.log('Error getting orders.', error);
  }
}


// let adminUsername = config.get("users.admin.username");
// let adminUserPassword = config.get("users.admin.password");
// await signIn(adminUsername, adminUserPassword);
// console.log(await getDeals());
// console.log(await getOrders());
// await signOut(adminUsername);
// console.log('--------------------------------------------------------------------------------');
let readOnlyUsername = config.get("users.readonly.username");
let readOnlyUserPassword = config.get("users.readonly.password");
await signIn(readOnlyUsername, readOnlyUserPassword);
console.log(await getDeals());
console.log(await getOrders());
await signOut(readOnlyUsername);