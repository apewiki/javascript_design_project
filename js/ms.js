$(function() {
	var initLocations = [
		{
		'name':'Central Park',
		'category':'placeOfInterest'
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

	var place = function(data) {
		this.name = ko.observable(data.name);
		this.category = ko.observable(data.category);
		this.selected= ko.observable(data.selected);
	};

	var ViewModel = {
		var self = this;
		var locations = ko.observableArray([]);

		initLocations.foreach(loc) {
			locations.push(new place(loc));
		};

		var searchPlace = function (search_term) {
			self.locations.foreach(loc) {
				if (loc.search(search_term) === -1) {
					loc.selected = false;
				}
			}
			//Use visible binding!!!
		}

		var markOnMap = function() {

		}

	}




});