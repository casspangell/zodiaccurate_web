function addEntry() {
    const path = "users"; // Path where you want to add the data

    const data = {
        name: "joe",
        age: "21",
    };

    const url = `${FIREBASE_URL}/${path}.json?auth=${FIREBASE_API_KEY}`;
    const options = {
        method: "post", // Use "post" to add a new entry
        contentType: "application/json",
        payload: JSON.stringify(data),
    };

    const response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());
}

function debugServiceAccount() {
    const clientEmail = PropertiesService.getScriptProperties().getProperty("client_email");
    Logger.log("Client Email from Script Properties: " + clientEmail);
}

// Retrieve single user data from Firebase
function getUserDataFromFirebase(uuid) {
    console.log("getUserDataFromFirebase ", uuid);
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${FIREBASE_API_KEY}`;

    Logger.log("Getting User Data from Database: " + firebaseUrl);
    const authToken = FIREBASE_API_KEY;
    Logger.log("Auth Token: " + authToken);

    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        const userData = JSON.parse(response.getContentText());
        if (!userData || typeof userData !== 'object') {
            Logger.log("No data found or data is invalid for UUID: " + uuid);
            return null;
        }
        Logger.log("Retrieved data for UUID: " + uuid);
        Logger.log(userData);
        return userData;
    } catch (e) {
        Logger.log("Error retrieving data for UUID " + uuid + ": " + e.message);
        return null;
    }
}

// Save an entry to Firebase
function saveEntryToFirebase(jsonData, uuid, callback) {
    Logger.log("Saving entry to Firebase...");
    const firebaseUrl = `${FIREBASE_URL}/responses/${uuid}.json?auth=${FIREBASE_API_KEY}`;
    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(jsonData),
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("Entry saved: " + response.getContentText());
        if (callback) callback();
    } catch (e) {
        Logger.log("Error saving entry to Firebase: " + e.message);
    }
}

// Save an entry to the secondary Firebase DB for email capture
function saveToFirebaseEmailCapture(jsonData, uuid) {
    const firebaseUrl = `${FIREBASE_URL}/emailcapture/${uuid}.json?auth=${FIREBASE_API_KEY}`;
    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(jsonData),
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("Email capture saved: " + response.getContentText());
    } catch (e) {
        Logger.log("Error saving email capture to Firebase: " + e.message);
    }
}

function getThreeDaysDataFromFirebase(uuid) {
    console.log("FB- getThreeDaysDataFromFirebase uuid " + uuid);
    console.log(`${FIREBASE_URL}/zodiac/${uuid}.json`);
    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}.json?auth=${FIREBASE_API_KEY}`;

    const options = {
        method: "GET",
        contentType: "application/json",
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        const data = JSON.parse(response.getContentText());
        const daysOfTheWeekData = {};

        if (data) {
            Logger.log("Data retrieved for UUID: " + uuid);

            const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            const today = new Date();
            let dayIndex = today.getDay();

            // Get the last 3 days' data
            for (let i = 1; i <= 3; i++) {
                dayIndex = (dayIndex - 1 + 7) % 7; // Calculate previous day index
                const day = daysOfWeek[dayIndex];
                if (data.hasOwnProperty(day)) {
                    daysOfTheWeekData[day] = data[day];
                    Logger.log(day + ": " + JSON.stringify(data[day]));
                } else {
                    Logger.log(day + ": No data available.");
                }
            }

            return daysOfTheWeekData;
        } else {
            Logger.log("No data found for UUID: " + uuid);
            return null;
        }
    } catch (e) {
        Logger.log("Error retrieving data from Firebase: " + e.message);
        return null;
    }
}


// Save timezone data to Firebase
function saveTimezoneToFirebase(jsonData, uuid) {
    const location = getLocationFromResponse(JSON.stringify(jsonData));
    const timezoneData = getTimeZoneFromLocation(location) || {
        timeZoneId: "America/Chicago",
        gmtOffset: "GMT-5"
    };

    const firebaseUrl = `${FIREBASE_URL}/timezone/${timezoneData.gmtOffset}.json?auth=${FIREBASE_API_KEY}`;
    const timezonePayload = { [uuid]: uuid };

    const options = {
        method: "patch",
        contentType: "application/json",
        payload: JSON.stringify(timezonePayload),
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("Saved timezone data to Firebase.");
    } catch (e) {
        Logger.log("Error saving timezone data to Firebase: " + e.message);
    }
}

// Save data for the current day to Firebase
// Save data for the current day to Firebase
function saveDayToFirebase(jsonData, uuid) {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date();
    const dayOfWeek = daysOfWeek[today.getDay()];
    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}/${dayOfWeek}.json?auth=${FIREBASE_API_KEY}`;

    Logger.log("Saving data for day: " + dayOfWeek + " to URL: " + firebaseUrl);

    const options = {
        method: "patch",
        contentType: "application/json",
        payload: JSON.stringify(jsonData),
        headers: {
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        Logger.log("Data saved to Firebase: " + response.getContentText());
    } catch (e) {
        Logger.log("Error saving data to Firebase: " + e.message);
    }
}

// Retrieve previous day's data from Firebase
function getPreviousDayFromFirebase(uuid) {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date();
    const dayOfWeek = daysOfWeek[(today.getDay() - 1 + 7) % 7]; // Handle Sunday as previous day

    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}/${dayOfWeek}.json?auth=${FIREBASE_API_KEY}`;
    const options = {
        method: "get",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${FIREBASE_API_KEY}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        const data = JSON.parse(response.getContentText());

        if (!data || typeof data !== 'object') {
            Logger.log(`No data found for ${dayOfWeek} in the database.`);
            return null;
        }

        Logger.log(`Retrieved ${dayOfWeek} data from Firebase: ` + JSON.stringify(data));
        return data;
    } catch (e) {
        Logger.log("Error retrieving data from Firebase: " + e.message);
        return null;
    }
}
