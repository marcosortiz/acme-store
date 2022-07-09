import { Amplify, Auth, API } from 'aws-amplify';

Amplify.configure({
    Auth: {
      identityPoolId: process.env.IDENTITY_POOL_ID,
      region: process.env.REGION,
      userPoolId: process.env.USER_POOL_ID,
      userPoolWebClientId: process.env.CLIENT_ID,
      mandatorySignIn: false,
    },
    API: {
      endpoints: [
        {
          name: "AcmeStore",
          endpoint: process.env.ENDPOINT,
          custom_header: async () => { 
            return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
          }
        }
      ]
    }
  });
  
  export async function signIn(username, password) {
    try {
  
      console.log(`Signing is as ${username} ...`)
      const user = await Auth.signIn(username, password);
    } catch (error) {
      console.log('error signing in', error);
    }
  }
  
  export async function signOut(username) {
    try {
  
      console.log(`Signing out as ${username} ...`)
      const user = await Amplify.Auth.signOut(username);
    } catch (error) {
      console.log('error signing out', error);
    }
  }

  // This is an idempotent method. It will automatically refresh the accessToken
  // and idToken if they are expired. More info: https://docs.amplify.aws/lib/auth/manageusers/q/platform/js/#retrieve-attributes-for-current-authenticated-user
  export async function refreshTokensIfNeeded() {
    try {
      await Auth.currentSession();
    } catch (error) {
      throw error;
    }
  }

  export async function sendApiGetRequest(path) {
    return API.get('AcmeStore', path);
  }
