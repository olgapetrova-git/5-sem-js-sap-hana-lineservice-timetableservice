"use strict";

function showMap() {
  const platform = new H.service.Platform({
    apikey: apikey
  });

  const defaultLayers = platform.createDefaultLayers();

  const map = new H.Map(
    document.getElementById('map'),
    defaultLayers.vector.normal.map, {
    center: { lat: 50, lng: 5 },
    zoom: 4,
    pixelRatio: window.devicePixelRatio || 1
  });

  window.addEventListener('resize', () => map.getViewPort().resize());
  const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  const ui = H.ui.UI.createDefault(map, defaultLayers);

  const coord1 = { lat: 52.5139, lng: 13.3707 };
  const coord2 = { lat: 52.5159, lng: 13.3777 };
  const coord3 = { lat: 52.5139, lng: 13.3797 };

  map.setCenter(coord2);
  map.setZoom(14);

  const marker = new H.map.Marker(coord2);
  map.addObject(marker);

  const lineString = new H.geo.LineString();
  lineString.pushPoint(coord1);
  lineString.pushPoint(coord2);
  lineString.pushPoint(coord3);
  map.addObject(new H.map.Polyline(
    lineString, { style: { lineWidth: 6 } }
  ));
}


