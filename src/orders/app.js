const express = require('express')
const mountRoutes = require('./routes')

const app = express()
mountRoutes(app)

// Setting the server to listen at port 3000
app.listen(3000, function (req, res) {
    console.log("Server is running at port 3000");
});