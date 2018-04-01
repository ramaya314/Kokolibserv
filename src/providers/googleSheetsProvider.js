
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var fs = require('fs');
var readline = require('readline');
var googleAuthorizer = require('../googleAuthorizer.js');

var dateFormat = require('dateformat');

var googleSheetsProvider = function (clientSecretFilePath, tokenPath) {

	if(!clientSecretFilePath || clientSecretFilePath.length <= 0 ||
		!tokenPath || tokenPath.length <= 0)
		throw new Error("Wrong arguments for sheets provider");

	var sheets = google.sheets('v4');
	
	var authorizer = new googleAuthorizer({
		clientSecretFilePath: clientSecretFilePath,
		tokenPath: tokenPath,
		scopes: ['https://www.googleapis.com/auth/spreadsheets']
	});

	var module = {};

	module.log = function() {
		console.info(spreadSheetId);
	}


	module.getRowsForRange = function(spreadSheetId, range, onSuccess, onError)  {

		var getTheRows = function(auth) {

			var sheets = google.sheets('v4');
			sheets.spreadsheets.values.get({
				range: range,
				spreadsheetId: spreadSheetId,
				auth: auth,
			}, function(err, response) {
				if(err) {
					onError && onError(err);
					return;
				}
				onSuccess && onSuccess(response.values);
			});
		}


		authorizer.authorizeForCallback(getTheRows, onError);

	}

	module.clearRange = function(spreadSheetId, range, onSuccess, onError) {

		authorizer.authorizeForCallback(function(auth) {
			var request = {
				// The ID of the spreadsheet to update.
				spreadsheetId: spreadSheetId,
				// The A1 notation of the values to clear.
				range: range,
				auth: auth,
			};

			sheets.spreadsheets.values.clear(request, function(err, response) {
				if (err) {
					onError && onError(err);
					return;
				}

				onSuccess && onSuccess(response);
			});
		}, onError);
	}

	module.sendDreamDonutFeedback = function(spreadSheetId, data, onSuccess, onError) {

		console.log(data);

		function sendResponse(auth) {
			var requests = [];


			var dateCreated = dateFormat(new Date(), "m/dd/yyyy h:MM:ss") + "";
			var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
			var secondDate = new Date();
			var firstDate = new Date(1899,11,30);
			var diffDays = Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay));

			console.log("pushing content");

			requests.push({
				appendCells: {
					//sheetId: 533344754,
					rows: [
						{
						values: [
							{
								userEnteredValue: {numberValue: diffDays},
								userEnteredFormat: {
									numberFormat: {
										type: "DATE_TIME",
	          							"pattern": "m/d/yyyy h:mm:ss"
									}
								} 
							}, {
								userEnteredValue: {stringValue: data.birthDate}
							}, {
								userEnteredValue: {stringValue: data.birthWeekDay}
							}, {
								userEnteredValue: {stringValue: data.gotDonut}
							}, {
								userEnteredValue: {numberValue: data.satisfactionRating}
							}
							]
						}
					],
					fields: 'userEnteredValue'
				}
			});


			var batchUpdateRequest = {requests: requests}

			sheets.spreadsheets.batchUpdate({
				auth: auth,
				spreadsheetId: spreadSheetId,
				resource: batchUpdateRequest
			}, function(err, response) {
				if(err) {
					// Handle error
					onError && onError(err);
					return;
				}
				onSuccess && onSuccess(response);
			});
		}

			console.log("pushing content");
		authorizer.authorizeForCallback(sendResponse, onError);
	}


	module.signDACAPetition = function(spreadSheetId, signeeInfo, onSuccess, onError) {

		function sendUniqueSignature() {
			var sendDACAPetitionSignature = function(auth) {
				var requests = [];

				var dateCreated = dateFormat(new Date(), "mm/dd/yyyy h:MM:ss")
				requests.push({
					appendCells: {
						rows: [{
							values: [{
								userEnteredValue: {stringValue: signeeInfo.fullname}
							}, {
								userEnteredValue: {stringValue: signeeInfo.email}
							}, {
								userEnteredValue: {stringValue: signeeInfo.organization}
							}, {
								userEnteredValue: {stringValue: signeeInfo.iam}
							}, {
								userEnteredValue: {stringValue: signeeInfo.iamspecific}
							}, {
								userEnteredValue: {stringValue: (new Date()).toISOString()}
							}]
						}],
						fields: 'userEnteredValue'
					}
				});

				var batchUpdateRequest = {requests: requests}

				sheets.spreadsheets.batchUpdate({
					auth: auth,
					spreadsheetId: spreadSheetId,
					resource: batchUpdateRequest
				}, function(err, response) {
					if(err) {
						// Handle error
						onError && onError(err);
						return;
					}
					onSuccess && onSuccess(response);
				});
			}

			authorizer.authorizeForCallback(sendDACAPetitionSignature, onError);
		}

		var getKeyRows = function(auth) {

			var sheets = google.sheets('v4');
			sheets.spreadsheets.values.get({
				range: "Sheet1",
				"majorDimension": "COLUMNS",
				spreadsheetId: spreadSheetId,
				auth: auth,
			}, function(err, response) {
				if(err) {
					onError && onError(err);
					return;
				}
				if(response.values.length <= 0) {
					onError && onError("No Values");
					return;
				}
				//lets prevent duplicate names
				var namesArray = response.values[0]
				if(namesArray.indexOf(signeeInfo.fullname) < 0) {
					sendUniqueSignature();
				} else {
					//send a succesful response so that we don't have to interrupt the client
					onSuccess && onSuccess();
				}
			});
		}

	}

	module.sendLobbyForm = function(spreadSheetId, data, onSuccess, onError) {

		function sendUniqueResponse() {
			var sendResponse = function(auth) {
				var requests = [];


				var dateCreated = dateFormat(new Date(), "m/dd/yyyy h:MM:ss") + "";

				var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
				var secondDate = new Date();
				var firstDate = new Date(1899,11,30);

				var diffDays = Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay));

				requests.push({
					appendCells: {
						sheetId: 533344754,
						rows: [{
							values: [{
								userEnteredValue: {numberValue: diffDays},
								userEnteredFormat: {
									numberFormat: {
										type: "DATE_TIME",
              							"pattern": "m/d/yyyy h:mm:ss"
									}
								} 
							}, {
								userEnteredValue: {stringValue: data.name}
							}, {
								userEnteredValue: {stringValue: data.email}
							}, {
								userEnteredValue: {numberValue: parseInt((data.phone + '').replace("(", "").replace(")", "").replace("-", "").replace(" ", ""))}
							}, {
								userEnteredValue: {numberValue: data.zip}
							}, {
								userEnteredValue: {stringValue: data.exp}
							}, {
								userEnteredValue: {stringValue: data.otherExp ? data.otherExp : ""}
							}]
						}],
						fields: 'userEnteredValue'
					}
				});

				var batchUpdateRequest = {requests: requests}

				sheets.spreadsheets.batchUpdate({
					auth: auth,
					spreadsheetId: spreadSheetId,
					resource: batchUpdateRequest
				}, function(err, response) {
					if(err) {
						// Handle error
						onError && onError(err);
						return;
					}
					onSuccess && onSuccess(response);
				});
			}

			authorizer.authorizeForCallback(sendResponse, onError);
		}

		var getKeyRows = function(auth) {

			var sheets = google.sheets('v4');
			sheets.spreadsheets.values.get({
				range: "Form Responses 1",
				"majorDimension": "COLUMNS",
				spreadsheetId: spreadSheetId,
				auth: auth,
			}, function(err, response) {
				if(err) {
					onError && onError(err);
					return;
				}
				if(response.values.length <= 0) {
					onError && onError("No Values");
					return;
				}
				//lets prevent duplicate emails
				var emailsArray = response.values[0]
				if(emailsArray.indexOf(data.email) < 0) {
					sendUniqueResponse();
				} else {
					//send a succesful response so that we don't have to interrupt the client
					onSuccess && onSuccess();
				}
			});
		}

		authorizer.authorizeForCallback(getKeyRows, onError);
	}


	module.batchEventbriteUndocuAllyData = function(spreadSheetId, data, onSuccess, onError) {

		function writeTheData(auth) {
			var requests = [];
			var rows = [];

			for(var i = 0; i < data.length; i++) {
				var attendees = data[i].attendees.attendees;
				var eventDate = dateFormat(new Date(data[i].start.utc), "mm/dd/yyyy")
				for(var j = 0; j < attendees.length; j++) {
					rows.push({
							values: [{
								userEnteredValue: {stringValue: eventDate}
							}, {
								userEnteredValue: {stringValue: attendees[j].profile.first_name}
							}, {
								userEnteredValue: {stringValue: attendees[j].profile.last_name}
							}, {
								userEnteredValue: {stringValue: attendees[j].profile.email}
							}]
						}
					);
				}

				//empty row
				rows.push({values: [{userEnteredValue: {stringValue: ""}}]});
			}

			requests.push({
				appendCells: {
					rows: rows,
					fields: 'userEnteredValue'
				}
			});

			var batchUpdateRequest = {requests: requests}

			sheets.spreadsheets.batchUpdate({
				auth: auth,
				spreadsheetId: spreadSheetId,
				resource: batchUpdateRequest
			}, function(err, response) {
				if(err) {
					// Handle error
					onError && onError(err);
					return;
				}
				onSuccess && onSuccess(response);
			});
		}


		authorizer.authorizeForCallback(writeTheData, onError);
	}


	return module;
};


module.exports = googleSheetsProvider;