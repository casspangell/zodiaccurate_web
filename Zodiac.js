// Main function to prepare ChatGPT response
function prepareChatGPTResponse(uuid) {
    console.log("PREPARE CHATGPT");
    uuid = TEST_USER;
    var jsonSinglePersonData = {};

    // Fetch user data (Replace TEST_USER with actual UUID for production)
    jsonSinglePersonData = getUserDataFromFirebase(uuid);

    var emailAddress = "";
    // var uuid = "";
    var editUrl = "";

    // Extract required fields
    for (var key in jsonSinglePersonData) {
        if (jsonSinglePersonData.hasOwnProperty(key)) {
            var value = jsonSinglePersonData[key];
            if (key.trim() === "Email Address") {
                emailAddress = value;
            }
            if (key.trim() === "Edit Response URL") {
                editUrl = value;
                // uuid = generateUUID(editUrl);
                // console.log("UUID1 = " + uuid);
            }
        }
    }

    // Generate ChatGPT prompt and fetch response
    const prompt = getChatInstructions(jsonSinglePersonData, uuid);
    getChatGPTResponse(prompt, jsonSinglePersonData, uuid, emailAddress);
}

// Function to fetch ChatGPT API response
function getChatGPTResponse(instructions, jsonData, uuid, emailAddress) {
    console.log("getChatGPTResponse");
    const apiKey = getChatGPTApiKey();
    const url = 'https://api.openai.com/v1/chat/completions';

    const payload = {
        "model": "gpt-4-turbo",
        "max_tokens": 3000,
        "temperature": 1.0,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant that provides personalized horoscopes."
            },
            {
                "role": "user",
                "content": instructions
            }
        ]
    };

    const options = {
        "method": "post",
        "headers": {
            "Authorization": "Bearer " + apiKey,
            "Content-Type": "application/json"
        },
        "payload": JSON.stringify(payload)
    };

    try {
        const response = UrlFetchApp.fetch(url, options);
        const jsonResponse = JSON.parse(response.getContentText());

        console.log("GET CHATGPT RESPONSE: " + response.getContentText());

        if (jsonResponse.choices && jsonResponse.choices.length > 0) {
            const responseData = createHoroscopeJsonForDatabase(JSON.stringify(jsonResponse));

            if (responseData) {
                saveDayToFirebase(jsonResponse, uuid); // Save to Firebase
                // sendHoroscopeEmail(responseData, emailAddress); // Optional: Send horoscope via email
            } else {
                console.log("INVALID JSON MODEL: " + responseData);
            }
        } else {
            console.log("Unexpected API response structure: " + JSON.stringify(jsonResponse));
        }
    } catch (error) {
        console.log("Error retrieving ChatGPT response: " + error.message);
    }
}

// Function to construct ChatGPT instructions
function getChatInstructions(jsonSinglePersonData, uuid) {
    console.log("getChatInstructions uuid ", uuid);

    const modifiers = getRandomModifiers();
    const getWeekData = getThreeDaysDataFromFirebase(uuid);

    const prompt = `
        You are a highly knowledgeable and empathetic astrologer and personal guide. Here is user data: ${JSON.stringify(jsonSinglePersonData)}
        Your task is to create a daily, personalized horoscope for this person, incorporating astrological insights and practical advice. Focus on these sections:
        - Overview: Emotional, mental, and spiritual insights (${modifiers.overview})
        - Career and Finances: Strategies for growth (${modifiers.careerAndFinances})
        - Relationships: Emotional connections (${modifiers.relationships})
        - Parenting Guidance: Support tailored to children (${modifiers.parentingGuidance})
        - Health: Holistic well-being (${modifiers.health})
        - Personal Guidance: Introspective advice (${modifiers.personalGuidance})
        - Local Weather: Brief forecast.
        Avoid repetition, technical terms, and ensure uniqueness each day. Use the previous day’s data for reference: ${getWeekData}.
    `;

    return prompt.trim();
}

// Helper function to validate JSON
function isValidJson(response) {
    try {
        JSON.parse(response.getContentText());
        return true;
    } catch {
        return false;
    }
}

// Example Firebase Save Function (for a day)
function saveDayToFirebase(jsonData, uuid) {
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date();
    const dayOfWeek = daysOfWeek[today.getDay()];
    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}/${dayOfWeek}.json`;

    Logger.log("Saving horoscope for " + dayOfWeek + " to URL: " + firebaseUrl);

    const options = {
        method: "patch",
        contentType: "application/json",
        payload: JSON.stringify(jsonData),
        headers: {
            Authorization: `Bearer ${getFirebaseAuthToken()}`
        }
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, options);
        Logger.log("Horoscope saved to Firebase: " + response.getContentText());
    } catch (error) {
        Logger.log("Error saving horoscope to Firebase: " + error.message);
    }
}

// Function to generate a UUID from an edit URL
// function generateUUID(editUrl) {
//     return Utilities.getUuid(); // Example: Replace with your actual UUID logic if needed
// }