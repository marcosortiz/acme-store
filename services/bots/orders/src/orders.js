import { sendApiGetRequest } from './cognito.js';

async function acmeStoreGet(path) {
  try {
    const resp = await sendApiGetRequest(path);
    return resp;
  } catch (err) {
    let code = err.response.status;
    let text = err.response.statusText;
    console.error(`Getting ${path}: ${code} (${text})`);
  }
}


export async function getOrders() {
  return await acmeStoreGet('/orders');
}