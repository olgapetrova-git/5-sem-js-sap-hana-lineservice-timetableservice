"use strict"
const utils = require('../a_mod/utils');

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


f1((err1, result1) =>
    f2((err2, result2) =>
        f3((err3, result3) =>
            f4((err4, result4) =>
                console.log(result1 + result2 + result3 + result4)
            )
        )
    )
);
console.log("main läuft weiter");


f1((err1, result1) => console.log(result1));
f2((err2, result2) => console.log(result2));
f3((err3, result3) => console.log(result3));
f4((err4, result4) => console.log(result4));
console.log("main läuft weiter");

