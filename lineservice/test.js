let d = new Date();
d.setFullYear(2019, 11, 25);
d.setHours(15, 17); //Date.setHours(hour, min, sec, millisec)
console.log(d);
d.toJSON();
//output: 2019-12-25T14:17:50.873Z

var currentDate = new Date();
//add 20 minutes in milliseconds to your date:
var twentyMinutesLater = new Date(currentDate.getTime() + (20 * 60 * 1000)); 
console.log(currentDate, twentyMinutesLater);