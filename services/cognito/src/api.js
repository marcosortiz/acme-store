import { API } from '@aws-amplify/api';
import { Auth} from '@aws-amplify/auth';
import config from 'config';

const REGION = config.get("aws.region");
const USER_POOL_ID = config.get("cognito.userPoolId");
const CLIENT_ID = config.get("cognito.ClientId");
const IDENTITY_POOL_ID = config.get("cognito.identityPoolId");
const API_ENDPOINT = config.get("api.endpoint");


Auth.configure({
  identityPoolId: IDENTITY_POOL_ID,
  region: REGION,
  userPoolId: USER_POOL_ID,
  userPoolWebClientId: CLIENT_ID,
  mandatorySignIn: false,
});

API.configure({
  endpoints: [
    {
      name: "AcmeStore",
      endpoint: API_ENDPOINT,
      custom_header: async () => { 
        return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
      }
    }
  ]
});

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

export async function getDeals() {
  await acmeStoreGet('/deals'); 
}

export async function getOrders() {
  await acmeStoreGet('/orders'); 
}