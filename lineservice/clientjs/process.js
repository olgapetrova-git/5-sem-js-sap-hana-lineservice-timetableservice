"use strict";

function getNewXHR() {
	let req = null;
	if (typeof XMLHttpRequest !== "undefined")
	{
		req = new XMLHttpRequest(); // Mozilla etc
	} else
	{
		if (typeof ActiveXObject !== "undefined")
		{
			req = new ActiveXObject("Microsoft.XMLHTTP");
			if (!req)
			{
				req = new ActiveXObject("Msxml2.XMLHTTP");
			}
		} else
		{
			alert("Server-Verbindung kann nicht erstellt werden");
		}
	}
	return req;
}

function process() {
	let text = document.getElementById('text').value;
	let textURIencoded = encodeURIComponent(text);
	let link = "http://localhost:3000/lineservice?text=" + textURIencoded;
	let req = getNewXHR();
	req.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200)
		{
			//**output_true
			//var output_true = true;
			let trueoutput = document.getElementById("output_true");
			trueoutput.style.display = "none";
			let falseoutput = document.getElementById("output_false");
			falseoutput.style.display = "none";
			let pathsoutput = document.getElementById("paths");
			pathsoutput.style.display = "block";
			let maparea = document.getElementById("map");

			if (this.responseText == "ERROR: Not valid address")
			{
				//**output_false
				//"Cannot identify two addresses from the specified text. Please reformulate your request."
				falseoutput.innerHTML = "Es ist nicht möglich, zwei Adressen aus dem angegebenen Text zu identifizieren. Bitte formulieren Sie Ihre Anfrage neu. ";
				falseoutput.style.display = "block";
				return;
			}
		

			//stations
			let lineservice = JSON.parse(this.responseText);
			let stationStart = document.getElementById("station_start");
			stationStart.innerHTML = "Startstation: " + lineservice.Start[0].BEZ;
			let stationEnd = document.getElementById("station_end");
			stationEnd.innerHTML = "Zielstation: " + lineservice.End[0].BEZ;
			if (lineservice.Shortest_path.results.length < 1)
			{
				//"Cannot find the connection between two addresses from the specified text. Please reformulate your request." 
				falseoutput.innerHTML = "Die Verbindung zwischen zwei Adressen aus dem angegebenen Text kann nicht gefunden werden. Bitte formulieren Sie Ihre Anfrage neu. ";
				falseoutput.style.display = "block";
				pathsoutput.style.display = "none";
				maparea.style.display = "none";
			} else
			{
				// verbindungen
				let sPathResult = writePath(lineservice.Shortest_path.results);
				let sPath = document.getElementById("shortest_path");
				sPath.innerHTML = "<span id=\"red_text\"> 1) Fahrverbindung mit kleinster Anzahl an Abschnitten: </span>" + sPathResult;
				let sDisResult = writePath(lineservice.Shortest_distance.results);
				let sDis = document.getElementById("shortest_distance");
				sDis.innerHTML = "<span id=\"green_text\"> 2) Fahrverbindung mit kürzester Länge: </span>" + sDisResult;
				let minline = document.getElementById("min_linechanges");
				minline.innerHTML = "<span id=\"violet_text\"> 3) Fahrverbindung mit geringster Anzahl von Umsteigevorgängen: </span>";
				//map
				//   let maparea = document.getElementById("map");
				//   maparea.innerHTML= 
				showMap(lineservice.Line_plan);
				showPath(lineservice.Shortest_path.results, lineservice.Line_plan, 'rgba(128, 0, 0, 0.7)');
				showPath(lineservice.Shortest_distance.results, lineservice.Line_plan, 'rgba(0, 128, 0, 0.7)');
				//showPath(lineservice.Min_linechanges.results, lineservice.Line_plan, 'rgba(64, 0, 128, 0.7)');
				maparea.style.display = "block";
			}
			trueoutput.style.display = "block";
		}

	}
	req.open("GET", link, true);
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	req.send();
}

function writePath(path) {
	let resWritePath = "";
	let currentLine = "";
	let lastStationInLine = "";
	for (let i = 0; i < path.length; i++)
	{
		let newLine = path[i].BEZ_LINE;

		if (newLine != currentLine)
		{
			currentLine = newLine;
			if (i != 0)
			{
				resWritePath += lastStationInLine;
				if (i != path.length - 1)
				{
					resWritePath += " --> ";
				}
			}
			resWritePath += currentLine + ": ";
		}
		lastStationInLine = path[i].BEZ_B;
		resWritePath += path[i].BEZ_A + ", ";
	}
	resWritePath += lastStationInLine + ". ";

	return resWritePath;
}

let map; //global map object

function showMap(linePlan) {
	//create and configure map object
	if (map == null)
	{
		const platform = new H.service.Platform({
			apikey: apikey
		});
		const defaultLayers = platform.createDefaultLayers();
		map = new H.Map(
			document.getElementById('map'),
			defaultLayers.vector.normal.map, {
			center: {
				lat: 52.5165,
				lng: 13.3819
			},
			zoom: 12,
			pixelRatio: window.devicePixelRatio || 1
		});
		window.addEventListener('resize', () => map.getViewPort().resize());
		const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
		const ui = H.ui.UI.createDefault(map, defaultLayers);
	}
	else
	{
		map.removeObjects(map.getObjects());
	}

	//draw default full line plan
	let currentLine = "";
	let coord2 = {};
	for (let i = 0; i < linePlan.length; i++)
	{
		let newLine = linePlan[i].LID;
		if (newLine != currentLine)
		{
			currentLine = newLine;
			if (i != 0)
			{
				const circle2 = new H.map.Circle(coord2, 60,
					{
						style: {
							fillColor: 'rgba(0, 0, 128, 1)'  // Color of the circle  fill: rgba(15, 22, 33, 0.6);
						}
					}
				);
				map.addObject(circle2);
			}
		}
		const coord1 = {
			lat: linePlan[i].LAT_A,
			lng: linePlan[i].LNG_A,
		};

		const circle1 = new H.map.Circle(coord1, 60,
			{
				style: {
					fillColor: 'rgba(0, 0, 128, 1)'  // Color of the circle
				}
			}
		);
		map.addObject(circle1);

		coord2 = {
			lat: linePlan[i].LAT_B,
			lng: linePlan[i].LNG_B,
		};

		const lineString = new H.geo.LineString();
		lineString.pushPoint(coord1);
		lineString.pushPoint(coord2);
		map.addObject(new H.map.Polyline(
			lineString, {
			style: {
				lineWidth: 6
			}
		}
		));
	}
	const circle2 = new H.map.Circle(coord2, 60,
		{
			style: {
				fillColor: 'rgba(0, 0, 128, 1)' // Color of the circle
			}
		}
	);
	map.addObject(circle2);

	setTimeout(function () { map.getViewPort().resize(); }, 1000);
}

function showPath(path, linePlan, color) {
	let coord2;
	for (let i = 0; i < path.length; i++)
	{

		let found1 = linePlan.filter(function (linePlanRow) {
			return (linePlanRow.HID_A == path[i].HID_A)
		});
		let coord1 = {
			lat: found1[0].LAT_A,
			lng: found1[0].LNG_A,
		};
		let found2 = linePlan.filter(function (linePlanRow) {
			return (linePlanRow.HID_B == path[i].HID_B)
		});
		coord2 = {
			lat: found2[0].LAT_B,
			lng: found2[0].LNG_B,
		};
		//hid_a
		const circle1 = new H.map.Circle(coord1, 100,
			{
				style: {
					fillColor: color, // Color of the circle
					strokeColor: color,
					lineWidth: 10
				}
			}
		);
		map.addObject(circle1);

		//line
		const lineString = new H.geo.LineString();
		lineString.pushPoint(coord1);
		lineString.pushPoint(coord2);
		map.addObject(new H.map.Polyline(
			lineString, {
			style: {
				lineWidth: 10,
				strokeColor: color
			}
		}
		));
	}
	//hid_b last
	const circle2 = new H.map.Circle(coord2, 100,
		{
			style: {
				fillColor: color,  // Color of the circle
				strokeColor: color,
				lineWidth: 10

			}
		}
	);
	map.addObject(circle2);
}