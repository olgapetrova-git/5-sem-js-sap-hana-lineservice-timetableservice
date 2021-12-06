"use strict";

const config = require("../a_config/config");
const utils = require("../a_mod/utils");
const hdb = require("../a_mod/hdb");

const urlLinien =
    "https://raw.githubusercontent.com/ic-htw/adbkt/master/a_db/usbahn/linien.csv"
const urlHaltestellen =
    "https://raw.githubusercontent.com/ic-htw/adbkt/master/a_db/usbahn/haltestellen.csv"
const sqlDeleteAbschnitt = "delete from abschnitt";
const sqlDeleteSegment = "delete from segment";
const sqlDeleteLinie = "delete from linie";
const sqlDeleteHaltestelle = "delete from haltestelle";
const sqlDeleteLinie_stage = "delete from linie_stage";
const sqlDeleteHaltestelle_stage = "delete from haltestelle_stage";
const sqlInsertLinie_stage = "insert into linie_stage values (?,?,?)";
const sqlSelectHaltestelle_stage = "select * from haltestelle_stage";
const sqlInsertHaltestelle_stage =
    "insert into haltestelle_stage values (?,?,?,?)";
const sqlUpdatePos =
    "update haltestelle set pos=new ST_POINT('POINT('|| lng || ' '|| lat ||' )', 4326);"; //need srid 4326, was error with srid 0 by default 
const sqlInsertHaltestelle = "insert into haltestelle values (?,?,?,?,?)";
const sqlSelectLinie_stage = "select * from linie_stage";
const sqlInsertLinie = "insert into linie values (?,?)";
const sqlUpdateLaenge_on_meter =
    "update segment set laenge_in_meter= new ST_POINT('POINT('|| a.lng || ' '|| a.lat ||' )', 4326).ST_DISTANCE(new ST_POINT('POINT('|| b.lng || ' '|| b.lat ||' )', 4326), 'meter') from segment join haltestelle a on hid_a = a.hid join haltestelle b on hid_b = b.hid";
const sqlInsertSegment = "insert into segment values (?,?,?,?)";
const sqlInsertAbschnitt = "insert into abschnitt values (?,?,?,?)";
const sqlUpdateSegment202 = "update segment set hid_b=10090 where sid=202";
const sqlUpdateSegment187 = "update segment set hid_a=10090 where sid=187";
const sqlCreateAbschnittView =
    "create or replace view abschnitt_view as select a.lid*1000+a.nr as aid," +
    "a.lid as lid, l.bez as bez_line, s.hid_a as hid_a, s.hid_b as hid_b, "
"h_a.bez as bez_a, h_b.bez as bez_b, " +
"h_a.lng as lng_a, h_a.lat as lat_a, h_b.lng as lng_b, h_b.lat as lat_b, " +
"a.nr as nr, s.laenge_in_meter as laenge " +
"from abschnitt a join segment s on a.sid = s.sid " +
"join haltestelle h_a on s.hid_a = h_a.hid join haltestelle h_b on s.hid_b = h_b.hid " +
"join linie l on a.lid=l.lid";

const sqlCreateGraphView =
    "create or replace view graph_view as select a.lid*1000+a.nr as aid, " +
    "a.lid as lid, l.bez as bez_line, s.hid_a as hid_a, s.hid_b as hid_b, h_a.bez as bez_a, h_b.bez as bez_b, " +
    "a.nr as nr, s.laenge_in_meter as laenge from abschnitt a join segment s on a.sid = s.sid " +
    "join haltestelle h_a on s.hid_a = h_a.hid join haltestelle h_b on s.hid_b = h_b.hid " +
    "join linie l on a.lid=l.lid union select a.lid*2000+a.nr as aid, a.lid as lid, l.bez as bez_line, " +
    "s.hid_b as hid_a, s.hid_a as hid_b, h_b.bez as bez_a, h_a.bez as bez_b, a.nr as nr, s.laenge_in_meter as laenge " +
    "from abschnitt a join segment s on a.sid = s.sid join haltestelle h_a on s.hid_a = h_a.hid " +
    "join haltestelle h_b on s.hid_b = h_b.hid join linie l on a.lid=l.lid";

const sqlSelectObjects =
    "select * from objects where object_name = 'LINESERVICE'";
const sqlDropWorkspace = "drop graph workspace lineservice";
const sqlCreateWorkspace =
    "create graph workspace lineservice edge table graph_view " +
    "source column hid_a target column hid_b key column aid vertex table haltestelle key column hid";

let haltestellenArray = []; //js array from haltestelle (ziel)
let linienArray = [];
let
    linienArrayFiltered = []; //with verlauf string and array column for each linienRow
let linienArrayZiel = []; //js array linie (ziel) filtered
let segmentArray = [];
let sidCounter = 1; //id for segments, incremented for every new segment
let abschnittArray = [];

async function main() {
    await deleteFromTables();
    await loadData();
    await transferHaltestelle_stageToHaltestelle();
    await transferLinie_stageToLinie();
    await createAbschnitt();
    await insertSegmentRecords();
    await insertAbschnittRecords();
    await createGraph();
}
async function deleteFromTables() {
    await utils.dbOp(config.hdb, sqlDeleteAbschnitt).catch(err => console
        .log(err));
    await utils.dbOp(config.hdb, sqlDeleteSegment).catch(err => console.log(
        err));
    await utils.dbOp(config.hdb, sqlDeleteLinie).catch(err => console.log(
        err));
    await utils.dbOp(config.hdb, sqlDeleteHaltestelle).catch(err => console
        .log(err));
    await utils.dbOp(config.hdb, sqlDeleteLinie_stage).catch(err => console
        .log(err));
    await utils.dbOp(config.hdb, sqlDeleteHaltestelle_stage).catch(err =>
        console.log(err));
    console.log("deleted from tables");
}

async function loadData() {
    console.log("load data:");
    let haltestellen = await utils.readCsvFromUrl(
        urlHaltestellen, { //json rows (with keys)
            separator: ';'
        }).catch(console.log);
    let linien = await utils.readCsvFromUrl(urlLinien, {
        separator: ';',
        headers: false //linien csv does not have header
    }).catch(console.log);
    console.log(" * read csv files");

    let haltestellenArrayStage = utils.jsonRowsToArrayRows(
        haltestellen); //await
    // remove utf-8 BOM from ressource "res"
    if (linien[0][0].charCodeAt(0) === 0xFEFF) {
        linien[0][0] = linien[0][0].substr(1);
    }
    let linienArrayStage = utils.jsonRowsToArrayRows(linien);
    console.log(" * converted csv rows to array rows");

    haltestellenArrayStage.map(row => { //delete column
        row.splice(4, 1); //deletes 1 element on the 4th position
    })
    await utils.dbBulkOp(config.hdb, sqlInsertHaltestelle_stage,
        haltestellenArrayStage).catch(console.log);
    console.log(" * inserted into haltestelle_stage");

    await utils.dbBulkOp(config.hdb, sqlInsertLinie_stage, linienArrayStage)
        .catch(console.log);
    console.log(" * inserted into linie_stage");
}

function convertStringtoFloat(input) {
    let output = input.split('.'); // splits string into array
    output = output.shift() + '.' + output.join(
        ''); // merge first element, then '.', then everything else
    let res = parseFloat(output);
    return res;
}
async function transferHaltestelle_stageToHaltestelle() {
    console.log("transfer to haltestelle: ");
    const haltestelle_stageJsonRows = await utils.dbOp(config.hdb,
        sqlSelectHaltestelle_stage); //json
    haltestellenArray = utils.jsonRowsToArrayRows(
        haltestelle_stageJsonRows); //js

    haltestellenArray.map(row => {
        let lat = convertStringtoFloat(row[2]);
        let lng = convertStringtoFloat(row[3]);
        row[2] = lat;
        row[3] = lng;
        //add column with null values on 4th position:
        row.splice(4, 0, null);
    })

    await utils.dbBulkOp(config.hdb, sqlInsertHaltestelle,
        haltestellenArray).catch(console.log); //pos = null
    await utils.dbOp(config.hdb, sqlUpdatePos).catch(console
        .log); //new ST_POINT('POINT('|| lng || ' '|| lat ||' )', 4326)
    console.log(" * data transferred into haltestelle");
}

async function transferLinie_stageToLinie() {
    console.log("transfer to linie: ");
    const linie_stageJsonRows = await utils.dbOp(config.hdb,
        sqlSelectLinie_stage);
    linienArray = utils.jsonRowsToArrayRows(linie_stageJsonRows);
    for (var i = 0; i < linienArray.length; i++) {
        let linieRow = linienArray[i];
        let success;
        let lid = linieRow[0];
        let bez = linieRow[1];
        let verlauf = linieRow[2];
        //split string verlauf by |, write elements into array
        let verlaufArray = verlauf.split(
            '|');
        verlaufArray = verlaufArray.filter(Boolean); //remove empty elements

        //array of elements extracted from 'verlauf' string
        for (var j = 0; j < verlaufArray
            .length; j++) {
            let haltestelle = verlaufArray[j];
            let found = searchHidForHalltestelle(haltestelle, bez);
            if (found != null) {
                success = true;
            } else {
                success = false;
                console.log(" * " + bez + ": " + haltestelle +
                    " not found in table haltestelle");
                break;
            }
        } //end of for "haltestellen"

        if (success == false) {
            console.log(" * line " + bez + " not saved");

            continue;
        } else {

            linienArrayFiltered.push([lid, bez, verlauf,
                verlaufArray
            ]); //save array from splitted verlauf-string as 4th column 
            linienArrayZiel.push([lid, bez]);
            console.log(" * line " + bez + " is saved to array");
        }

    } //end of for "linien"

    await utils.dbBulkOp(config.hdb, sqlInsertLinie, linienArrayZiel).catch(
        console.log);
    console.log("* data transferred into linie");
}

function searchHidForHalltestelle(haltestelle, bez) {

    let
        found = []; //array of stations with name that fits the name of currents station extracted from verlauf

    found = haltestellenArray.filter(function(
        haltestelleRow) { //js array (goes to haltestelle ziel)
        return (haltestelleRow[1].includes(haltestelle))
    })

    //S-Linie:
    if (bez.charAt(0) == 'S') {

        found = found.filter(function(haltestelleRow) {
            return (haltestelleRow[1].startsWith("S ") ||
                haltestelleRow[1].startsWith("S+U "))
        })

        //U-Linie:
    } else if (bez.charAt(0) == 'U') {

        found = found.filter(function(haltestelleRow) {
            return (haltestelleRow[1].startsWith("U ") ||
                haltestelleRow[1].startsWith("S+U "))
        })
    }

    if (found.length > 1) {
        found = found.filter(function(haltestelleRow) {
            return (!(haltestelleRow[1].includes("/")))
        })
    }
    return found.length > 0 ? found[0][0] : null;
}

function createOrFindSegment(hid_a, hid_b) {
    let existSegment = segmentArray.filter(function(segmentRow) {
        return ((segmentRow[1] == hid_a && segmentRow[2] == hid_b) || (
            segmentRow[1] == hid_b && segmentRow[2] == hid_a))
    })
    if (existSegment.length < 1) {
        segmentArray.push([sidCounter, hid_a, hid_b, null]);
        sidCounter += 1;
        return sidCounter - 1; //not assigning new value, returning current sid
    } else {
        console.log("Segment " + existSegment[0][0] + " with HID_A: " + hid_a +
            " and HID_B: " + hid_b + " already exists")
        return existSegment[0][0]
    }

}

async function createAbschnitt() {
    console.log("insert data to segment")

    for (var i = 0; i < linienArrayFiltered.length; i++) {
        let nrCounter;
        let linieRow = linienArrayFiltered[i];
        let verlaufArray = linieRow[3];
        for (var j = 0; j < verlaufArray.length -
            1; j++
            ) { //last iteration: B is last element, A is last but one element 
            let haltestelleA = verlaufArray[j];
            let haltestelleB = verlaufArray[j + 1];
            let richtung;
            let hidA = searchHidForHalltestelle(haltestelleA, linieRow[1]);
            let hidB = searchHidForHalltestelle(haltestelleB, linieRow[1]);
            let sid = createOrFindSegment(hidA, hidB);
            nrCounter = j + 1;
            let segmentArrayFiltered = segmentArray.filter(function(
                segmentRow) {
                return (segmentRow[0] == sid)
            })

            if (hidA == segmentArrayFiltered[0][1]) {
                richtung = "ab";
            } else {
                richtung = "ba";
            }
            abschnittArray.push([linieRow[0], nrCounter, sid, richtung]);
        }
    }
    console.log(" * all segments saved to array");
}
async function insertSegmentRecords() {
    await utils.dbBulkOp(config.hdb, sqlInsertSegment, segmentArray).catch(
        console.log); //laenge_on_meter = null
    //fix on segment 202:
    await utils.dbOp(config.hdb, sqlUpdateSegment202).catch(console.log);
    //fix on segment 187:
    await utils.dbOp(config.hdb, sqlUpdateSegment187).catch(console.log);
    await utils.dbOp(config.hdb, sqlUpdateLaenge_on_meter).catch(console.log);
    console.log(" * data inserted into segment");
}

async function insertAbschnittRecords() {
    await utils.dbBulkOp(config.hdb, sqlInsertAbschnitt, abschnittArray)
        .catch(console.log);
    console.log(" * data inserted into abschnitt");
}

//graph
async function createGraph() {
    await utils.dbOp(config.hdb, sqlCreateAbschnittView).catch(console.log);
    await utils.dbOp(config.hdb, sqlCreateGraphView).catch(console.log);

    const objects = await utils.dbOp(config.hdb, sqlSelectObjects).catch(
        console.log);
    if (Object.keys(objects).length > 0) {
        await utils.dbOp(config.hdb, sqlDropWorkspace).catch(console.log);
        console.log("Graph worspace dropped");
    }
    await utils.dbOp(config.hdb, sqlCreateWorkspace).catch(console.log);
    console.log("Graph worspace created");
}
main();