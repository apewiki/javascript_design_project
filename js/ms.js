$(function() {

	var map;
	var markers=[];
	var bounds;
	var errMsg;

	const YELP_KEY = 'bv-f4fN8pfiBGodIp824VA';
    const YELP_KEY_SECRET = 'Lmq4G67yJ8avCfy6LqCaxFiEm1E';
    const YELP_TOKEN = '-rBzvZN5TaldkdYTsM_vv4SDm8lvOVZM';
    const YELP_TOKEN_SECRET = 'x9rkfFF6cKAnNJgz5oR5GsH_pew';
    const MYLOCATION = 'New York, NY';


	var Place = function(name, category,selected, address,url, rating, rating_img_url, snippet) {
		this.name = ko.observable(name);
		this.category = ko.observable(category);
		this.selected= ko.observable(selected);
		this.address = ko.observable(address);
		this.url = ko.observable(url);
		this.rating = ko.observable(rating);
		this.rating_img = ko.observable(rating_img_url);
		this.snippet = ko.observable(snippet);
	};

	var MapView = {


		initMap : function() {

			map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 40.7033, lng:-73.9797},
				zoom: 12,
				disableDefaultUI: true
			});
			bounds = new google.maps.LatLngBounds();

			//console.log("No of places selected:" + ViewModel.getPlaces().length);
			//MapView.setAllMarkers();
			//console.log("initMap is called");
		},

		setAllMarkers: function() {
			var places = ViewModel.getPlaces();
			places.forEach(function(loc) {
				console.log("in setAll Markers:" + loc);
				MapView.pinPoster(loc.name, loc.category, loc.address);
			});
		},

		pinPoster : function(name, category, location) {
			if (map) {
				var service = new google.maps.places.PlacesService(map);
				//var type_string = [];
				//type_string.push(category);

				var request = {
					location: map.getCenter(),
					radius: '5000',
					query: name,
					types: category
				};
				console.log("in pinPoster:"+name+":"+ location + category);
				service.textSearch(request, MapView.callback);
			} else {
				console.log("no map to post pins!");
			}

		},

		createMarker : function (placeData) {
			console.log("in createMakrker: "+placeData.name);
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
			});

			markers.push(marker);

			bounds.extend(new google.maps.LatLng(lat,lng));
			map.fitBounds(bounds);
			map.setCenter(bounds.getCenter());


			var infowindow = new google.maps.InfoWindow();

			google.maps.event.addListener(marker, 'click', function() {
				var service = new google.maps.places.PlacesService(map);
				var request = {
					placeId: placeData.place_id
				};
				service.getDetails(request, callback);

				function callback(place, status) {
					var infoContent = '';
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						infoContent = "<a href="+place.website+" target='_blank'>"+place.name+"</a> Tel: "+ place.formatted_phone_number;
						console.log(infoContent);
					} else {
						infoContent = placeData.name;
					}
					infowindow.setContent(infoContent);
				}
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
				MapView.createMarker(results[0]);
				/*
				for (var r in results) {
					//console.log(results[r]);
					MapView.createMarker(results[r]);
				*/			}
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
		self.type = ko.observable("restaurant");
		self.filter = "restaurants";
		self.google_types = ['restaurant'];
		self.infoTypes = ['Restaurant', 'Cafe', 'Ice Cream', 'Shopping'];
		loadPlaces();

		self.search_term = ko.observable("");

		console.log(self.locations().length);
		self.locations().forEach(function(loc) {
			console.log(loc.name() + ':' +loc.category() + ":"+loc.selected());
		});

		function loadPlaces() {
			var yelp_url = "http://api.yelp.com/v2/search";
		   // var yelpRequestTimeout = setTimeout(function(){
		   //     errMsg = "failed to get yelp resources";
		    //}, 8000);

		    var nonce = (Math.floor(Math.random() * 1e12).toString());
		    var parameters = {
		        oauth_consumer_key: YELP_KEY,
		        oauth_token: YELP_TOKEN,
		        oauth_nonce: nonce,
		        oauth_timestamp: Math.floor(Date.now()/1000),
		        oauth_signature_method: 'HMAC-SHA1',
		        oauth_version: '1.0',
		        callback: 'cb',
		        location: MYLOCATION,
		        //radius_filter: '10000',
		        term: 'popular '+ self.type(),
		        //category_filter: 'restaurants',
		        limit: 10,
		        sort: 2
		    };
		    if (self.filter.length) {
		    	parameters.category_filter = self.filter;
		    }

		    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters,
		        YELP_KEY_SECRET, YELP_TOKEN_SECRET);
		    parameters.oauth_signature = encodedSignature;
		    console.log("obtaining encodedSignature:"+encodedSignature);


		    $.ajax({
		        url: yelp_url,
		        data: parameters,
		        cache: true,
		        dataType: "jsonp",
		        jsonp: "callback",
		        success: function( response ) {
		            for (var i = 0; i<response.businesses.length; i++) {
		                var bizname = response.businesses[i].name;
		                var bizurl = response.businesses[i].url;
		                var bizRating = response.businesses[i].rating;
		                var rating_img_url = response.businesses[i].rating_img_url_small;
		                var bizSnippet = response.businesses[i].snippet_text;
		                var bizAddress = response.businesses[i].location.display_address;
		                console.log(bizname);
		               	self.locations.push(new Place(bizname,self.type(), true, bizAddress, bizurl, bizRating,
		               		rating_img_url, bizSnippet));
		               	console.log("After AJAX call:"+self.locations().length + "Google Type: " + self.google_types);
		               	MapView.pinPoster(bizname, self.google_types, bizAddress);
		            }


		            //clearTimeout(yelpRequestTimeout);
		        }

		    });

		};

		self.getInfoType = function() {
			self.google_types=[];

			self.type(this);
			console.log("In getInfoType: "+self.type());
			switch(this) {
				case 'Restaurant':
					self.filter = 'Restaurants';
					self.google_types.push('restaurant');
					break;
				case 'Cafe':
					self.filter = '';
					self.google_types.push('cafe');
				case 'Shopping':
					self.filter = 'Shopping';
					self.google_types = [];
				case 'Ice Cream':
					self.filter = '';
					self.google_types.push('food');
			}
			console.log("In GetInfoType: " +self.google_types);
			self.locations.removeAll();
			MapView.deleteMarkers();
			loadPlaces();
			//console.log("In getInfoType: " + self.locations.length);

			//MapView.setAllMarkers();
		}


		self.reset = function() {
				self.locations().forEach(function(loc) {
					loc.selected(true);
				});
				MapView.setAllMarkers();
		};

		self.reload = function() {
			self.locations = ko.observableArray([]);
			loadPlaces();
		};

		self.searchPlace = function () {
			console.log("In Search:"+self.search_term());

			var re = new RegExp(self.search_term(), "i");

			if (self.search_term().length>0) {
				MapView.deleteMarkers();
				self.locations().forEach(function(loc) {
					if (loc.name().search(re) === -1) {
						loc.selected(false);
					} else {
						loc.selected(true);
						MapView.pinPoster(loc.name(), self.google_types, loc.address());
					}
				});
				//Use visible binding!!!
			} else {
				self.reset();
			}

		};

		self.redirect = function(data, event) {

			console.log("$$$$$$$$$$In redirect:"+self.search_term());
			//event.preventDefault();
			return false;
		};

		$( "#dialog" ).dialog({
	      autoOpen: false,
	      show: {
	        effect: "blind",
	        duration: 1000
	      },
	      hide: {
	        effect: "explode",
	        duration: 1000
	      }
	    });



		self.showDetail = function() {
			console.log("!!!!!In showWindow: "+this.name());
			self.search_term(this.name());
			self.searchPlace();
			$('#dialog').empty();
			$('#dialog').append("<p>"+this.name()+" Yelp Rating:"+this.rating()+"</p>");
			$('#dialog').append("<p>"+this.snippet()+"</p>");
			$("#dialog").dialog("open");
		};

		ViewModel.getPlaces = function() {
			var retArr = [];
			self.locations().forEach(function(loc) {
				if (loc.selected()) {
					retArr.push({
						"name": loc.name(),
						"category": self.google_types,
						"address": loc.address()
					});
				}
			});
			return retArr;
		};
	};








	/*var AppView =  {



		init: function() {
			document.getElementById("search_term").addEventListener("keyup", AppView.getSearchTerm);
			document.getElementById("topFood").addEventListener("click", loadFood);
			$("#search_form").submit(function(e) {
				var term = document.getElementById("search_term").value;
				console.log("submit is called:"+term);
				v.setSearchTerm(term);
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
*/

	//window.addEventListener('load', MapView.initMap);
	MapView.initMap();
	var viewModel = new ViewModel();
	ko.applyBindings(viewModel);
	//viewModel.reload();
	//AppView.init();

	//ViewModel.setPins();
});


