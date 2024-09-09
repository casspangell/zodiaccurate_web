// Function to access the Google Sheet
function getSpreadsheet(spreadsheetId, sheetType) {
  var service = getOAuth2Service(); //Found in API-Utilities.gs
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Form Responses 1');
    if (service.hasAccess()) {
      if (sheetType == "Private") {
        sheet = SpreadsheetApp.openById(spreadsheetId);
      }
    return sheet;
  } else {
    Logger.log('Access not granted. Please check the service account configuration.');
    return null;
  }
}

function saveToPrivateSheet(clientName, email, privateSheet) {
  if (privateSheet) {
    console.log('Saving to private sheet:', clientName, email);
    privateSheet.appendRow([clientName, email]);
  } else {
    console.log('Failed to access the private Google Sheet.');
  }
}