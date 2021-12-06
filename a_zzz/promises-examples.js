"use strict";

const utils = require('../a_mod/utils');

// let promise1 = new Promise((resolve, reject) => {
//   setTimeout(() => resolve("done1"), 1000 + utils.randomIntInclusive(0, 100))
// });

// let promise2 = new Promise((resolve, reject) => {
//   setTimeout(() => resolve("done2"), 1000 + utils.randomIntInclusive(0, 100))
// });

// promise1.then(console.log);
// promise2.then(console.log);
// console.log("main läuft weiter");


// async function deterministic1() {
//   let promise1 = new Promise((resolve, reject) => {
//     setTimeout(() => resolve("done1"), 1000 + utils.randomIntInclusive(0, 100))
//   });
//   let promise2 = new Promise((resolve, reject) => {
//     setTimeout(() => resolve("done2"), 1000 + utils.randomIntInclusive(0, 100))
//   });
//   let msg1 = await promise1;
//   console.log(msg1);
//   let msg2 = await promise2;
//   console.log(msg2);
// }
// deterministic1()
// console.log("main läuft weiter");


async function deterministic2() {
  let promise1 = new Promise((resolve, reject) => {
    setTimeout(() => resolve("done1"), 1000 + utils.randomIntInclusive(0, 100))
  });
  let msg1 = await promise1;
  console.log(msg1);
  let promise2 = new Promise((resolve, reject) => {
    setTimeout(() => resolve("done2"), 1000 + utils.randomIntInclusive(0, 100))
  });
  let msg2 = await promise2;
  console.log(msg2);
}
deterministic2()
console.log("main läuft weiter");


