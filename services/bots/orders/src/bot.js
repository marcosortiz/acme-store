import { refreshTokensIfNeeded, signOut } from './cognito.js'
import { getOrders } from './orders.js'

var intervals = []
var intervalId;

function setConstantWork() {
    // Every second, get stores
    intervalId = setInterval(function () {
        getOrders()
            .then(response => {
                const az = response.meta.az;
                console.log(`GET /orders served out of ${az}.`);
            })
            .catch(error => {
                console.error(`Error getting orders: (${error}).`);
            })
    }, 1000);
    intervals.push(intervalId);

    // Every 15 mins, refresh id and access tokens if needed
    intervalId = setInterval(function () {
        refreshTokensIfNeeded()
            .then(response => {
            })
            .catch(error => {
                console.error(`Error refreshing token: (${error}).`);
            })
    }, 900000);
    intervals.push(intervalId);
}

function setTerminationListeners(username) {
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received.');
        console.log('Stopping constant work ...')
        intervals.forEach(intervalId => {
            clearInterval(intervalId)
        });
        signOut(username);
        process.exit();
    });
    
    process.on('SIGINT', function () {
        console.log('SIGINT signal received.');
        console.log('Stopping constant work ...')
        intervals.forEach(intervalId => {
            clearInterval(intervalId)
        });
        signOut(username);
        process.exit();
    });
}

export function startBotWork(params) {
    setConstantWork();
    setTerminationListeners(params.username);
}






