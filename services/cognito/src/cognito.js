import { Auth } from '@aws-amplify/auth';
import config from 'config';
import {
  CognitoIdentityProviderClient, AdminDeleteUserCommand, AdminCreateUserCommand,
  AdminSetUserPasswordCommand, AdminAddUserToGroupCommand
} from "@aws-sdk/client-cognito-identity-provider";

const REGION = config.get("aws.region");
const USER_POOL_ID = config.get("cognito.userPoolId");
const CLIENT_ID = config.get("cognito.ClientId");
const IDENTITY_POOL_ID = config.get("cognito.identityPoolId");

Auth.configure({
  identityPoolId: IDENTITY_POOL_ID,
  region: REGION,
  userPoolId: USER_POOL_ID,
  userPoolWebClientId: CLIENT_ID,
  mandatorySignIn: false,
});

// a client can be shared by different commands.
const client = new CognitoIdentityProviderClient({ region: REGION });

export async function signIn(username, password) {
  try {

    console.log(`Signing is as ${username} ...`)
    const user = await Auth.signIn(username, password);
  } catch (error) {
    throw error
  }
}

export async function signOut(username) {
  try {

    console.log(`Signing out as ${username} ...`)
    const user = await Auth.signOut(username);
  } catch (error) {
    throw error
  }
}

export async function inspectCurrentSession() {
  Auth.currentSession().then(res => {
    let idToken = res.getIdToken();
    let jwt = idToken.getJwtToken();
    console.log(`JWT=${jwt}`);
  });
}

export async function deleteUser(username) {
  try {
    const command = new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
    });
    console.log(`Deleting ${username} user ...`);
    const response = await client.send(command);
  } catch (error) {
    throw error;
  }
}

export async function createUser(username) {
  try {
      const command = new AdminCreateUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
      });
      console.log(`Creating ${username} user ...`);
      const response = await client.send(command);
  } catch (error) {
      throw error;
  }
}

export async function setUserPassword(username, password) {
  try {
      const command = new AdminSetUserPasswordCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          Password: password,
          Permanent: true
      });
      console.log(`Setting ${username} password ...`);
      const response = await client.send(command);
  } catch (error) {
      throw error;
  }
}

export async function addUserToGroup(username, group) {
  try {
      const command = new AdminAddUserToGroupCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          GroupName: group
      });
      console.log(`Adding ${username} to ${group} group ...`);
      const response = await client.send(command);
  } catch (error) {
      throw error;
  }
}