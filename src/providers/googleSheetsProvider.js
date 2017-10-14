
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var fs = require('fs');
var readline = require('readline');
var googleAuthorizer = require('../googleAuthorizer.js');

var dateFormat = require('dateformat');

var googleSheetsProvider = function (clientSecretFilePath, tokenPath) {

	var spreadSheetId = spreadSheetId;

	if(!clientSecretFilePath || clientSecretFilePath.length <= 0 ||
		!tokenPath || tokenPath.length <= 0)
		throw new exception("Wrong arguments for sheets provider");

	var sheets = google.sheets('v4');
	
	var authorizer = new googleAuthorizer({
		clientSecretFilePath: clientSecretFilePath,
		tokenPath: tokenPath,
		scopes: ['https://www.googleapis.com/auth/spreadsheets'],
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




	return module;
};


module.exports = googleSheetsProvider;