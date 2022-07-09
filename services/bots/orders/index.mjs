import { signIn } from './src/cognito.js'
import { getSecretValue } from './src/secrets.js'
import { startBotWork } from './src/bot.js'

console.log('Order bot started ...');
console.log(`Orders service endpoint is ${process.env.ENDPOINT}`);

let username = process.env.USERNAME;
let password = await getSecretValue(process.env.SECRET_NAME);
await signIn(username, password);
startBotWork({username: username});