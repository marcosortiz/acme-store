const axios = require('axios');
const express = require('express');

const app = express();

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


app.get('/', function (req, res) {
    res.json({
        service: 'orders',
        version: '1.1',
        az: AZ
    });
});

app.get('/orders', function (req, res) {
    res.json({
        orders: [
            {
                id: 1,
                value: 4.55,
                item: 'Item A',
            },
            {
                id: 15,
                value: 55.87,
                item: 'Item C'
            }
        ], 
        az: AZ
    });
});

app.get('/order/:id', function (req, res) {
    const id = req.params.id
    res.json({
        order:{
            id: id,
            value: 4.55,
            item: 'Some item',
        }, 
        az: AZ
    });
});

// Setting the server to listen at port 3000
app.listen(3000, function (req, res) {
    console.log("Server is running at port 3000");
});