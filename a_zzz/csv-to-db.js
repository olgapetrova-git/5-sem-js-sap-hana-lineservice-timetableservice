"use strict";

const config = require('../a_config/config');
const utils = require('../a_mod/utils');
const Hdb = require('../a_mod/hdb');

const sqlSelPerson1 = "select * from person_stage where pid=?";
const sqlSelPersons = "select top 100 * from person_stage";
const sqlCount = "select count(*) as anzahl from person_stage";
const sqlInsert = "insert into person_stage values (?,?,?)";
const sqlTruncate = "truncate table person_stage";

const path10 = "a_db/personen/personen-10.csv";
const path10000 = "a_db/personen/personen-10000.csv";


async function doit0() {
  await utils.dbOp(config.hdb, sqlTruncate);
  console.log('ende doit0');
}

async function doit1() {
  const csvRows = await utils.readCsvFromFile(path10000).catch(err => console.log(err));
  const data = utils.jsonRowsToArrayRows(csvRows);

  const connection = await Hdb.createConnection(config.hdb);
  const hdb = new Hdb(connection);
  const pstmt = await hdb.preparePromisified(sqlInsert);
  const result = await hdb.statementExecBatchPromisified(pstmt, data);
  console.log(result);
  await connection.disconnect(console.log('disconnected'));
  console.log('ende doit1');
}

async function doit2() {
  const csvRows = await utils.readCsvFromFile(path10000).catch(err => console.log(err));
  const data = utils.jsonRowsToArrayRows(csvRows);
  const connection = await Hdb.createConnection(config.hdb);
  const hdb = new Hdb(connection);
  const pstmt = await hdb.preparePromisified(sqlInsert);
  let result = 0;
  for (const row of data) {
    result += await hdb.statementExecPromisified(pstmt, row);
  }
  console.log(result);
  await connection.disconnect(console.log('disconnected'));
  console.log('ende doit2');
}

async function doit3() {
  const rows = await utils.dbOp(config.hdb, sqlCount);
  console.log(rows);
  console.log('ende doit3');
}


// doit0().catch(console.log);
// doit1().catch(console.log);
// doit2().catch(console.log);
 doit3().catch(console.log);

