
import { Amplify, Auth } from 'aws-amplify';
import config from 'config';

const REGION = config.get("aws.REGION");
const USER_POOL_ID = config.get("cognito.USER_POOL_ID");
const CLIENT_ID = config.get("cognito.CLIENT_ID");
const IDENTITY_POOL_ID = config.get("cognito.IDENTITY_POOL_ID");


Amplify.configure({
  Auth: {
    identityPoolId: IDENTITY_POOL_ID,
    region: REGION,
    userPoolId: USER_POOL_ID,
    userPoolWebClientId: CLIENT_ID,
    mandatorySignIn: false,
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
  Auth.currentSession().then(res=>{
    let accessToken = res.getAccessToken()
    let jwt = accessToken.getJwtToken()
    console.log(`myAccessToken: ${JSON.stringify(accessToken)}`)
  });
}


let adminUsername = config.get("users.admin.username");
let adminUserPassword = config.get("users.admin.password");
let readOnlyUsername = config.get("users.readonly.username");
let readOnlyUserPassword = config.get("users.readonly.password");
await signIn(adminUsername, adminUserPassword);
await inspectCurrentSession();
await signOut(adminUsername);
await signIn(readOnlyUsername, readOnlyUserPassword);
await inspectCurrentSession();
await signOut(readOnlyUsername);