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
    console.log("Prompt ", prompt);
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
                "content": "You are a highly knowledgeable and empathetic astrologer and personal guide."
            },
            {
                "role": "user",
                "content": "You are a highly knowledgeable and empathetic astrologer and personal guide. Your task is to generate a personalized daily horoscope in CSV format based on the provided data. Always provide the CSV content enclosed in a markdown code block with the csv tag (e.g., csv \"Column1\",\"Column2\",\"Column3\" \"Value1\",\"Value2\",\"Value3\" ). The first row must contain column headers, and subsequent rows must contain corresponding values. Do not include any text or explanation outside the markdown block. Ensure all values are properly quoted (e.g., \"Value\"), especially if they contain commas, line breaks, or special characters. Example format: csv \"Overview\",\"Career and Finances\",\"Relationships\",\"Parenting Guidance\",\"Health\",\"Personal Guidance\",\"Local Weather\" \"Today's insights...\",\"Career advice...\",\"Relationship advice...\",\"Parenting guidance...\",\"Health tips...\",\"Personal advice...\",\"Local weather forecast...\" . Ensure the format is consistent and adheres strictly to these guidelines."
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

    const response = UrlFetchApp.fetch(url, options);
    const jsonResponse = JSON.parse(response.getContentText());

    console.log("GET CHATGPT RESPONSE: " + response.getContentText());
    const responseData = parseResponseToJson(jsonResponse);

        if (responseData && responseData.length > 0) {
                saveDayToFirebase(responseData, uuid);
                // sendHoroscopeEmail(responseData, emailAddress); // Optional: Send horoscope via email
        } else {
            console.log("Unexpected API response structure: " + JSON.stringify(responseData));
        }
}

// Function to construct ChatGPT instructions
function getChatInstructions(jsonSinglePersonData, uuid) {
    console.log("getChatInstructions uuid ", uuid);

    const modifiers = getRandomModifiers();
    const getWeekData = getThreeDaysDataFromFirebase(uuid);

    const prompt = `
        Here is user data: ${JSON.stringify(jsonSinglePersonData)}
        Your task is to create a daily, personalized horoscope for this person, incorporating astrological insights and practical advice. Focus on these sections and generate a CSV file containing the following columns and data:
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

function saveDayToFirebase(jsonData, uuid) {
    // Sanitize the keys in the JSON object
    const sanitizedData = sanitizeKeys(jsonData);

    Logger.log("saveDayToFirebase data: " + JSON.stringify(sanitizedData));

    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date();
    const dayOfWeek = daysOfWeek[today.getDay()];
    const firebaseUrl = `${FIREBASE_URL}/zodiac/${uuid}/${dayOfWeek}.json?auth=${FIREBASE_API_KEY}`;

    Logger.log("Saving horoscope for " + dayOfWeek + " to URL: " + firebaseUrl);

    const options = {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(sanitizedData[0])
    };

    try {
        const response = UrlFetchApp.fetch(firebaseUrl, { ...options, muteHttpExceptions: true });
        Logger.log("Horoscope saved to Firebase: " + response.getContentText());
    } catch (e) {
        Logger.log("Error saving horoscope to Firebase: " + e.message);
    }
}

// Function to generate a UUID from an edit URL
// function generateUUID(editUrl) {
//     return Utilities.getUuid(); // Example: Replace with your actual UUID logic if needed
// }