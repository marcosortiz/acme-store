const axios = require('axios');
const DEALS_SERVICE_URL = 'http://cdkst-deals-j3jricr7hpct-1377744318.us-east-1.elb.amazonaws.com/deals'

setInterval(function A() {
    console.log('Sending request to deals service (/deals) ...');
    axios.get(DEALS_SERVICE_URL, {timeout: 3000} )
    .then(response => {
    })
    .catch(error => {
        console.error(`Error fetching task metadata (${error.code}).`);
    })
}, 1000);

// Executed right away 
console.log('Deal bot started ...');
console.log(`Deals service URL is ${DEALS_SERVICE_URL}`);