//                                         //
// THIS IS WHAT YOU RUN TO TEST EVERYTHING //
//                                         //
function prepareChatGPTResponse(uuid){
  console.log("PREPARE CHATGPT");
  var jsonSinglePersonData = {};

  //This is a test user, you can change this:
  jsonSinglePersonData = getUserDataFromFirebase(TEST_USER); //TODO: REMOVE ME
  // jsonSinglePersonData = getUserDataFromFirebase(uuid);
  //   console.log("PERSONAL DATA: "+jsonSinglePersonData);

  var emailAddress = "";
  var uuid = "";
  var editUrl = "";

  for (var key in jsonSinglePersonData) {
    if (jsonSinglePersonData.hasOwnProperty(key)) {
        var value = jsonSinglePersonData[key];
        if (key.trim() == "Email Address") {
          emailAddress = value;
        }
        if (key.trim() == "Edit Response URL") {
          editUrl = value;
          uuid = generateUUID(editUrl);
          console.log("UUID1 = "+uuid);
        }
    }
  }

  const prompt = getChatInstructions(jsonSinglePersonData, uuid);

  getChatGPTResponse(prompt, jsonSinglePersonData, uuid, emailAddress);
}

function getChatGPTResponse(instructions, jsonData, uuid, emailAddress) {
  var apiKey = getChatGPTApiKey();
  var url = 'https://api.openai.com/v1/chat/completions';

  var prompt = instructions;

  var payload = {
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
            "content": prompt
        }
    ]
};

  var options = {
    "method": "post",
    "headers": {
      "Authorization": "Bearer " + apiKey,
      "Content-Type": "application/json"
    },
    "payload": JSON.stringify(payload)
  };

  var jsonResponse = UrlFetchApp.fetch(url, options);
    console.log("GET CHATGPT RESPONSE: "+jsonResponse);

  if (isValidJson(jsonResponse)) {
    var parsedResponse = JSON.parse(jsonResponse.getContentText());

    if (parsedResponse.choices && parsedResponse.choices.length > 0) {

      console.log("RESPONSE DATA: "+JSON.stringify(parsedResponse));

      var responseData = createHoroscopeJsonForDatabase(JSON.stringify(parsedResponse));

      // Check if jsonModel is a valid JSON object and save/send it if it is
      if (responseData != null) {

          // // Safety check: Ensure 'choices' exists and is not empty
          // if (responseData.choices && responseData.choices.length > 0) {
          //     // Access the 'content' field from the first choice
          //     const content = responseData.choices[0].message.content;
          //
          //     console.log("Extracted Content: ", content);
          // } else {
          //     console.log("Choices array is missing or empty.");
          // }

          saveDayToFirebase(parsedResponse, uuid);
          // sendHoroscopeEmail(responseData, emailAddress);
      } else {
          console.log("INVALID JSON MODEL: " + responseData); // Log invalid JSON
      }
    } else {
        console.log("Unexpected API response structure: " + responseData); // Ensure full response is logged
    }
  } else {
    parseHtmlToJson(pData);
  }
}

function getChatInstructions(jsonSinglePersonData, uuid) {
  console.log("Z-GET CHAT INSTRUCTIONS");
  var modifiers = getRandomModifiers();
  var getWeekData = getThreeDaysDataFromFirebase(uuid);

  var prompt =  "You are a highly knowledgeable and empathetic astrology and personal guidance. Here is supplied json user data that will be used in creating the horoscope:"+JSON.stringify(jsonSinglePersonData)+"  Your task is to create a daily, personalized horoscope for this person, incorporating astrological insights, psychological principles, and practical advice. Use their name sparingly to maintain a natural tone. Use their partners or childrens names the same way. Each section should be comprehensive, offering detailed insights and practical guidance, while maintaining a tone that is casual, empathetic, friendly, and professional. Include actionable advice for every section, reflections on recent experiences, and specific recommendations tailored to the individual's circumstances. Ensure each category contains 3-4 sentences, if they have multiple kids, parenting advise can be up to 6 sentences. In offering guidance do not directly repeat the words used in their personalized answers. Ensure that each piece of advice or suggestion reflects the individual's unique circumstances." +
`
<!DOCTYPE html>
<html lang="en">
<body>
    <div class="container">
        <div class="header">
            <img src="cid:zodiac_header" alt="Zodiaccurate Daily Guidance">
        </div>
        <div class="content">
            <!-- Populate sections here -->
            <div class="section">
                <h2>Date</h2>
                <p>Date being pulled</p>
            </div>
            <div class="section">
                <h2>General Outlook</h2>
                <p>Today, Paul, the stars encourage you to embrace balance and harmony in both your personal and professional life...</p>
            </div>
            <div class="section">
                <h2>Career and Finances</h2>
                <p>Your analytical skills are at their peak today, making it ideal for tackling complex problems at work...</p>
            </div>
            <div class="section">
                <h2>Health and Wellness</h2>
                <p>Physical vitality can be improved by adjusting your sleep schedule...</p>
            </div>
            <div class="section">
                <h2>Family and Relationships</h2>
                <p>As a loving father and husband, your family appreciates your supportive nature...</p>
            </div>
            <div class="section">
                <h2>Emotional and Mental Well-being</h2>
                <p>Taking a moment to reflect on thought patterns can lead to profound insights...</p>
            </div>
            <div class="section">
                <h2>Practical Tips</h2>
                <p>1. Morning Routine: Solidify your morning routine with a quick session of stretching or yoga followed by meditation...</p>
                <p>2. Family Time: Allocate specific times for uninterrupted family activities...</p>
                <p>3. Financial Planning: Revisit your budget tonight...</p>
            </div>
            <div class="quote">
                <p>Local Weather: The day in Owasso, Oklahoma, USA, will have a high of 75°F and a low of 60°F. Expect a sunny day with a few scattered clouds...</p>
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2024 Zodiaccurate. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`+

  "Focus on these sections: "+
  "Overview: Provide a comprehensive summary of the day's astrological influences, focusing on emotional, mental, and spiritual well-being. Highlight significant astrological movements (such as a new moon or trine) and their potential impact on the day. Reflect on the past three days' guidance where relevant, noting any shifts or changes in planetary alignments that could influence today's outlook: "+modifiers.overview+
  "Career and Finances: Offer detailed strategies for professional growth and financial stability, addressing both short-term actions and long-term planning. Include advice on navigating current challenges or seizing opportunities, incorporating recent astrological changes and their potential effects on career and financial decisions.Offer practical advice to enhance their financial and professional life. DO NOT   mention exact words used in the careeer personal profile, job titles or financial terms with the focus on: "+modifiers.careerAndFinances +
  "Relationships: Explore various ways to enhance emotional connections and strengthen bonds with loved ones. Provide specific scenarios or advice on improving communication, empathy, and understanding, drawing on the individual's personal relationship dynamics and the current astrological landscape. Provide specific suggestions to improve interpersonal relationships, based on both astrological insights and personal data with the focus on: "+modifiers.relationships+
  "Parenting Guidance: Deliver a variety of supportive tips tailored to each of [User's First Name]'s children, mentioning their names and specific needs. Consider developmental stages, emotional support requirements, and practical advice for addressing parenting challenges. Ensure each child receives individualized attention within the guidance. Give advice tailored to any children mentioned, considering their ages and any relevant details with the focus on: "+modifiers.parentingGuidance+
  "Health: Detail a holistic approach to well-being, incorporating advice on diet, exercise, mental health practices, and preventive care. Consider both personal health data and current astrological influences, offering actionable steps to enhance physical and emotional health. Suggest actions or considerations related to health, tailored to the personal information provided with the focus on: "+modifiers.health+
  "Personal Guidance: Focus on introspective advice that encourages self-awareness, spiritual growth, and emotional resilience. Reflect on any recent personal challenges or achievements, suggesting ways to build on these experiences in light of the day's astrological insights. With thoughtful advice on personal growth, avoiding repetition from previous days with the focus on: "+modifiers.personalGuidance+
  "Local Weather: Provide a brief weather forecast, including temperatures and conditions."+
  "Ensure that each section is unique and offers new guidance each day. Avoid technical astrological terms and keep the guidance varied by focusing on different life areas each day. The output must be in valid JSON format, with each section clearly labeled."+
  "Here is the previous day, be sure to have a significantly different output today than the week data provided here: "+getWeekData;

  var fullPrompt = prompt;

  return fullPrompt;
}

///----------------
// function scheduleZodiacGuidanceGeneration(email, clientName, response, location, editResponseUrl) {
//   var now = new Date();
//   var timezone = getTimeZone(location);
//   var oneAMToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0); // 1 AM today in user's local time
//
//   // Convert 1 AM to user's local time
//   oneAMToday = convertToTimeZone(oneAMToday, timezone);
//
//   // Check if it's past 1 AM today in user's local time, if so, set for 1 AM the next day
//   if (now.getTime() > oneAMToday.getTime()) {
//     oneAMToday.setDate(oneAMToday.getDate() + 1); // Set to 1 AM next day
//   }
//
//   var delayUntilOneAM = oneAMToday.getTime() - now.getTime();
//   Logger.log('Scheduling zodiac guidance for:', email, 'Delay:', delayUntilOneAM); // Debugging information
//   ScriptApp.newTrigger('generateAndSendZodiacGuidance')
//     .timeBased()
//     .after(delayUntilOneAM)
//     .create();
//
//   // Store the necessary data in script properties for later use
//   var properties = {
//     email: email,
//     firstName: clientName,
//     responses: JSON.stringify(response),
//     editResponseUrl: editResponseUrl,
//     timezone: timezone
//   };
//   PropertiesService.getScriptProperties().setProperties(properties);
// }