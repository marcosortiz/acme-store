import { faker } from '@faker-js/faker';
import { refreshTokensIfNeeded, signOut } from './cognito.js'
import { getOrders, createOrder } from './orders.js'

var intervals = []
var intervalId;

function createRandomOrder() {
    const order = {
        username: faker.internet.userName(),
        details: {
            customer: faker.name.findName(),
            address: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.state(),
            zip: faker.address.zipCode(),
            email: faker.internet.email(),
            product: faker.commerce.product(),
            price: parseFloat(faker.commerce.price())
        }
    };
    return order;
}

function setConstantWork() {
    // 1 get orders per second
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

    // 5 orders created per second
    intervalId = setInterval(function () {
        let order = createRandomOrder();
        createOrder(order)
            .then(response => {
                const az = response.meta.az;
                console.log(`POST /orders served out of ${az}.`);
            })
            .catch(error => {
                console.error(`Error getting orders: (${error}).`);
            })
    }, 200);
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






