import { sendApiGetRequest, sendApiPostRequest } from './cognito.js';

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

async function acmeStorePost(path, params) {
  try {
    const resp = await sendApiPostRequest(path, params);
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

export async function createOrder(body) {
  const params = {
    body: body
  }
  return await acmeStorePost('/orders', params);
}