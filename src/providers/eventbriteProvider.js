
var eventbriteAPI = require('node-eventbrite');


var eventbriteProvider = function (authToken) {

	var module = {};

	var api = eventbriteAPI({
		token: authToken,
		version : 'v3'
	});

	module.GetEventAtendees = function(eventId, onSuccess, onError) {

		api.event_attendees({event_id: eventId}, function(error, data) {
			if(error) {
				onError && onError(error);
				return;
			}

			//remove duplicates
			//one good bet to find out if we have duplicates is if their id is composed of
			//something like 2783747623-1 <--- see that dash?
			//the duplicates will have something like 2783747623-2, 2783747623-3, 2783747623-4.... and so on
			data.attendees = data.attendees.filter(function(attendee) {
				return attendee.id.indexOf('-') < 0;
			});

			onSuccess && onSuccess(data);
		});

	}

	module.GetSingleEvent = function(eventId, onSuccess, onError) {

		try {
			var callback = function (error, data) {
				if (error) 
					onError && onError(error);
				else {
					api.get('venues', 
						data.venue_id + "/", 
						[], 
						{'venue_id' : data.venue_id},
						function(error, venueData) {
							if (error) {
								onError && onError(error);
								return;
							}

							data.venue = venueData;

							api.get('organizers', 
								data.organizer_id + "/", 
								[], 
								{'organizer_id' : data.organizer_id},
								function(error, organizerData) {
									if (error)  {
										onError && onError(error);
										return;
									}

									data.organizer = organizerData;
									onSuccess && onSuccess(data);
								}
							);
						}
					);
				}
			};
			api.event_details({event_id: eventId}, callback);

		} catch (error) {
			onError && onError(error); 
		}

	}


	module.GetUserEvents = function(additionalOrganizers, onSuccess, onError) {

		try {

			if(!additionalOrganizers || additionalOrganizers == null)
				additionalOrganizers = [];

			var aggregateData = {events: []};

			var i = 0;
			var addUsersCallback = function(error, userData) {
				if(error){
					onError && onError(error);
				} else {
					if(userData && userData.events.length > 0) 
						for(var j = 0, l = userData.events.length; j < l; j++)
							aggregateData.events.push(userData.events[j]);
				}
				if(i < additionalOrganizers.length) {
					api.search({"organizer.id": additionalOrganizers[i++]}, addUsersCallback);
				} else {

					//filter all draft events. these should never be visible to the client
					aggregateData.events = aggregateData.events.filter(function(event, i) {
						return event.status !== 'draft';
					});

					onSuccess && onSuccess(aggregateData);
				}

			}

			var callback = function (error, data) {
				if(error)
					onError && onError(error);
				else{
					if(additionalOrganizers.length > 0) {
						aggregateData = data;
						api.search({"organizer.id": parseInt(additionalOrganizers[i++], 10)}, addUsersCallback);
					} else {
						//filter all draft events. these should never be visible to the client
						data.events = data.events.filter(function(event, i) {
							return event.status !== 'draft';
						});

						onSuccess && onSuccess(data);
					}
				}
			};

			//get our events
			api.user_events({},callback);
		} catch (error) {
			onError && onError(error);
		}

	}

	return module;
};


module.exports = eventbriteProvider;