"use strict";


const utils = require("../a_mod/utils");
const util = require('util');

const here = require('../a_mod/here');
const express = require('express')
const app = express()
const port = 3010

const hdbext = require("@sap/hdbext");
var ta = require('@sap/textanalysis');
const config = require('../a_config/config');
const Hdb = require('../a_mod/hdb');

const moment = require('moment');

const sqlInsertTrain = "insert into train (lid, direction, start_date, " +
    "end_date, start_time, end_time, interval) values (?,?,?,?,?,?,?)";
const sqlSelectMaxTrain_id = "select max (train_id) as train_id from train";

const sqlInsertTrip = "insert into trip (train_id, departure_datetime) " +
    "values (?, TO_SECONDDATE (?))";
const sqlSelectMaxTrip_id = "select max (trip_id) as trip_id from trip";

app.listen(port, () =>
    console.log(`Timetable service listening on port ${port}!`))

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/*
 When accessing the resource /add_train, the service takes parameters
(line_id, direction,  start_date,  end_date, start_time,  end_time, interval) and
Adds a record to the train table
Adds one or more records to the trips table
Calls a function, which adds all corresponding rows to the schedule table 

"Repeating trips" and "single trips" are distinguished by the fact that 
"repeating trips" have interval parameter (rhythm, i.e. how often train goes) and 
for "single trips" interval equals NULL, and:
- if start_date and end_date are unequal, a single train trip is created for each day.
- end_time is ignored, only one train trip is created (with start_time), if interval is NULL 

*/
app.get('/add_train', async (req, res, next) => {

    let lid = req.query.lid;
    let direction = req.query.direction;
    let start_date = req.query.start_date;
    let end_date = req.query.end_date;
    let start_time = req.query.start_time;
    let end_time = req.query.end_time;
    let interval = req.query.interval;
    if (interval == 0 || interval == "null") {
        interval = null;
    }
    // insert new train into table and save it's train_id into variable
    await utils.dbOp(config.hdb, sqlInsertTrain,
        [lid, direction, start_date, end_date, start_time,
            end_time,
            interval
        ]).catch(console.log);
    console.log("data inserted into train");
    const resSelectMaxTrain_id = await utils.dbOp(config.hdb,
        sqlSelectMaxTrain_id);
    const train_id = resSelectMaxTrain_id[0].TRAIN_ID;
    console.log("train_id: " + train_id + " goes from " +
        start_date +
        " to " + end_date + " in time period between " +
        start_time + " and " +
        end_time + " with interval " + interval);

    //date time for trips:

    let start_date_moment = moment(start_date);
    let end_date_moment = moment(end_date);
    let interval_duration;
    //repeating trips:
    if (interval != null) {
        interval_duration = moment.duration(interval);
    }

    // for each day between (and including) start_date and end_date
    for (let current_date = start_date_moment; current_date <=
        end_date_moment; current_date.add(1, 'days')) {
        // caluclate datetime variables for start and end of the period for that day
        let start_timeArray = start_time.split(':');
        let startHours = start_timeArray[0];
        let startMinutes = start_timeArray[1];

        let start_datetime = current_date.clone();
        start_datetime.set('hour', startHours);
        start_datetime.set('minute', startMinutes);

        let end_timeArray = end_time.split(':');
        let endHours = end_timeArray[0];
        let endMinutes = end_timeArray[1];

        let end_datetime = current_date.clone();
        end_datetime.set('hour', endHours);
        end_datetime.set('minute', endMinutes);
        //*single trip:
        if (interval == null) {
            // convert departure_datetime moment to string in order to insert to hana
            let departure_datetime_string = start_datetime.format(
                "YYYY-MM-DD HH:mm:ss");
            await utils.dbOp(config.hdb, sqlInsertTrip,
                [train_id, departure_datetime_string]).catch(
                console.log);
            //get trip_id for this record:
            const resSelectMaxTrip_id = await utils.dbOp(config.hdb,
                sqlSelectMaxTrip_id);
            const trip_id = resSelectMaxTrip_id[0].TRIP_ID;
            console.log("* trip_id: " + trip_id);
            //add all records to schedule for this trip
            await addSchedule(lid, trip_id, direction,
                start_datetime);
        } else {
            //*repeating trip:
            // from start of the period until the end of the period, increasing time
            // by 'interval' value
            for (let departure_datetime =
                    start_datetime; departure_datetime <=
                end_datetime; departure_datetime.add(
                    interval_duration)
            ) {
                // convert departure_datetime moment to string in order to insert to hana
                let departure_datetime_string = departure_datetime
                    .format("YYYY-MM-DD HH:mm:ss");
                await utils.dbOp(config.hdb, sqlInsertTrip,
                        [train_id, departure_datetime_string])
                    .catch(
                        console.log);
                //get trip_id for this record:
                const resSelectMaxTrip_id = await utils.dbOp(config
                    .hdb,
                    sqlSelectMaxTrip_id);
                const trip_id = resSelectMaxTrip_id[0].TRIP_ID;
                console.log("* trip_id: " + trip_id);
                //add all records to schedule for this trip
                await addSchedule(lid, trip_id, direction,
                    departure_datetime);

            } //end of for "interval between start and end time"
        } // end of else
    } // end of for "days"
    console.log("all data inserted into trip and schedule");


    let serviceResult = {
        "train_id": train_id
    };
    res.send(`${JSON.stringify(serviceResult)}`);
});

async function addSchedule(lid, trip_id, direction, departure_datetime) {
    const sqlSelectHidsAB =
        "select s.hid_a as hid, 0 as laenge_in_meter, " +
        "a.nr from linie l " +
        "join abschnitt a on l.lid=a.lid " +
        "join segment s on a.sid = s.sid " +
        "where l.lid=? and a.nr=1 union " +
        "select s.hid_b as hid, s.laenge_in_meter as laenge_in_meter, " +
        "a.nr from linie l " +
        "join abschnitt a on l.lid=a.lid " +
        "join segment s on a.sid = s.sid " +
        "where l.lid=? order by a.nr";

    const sqlSelectHidsBA =
        "select s.hid_b as hid, 0 as laenge_in_meter, " +
        "a.nr from linie l " +
        "join abschnitt a on l.lid=a.lid " +
        "join segment s on a.sid = s.sid " +
        "where l.lid=? and a.nr=(select max(nr)" +
        "from abschnitt a2 where a2.lid=?) " +
        "union select s.hid_a as hid, s.laenge_in_meter as laenge_in_meter, " +
        "a.nr from linie l " +
        "join abschnitt a on l.lid=a.lid " +
        "join segment s on a.sid = s.sid " +
        "where l.lid=? order by a.nr desc";
    const trainSpeed = 19; //70*1000/3600=19,44 m/sec (70 km/h)
    const stopDuration = 60;
    const sqlInsertSchedule =
        "insert into schedule (trip_id, hid, transit_datetime) values (?,?,TO_SECONDDATE (?))";

    let hidArray = [];
    if (direction == "ab") {
        hidArray = await utils.dbOp(config.hdb, sqlSelectHidsAB,
            [lid, lid]).catch(console.log);
    } else {
        hidArray = await utils.dbOp(config.hdb, sqlSelectHidsBA,
            [lid, lid, lid]).catch(console.log);
    }
    let transit_datetime = departure_datetime.clone();
    let scheduleArray = [];

    for (let i = 0; i < hidArray.length; i++) {
        let hid = hidArray[i].HID;
        //transit_datetime for the first station is equal to departure_datetime, then
        //add time to transit_datetime, calculated from trainSpeed and distance (laenge_in_meter) 
        //plus duration of train stop for passengers to get on/off train (stopDuration)
        transit_datetime.add(hidArray[i].LAENGE_IN_METER / trainSpeed +
            stopDuration, 'seconds');
        console.log("** hid: " + hid +
            ", transit_datetime: " + transit_datetime.format());

        scheduleArray.push([trip_id, hid, transit_datetime.format(
            "YYYY-MM-DD HH:mm:ss")]);
    }
    await utils.dbBulkOp(config.hdb, sqlInsertSchedule,
        scheduleArray).catch(console.log);
}
/*
 When accessing the resource /remove_train, the service takes parameter train_id and
Removes all corresponding rows from the schedule table 
Removes all corresponding rows from the trip table 
Removes a corresponding row row from the train table 
*/
app.get('/remove_train', async (req, res, next) => {
    let train_id = req.query.train_id;

    const sqlRemoveSchedule =
        "delete from schedule where trip_id " +
        "in (select trip_id from trip where train_id=?)";
    const sqlRemoveTrips = "delete from trip where train_id = ?";
    const sqlRemoveTrain = "delete from train where train_id = ?";

    let scheduleDeletedRows = await utils.dbOp(config.hdb,
        sqlRemoveSchedule, [train_id]).catch(console.log);
    let tripsDeletedRows = await utils.dbOp(config.hdb,
        sqlRemoveTrips, [train_id]).catch(console.log);
    await utils.dbOp(config.hdb, sqlRemoveTrain, [train_id]).catch(
        console.log);
    console.log("data for train  " + train_id + " deleted: " +
        tripsDeletedRows +
        " rows from trips, " + scheduleDeletedRows +
        " rows from schedule.");


    let serviceResult = {
        "train_id": train_id,
        "Number_of_rows_deleted_from_trip": tripsDeletedRows,
        "Number_of_rows_deleted_from_schedule": scheduleDeletedRows
    };
    res.send(`${JSON.stringify(serviceResult)}`);
});

/*
When accessing the resource /remove_trip, the service takes parameter trip_id and
Removes all corresponding rows from the schedule table 
Removes a corresponding row from the trip table 
*/
app.get('/remove_trip', async (req, res, next) => {
    let trip_id = req.query.trip_id;

    const sqlRemoveSchedule =
        "delete from schedule where trip_id =?";
    const sqlRemoveTrips = "delete from trip where trip_id =?";

    let scheduleDeletedRows = await utils.dbOp(config.hdb,
        sqlRemoveSchedule, [trip_id]).catch(console.log);
    let tripsDeletedRows = await utils.dbOp(config.hdb,
        sqlRemoveTrips, [trip_id]).catch(console.log);

    console.log("data for trip  " + trip_id + " deleted: " +
        tripsDeletedRows +
        " rows from trips, " + scheduleDeletedRows +
        " rows from schedule.");


    let serviceResult = {
        "trip_id": trip_id,
        "Number_of_rows_deleted_from_trip": tripsDeletedRows,
        "Number_of_rows_deleted_from_schedule": scheduleDeletedRows
    };
    res.send(`${JSON.stringify(serviceResult)}`);
});

 /*
    When accessing the resource /get_info, the service returns a JSON 
    with data distinguished for parameters: 
    1. All trains: (without parameters): returns all data from the "train" table.  
    2. All trips for single train: (train_id) returns the data from 
    the "trip" table for the train_id.
    3. All stations stops for single trip: (trip_id) returns the data from 
    the "schedule" table for the trip_id (incl. "bez")
    4. All trips for single line for the period: (lid, datetime_start, datetime_end) 
    returns the data from the "trip" table for the specified line ("linie") 
    and for all train_id in that period between two given dates.
    5. Schedule for single station for the period: (hid, datetime_start, datetime_end) 
    returns the data: line id, train_id, trip_id, transit_datetime for this 
    station ("haltestelle") with given hid and time period between two given dates.
    */

app.get('/get_info', async (req, res, next) => {
 
    let train_id = req.query.train_id;
    let trip_id = req.query.trip_id;
    let lid = req.query.lid;
    let hid = req.query.hid;
    let datetime_start = req.query.datetime_start;
    let datetime_end = req.query.datetime_end;
    //#1
    const sqlSelectAllTrain = "select * from train";
    //#2
    const sqlSelectOneTrain = "select * from trip where train_id=?";
    //#3 
    const sqlSelectScheduleForOneTrip =
        "select s.trip_id, s.hid, h.bez, " +
        "s.transit_datetime from schedule s " +
        "join haltestelle h on h.hid=s.hid " +
        "where trip_id =? order by s.transit_datetime";
    //#4
    const sqlSelectAllTripforLine =
        "select t.lid, l.bez, tr.train_id, " +
        "tr.trip_id, tr.departure_datetime from trip tr " +
        "join train t on t.train_id=tr.train_id " +
        "join linie l on l.lid=t.lid " +
        "where t.lid=? and tr.departure_datetime>=TO_SECONDDATE(?) " +
        "and tr.departure_datetime<=TO_SECONDDATE(?) " +
        "order by tr.departure_datetime";
    //#5
    const sqlSelectAllForOneStation =
        "select s.hid, h.bez, t.lid, " +
        "l.bez as lid_bez, tr.train_id, s.trip_id, s.transit_datetime " +
        "from schedule s join trip tr on tr.trip_id=s.trip_id " +
        "join train t on t.train_id=tr.train_id " +
        "join haltestelle h on h.hid=s.hid " +
        "join linie l on l.lid=t.lid " +
        "where h.hid=? and s.transit_datetime>=TO_SECONDDATE(?) " +
        "and s.transit_datetime<=TO_SECONDDATE(?) " +
        "order by transit_datetime";

    if (train_id != undefined) {
        //2.  
        let oneTrainTripArray = await utils.dbOp(config.hdb,
            sqlSelectOneTrain,
            [train_id]).catch(console.log);

        res.send(oneTrainTripArray);
    } else if(trip_id != undefined) {
    //3.
    let oneTripScheduleArray = await utils.dbOp(config.hdb,
        sqlSelectScheduleForOneTrip,
        [trip_id]).catch(console.log);

        res.send(oneTripScheduleArray);
    } else if(lid != undefined && datetime_start != undefined && datetime_end != undefined) {
    //4.
    let oneLineTripArray = await utils.dbOp(config.hdb,
        sqlSelectAllTripforLine,
        [lid, datetime_start, datetime_end]).catch(console.log);

        res.send(oneLineTripArray);
    } else if(datetime_start != undefined && datetime_end != undefined && hid != undefined) {
    //5.   
    let oneStationScheduleArray = await utils.dbOp(config.hdb,
        sqlSelectAllForOneStation,
        [hid, datetime_start, datetime_end]).catch(console.log);

        res.send(oneStationScheduleArray);
    } else { 
    //1.
    let allTrainArray = await utils.dbOp(config.hdb,
            sqlSelectAllTrain)
        .catch(console.log);

        res.send(allTrainArray);
    }
});