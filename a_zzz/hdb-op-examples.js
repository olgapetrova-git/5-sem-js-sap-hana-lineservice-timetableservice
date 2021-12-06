"use strict";

const config = require('../a_config/config');
const utils = require('../a_mod/utils');
const Hdb = require('../a_mod/hdb');

const sqlSelect1 = "select * from kv where pid=?";
const sqlSelectAll = "select * from kv";
const sqlInsert = "insert into kv values (?,?)";
const sqlTruncate = "truncate table kv";
const sqlDelete = "delete from kv";

const kv1 = [1, "value1"];
const kv2 = [2, "value2"];
const kv3 = [3, "value3"];
const kv4 = [4, "value4"];
const kvs = [kv1, kv2, kv3, kv4];

async function doit1() {
  await utils.dbOp(config.hdb, sqlTruncate);
  console.log('nach truncate');
  await utils.dbBulkOp(config.hdb, sqlInsert, kvs);
  console.log('nach insert');
}

async function doit2() {
  const result = await utils.dbOp(config.hdb, sqlSelectAll);
  console.log(result);
}

async function doit3() {
  const result = await utils.dbOp(config.hdb, sqlDelete);
  console.log(result);
}

async function doit4() {
  const result = await utils.dbSp(config.hdb, "ERZEUGE_KVS");
  console.log(result);
}

// doit1().catch(console.log);
doit2().catch(console.log);
// doit3().catch(console.log);
// doit4().catch(console.log);

console.log('main');

