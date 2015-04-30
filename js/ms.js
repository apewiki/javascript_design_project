$(function() {

	var map;
	var markers=[];
	var bounds;
	
	const YELP_KEY = 'bv-f4fN8pfiBGodIp824VA';
    const YELP_KEY_SECRET = 'Lmq4G67yJ8avCfy6LqCaxFiEm1E';
    const YELP_TOKEN = '-rBzvZN5TaldkdYTsM_vv4SDm8lvOVZM';
    const YELP_TOKEN_SECRET = 'x9rkfFF6cKAnNJgz5oR5GsH_pew';
    const MYLOCATION = 'New York, NY';
    const NYLAT=40.733;
    const NYLNG=-73.9797;


	var Place = function(name, category,selected, address, neighborhoods, url, rating, rating_img_url, snippet) {
		this.name = ko.observable(name);
		this.category = ko.observable(category);
		this.selected= ko.observable(selected);
		this.address = ko.observable(address);
		this.neighborhoods = ko.observable(neighborhoods);
		this.url = ko.observable(url);
		this.rating = ko.observable(rating);
		this.rating_img = ko.observable(rating_img_url);
		this.snippet = ko.observable(snippet);
	};

	var MapView = {


		initMap : function() {

			map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: NYLAT, lng:NYLNG},
				zoom: 12,
				disableDefaultUI: true
			});
			bounds = new google.maps.LatLngBounds();

			//console.log("No of places selected:" + ViewModel.getPlaces().length);
			//MapView.setAllMarkers();
			//console.log("initMap is called");
		},

		/*setAllMarkers: function() {
			var places = ViewModel.getPlaces();
			places.forEach(function(loc) {
				console.log("in setAll Markers:" + loc);
				MapView.pinPoster(loc.name, loc.category, loc.address);
			});
		},*/

		findMarker: function(name) {
			for (var i =0; i<markers.length; i++) {
				var marker_name = markers[i].title.split(',')[0];
				var re = new RegExp(name, 'i');
				var search_r = marker_name.search(re);
				//console.log("In findMarker: marker_name: "+marker_name+" search_term: "+name+ "Regular Exp: "+re +"search result: " + search_r);
				if (search_r != -1) {
					return markers[i];
				}
			};
			return null;
		},

		pinPoster : function(name, category, location) {
			if (map) {
				var marker = MapView.findMarker(name);
				if (marker) {
					console.log("in pinPost: found marker! " + name);
					marker.setMap(map);
					MapView.setBounds(marker);
				} else {
					console.log("in pinPoster: DID NOT Find Marker "+name);
					var service = new google.maps.places.PlacesService(map);
					//var type_string = [];
					//type_string.push(category);

					var request = {
						location: map.getCenter(),
						radius: '5000',
						query: name + ' in New York',
						types: category
					};
					console.log("in pinPoster:"+name+":"+ location + category);
					service.textSearch(request, MapView.callback);
				}

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
				title: placeData.name + ", " + placeData.formatted_address
			});

			markers.push(marker);

			/*bounds.extend(new google.maps.LatLng(lat,lng));
			map.fitBounds(bounds);
			map.setCenter(bounds.getCenter());*/
			MapView.setBounds(marker);


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
			bounds = new google.maps.LatLngBounds();
		},

		setBounds: function(marker) {
			bounds.extend(new google.maps.LatLng(marker.getPosition().lat(),marker.getPosition().lng()));
			map.fitBounds(bounds);
			map.setCenter(bounds.getCenter());
		},

		deleteMarkers: function() {
			MapView.clearMarkers();
			markers = [];
		}
	};

	var ViewModel = function() {
		var self = this;
		self.errMsg = ko.observable("");
		self.search_term = ko.observable("");
		self.locations = ko.observableArray([]);
		self.type = ko.observable("restaurant");
		self.filter = "restaurants";
		self.google_types = ['restaurant'];
		self.infoTypes = ko.observableArray([]);
		self.infoTypes.push(ko.observable('Restaurant'));
		self.infoTypes.push(ko.observable('Cafe'));
		self.infoTypes.push(ko.observable('Ice Cream'));
		self.infoTypes.push(ko.observable('Shopping'));
		loadAll();

		self.search_term = ko.observable("");

		console.log(self.locations().length);
		self.locations().forEach(function(loc) {
			console.log(loc.name() + ':' +loc.category() + ":"+loc.selected());
		});

		function loadAll()
		{
			loadPlaces('restaurant', 'restaurants',['restaurant']);
			loadPlaces('cafe, coffee shop', '', []);
			loadPlaces('ice cream parlor, candy shop','',['food']);
			loadPlaces('shopping, shopping mall','shopping','');
		}

		function loadPlaces(type,yelp_filter, google_types) {
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
		        lcc: 'NYLAT, NYLLG',
		        //radius_filter: '10000',
		        term: 'popular '+ type,
		        //category_filter: 'restaurants',
		        limit: 10,
		        sort: 2
		    };
		    if (self.filter.length) {
		    	parameters.category_filter = yelp_filter;
		    }

		    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters,
		        YELP_KEY_SECRET, YELP_TOKEN_SECRET);
		    parameters.oauth_signature = encodedSignature;
		    console.log("obtaining encodedSignature:"+encodedSignature);
		    var selected = (type === self.type());
		    console.log("In load: selected or not? "+selected);

		    var yelpRequestTimeout = setTimeout(function() {
		    	self.errMsg("Sorry, request to yelp timed out. Please check your internet connection.");
		    	//$('#result-form').prepend("<div id='err'>"+errMsg+"</div>");
		    }, 8000);

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
		                var bizNeighborhoods = response.businesses[i].location.neighborhoods;
		               // console.log(bizname);
		               	self.locations.push(new Place(bizname, type, selected, bizAddress, bizNeighborhoods, bizurl, bizRating,
		               		rating_img_url, bizSnippet));
		               	//console.log("After AJAX call:"+self.locations().length + "Google Type: " + google_types);
		               	if (selected) {
		               		MapView.pinPoster(bizname, google_types, bizAddress);
		               	}
		            }


		            clearTimeout(yelpRequestTimeout);
		        },
		        error: function (response ) {
		        	self.errMsg ("Sorry, Yelp search failed.");
		        	//$('#result-form').prepend("<div id='err'>"+errMsg+"</div>");
		        	console.log("Failed to search Yelp.");
		        }

		    });

		};

		//This does not work
		/*self.checkType = ko.pureComputed( function() {
			console.log("checkType is######## called!" + self.type() + "matching:" + this);
			console.log("Result:" + self.type().match(new RegExp(this, 'i')));
			var ret = self.type().match(new RegExp(this, 'i'))? "typeSelected": "typeDeselected";
			console.log("Result:" + ret);
			return ret;

		}, self);*/


		self.getInfoType = function() {
			self.google_types=[];
			self.search_term("");


			console.log("In getInfoType: "+self.type());
			if (this.match(/Restaurant/)) {
					self.type('restaurant');
					self.filter = 'restaurants';
					self.google_types.push('restaurant');
				} else if (this.match(/Cafe/)) {
					self.filter = '';
					self.type('cafe, coffee shop');
					//self.google_types.push('cafe');
				} else if (this.match(/Shopping/))
				{
					self.filter = 'shopping';
					self.type('shopping, shopping mall')
				} else if (this.match(/Ice Cream/))
				{
					self.filter = '';
					self.type('ice cream parlor, candy shop');
					self.google_types.push('food');
				}

			console.log("In GetInfoType: google Type:" +self.google_types+" yelp filter:" + self.filter);
			MapView.clearMarkers();
			self.reset();
			//loadPlaces();
			//console.log("In getInfoType: " + self.locations.length);

			//MapView.setAllMarkers();
		};


		self.reset = function() {
				self.locations().forEach(function(loc) {
					loc.selected(loc.category() === self.type());
					console.log("Type is: "+loc.category() + "Self type: "+self.type());
					if (loc.selected()) {
						console.log("!!!Set Pin: " + loc.name() + ":"+loc.category());
						MapView.pinPoster(loc.name(), self.google_types, loc.address());
					}
				});

		};

		/*
		self.reload = function() {
			self.locations = ko.observableArray([]);
			loadPlaces();
		};*/

		self.searchPlace = function () {
			console.log("In Search:"+self.search_term());

			var re = new RegExp(self.search_term(), "i");

			if (self.search_term().length>0) {
				MapView.clearMarkers();
				self.locations().forEach(function(loc) {
					if (loc.name().search(re) === -1) {
						loc.selected(false);
					} else {
						loc.selected(true);
						MapView.pinPoster(loc.name(), self.google_types, loc.address());
						//manageDialog(loc, false);
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
	      },
	      position: {
	      	my: "center top",
	      	at: "right center+50%",
	      	of: "#selected-list"
	      }
	    });

	    /*function manageDialog(location, toOPen) {
	    	if ($('#dialog').dialog('isOpen') || toOpen) {
	    		$('#dialog').empty();
				$('#dialog').append("<p>"+location.name()+" Yelp Rating:"+location.rating()+"</p>");
				$('#dialog').append("<p>"+location.snippet()+"</p>");
				$("#dialog").dialog("open");
	    	}
	    }*/



		self.showDetail = function() {
			console.log("!!!!!In showWindow: "+this.name());
			self.search_term(this.name());
			self.searchPlace();

			$('#dialog').empty();
			$('#dialog').append("<a href="+this.url()+" target='_blank' class='detail-header'>"+this.name()+"</a>"
				+"<span class='detail-header'> Yelp Rating:"+this.rating()+"</span>");
			$('#dialog').append("<p class='detail-body'> <span>From Yelp Review: </span>"+this.snippet()+"</p>");
			var yelp_url = "<a href=" + this.url() +"> Read more</a>";
			console.log("Yelp URL: "+this.url);
			//$('#dialog').append("<a href=" + this.url() +" target='_blank'> Go To Yelp</a>");

			$("#dialog").dialog("open");
			$('#dialog').dialog("moveToTop");
		};

		/*
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
			console.log(retArr);
			return retArr;
		};*/
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


