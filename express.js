"use strict";

const express = require('express')
const app = express()
const port = 3000

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers", 
        "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/mult', (req, res, next) => {
    res.send(`${req.query.num1 * req.query.num2}`);
});

app.listen(port, () => 
  console.log(`Example app listening on port ${port}!`))

