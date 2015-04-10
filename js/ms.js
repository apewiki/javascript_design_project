	var initLocations = [
		{
			'name':'Central Park',
			'category':'placeOfInterest',
			'selected': true
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

	var Place = function(data) {
		this.name = ko.observable(data.name);
		this.category = ko.observable(data.category);
		this.selected= ko.observable(data.selected);
	};

	var ViewModel = function() {
		var self = this;
		self.locations = ko.observableArray([]);

		initLocations.forEach(function(loc) {
			self.locations.push(new Place(loc));
			
		});

		console.log(self.locations().length);
		self.locations().forEach(function(loc) {
			console.log(loc.name() + ':' +loc.category() + ":"+loc.selected());
		});

		/*var searchPlace = function (search_term) {
			self.locations().forEach(function(loc) {
				if (loc.name().search(search_term) === -1) {
					loc.selected(false);
				}
			});
			//Use visible binding!!!
		};

		var markOnMap = function() {

		};

		//self.places=['place 1', 'place 2','place 3'];*/

	};

	ko.applyBindings(new ViewModel());


