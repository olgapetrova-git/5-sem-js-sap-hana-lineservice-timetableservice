"use strict";

const hdbext = require("@sap/hdbext");
var ta = require('@sap/textanalysis');
const config = require('../a_config/config');
const Hdb = require('../a_mod/hdb');

var values = {
    DOCUMENT_TEXT: 'Ich will in die Treskowallee 8 fahren.',
    LANGUAGE_CODE: 'DE',
    CONFIGURATION: 'EXTRACTION_CORE',
    RETURN_PLAINTEXT: 0
};

hdbext.createConnection(config.hdb, (err, connection) => {
    if (err) {
        return console.error("Connection error", err);
    }

    ta.analyze(values, connection, function done(err, parameters, rows) {
        if (err) { return console.error('error', err); }
        console.log(rows);
    });
});

