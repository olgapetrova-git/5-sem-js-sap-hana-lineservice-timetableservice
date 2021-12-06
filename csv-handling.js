"use strict";

const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile)

const request = require('request-promise-native');
const parse = require('neat-csv');

const config = require('../a_config/config');
const utils = require('../a_mod/utils');

const url = "https://wiki.htw-berlin.de/confluence/download/attachments/31623434/test.txt?version=1&modificationDate=1552985182810&api=v2"
const path10 = "d:/dev/sap/hana/dev-js/sql/personen/personen-10.csv";
const path10000 = "d:/dev/sap/hana/dev-js/sql/personen/personen-10000.csv";

function csvFromWeb1() {
  let data = utils.readCsvFromUrl(url).catch(console.log);
  console.log(data);
}

async function csvFromWeb2() {
  let data = await utils.readCsvFromUrl(url);
  console.log(data);
}

async function csvFromFile(path) {
  const csvRows = await utils.readCsvFromFile(path).catch(err => console.log(err));
  const data = utils.convertCsvRows2ArrayRows(csvRows);
  // const data = csvRows[0];
  console.log(data);
}



// csvFromWeb1();
csvFromWeb2().catch(console.log);
// csvFromFile(path10).catch(err => console.log(err));
console.log('ende');
