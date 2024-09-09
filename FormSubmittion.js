// Email Handling Script
function onFormSubmit(e) {
  var sheet = getSpreadsheet(mainSheetId, "Main"); // Access the Main Google Sheet

  if (sheet) {
    // Grab latest response
    var responseRow = sheet.getLastRow();

    var lastCol = getColumnNumberByHeader(sheet, "Edit URL");
    var email = getDataFromRowByHeader(sheet, "Email Address");
    var clientName = getDataFromRowByHeader(sheet, "Name");
    
    // Set the edit url in the last column of the doc
    var form = FormApp.openById(formId);
    var formResponses = form.getResponses();
    var formResponse = formResponses[formResponses.length-1];
    var editResponseUrl = formResponse.getEditResponseUrl();
    sheet.getRange(responseRow, lastCol).setValue(editResponseUrl);

    // Create the JSON Model
   var jsonData = {};
    if (formResponses.length > 0) {
    // Get the latest form response
    var latestFormResponse = formResponses[formResponses.length - 1];
    
    // Get all the item responses for the latest form response
    var itemResponses = latestFormResponse.getItemResponses();
    
    for (var j = 0; j < itemResponses.length; j++) {
      var itemResponse = itemResponses[j];
      var questionTitle = itemResponse.getItem().getTitle();
      var answer = itemResponse.getResponse();
      console.log(questionTitle+" "+answer);
      jsonData[questionTitle] = answer;
    }

    // Save to Main Database
    var uuid = generateUUID(editResponseUrl);
    jsonData['Edit Response URL'] = editResponseUrl;
    jsonData['Email Address'] = email;
    jsonData['UUID'] = uuid;

    saveEntryToFirebase(jsonData, uuid); //Found in Firebase-Utilities.gs 

    // Save to Email Capture Database
    var jsonDataEmailCapture = {};
    jsonDataEmailCapture['Email Address'] = email;
    jsonDataEmailCapture['Name'] = clientName;

    saveToFirebaseEmailCapture(jsonDataEmailCapture, uuid);
  }

    // Save first name and email to a separate Google Sheet
    var privateSheet = getSpreadsheet(privateSheetId, "Private");
    saveToPrivateSheet(clientName, email, privateSheet); //Found in Spreadsheet.gs

    // Send a welcome email calling from WelcomeEmail.gs
    // sendWelcomeEmail(email, clientName, editResponseUrl); 

    // Schedule the generation of zodiac guidance based on time zone 
    // scheduleZodiacGuidanceGeneration(email, clientName, formResponse, location, editResponseUrl); // Located in Zodiac.gs

    // Schedule the 3-day prior free trial expiration reminder email
    // scheduleTrialEndingReminder(email, clientName);

  }
}



