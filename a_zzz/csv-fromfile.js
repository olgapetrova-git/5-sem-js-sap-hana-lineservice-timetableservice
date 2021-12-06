"use strict";

const config = require('../a_config/config');
const utils = require('../a_mod/utils');

const base = "";
const path10 = base + "a_db/personen/personen-10.csv";

async function csvFromFile(path) {
  const csvRows = 
    await utils.readCsvFromFile(path).catch(err => console.log(err));
  const data = utils.jsonRowsToArrayRows(csvRows);
  console.log(data);
}

csvFromFile(path10).catch(err => console.log(err));
console.log('main');
