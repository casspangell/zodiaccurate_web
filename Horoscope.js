const HoroscopeStringEnum = {
  overview: "Overview",
  careerAndFinances: "Career and Finances",
  health: "Health",
  localWeather: "Local Weather",
  parentingGuidance: "Parenting Guidance",
  personalGuidance: "Personal Guidance",
  relationships: "Relationships"
};

class HoroscopeModel {
  constructor() {
    this.overview = null;
    this.careerAndFinances = null;
    this.health = null;
    this.localWeather = null;
    this.parentingGuidance = null;
    this.personalGuidance = null;
    this.relationships = null;
  }

  // Methods to set each property
  setOverview(overviewText) {
    this.overview = overviewText;
  }

  setCareerAndFinances(careerAndFinancesText) {
    this.careerAndFinances = careerAndFinancesText;
  }

  setHealth(healthText) {
    this.health = healthText;
  }

  setLocalWeather(localWeatherText) {
    this.localWeather = localWeatherText;
  }

  setParentingGuidance(parentingGuidanceText) {
    this.parentingGuidance = parentingGuidanceText;
  }

  setPersonalGuidance(personalGuidanceText) {
    this.personalGuidance = personalGuidanceText;
  }

  setRelationships(relationshipsText) {
    this.relationships = relationshipsText;
  }
}

function parseHoroscopeResponse(jsonResponse) {
  // Parse the JSON response to extract the horoscope content
  var parsedContent = JSON.parse(jsonResponse);
  console.log("HM - Parsed Content: " + JSON.stringify(parsedContent));

  // Create an empty object
  var horoscope = {};

  // Extract and set the values in the horoscope object
  if (parsedContent.Horoscope.Overview) {
    horoscope.Overview = parsedContent.Horoscope.Overview;
  }

  if (parsedContent.Horoscope["Career and Finances"]) {
    horoscope.CareerAndFinances = parsedContent.Horoscope["Career and Finances"];
  }

  if (parsedContent.Horoscope.Health) {
    horoscope.Health = parsedContent.Horoscope.Health;
  }

  if (parsedContent.Horoscope["Local Weather"]) {
    horoscope.LocalWeather = parsedContent.Horoscope["Local Weather"];
  }

  if (parsedContent.Horoscope["Parenting Guidance"]) {
    horoscope.ParentingGuidance = parsedContent.Horoscope["Parenting Guidance"];
  }

  if (parsedContent.Horoscope["Personal Guidance"]) {
    horoscope.PersonalGuidance = parsedContent.Horoscope["Personal Guidance"];
  }

  if (parsedContent.Horoscope.Relationships) {
    horoscope.Relationships = parsedContent.Horoscope.Relationships;
  }

  console.log("HOROSCOPE: " + JSON.stringify(horoscope));
  return horoscope; // Return the populated horoscope object
}



function getHoroscopeString(horoscope) {
    // Initialize an empty string to store the horoscope sections
    var horoscopeString = '';

    // Check if 'horoscope' is a string and parse it into an object
    if (typeof horoscope === 'string') {
        try {
            horoscope = JSON.parse(horoscope);  // Parse JSON string into an object
        } catch (e) {
            console.log("Error parsing JSON: " + e.message);
            return;  // Exit the function if JSON parsing fails
        }
    }

    // Iterate over the horoscope object directly
    for (var key in horoscope) {
        if (horoscope.hasOwnProperty(key)) {
            var sectionContent = horoscope[key];
            var formattedKey = getFormattedHoroscopeString(key);
            
            if (formattedKey !== "Local Weather") {
                // Format other sections with header and content
                horoscopeString += `
                <div class="section">
                    <h2>${formattedKey}</h2>
                    <p>${sectionContent}</p>
                </div>
                `;
            } else {
                // Add the "Local Weather" section as a quote block
                horoscopeString += `
                <div class="quote">
                    <p>${sectionContent}</p>
                </div>
                `;
            }
        }
    }

    return horoscopeString;
}

function getFormattedHoroscopeString(key) {
  return HoroscopeStringEnum[key] || key; // Return the formatted string or the key if not found
}

function createHoroscopeJson(data) {
    try {
        // First, parse the main JSON response
        var parsedData = JSON.parse(data);

        var contentString = parsedData.choices[0].message.content;
        var content;

        // Try parsing the content normally first
        try {
            content = JSON.parse(contentString);
        } catch (innerError) {
            // If content parsing fails, handle the backticks case
            Logger.log("Initial content parsing failed. Attempting to handle backticks...");
            contentString = contentString.replace(/```json\n|```/g, '');
            content = JSON.parse(contentString);
        }

        // Initialize the Horoscope object
        var horoscopeJson = {
            "Horoscope": {}
        };

        // Iterate over each key in the content object
        for (var key in content) {
            // Check if the content is a string (e.g., in the latest response)
            if (typeof content[key] === 'string') {
                // Add the content as a string
                horoscopeJson.Horoscope[key.replace(/_/g, " ")] = {
                    "content": content[key]
                };
            } else if (content[key].hasOwnProperty('title') && content[key].hasOwnProperty('content')) {
                // If it's the original format with title and content
                horoscopeJson.Horoscope[key.replace(/_/g, " ")] = {
                    "title": content[key].title,
                    "content": content[key].content
                };
            }
        }

        // Return the constructed Horoscope JSON object
        return JSON.stringify(horoscopeJson, null, 2);
    } catch (error) {
        Logger.log("Error processing data: " + error.message);
        return null;
    }
}

