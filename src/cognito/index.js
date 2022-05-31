
import { Amplify, Auth } from 'aws-amplify';
import config from 'config';

const REGION = config.get("aws.REGION");
const USER_POOL_ID = config.get("cognito.USER_POOL_ID");
const CLIENT_ID = config.get("cognito.CLIENT_ID");
const USERNAME = config.get("cognito.USERNAME");
const PASSWORD = config.get("cognito.PASSWORD");
const IDENTITY_POOL_ID = config.get("cognito.IDENTITY_POOL_ID");


Amplify.configure({
  Auth: {
    identityPoolId: IDENTITY_POOL_ID,
    region: REGION,
    userPoolId: USER_POOL_ID,
    userPoolWebClientId: CLIENT_ID,
    mandatorySignIn: false,
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  }
});

async function signIn() {
  try {
      const user = await Auth.signIn(USERNAME, PASSWORD);
      console.log('Fucking works !!!!!')
  } catch (error) {
      console.log('error signing in', error);
  }
}

async function inspectCurrentSession() {
  Auth.currentSession().then(res=>{
    let accessToken = res.getAccessToken()
    let jwt = accessToken.getJwtToken()
    //You can print them to see the full objects
    console.log(`myAccessToken: ${JSON.stringify(accessToken)}`)
    // console.log('--------------------------------------------------------------------------------');
    // console.log(`myJwt: ${jwt}`)
  });
}
await signIn();
console.log('--------------------------------------------------------------------------------');
await inspectCurrentSession();


