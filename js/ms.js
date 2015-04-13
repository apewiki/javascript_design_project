$(function() {
	var initLocations = [
		{
			'name':'Central Park',
			'category':'placeOfInterest',
			'selected': false
		},

		{
			'name':'Penn Station',
			'category':'transit',
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
			'category': 'transit',
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

		ViewModel.reset = function() {
			self.locations().forEach(function(loc) {
				loc.selected(true);
			});
		};

		ViewModel.searchPlace = function (search_term) {
			console.log("In Search:"+search_term);
			var re = new RegExp(search_term, "i");

			if (search_term.length>0) {
				self.locations().forEach(function(loc) {
					if (loc.name().search(re) === -1) {
						loc.selected(false);
					}
				});
				//Use visible binding!!!
			} else {
				ViewModel.reset();
			}
			MapView.pinPoster(self.locations());

		};

		ViewModel.setSearchTerm = function(search_term) {
			self.search_term(search_term);
			console.log("In setSearchTerm:"+self.search_term());
		};

		ViewModel.getPlaces = function() {
			return self.locations();
		}
	};

	ko.applyBindings(new ViewModel());

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

	var MapView = {


		initMap : function() {

			var map= new google.maps.map(document.getElementById('map'), {
				center: {lat: 40.7033, lon:-73.9797},
				zoom: 15
			});
			console.log("initMap is called");
		},

		pinPoster : function(locations) {
			var service = new google.maps.places.PlaceService(map);

			locations.forEach(function(loc) {
				if (loc.selected()) {
					var request = {
						query: loc.name()
					};
					service.textSearch(request, this.callback);
				}
			})
		},

		callback : function(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				for (var r in results) {
					createMarker(r);
				}
			}
		},

		createMakrker : function (placeData) {
			var market = new google.maps.Marker({
				position: placeData.geometry.location,
				map:this.map,
				title: placeData.formatted_address
			})
		}

	};

	AppView.init();
	window.addEventListener('load', MapView.initMap);
});


