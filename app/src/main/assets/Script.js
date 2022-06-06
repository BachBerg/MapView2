var bluetoothlng = 12.398112598878498
var bluetoothlat = 55.731372176608886

const beaconarray = ["12.398112598878498,55.731372176608886", "12.39685695733641,55.731406687433775", "12.397130888937596,55.73155143121474"];

function changeBluetooth(hello) {
    var name = beaconarray[hello]
    bluetoothlng=name.substring(0,name.indexOf(","))
    bluetoothlat=name.substring(name.indexOf(",")+1)
}

var myMap = new Mazemap.Map({
    // container id specified in the HTML
    container: 'map',

    campuses: 88,

    // initial position in lngLat format
    center: {lng: 12.397434, lat: 55.731126},
    // initial zoom
    zoom: 18,
    scrollZoom: true,
    doubleClickZoom: true,
    touchZoomRotate: true,
    zLevel: 1
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
        .setZLevel(1)
        .setAccuracy(7)
        .setLngLat({lng: bluetoothlng, lat: bluetoothlat})
        .show();

});

// define a global
var mazeMarker;
var lngLat;
var zLevel;
var routeController;


function onMapClick(e) {
    // Clear existing, if any
    clearPoiMarker();

    lngLat = e.lngLat;
    zLevel = myMap.zLevel;

    // Fetching via Data API
    Mazemap.Data.getPoiAt(lngLat, zLevel).then(poi => {

        printPoiData(poi);

        placePoiMarker(poi);

    }).catch(function () {
        return false;
    });
}

function printPoiData(poi) {
    var poiStr = JSON.stringify(poi, null, 2); // spacing level = 2
    document.getElementById('poi-data').innerHTML = poiStr;

    console.log(poi.properties.title + " " + lngLat); // Can also look in your console to see the object there

}

function clearPoiMarker() {
    if (mazeMarker) {
        mazeMarker.remove();
    }
    if (routeController) {
        routeController.clear();
    }
    myMap.highlighter.clear();
}

function placePoiMarker(poi) {
    lngLat = Mazemap.Util.getPoiLngLat(poi)
    zLevel = poi.properties.zValue;


    // Get a center point for the POI, because the data can return a polygon instead of just a point sometimes

    mazeMarker = new Mazemap.MazeMarker({
        color: '#ff00cc',
        innerCircle: true,
        innerCircleColor: '#FFF',
        size: 34,
        innerCircleScale: 0.5,
        zLevel: zLevel
    })
        .setLngLat(lngLat)
        .addTo(myMap);

    // If we have a polygon, use the default 'highlight' function to draw a marked outline around the POI.
    if (poi.geometry.type === "Polygon") {
        myMap.highlighter.highlight(poi);
    }
    myMap.flyTo({center: lngLat, zoom: 19, speed: 0.5});
}

function makeRoute() {
    var start = {lngLat: {lng: bluetoothlng, lat: bluetoothlat}, zLevel: 1};
    var dest = {lngLat: {lng: lngLat.lng, lat: lngLat.lat}, zLevel: zLevel};

    routeController = new Mazemap.RouteController(myMap);

    Mazemap.Data.getRouteJSON(start, dest)
        .then(function (geojson) {
            routeController.setPath(geojson);

            // Fit the map bounds to the path bounding box
            var bounds = Mazemap.Util.Turf.bbox(geojson);
            myMap.fitBounds(bounds, {padding: 100});
        });
}

//blueDot.setLngLatAnimated({lng: bluetoothlng, lat: bluetoothlat});
//blueDot.setZLevel(Zlelvel);


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
}).on('itemclick', function (e) {

    var poiFeature = e.item;
    clearPoiMarker()
    placePoiMarker(poiFeature);
});

// Add zoom and rotation controls to the map.
myMap.addControl(new Mazemap.mapboxgl.NavigationControl());
