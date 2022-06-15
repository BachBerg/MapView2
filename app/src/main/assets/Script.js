var bluetoothlng=12.395187600341018
var bluetoothlat=55.73211190866394
var bluetoothzLevel =1


const beacons = ["12.395187600341018|55.73211190866394|1","12.394907164907806|55.73183938129566|1", "12.39456431370212|55.73186350349732|1"];

var myMap = new Mazemap.Map({
    // container id specified in the HTML
    container: 'map',

    campuses: 88,

    // initial position in lngLat format
    center: {lng: 12.395187600341018, lat: 55.73211190866394},
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
    var poiStr = JSON.stringify(poi, null, 1); // spacing level = 2
    document.getElementById('poi-data').innerHTML = poiStr;

    console.log(poi.properties.title + " " + lngLat+Zlevel); // Can also look in your console to see the object there

}

var started=true;


function changeCount(){
    if(count=1){
        count=2;
        console.log('hejjjjjjjjjj');
        }
        else if(count=2){
        count=1;
        }
}

function makeRoute() {
    var start = {lngLat: {lng: bluetoothlng, lat: bluetoothlat}, zLevel: bluetoothzLevel};
    var dest = {lngLat: {lng: lngLat.lng, lat: lngLat.lat}, zLevel: Zlevel};
    routeController = new Mazemap.RouteController(myMap);



    if(started==true){
        Mazemap.Data.getRouteJSON(start, dest)
            .then(function (geojson) {
                routeController.setPath(geojson);

                // Fit the map bounds to the path bounding box
                var bounds = Mazemap.Util.Turf.bbox(geojson);
                myMap.fitBounds(bounds, {padding: 100});
                    });

    }
    else if(started==false){
        routeController.clear();
        clearPoiMarker();
        location.reload();
    }

}

function changeDot(beaconnumber){
    data=beacons[beaconnumber].split('|')
    bluetoothlng= data[0]
    bluetoothlat= data[1]

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

//CSS BRAS

function changeStyle(){
        var element = document.getElementById("button");


        if(started==true){
        element.style.backgroundColor = "red";
         element.innerHTML="Afslut";
         started=false;
         element.style.width= '50px';


         }

         else if(started==false){
         element.style.backgroundColor = "rgb(14,168,61)";
         element.innerHTML="Start Navigation";
         console.log('breeen');
         started=true;
         }


}

//SammenSat Functioner
function makeRouteWithChange(){

    makeRoute();
    changeStyle();

}
