$(function() {

	var map;
	var markers=[];
	var bounds;
	var errMap;
	var errMapDetail="";

	const YELP_KEY = 'bv-f4fN8pfiBGodIp824VA';
    const YELP_KEY_SECRET = 'Lmq4G67yJ8avCfy6LqCaxFiEm1E';
    const YELP_TOKEN = '-rBzvZN5TaldkdYTsM_vv4SDm8lvOVZM';
    const YELP_TOKEN_SECRET = 'x9rkfFF6cKAnNJgz5oR5GsH_pew';
    const MYLOCATION = 'New York, NY';
    const NYLAT=40.733;
    const NYLNG=-73.9797;
    const YELP_URL = "https://api.yelp.com/v2/search";


    //Place object definition
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

	//Google Map View object
	var MapView = {

		//Initialize google map if api is loaded
		initMap : function() {
			//Check if google api is properly loaded
			if (typeof(google) === 'object' && typeof(google.maps) ==='object') {
				map = new google.maps.Map(document.getElementById('map'), {
					center: {lat: NYLAT, lng:NYLNG},
					zoom: 12,
					disableDefaultUI: true
				});
				bounds = new google.maps.LatLngBounds();
				return true;
			} else {
				//If google api fails to load, exit and print the error message on screen
				$(".nav").after("<p> Google Map is not available, please check internet connection.</p>");
				$('main').hide();
				return false;
			}


		},

		//Find the marker if the location was found and cached
		findMarker: function(name) {
			for (var i =0; i<markers.length; i++) {
				var marker_name = markers[i].name;
				var re = new RegExp(name, 'i');
				var search_r = marker_name.search(re);
				if (search_r != -1) {
					return markers[i].marker;
				}
			};
			return null;
		},

		//Given name, category, neighbood(location), mark it on google map.
		pinPoster : function(name, category, location, delay, initLoad) {
			if (map) {
				var marker = initLoad? null:MapView.findMarker(name+":"+location);
				if (marker) {
					marker.setMap(map);
					MapView.setBounds(marker);
				} else {
					//Use google place library service to search for place data (lat, lng, website) of the business
					var service = new google.maps.places.PlacesService(map);
					var queryString = location && location.length? name + ' near ' + location : name + ' in New York';


					var request = {
						location: map.getCenter(),
						radius: '5000',
						query: name + ' in New York',
						types: category
					};
					//In order to get around OVER_QUERY_LIMIT problem, increase delay on each search by 300 ms
					setTimeout(function() {
						service.textSearch(request, function(results, status){
							if (status == google.maps.places.PlacesServiceStatus.OK) {
								MapView.createMarker(name+":"+location, results[0]);
							} else if (status == google.maps.place.PlacesServiceStatus.OVER_QUERY_LIMIT) {
								alert("Sorry, Google query limit is reached. Wait couple seconds and click your selection again!");
							} else {
								errMapDetail += status + "; ";
								alert("An error occurred on google query: " + errMapDetail);
							}
						});
					}, 300*delay);
				}

			} else {
				errMapDetail="Google Map is not available.";
				alert("Sorry, failed to open Google map.");
			}
		},

		//Create marker give place data and store marker in markers array
		createMarker : function (name, placeData) {
			var lat = placeData.geometry.location.lat();
			var lng = placeData.geometry.location.lng();

			//Properly size the marker icons
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

			markers.push({"name": name, "marker":marker});
			MapView.setBounds(marker);
			var infowindow = new google.maps.InfoWindow();

			google.maps.event.addListener(marker, 'mouseup', function(e) {
				var service = new google.maps.places.PlacesService(map);
				var request = {
					placeId: placeData.place_id
				};

				//Use place_id to obtain the website url of the business
				service.getDetails(request, callback);

				function callback(place, status) {
					var infoContent = '';
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						var web_address = place.website? "<a href="+place.website+" target='_blank'>"+place.name+"</a>" : place.name;
						infoContent = web_address;
						infoContent += place.formatted_phone_number? " Tel: " + place.formatted_phone_number : "not available";
					} else {
						infoContent = placeData.name;
					}
					infowindow.setContent(infoContent);
				}
				infowindow.open(map, marker);
				marker.setAnimation(google.maps.Animation.BOUNCE);
				e.stop();
			});

			//Stop animation if infowindow is closed
			google.maps.event.addListener(infowindow,'closeclick', function() {
				if (marker.getAnimation() != null) {
					marker.setAnimation(null);
				}
			});
		},

		//Erase all markers from the map
		clearMarkers: function() {
			markers.forEach(function(m) {
				m.marker.setMap(null);
			})
			bounds = new google.maps.LatLngBounds();
		},

		//Set the boundary of the map when a new marker is added
		setBounds: function(marker) {
			bounds.extend(new google.maps.LatLng(marker.getPosition().lat(),marker.getPosition().lng()));
			map.fitBounds(bounds);
			map.setCenter(bounds.getCenter());
		},

		//Delete all markers
		deleteMarkers: function() {
			MapView.clearMarkers();
			markers = [];
		}
	};

	//View Model
	var ViewModel = function() {
		var self = this;
		self.errMsg = ko.observable("");
		self.search_term = ko.observable("");
		self.locations = ko.observableArray([]);
		self.type = ko.observable("restaurant");
		self.google_types = ['restaurant'];
		self.infoTypes = ko.observableArray([]);
		self.infoTypes.push(ko.observable('Restaurant'));
		self.infoTypes.push(ko.observable('Cafe'));
		self.infoTypes.push(ko.observable('Ice Cream'));
		self.infoTypes.push(ko.observable('Shop'));
		self.search_term = ko.observable("");

		loadAll();

		//Load up all business data of interest at start up
		function loadAll()
		{
			loadPlaces('restaurant', 'restaurants',['restaurant']);
			loadPlaces('cafe, coffee shop', '', []);
			loadPlaces('ice cream parlor, candy shop','',['food']);
			loadPlaces('shopping, shopping mall','shopping','');
		}

		//Load a set of business data based on category such as restaurant, cafe, shop, etc
		function loadPlaces(type, yelp_filter, google_types) {
			//oAuth set up
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

		    if (yelp_filter.length) {
		    	parameters.category_filter = yelp_filter;
		    }

		    var encodedSignature = oauthSignature.generate('GET', YELP_URL, parameters,
		        YELP_KEY_SECRET, YELP_TOKEN_SECRET);
		    parameters.oauth_signature = encodedSignature;
		    var selected = (type === self.type());

		    //Set time out if query is not set up right or yelp is not available
		    var yelpRequestTimeout = setTimeout(function() {
		    	self.errMsg("Sorry, request to yelp timed out. Please check your internet connection.");
		    }, 8000);

		    //jQuery ajax call to Yelp API
		    $.ajax({
		        url: YELP_URL,
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
		               // Create a place based on each record received and push it into locations array
		               	self.locations.push(new Place(bizname, type, selected, bizAddress, bizNeighborhoods, bizurl, bizRating,
		               		rating_img_url, bizSnippet));
		               	//If a category is selected by default, show markers on the map;
		               	if (selected) {
		               		MapView.pinPoster(bizname, google_types, bizNeighborhoods, 0, true);
		               	}
		            }
		            //Clear Timeout if request to Yelp is successful
		            clearTimeout(yelpRequestTimeout);
		        },
		        error: function (response ) {
		        	//Show error message if request to Yelp failed
		        	self.errMsg ("Sorry, Yelp search failed.");
		        }

		    });

		};

		//Set up google filters
		self.getGoogleTypes = function(type) {
			var retVal = [];
			if (type.match(/Restaurant/)) {
					retVal.push('restaurant');
			} else if (type.match(/Ice Cream/))
			{
				retVal.push('food');
			}
			return retVal;
		}

		//This function is called when a category element is clicked.
		//Subsequently business data relevant to that category is shown as list as well as markers on the map
		self.getInfoType = function() {
			self.google_types=[];
			self.search_term("");

			//Have to map search types/key terms between google and caption on the buttons
			if (this.match(/Restaurant/)) {
					self.type('restaurant');
					self.google_types.push('restaurant');
				} else if (this.match(/Cafe/)) {
					self.type('cafe, coffee shop');
				} else if (this.match(/Shop/))
				{
					self.type('shopping, shopping mall')
				} else if (this.match(/Ice Cream/))
				{
					self.type('ice cream parlor, candy shop');
					self.google_types.push('food');
				}

			//Clear markers of previously selected category
			MapView.clearMarkers();
			//Show markers of currently selected category
			self.reset();
		};

		//This function is called by to put all markers of a selected category on the map
		self.reset = function() {
			errMap="";
			errMapDetail="";
			self.errMsg("");
			var i=0;
			self.locations().forEach(function(loc) {
				loc.selected(loc.category() === self.type());
				if (loc.selected()) {
					MapView.pinPoster(loc.name(), self.google_types, loc.neighborhoods(),i, false);
					i++;
				}
			});
		};

		/*This function is called when user fill in the search box or click an item on the list
		 Based on the text in search box, the list will be filtered using regular expression matching
		 The markers of matched business will be shown and all other markers will be cleared from the map*/
		self.searchPlace = function () {
			errMap="";
			errMapDetail="";

			var re = new RegExp(self.search_term(), "i");
			MapView.clearMarkers();

			if (self.search_term().length>0) {

				self.locations().forEach(function(loc) {
					//The search is conducted on selected category only
					if (loc.category() === self.type()) {
						//Use knockout "visible" property binding to show the matching list item
						if (loc.name().search(re) === -1) {
							loc.selected(false);
						} else {
							loc.selected(true);
							MapView.pinPoster(loc.name(), self.getGoogleTypes(loc.category()), loc.neighborhoods(),0, false);
						}
					}
				});
			} else {
				//If the search box is empty, show everything on the list.
				self.reset();
			}

		};

		//This function is called when user press return on search box to stop default behavoir of browser.
		self.redirect = function(data, event) {
			return false;
		};

		/*Use jQuery UI to show pop up box with detailed info when a list item is clicked.
		  jQuery UI dialog box set up */
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

		//Use jQuery UI to show pop up box with detailed info when a user click the name protion of a list item.
		self.showDetail = function() {
			self.search_term(this.name());
			self.searchPlace();

			$('#dialog').empty();
			$('#dialog').append("<a href="+this.url()+" target='_blank' class='detail-header'>"+this.name()+"</a>"
				+"<span class='detail-header'> Yelp Rating:"+this.rating()+"</span>");
			$('#dialog').append("<p class='detail-body'> <span>From Yelp Review: </span>"+this.snippet()+"</p>");

			$("#dialog").dialog("open");
			$('#dialog').dialog("moveToTop");
		};

		//User can toggle "+"/"-" sign next to list name. click "+" to show all items on the list. click "-" to collapse the list.
		self.toggleList = function() {
			$('#loc_list').toggleClass("loc-list");
			$('#plus').toggleClass("hidden");
			$('#minus').toggleClass("hidden");
		};

		//User clicks the hamburger menu to show category list. Only show up when screen is less than 500px
		self.showList = function() {
			$("#selected-list").toggleClass("open");
		};

		//User clicks anywhere around the navigation menu to close the category list
		self.closeList = function() {
			$("#selected-list").removeClass("open");
		};

		//Select the text in search box when user clicks inside box for easy deletion
		self.select = function() {
			$('#search_term').select();
		}
	};

	//Start the app when google map is initialized successfully
	if (MapView.initMap()) {
		var viewModel = new ViewModel();
		ko.applyBindings(viewModel);
		window.addEventListener("resize", function() {
			map.fitBounds(bounds);
		})
	}
});


