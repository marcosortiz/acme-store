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
        service: 'deals',
        version: '1.1',
        az: AZ
    });
});

app.get('/deals', function (req, res) {
    res.json({
        deals: [
            {
                id: 1,
                value: 'Free delivery.',
            },
            {
                id: 15,
                value: '3% off when you spend more than $15.00.',
            }
        ], 
        az: AZ
    });
});

app.get('/deal/:id', function (req, res) {
    const id = req.params.id
    res.json({
        deal: {
            id: id,
            value: '3% off when you spend more than $15.00.',
        }, 
        az: AZ
    });
});

// Setting the server to listen at port 3000
app.listen(3000, function (req, res) {
    console.log("Server is running at port 3000");
});