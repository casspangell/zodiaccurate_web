// Function to access the Google Sheet
function getSpreadsheet(spreadsheetId, sheetType) {
  var service = getOAuth2Service(); //Found in API-Utilities.gs
  let sheet = SpreadsheetApp.openById(spreadsheetId);
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

// function testAccess() {
//   const spreadsheetId = mainSheetId;
//   try {
//     const sheet = SpreadsheetApp.openById(spreadsheetId);
//     Logger.log(`Successfully accessed spreadsheet: ${sheet.getName()}`);
//   } catch (error) {
//     Logger.log(`Error: ${error.message}`);
//   }
// }