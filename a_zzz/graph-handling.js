"use strict";

const config = require('../a_config/config');
const utils = require('../a_mod/utils');

async function doit1() {
  const result = await utils.dbSp(config.hdb, "SHORTEST_PATH", {S:101, T:107});
  console.log(result);
}

async function doit2() {
  const sqlGetShortestPath = "call SHORTEST_PATH(101, 107, ?)"
  const result = await utils.dbOp(config.hdb, sqlGetShortestPath);
  console.log(result);
}
doit1().catch(console.log);
console.log('main');
