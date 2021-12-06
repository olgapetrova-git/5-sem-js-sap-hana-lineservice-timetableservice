"use strict";


const utils = require("../a_mod/utils");
const util = require('util');

const here = require('../a_mod/here');
const express = require('express')
const app = express()
const port = 3000

const hdbext = require("@sap/hdbext");
var ta = require('@sap/textanalysis');
const config = require('../a_config/config');
const Hdb = require('../a_mod/hdb');

const sqlSelectClosestStation =
    "select top 1 hid, bez, new ST_POINT('POINT('|| ?  || ' '|| ? ||' )', 4326).ST_DISTANCE(pos) as distance from haltestelle order by distance asc";
const sqlSelectAbschnitt_view = "select * from abschnitt_view order by lid, nr";

//promises:
let taAnalyzePromise = function(values, connection) {
    return new Promise((resolve, reject) => {
        ta.analyze(values, connection, (err, parameters, rows) => {
            if (err) {
                console.error('error', err);
                reject(err);
            } else {

                resolve(rows);
            }
        });
    });
}

let geoCodePromise = function(config, addresse) {
    return new Promise((resolve, reject) => {
        here.geoCode(config, addresse, (coordinates) => {
            resolve(coordinates);
        });
    });
}

app.listen(port, () =>
    console.log(`Lineservice listening on port ${port}!`))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/lineservice', async (req, res, next) => {

    let textRequest = req.query.text;
    let addresses = await getAddressFromText(textRequest).catch(
        err => console.log("getAddressFromText :" + err));
    console.log("\nAddresses: " + JSON.stringify(addresses));
    if (Object.keys(addresses).length < 2) {
        console.log(
            "Cannot identify two addresses from the specified text. Please reformulate your request. "
            )
        res.send("ERROR: Not valid address");
        return;
    }
    console.log("Addresse 1: " + addresses[0].TOKEN);
    console.log("Addresse 2: " + addresses[1].TOKEN);

    //request geo-coordinates from here (here-geo-coding.js)
    let coordinates1 = await geoCodePromise(config, addresses[0]
        .TOKEN + ", Berlin").then(coordinates => {
        return coordinates;
    }).catch(err => console.log("geoCodePromise: " + err));
    console.log("Coordinates 1: " + JSON.stringify(coordinates1));

    let coordinates2 = await geoCodePromise(config, addresses[1]
        .TOKEN + ", Berlin").then(coordinates => {
        return coordinates;
    }).catch(err => console.log("geoCodePromise: " + err));
    console.log("Coordinates 2: " + JSON.stringify(coordinates2));

    //find closest stations for start and end addresses
    let stationStart = await findClosestStation(coordinates1);
    let stationEnd = await findClosestStation(coordinates2);
    console.log("Station Start: " + JSON.stringify(stationStart));
    console.log("Station End: " + JSON.stringify(stationEnd));


    //work with graph - verbindungen
    const sPath = await findShortestPath(stationStart[0].HID,
        stationEnd[0].HID);
    const sDis = await findShortestDistance(stationStart[0].HID,
        stationEnd[0].HID);
    //const mLine = await findMinimumLines

    if (sPath.results.length < 1) {
        console.log(
            "Cannot find the connection between two addresses from the specified text. Please reformulate your request. "
            )
    }

    //get station coords for all lines 
    const linePlan = await getFullLinePlan();
    // return values for map here.com
    let serviceResult = {
        "Start": stationStart,
        "End": stationEnd,
        "Shortest_path": sPath,
        "Shortest_distance": sDis,
        //"Minimum_linechanges": mLine,
        "Line_plan": linePlan
    };
    res.send(`${JSON.stringify(serviceResult)}`);
});

async function getAddressFromText(text) {
    var values = {
        DOCUMENT_TEXT: text,
        LANGUAGE_CODE: 'DE',
        CONFIGURATION: 'EXTRACTION_CORE',
        RETURN_PLAINTEXT: 0
    };

    const connection = await Hdb.createConnection(config.hdb).catch(err =>
        console.log("Connection error", err));

    const resultTextAnalyze = await taAnalyzePromise(values, connection)
        .then((rows) => {
            return rows
        });
    return resultTextAnalyze;
}

async function findClosestStation(coordinates) {
    const haltestelle = await utils.dbOp(config.hdb,
            sqlSelectClosestStation, [coordinates.lng, coordinates.lat])
        .catch(err => console.log("findClosestStation error: ", err));
    return haltestelle;
}

async function findShortestPath(stationStart, stationEnd) {

    const result = await utils.dbSp(config.hdb, "SHORTEST_PATH", {
        S: stationStart,
        T: stationEnd
    }).catch(err => console.log("Error calling Shortest_path: ", err));
    console.log(
        "1) Shortest path / Fahrverbindung mit kleinster Anzahl an Abschnitten: "
        );
    console.log(result);
    return result;
}

async function findShortestDistance(stationStart, stationEnd) {

    const result = await utils.dbSp(config.hdb, "SHORTEST_DISTANCE", {
        S: stationStart,
        T: stationEnd
    }).catch(err => console.log("Error calling Shortest_distance: ",
        err));
    console.log(
        "2) Shortest distance / Fahrverbindung mit kürzester Länge: ");
    console.log(result);
    return result;
}

async function findMinimumLines() {
    console.log(
        "3) Fahrverbindung mit geringster Anzahl von Umsteigevorgängen: "
        );
}

async function getFullLinePlan() {
    const linePlan = await utils.dbOp(config.hdb, sqlSelectAbschnitt_view)
        .catch(err => console.log("getFullLinePlan error: ", err));
    return linePlan;
}