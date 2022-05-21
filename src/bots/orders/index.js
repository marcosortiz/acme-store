const axios = require('axios');
const ORDERS_SERVICE_URL = 'http://CdkSt-Order-G2YRUJMED888-efb062ea62d979ab.elb.us-east-1.amazonaws.com/orders'



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