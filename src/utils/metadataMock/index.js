// Requiring express in our server
const express = require('express');
const app = express();

// Defining get request at '/multiple' route
app.get('/task', function (req, res) {
    res.json({AvailabilityZone: 'us-east-1a'});
});


// Setting the server to listen at port 3001
app.listen(3001, function (req, res) {
    console.log("Server is running at port 3001");
});