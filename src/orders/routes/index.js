const axios = require('axios');
const orders = require('./orders')
const root = require('./root');

var AZ = null;
console.log('Fetching task metadata ...')
axios.get(`${process.env.ECS_CONTAINER_METADATA_URI_V4}/task`, {timeout: 3000} )
.then(response => {
    AZ = response.data.AvailabilityZone;
})
.catch(error => {
    console.error(`Error fetching task metadata (${error.code}).`);
    AZ = 'N/A';
})


module.exports = app => {

  app.use((req, res, next) => {
    req.az = AZ
    next();
  })
  app.use('/', root);
  app.use('/orders', orders);
  
}
