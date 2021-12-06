"use strict"
const utils = require('../a_mod/utils');
const util = require('util');

function f1(cb) {
    setTimeout(() => {
        console.log("f1 erledigt (nach 5 sek)");
        cb(null, 1);
    }, 5000 + utils.randomIntInclusive(0, 100));
}

function f2(cb) {
    setTimeout(() => {
        console.log("f2 erledigt (nach 5 sek)");
        cb(null, 2);
    }, 5000 + utils.randomIntInclusive(0, 100));
}

function f3(cb) {
    setTimeout(() => {
        console.log("f3 erledigt (nach 5 sek)");
        cb(null, 3);
    }, 5000 + utils.randomIntInclusive(0, 100));
}

function f4(cb) {
    setTimeout(() => {
        console.log("f4 erledigt (nach 5 sek)");
        cb(null, 4);
    }, 5000 + utils.randomIntInclusive(0, 100));
}

let promise1 = new Promise((resolve, reject) => {
    setTimeout(() => resolve("done1"), 1000 + utils.randomIntInclusive(0, 100))
});



const f1p = util.promisify(f1);
const f2p = util.promisify(f2);
const f3p = util.promisify(f3);
const f4p = util.promisify(f4);

// f1p().then(console.log);
// f2p().then(console.log);
// f3p().then(console.log);
// f4p().then(console.log);


async function doit() {
    const result1 = await f1p();
    const result2 = await f2p();
    const result3 = await f3p();
    const result4 = await f4p();
    console.log(result1 + result2 + result3 + result4);
}
doit().catch(err => console.log(err));
console.log("main läuft weiter");
