"use strict";

const config = require('../a_config/config');
const utils = require('../a_mod/utils');

const url = "https://raw.githubusercontent.com/ic-htw/adbkt/master/a_data/test.csv"

function csvFromWeb1() {
  let data = utils.readCsvFromUrl(url).catch(console.log);
  console.log(data);
}

async function csvFromWeb2() {
  let data = await utils.readCsvFromUrl(url);
  console.log(data);
}



csvFromWeb1();
// csvFromWeb2().catch(console.log);
console.log('main');
