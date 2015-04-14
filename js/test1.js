$(function() {
  var map;
  var service;
  var infowindow;

  function initialize() {

    var pyrmont = new google.maps.LatLng(-33.8665433,151.1956316);
    console.log("in initilizing lat lng of a place");

    map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: pyrmont,
        zoom: 15
      });

    console.log("in initialize map")
    var request = {
      location: pyrmont,
      radius: '500',
      query: 'restaurant'
    };

    service = new google.maps.places.PlacesService(map);
    console.log("end in initialize")
    service.textSearch(request, callback);
  }

  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        var place = results[i];
        createMarker(results[i]);
      }
    }
  }

  function createMarker(placeData) {


    var marker = new google.maps.Marker({
        position: placeData.geometry.location,
        map: map,
        title: 'Hello World!'
    });
  }

  google.maps.event.addDomListener(window, 'load', initialize);
});