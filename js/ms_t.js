$(function() {
	var ViewModel = function() {
	var self = this;
	self.places = ko.observableArray([
		{
			name:'Central Park',
			category:'placeOfInterest',
			selected: true
		},

		{
			name:'Penn Station',
			category:'transit',
			selected:true
		},

		{
			name: 'Olive Garden',
			category: 'restuarant',
			selected:true
		},

		{
			name: 'Morimoto',
			category: 'restuarant',
			selected:true
		},

		{
			name: 'Grand Central',
			category: 'transit',
			selected:true
		},

		{
			name:'Rockefeller Center',
			category: 'placeOfInterest',
			selected:true
		}
	]);
}

ko.applyBindings(new ViewModel());
});
