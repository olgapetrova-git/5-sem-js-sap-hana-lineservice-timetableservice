"use strict";

const config = require('../a_config/config');
const Hdb = require('../a_mod/hdb');

async function doit() {
    const connection = await Hdb.createConnection(config.hdb);
    const hdb = new Hdb(connection);
    const sql = "select * from kv where key<?";
    const pstmt = await hdb.preparePromisified(sql);
    const rows = await hdb.statementExecPromisified(pstmt, [4]);
    await connection.disconnect(() => console.log("disconnected"));
    console.log(rows);
  }

doit().catch(console.log);
console.log("main läuft weiter");

