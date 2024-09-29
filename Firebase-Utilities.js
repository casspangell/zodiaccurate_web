//
// SAVE initial entry to Firebase
//
function saveEntryToFirebase(jsonData, uuid) {
    uuid = TEST_USER;
    jsonData = getUserDataFromFirebase(uuid);
    Logger.log("LOOKING FOR TIMEZONE: "+JSON.stringify(jsonData));

    //Save initial entry to the responses table
    var firebaseUrl = firebase_BaseURL + "responses/" + uuid + ".json";

    var options = {
        "method": "put",
        "contentType": "application/json",
        "payload": JSON.stringify(jsonData)
    };

    var response = UrlFetchApp.fetch(firebaseUrl, options);
    uuid = TEST_USER;
    saveTimezoneToFirebase(uuid, jsonData);

    // var location = getLocationFromResponse(JSON.stringify(jsonData));
    // var timezoneData = getTimeZoneFromLocation(location);
    // if (!timezoneData) {
    //     timezoneData.timeZoneId = "America/Chicago"; //set to a default
    //     timezoneData.gmtOffset = "GMT-5";
    //     Logger.log("Could not retrieve timezone data.");
    // }
    //
    // var firebaseZodiacUrl = firebase_BaseURL + "zodiac/" + uuid + ".json";
    //
    // var timezonePayload = {
    //     "timezone": timezoneData.timeZoneId,
    //     "gmtOffset": timezoneData.gmtOffset,
    //     ...jsonData
    // };
    //
    // var optionsZodiac = {
    //     "method": "put",
    //     "contentType": "application/json",
    //     "payload": JSON.stringify(timezonePayload)
    // };



    // Logger.log("Successfully saved to both responses and zodiac tables.");
}

function getTimezoneFromResponse(firebaseResponse) {
    var parsedResponse = typeof firebaseResponse === 'string' ? JSON.parse(firebaseResponse) : firebaseResponse;
    var currentLocation = parsedResponse["Your Current Location"];

    if (currentLocation) {
        Logger.log("Current Location: " + currentLocation);
        return getTimeZoneFromLocation(currentLocation);
    } else {
        Logger.log("Current Location data not found.");
        return null;
    }
}

//
// SAVE single entry to secondary Firebase DB
// UUID: email
//
function saveToFirebaseEmailCapture(jsonData, uuid) {
    var firebaseUrl = firebase_BaseURL+"emailcapture/" + uuid + ".json";

    var options = {
        "method": "put", 
        "contentType": "application/json",
        "payload": JSON.stringify(jsonData)
    };
    
    var response = UrlFetchApp.fetch(firebaseUrl, options);
}

//
// GET single user from Firebase
//
function getUserDataFromFirebase(uuid) {

    var firebaseUrl = firebase_BaseURL+"responses/" + uuid + ".json";
    Logger.log("Getting User Data from Database "+firebaseUrl);
    var options = {
        "method": "get",
        "headers": {
            "Content-Type": "application/json"
        }
    };

    try {
        var response = UrlFetchApp.fetch(firebaseUrl, options);
        var userData = JSON.parse(response.getContentText());

        // Check if userData is null or not an object
        if (!userData || typeof userData !== 'object') {
            console.log("No data found for UUID: " + uuid + " or data is not an object.");
            return null;  // Return null if no valid data is found
        }

        console.log("Retrieved Data for UUID: " + uuid);
        console.log(JSON.stringify(userData));  // Log the user data as a JSON string
        return userData;

    } catch (e) {
        // Log any errors during fetch or parsing
        console.log("Error retrieving data for UUID " + uuid + ": " + e.message);
        return null;  // Return null if an error occurs
    }
}

//
// GET last entry from Firebase
//
// function getLastEntryFromFirebase() {
//     var firebaseUrl = firebase_BaseURL+"responses.json";
//     var options = {
//         "method": "get",
//         "headers": {
//             "Content-Type": "application/json"
//         }
//     };
//
//     try {
//         var response = UrlFetchApp.fetch(firebaseUrl, options);
//         var data = JSON.parse(response.getContentText());
//
//         // Check if data is null or not an object
//         if (!data || typeof data !== 'object') {
//             console.log("No data found in the database or data is not an object.");
//             return null;  // Return null if no valid data is found
//         }
//
//         var keys = Object.keys(data);
//
//         // Check if there are no keys in the data
//         if (keys.length === 0) {
//             console.log("No entries found in the database.");
//             return null;  // Return null if the data object is empty
//         }
//
//         var lastEntry = data[keys[keys.length - 1]];
//
//         console.log("Retrieved Last Entry from Database:");
//         console.log(JSON.stringify(lastEntry));  // Log the last entry as a JSON string
//         return lastEntry;
//
//     } catch (e) {
//         // Log any errors during fetch or parsing
//         console.log("Error retrieving data from Firebase: " + e.message);
//         return null;  // Return null if an error occurs
//     }
// }

//
// GET previous day from Firebase
//
function getPreviousDayFromFirebase(uuid) {
    var daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    var today = new Date();
    var dayOfWeek = daysOfWeek[today.getDay()-1]; //previous day

    var firebaseUrl = firebase_BaseURL+"zodiac/" + uuid + "/" + dayOfWeek + ".json";
    var options = {
        "method": "get",
        "headers": {
            "Content-Type": "application/json"
        }
    };

    try {
        var response = UrlFetchApp.fetch(firebaseUrl, options);
        var data = JSON.parse(response.getContentText());

        // Check if data is null or undefined
        if (!data || typeof data !== 'object') {
            console.log("No data found for " + dayOfWeek + " in the database or data is not an object.");
            return null;
        }

        var keys = Object.keys(data);

        // Check if there are no keys in the data
        if (keys.length === 0) {
            console.log("No entries found for " + dayOfWeek + " in the database.");
            return null;
        }

        var lastEntry = data[keys[keys.length - 1]];

        console.log("Retrieved " + dayOfWeek + " from Database:");
        console.log(lastEntry);

        return lastEntry;

    } catch (e) {

        console.log("Error retrieving data from Firebase: " + e.message);
        return null;
    }
}

function saveTimezoneToFirebase(uuid, jsonData) {
    var location = getLocationFromResponse(JSON.stringify(jsonData));
    var timezoneData = getTimeZoneFromLocation(location);
    if (!timezoneData) {
        timezoneData.timeZoneId = "America/Chicago"; //set to a default
        timezoneData.gmtOffset = "GMT-5";
        Logger.log("Could not retrieve timezone data.");
    }

    var firebaseZodiacUrl = firebase_BaseURL + "timezone/" + timezoneData.gmtOffset + ".json";

    var timezonePayload = {
        [uuid]: timezoneData.gmtOffset,
    };

    var optionsZodiac = {
        "method": "patch",
        "contentType": "application/json",
        "payload": JSON.stringify(timezonePayload)
    };

    try {
        var response = UrlFetchApp.fetch(firebaseZodiacUrl, optionsZodiac);
        Logger.log("Saved timezone data to Firebase.");
    } catch (e) {

        console.log("Error saving timezone data to Firebase: " + e.message);
        return null;
    }
}

function saveDayToFirebase(jsonData, uuid) {

    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date();
    var dayOfWeek = daysOfWeek[today.getDay()];
    console.log("FU-Saving "+dayOfWeek);

    // var formattedDate = Utilities.formatDate(today, Session.getScriptTimeZone(), "yyyy-MM-dd");
    // console.log("FU-Saving horoscope for date: " + formattedDate);

    // var horoscopeDataWithDate = {
    //     ...jsonData,
    //     "date": formattedDate
    // };

    // console.log("F saveDay: "+horoscopeDataWithDate);
console.log("DATABASE STRING: "+firebase_BaseURL+"zodiac/" + uuid + "/" + dayOfWeek + ".json");
    var firebaseUrl = firebase_BaseURL+"zodiac/" + uuid + "/" + dayOfWeek + ".json";
    Logger.log("Data being sent to database: "+JSON.stringify(jsonData));
    var options = {
        "method": "patch",
        "contentType": "application/json",
        "payload": JSON.stringify(jsonData)
    };

    try {
        var response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("FU-Saving entry to Firebase: " + response.getContentText());
    } catch (e) {
        Logger.log("FU-Error saving entry to Firebase: " + e.message);
    }
}

//
// GET one day from Firebase to send in email
//
function getContentFromFirebase(uuid, dayOfWeek) {



    try {
        // Navigate to the path where the content is stored
        var contentString = firebaseData.zodiac.saturday.choices[0].message.content;

        // Log the extracted content or store it in a variable
        Logger.log("Extracted Content: " + contentString);

        // Return the content string for further processing
        return contentString;
    } catch (error) {
        Logger.log("Error accessing content: " + error.message);
        return null;
    }
}

function getThreeDaysDataFromFirebase(uuid) {
    // uuid = "2_ABaOnudHJDNujgsYR5qZauZ8YyqNuNquPv0Zp4pbNguVavEEZxU2iXyEXdbu0XmZDOkNsII";
    console.log("FB- getThreeDaysDataFromFirebase uuid "+ uuid);
    var firebaseUrl = firebase_BaseURL+"zodiac/" + uuid + ".json";

    var options = {
        "method": "GET",  // Use GET to retrieve the data
        "contentType": "application/json"
    };

    try {
        var response = UrlFetchApp.fetch(firebaseUrl, options);
        var data = JSON.parse(response.getContentText());
        var daysOfTheWeekData = {};  // Initialize as an empty object

        if (data) {
            Logger.log("Data retrieved for UUID: " + uuid);
            
            var daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            var today = new Date();
            var dayOfWeek = daysOfWeek[today.getDay()];

            for (var i = 1; i <= 3; i++) {
              var day = daysOfWeek[today.getDay()-i];
              if (data.hasOwnProperty(day)) { 
                daysOfTheWeekData[day] = data[day];
                Logger.log(day + ": " + JSON.stringify(data[day]));
              } else {
                    Logger.log(day + ": No data available.");
                }
            }
            // daysOfWeek.forEach(function(day) {
            //     if (data.hasOwnProperty(day)) {  // Check if the day exists in the data
            //         daysOfTheWeekData[day] = data[day];
            //         // Logger.log(day + ": " + JSON.stringify(data[day]));
            //     } else {
            //         Logger.log(day + ": No data available.");
            //     }
            // });

            return createJsonModel(daysOfTheWeekData);
        } else {
            Logger.log("No data found for UUID: " + uuid);
            return null;
        }

    } catch (e) {
        Logger.log("Error retrieving data from Firebase: " + e.message);
        return null;
    }
}

function pullHoroscopeFromFirebase(uuid, day) {
    console.log("pulling horoscope from database "+uuid);

    var daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    var today = new Date();
    var dayOfWeek = daysOfWeek[today.getDay()];

    var firebaseUrl = firebase_BaseURL+"zodiac/" + uuid + "/"+dayOfWeek+".json";

    var options = {
        "method": "GET",
        "contentType": "application/json"
    };

    try {
        var response = UrlFetchApp.fetch(firebaseUrl, options);
        var data = JSON.parse(response.getContentText());

        if (data) {
            Logger.log("Data retrieved for UUID: " + uuid);
            Logger.log(data);

            try {
                Logger.log("data.choices[0].message.content: "+data.choices[0].message.content)

                return JSON.parse(data.choices[0].message.content);
            } catch (error) {
                console.error("Error extracting horoscope content: ", error);
                return null;
            }

        } else {
            Logger.log("No data found for UUID: " + uuid);
            return null;
        }

    } catch (e) {
        Logger.log("Error retrieving data from Firebase: " + e.message);
        return null;
    }
}




