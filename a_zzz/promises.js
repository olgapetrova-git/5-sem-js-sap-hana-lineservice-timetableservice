"use strict";
const utils = require('../a_mod/utils');


let promise = new Promise(function (resolve, reject) {
  // Anwendungscode
  // Aufruf von resolve(value)
  // oder
  // Aufruf von reject(error)
});


let promise1 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("done1"), 1000 + utils.randomIntInclusive(0, 100))
});
let promise2 = new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error("Error")), 1000 + utils.randomIntInclusive(0, 100))
});

console.log(promise1);
console.log(promise2);

promise1.then(
  result => console.log('ok: promise1: ' + result),
  error => console.log('error: promise1')
);
promise2.then(
  result => console.log('ok: promise2: ' + result),
  error => console.log('error: promise2')
);
console.log("main läuft weiter");
