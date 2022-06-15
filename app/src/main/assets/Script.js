var bluetoothlng=12.395161890820106
var bluetoothlat=55.73229232272769
var bluetoothzLevel =2

const beacons = ["12.395177992715958|55.73224094676854|2","12.395227634902142|55.73216684335219|2", "12.395162257184722|55.73204114500106|2"];

var myMap = new Mazemap.Map({
    // container id specified in the HTML
    container: 'map',

    campuses: 88,

    // initial position in lngLat format
    center: {lng: 12.3951194, lat: 55.732283006},
    // initial zoom
    zoom: 18,
    scrollZoom: true,
    doubleClickZoom: true,
    touchZoomRotate: true,
    zLevel: 2
});

myMap.on('load', function () {
    // Initialize a Highlighter for POIs
    // Storing the object on the map just makes it easy to access for other things
    myMap.highlighter = new Mazemap.Highlighter(myMap, {
        showOutline: true,
        showFill: true,
        outlineColor: Mazemap.Util.Colors.MazeColors.MazeBlue,
        fillColor: Mazemap.Util.Colors.MazeColors.MazeBlue
    });
    myMap.on('click', onMapClick);

    window.blueDot = new Mazemap.BlueDot({
        map: myMap,
    })
        .setZLevel(bluetoothzLevel)
        .setAccuracy(7)
        .setLngLat({lng: bluetoothlng, lat: bluetoothlat})
        .show();

});

// define a global
var mazeMarker;
var lngLat;
var Zlevel;
var routeController;


function onMapClick(e) {
    // Clear existing, if any
    clearPoiMarker();

    lngLat = e.lngLat;
    Zlevel = myMap.zLevel;

    // Fetching via Data API
    Mazemap.Data.getPoiAt(lngLat, Zlevel).then(poi => {

        printPoiData(poi);

        placePoiMarker(poi);

    }).catch(function () {
        return false;
    });
}

function clearPoiMarker() {
    if (mazeMarker) {
        mazeMarker.remove();
    }
    if(routeController){
        routeController.clear();
    }
    myMap.highlighter.clear();
}

function placePoiMarker(poi) {
    lngLat=Mazemap.Util.getPoiLngLat(poi)
    //Zlevel=poi.properties.zValue;


    // Get a center point for the POI, because the data can return a polygon instead of just a point sometimes

    mazeMarker = new Mazemap.MazeMarker({
        color: '#ff00cc',
        innerCircle: true,
        innerCircleColor: '#FFF',
        size: 34,
        innerCircleScale: 0.5,
        zLevel: Zlevel
    })
        .setLngLat(lngLat)
        .addTo(myMap);

    // If we have a polygon, use the default 'highlight' function to draw a marked outline around the POI.
    if (poi.geometry.type === "Polygon") {
        myMap.highlighter.highlight(poi);
    }
    myMap.flyTo({center: lngLat, zoom: 19, speed: 0.5});
}

function printPoiData(poi) {
    var poiStr = JSON.stringify(poi, null, 2); // spacing level = 2
    document.getElementById('poi-data').innerHTML = poiStr;

    console.log(poi.properties.title + " " + lngLat+Zlevel); // Can also look in your console to see the object there

}

function makeRoute() {
    var start = {lngLat: {lng: bluetoothlng, lat: bluetoothlat}, zLevel: bluetoothzLevel};
    var dest = {lngLat: {lng: lngLat.lng, lat: lngLat.lat}, zLevel: Zlevel};


    routeController = new Mazemap.RouteController(myMap);

    Mazemap.Data.getRouteJSON(start, dest)
        .then(function (geojson) {
            routeController.setPath(geojson);

            // Fit the map bounds to the path bounding box
            var bounds = Mazemap.Util.Turf.bbox(geojson);
            myMap.fitBounds(bounds, {padding: 100});
        });
}

function changeDot(beaconnumber){
    data=beacons[beaconnumber].split('|')

    blueDot.setLngLatAnimated({lng: data[0], lat: data[1]});
    //blueDot.setZLevel(data[2]);
}

var mySearch = new Mazemap.Search.SearchController({
    campusid: 88,

    rows: 10,

    withpois: true,
    withbuilding: false,
    withtype: false,
    withcampus: false,

    resultsFormat: 'geojson'
});

var mySearchInput = new Mazemap.Search.SearchInput({
    container: document.getElementById('search-input-container'),
    input: document.getElementById('searchInput'),
    suggestions: document.getElementById('suggestions'),
    searchController: mySearch
}).on('itemclick', function(e){

    var poiFeature = e.item;
    clearPoiMarker()
    placePoiMarker(poiFeature);
});

// Add zoom and rotation controls to the map.
myMap.addControl(new Mazemap.mapboxgl.NavigationControl());