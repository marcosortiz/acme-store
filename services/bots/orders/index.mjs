import { signIn } from './src/cognito.js'
import { startBotWork } from './src/bot.js'

console.log('Order bot started ...');
console.log(`Orders service endpoint is ${process.env.ENDPOINT}`);

let username = process.env.USERNAME;
let password = process.env.PASSWORD;
await signIn(username, password);
startBotWork({
    username: username
});