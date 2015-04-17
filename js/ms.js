$(function() {

	var map;
	var markers=[];
	var bounds;

	var initLocations = [
		{
			'name':'Central Park',
			'category':'park',
			'selected': false
		},

		{
			'name':'Penn Station',
			'category':'train_station',
			'selected':true
		},

		{
			'name': 'Olive Garden',
			'category': 'restuarant',
			'selected':true
		},

		{
			'name': 'Morimoto',
			'category': 'restuarant',
			'selected':true
		},

		{
			'name': 'Grand Central',
			'category': 'train_station',
			'selected':true
		},

		{
			'name':'Rockefeller Center',
			'category': 'placeOfInterest',
			'selected':true
		}
	];

	var Model = {
		places: initLocations,
		search_term: ""
	}

	var Place = function(data) {
		this.name = ko.observable(data.name);
		this.category = ko.observable(data.category);
		this.selected= ko.observable(data.selected);
	};

	var MapView = {


		initMap : function() {

			map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 40.7033, lng:-73.9797},
				zoom: 12,
				disableDefaultUI: true
			});
			bounds = new google.maps.LatLngBounds();

			console.log("No of places selected:" + ViewModel.getPlaces().length);
			MapView.setAllMarkers();
			console.log("initMap is called");
		},

		setAllMarkers: function() {
			var places = ViewModel.getPlaces();
			places.forEach(function(loc) {
				MapView.pinPoster(loc);
			});
		},

		pinPoster : function(location) {
			if (map) {
				var service = new google.maps.places.PlacesService(map);

				var request = {
					bounds: map.getBounds(),
					query: location
				};
				console.log("in pinPoster:"+location);
				service.textSearch(request, MapView.callback);
			} else {
				console.log("no map to post pins!");
			}

		},

		createMarker : function (placeData) {
			console.log("in createMakrker:"+placeData);
			var lat = placeData.geometry.location.lat();
			var lng = placeData.geometry.location.lng();

			var image = {
				url: placeData.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0,0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25,25)
			};
			

			var marker = new google.maps.Marker({
				position: placeData.geometry.location,
				map: map,
				icon: image,
				animation: google.maps.Animation.DROP,
				title: placeData.formatted_address
			})
			markers.push(marker);

			bounds.extend(new google.maps.LatLng(lat,lng));
			map.fitBounds(bounds);
			map.setCenter(bounds.getCenter());

			var infowindow = new google.maps.InfoWindow();

			google.maps.event.addListener(marker, 'click', function() {
				infowindow.setContent(placeData.name);
				infowindow.open(map, marker);
				marker.setAnimation(google.maps.Animation.BOUNCE);
			});

			google.maps.event.addListener(infowindow,'closeclick', function() {
				if (marker.getAnimation() != null) {
					marker.setAnimation(null);
				}
			});
		},

		callback : function(results, status) {
			console.log("callback stauts:" + status);
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				console.log("in callback, number of results:"+results.length);
				for (var r in results) {
					console.log(results[r]);
					MapView.createMarker(results[r]);
				}
			}
		},

		clearMarkers: function() {
			markers.forEach(function(marker) {
				marker.setMap(null);
			})
		},

		deleteMarkers: function() {
			MapView.clearMarkers();
			markers = [];
		}
	};

	var ViewModel = function() {
		var self = this;
		self.search_term = ko.observable("");
		self.locations = ko.observableArray([]);

		initLocations.forEach(function(loc) {
			self.locations.push(new Place(loc));

		});

		console.log(self.locations().length);
		self.locations().forEach(function(loc) {
			console.log(loc.name() + ':' +loc.category() + ":"+loc.selected());
		});

		ViewModel.setPins = function() {

			self.locations().forEach(function(loc) {
				if (loc.selected()) {
					MapView.pinPoster(loc.name()+", New York");
				}
			});
		};

		ViewModel.reset = function() {
			self.locations().forEach(function(loc) {
				loc.selected(true);
			});
			MapView.setAllMarkers();
		};

		ViewModel.searchPlace = function (search_term) {
			console.log("In Search:"+search_term);

			var re = new RegExp(search_term, "i");

			if (search_term.length>0) {
				MapView.deleteMarkers();
				self.locations().forEach(function(loc) {
					if (loc.name().search(re) === -1) {
						loc.selected(false);
					} else {
						MapView.pinPoster(loc.name()+", New York");
					}
				});
				//Use visible binding!!!
			} else {
				ViewModel.reset();
			}

		};

		ViewModel.setSearchTerm = function(search_term) {
			self.search_term(search_term);
			console.log("In setSearchTerm:"+self.search_term());
		};

		ViewModel.getPlaces = function() {
			var retArr = [];
			self.locations().forEach(function(loc) {
				if (loc.selected()) {
					retArr.push(loc.name()+", NY");
				}
			});
			return retArr;
		}
	};

	var viewModel = new ViewModel();
	ko.applyBindings(viewModel);

	var AppView =  {



		init: function() {
			document.getElementById("search_term").addEventListener("keyup", AppView.getSearchTerm);
			$("#search_form").submit(function(e) {
				var term = document.getElementById("search_term").value;
				console.log("submit is called:"+term);
				ViewModel.setSearchTerm(term);
				e.preventDefault();
			})
		},

		getSearchTerm: function(e) {
			var term = document.getElementById("search_term").value;
			console.log("getSearchTerm:"+term);
			ViewModel.searchPlace(term);
			e.preventDefault();
		}



	};



	AppView.init();
	window.addEventListener('load', MapView.initMap);
	//ViewModel.setPins();
});


