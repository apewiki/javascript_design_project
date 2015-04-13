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

		};

		ViewModel.setSearchTerm = function(search_term) {
			self.search_term(search_term);
			console.log("In setSearchTerm:"+self.search_term());
		}


		var markOnMap = function() {

		};
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

	AppView.init();
});


