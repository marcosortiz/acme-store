const axios = require('axios');
const ORDERS_SERVICE_URL = 'http://cdkst-order-7hx7xl2l0nte-1948293795.us-east-1.elb.amazonaws.com/orders'



setInterval(function A() {
    console.log('Sending request to orders service (/orders) ...');
    axios.get(ORDERS_SERVICE_URL, {timeout: 3000} )
    .then(response => {
    })
    .catch(error => {
        console.error(`Error fetching task metadata (${error.code}).`);
    })
}, 1000);

// Executed right away 
console.log('Order bot started ...');
console.log(`Orders service URL is ${ORDERS_SERVICE_URL}`);