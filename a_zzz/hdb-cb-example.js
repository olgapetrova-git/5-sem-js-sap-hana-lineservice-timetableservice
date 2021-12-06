"use strict";

const config = require('../a_config/config');
const hdbext = require('@sap/hdbext');

hdbext.createConnection(config.hdb, (error, connection) => {
    if (error) {
        return console.error("Connection error: ", error);
    }
    if (connection) {
        const sql = "select * from kv where key<?";
        const stmt = connection.prepare(sql);
        stmt.exec([4], (error, rows) => {
            console.log(rows);
            connection.disconnect(() => console.log("disconnected"));
            if (error) {
                return console.error("SQL execute error: ", error);
            }
        });
    }
});
console.log("main läuft weiter");


