"use strict";

module.exports = {
  // Returns all - also inherited - methods
  methods: function (obj) {
    let properties = new Set()
    let currentObj = obj
    do {
      Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof obj[item] === 'function')
  },

  // Returns a random integer between min and max inclusive
  randomIntInclusive: function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Fetches a csv file from the given url and parses it
  // Returns a promise object
  readCsvFromUrl: function (url, parseOptions) {
    const request = require('request-promise-native');
    const parse = require('neat-csv');
    return request.get(url).then(body => parse(body, parseOptions));
  },

  // Fetches a csv file from the given path and parses it
  // Returns a promise object
  readCsvFromFile: function (path, parseOptions) {
    const fs = require('fs');
    const util = require('util');
    const parse = require('neat-csv');
    const readFile = util.promisify(fs.readFile)
    return readFile(path).then(content => parse(content, parseOptions));
  },

  // Executes a database operation 
  // Returns an array of resulting rows in case of select
  // Example: [ { KEY: 1, VALUE: 'value1' }, { KEY: 2, VALUE: 'value2' } ]
  // Returns number of effected rows in case of insert, update, delete
  dbOp: async function (connectionParams, sql, sqlParams = []) {
    const Hdb = require('../a_mod/hdb');
    const connection = await Hdb.createConnection(connectionParams);
    const hdb = new Hdb(connection);
    const pstmt = await hdb.preparePromisified(sql);
    const result = await hdb.statementExecPromisified(pstmt, sqlParams);
    await connection.disconnect();
    return result;
  },

  // Executes one bulk database operation - insert, update, delete
  dbBulkOp: async function (connectionParams, sql, sqlParams = []) {
    const Hdb = require('../a_mod/hdb');
    const connection = await Hdb.createConnection(connectionParams);
    const hdb = new Hdb(connection);
    const pstmt = await hdb.preparePromisified(sql);
    const noOfEffected = await hdb.statementExecBatchPromisified(pstmt, sqlParams);
    await connection.disconnect();
    return noOfEffected;
  },

  // Executes a stored procedure 
  dbSp: async function (connectionParams, spName, spParams = []) {
    const hdbext = require("@sap/hdbext");
    const Hdb = require('../a_mod/hdb');
    const connection = await Hdb.createConnection(connectionParams);
    const hdb = new Hdb(connection);
    const sp = await hdb.loadProcedurePromisified(hdbext, null, spName);
    const result = await hdb.callProcedurePromisified(sp, spParams);
    await connection.disconnect();
    return result;
  },

  // Takes an array of json rows e.g.: 
  // [ { KEY: 1, VALUE: 'value1' }, { KEY: 2, VALUE: 'value2' } ]
  // and turns it into an array of array rows, i.e.
  // [[1, 'value1'], [2, 'value2']]
  jsonRowsToArrayRows: function (csvRows) {
    return csvRows.map(singleRow => Object.values(singleRow));
  },


}