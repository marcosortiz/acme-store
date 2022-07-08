const express = require('express');
const mountRoutes = require('./src/routes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
mountRoutes(app)

// Setting the server to listen at port 3000
app.listen(3000, function (req, res) {
    console.log("Server is running at port 3000");
});