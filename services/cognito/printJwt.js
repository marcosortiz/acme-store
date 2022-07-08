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
          // return { Authorization : 'token' } 
          // Alternatively, with Cognito User Pools use this:
          // return { Authorization: `Bearer ${(await Auth.currentSession()).getAccessToken().getJwtToken()}` }
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
    let idToken = res.getIdToken();
    let jwt = idToken.getJwtToken();
    console.log(`JWT=${jwt}`);
  });
}

let adminUsername = 'Admin';
let adminUserPassword = await getSecretValue(config.get('cognito.adminUserSecretName'));
await signIn(adminUsername, adminUserPassword);
await inspectCurrentSession();
await signOut(adminUsername);
console.log('--------------------------------------------------------------------------------');
let readOnlyUsername = 'readOnly';
let readOnlyUserPassword = await getSecretValue(config.get('cognito.readOnlyUserSecretName'));
await signIn(readOnlyUsername, readOnlyUserPassword);
await inspectCurrentSession();
await signOut(readOnlyUsername);