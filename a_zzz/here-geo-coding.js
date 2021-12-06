"use strict";

const config = require('../a_config/config');
const here = require('../a_mod/here');

here.geoCode(config, "Treskowallee 8, Berlin", r => console.log(r));


// here.geoCode(config, "Hohenzollerndamm 10, Berlin", r => console.log(r));
// here.geoCode(config, "Fasanenstr. 1, Berlin", r => console.log(r));
// here.geoCode(config, "Kurfürstendamm 100, Berlin", r => console.log(r));

