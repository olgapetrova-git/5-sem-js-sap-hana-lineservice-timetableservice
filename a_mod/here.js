const request = require('request');
// request.debug = true;

module.exports = {
    geoCode: function (config, searchtext, handleResponse) {

         var options = {
            url: "https://geocoder.api.here.com/6.2/geocode.json",
            qs: {
                searchtext: searchtext,
                app_id: config.here.app_id,
                app_code: config.here.app_code,
                gen: 9
            }
        }
        request.get(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                r = JSON.parse(body);
                var lat = r.Response.View["0"].Result["0"].Location.DisplayPosition.Latitude;
                var lng = r.Response.View["0"].Result["0"].Location.DisplayPosition.Longitude;
 
                handleResponse({lat: lat, lng: lng});
            } else {
                console.error(error);
                console.error(response);
            }
        })
    }
};