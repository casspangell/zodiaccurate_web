const HoroscopeStringEnum = {
  overview: "Overview",
  careerAndFinances: "Career and Finances",
  health: "Health",
  localWeather: "Local Weather",
  parentingGuidance: "Parenting Guidance",
  personalGuidance: "Personal Guidance",
  relationships: "Relationships",
  generalOutlook: "General Outlook",
  healthAndWellness: "Health and Wellness",
  familyAndRelationships: "Family and Relationships",
  emotionalAndMentalWellBeing: "Emotional and Mental WellBeing",
  practicalTips: "Practical Tips"
};

function getEnumValue(key) {
    return HoroscopeStringEnum[key.toLowerCase()] || null;
}

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
  var parsedContent = JSON.stringify(jsonResponse);
  parsedContent = parsedContent.replace(/\\/g, '');

  try {
        parsedContent = JSON.parse(parsedContent);
      var horoscope = {};

      horoscope.Overview = parsedContent["Overview"] ?? null;
      horoscope.GeneralOutlook = parsedContent["General Outlook"] ?? null;
      horoscope.CareerAndFinances = parsedContent["Career And Finances"] ?? null;
      horoscope.Health = parsedContent["Health"] ?? null;
      horoscope.HealthAndWellness = parsedContent["Health And Wellness"] ?? null;
      horoscope.LocalWeather = parsedContent["Local Weather"] ?? null;
      horoscope.ParentingGuidance = parsedContent["Parenting Guidance"] ?? null;
      horoscope.PersonalGuidance = parsedContent["Personal Guidance"] ?? null;
      horoscope.EmotionalAndMentalWellBeing = parsedContent["Emotional And Mental WellBeing"] ?? null;
      horoscope.Relationships = parsedContent["Relationships"] ?? null;
      horoscope.FamilyAndRelationships = parsedContent["Family And Relationships"] ?? null;
      horoscope.PracticalTips = parsedContent["Practical Tips"] ?? null;

      console.log("HOROSCOPE: " + JSON.stringify(horoscope));
      return horoscope;
    } catch (error) {
        console.error("Failed to parse JSON: ", error);
        return null;
    }
}



// function getHoroscopeString(horoscope) {
//     // Initialize an empty string to store the horoscope sections
//     var horoscopeString = '';
//
//     // Check if 'horoscope' is a string and parse it into an object
//     if (typeof horoscope === 'string') {
//         try {
//             horoscope = JSON.parse(horoscope);  // Parse JSON string into an object
//         } catch (e) {
//             console.log("Error parsing JSON: " + e.message);
//             return;  // Exit the function if JSON parsing fails
//         }
//     }
//
//     // Iterate over the horoscope object directly
//     for (var key in horoscope) {
//         if (horoscope.hasOwnProperty(key)) {
//             var sectionContent = horoscope[key];
//             var formattedKey = getFormattedHoroscopeString(key);
//
//             if (formattedKey !== "Local Weather") {
//                 // Format other sections with header and content
//                 horoscopeString += `
//                 <div class="section">
//                     <h2>${formattedKey}</h2>
//                     <p>${sectionContent}</p>
//                 </div>
//                 `;
//             } else {
//                 // Add the "Local Weather" section as a quote block
//                 horoscopeString += `
//                 <div class="quote">
//                     <p>${sectionContent}</p>
//                 </div>
//                 `;
//             }
//         }
//     }
//
//     return horoscopeString;
// }

function getFormattedHoroscopeString(key) {
  return HoroscopeStringEnum[getEnumValue(key)] || key; // Return the formatted string or the key if not found
}

function createHoroscopeJsonForDatabase(data) {
    try {
        // First, parse the main JSON response
        var parsedData = JSON.parse(data);

        var contentString = parsedData.choices[0].message.content;
        var content;

        // Try parsing the content normally first
        try {
            let newContentString = contentString.replace(/```json\n|```/g, '');
            let cleanedData = newContentString.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            content = JSON.parse(cleanedData);
        } catch (innerError) {
            // If content parsing fails, handle the backticks case
            Logger.log("Initial content parsing failed. Attempting to handle backticks...");
            contentString = contentString.replace(/```json\n|```/g, '');
            var cleanedData = contentString.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            content = JSON.parse(cleanedData);
        }

        // Initialize the Horoscope object
        var horoscopeJson = {
            "Horoscope": {}
        };

        // Iterate over each key in the content object
        for (var key in content) {
            // Check if the content is a string (e.g., in the latest response)
            if (typeof content[key] === 'string') {
                horoscopeJson.Horoscope[key.replace(/_/g, " ")] = {
                    "content": content[key]
                };
            } else if ((content[key].hasOwnProperty('title') || content[key].hasOwnProperty('Title')) &&
                (content[key].hasOwnProperty('content') || content[key].hasOwnProperty('Content'))) {

                horoscopeJson.Horoscope[key.replace(/_/g, " ")] = {
                    "title": content[key].title || content[key].Title,
                    "content": content[key].content || content[key].Content
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

function createHoroscopeJsonForEmail(data) {
    try {
        var content = JSON.parse(data);

        var horoscopeJson = {
            "Horoscope": {}
        };

        for (var key in content) {
            if (content.hasOwnProperty(key)) {
                // Assume content is a string since that's the format of your data
                horoscopeJson.Horoscope[key.replace(/_/g, " ")] = {
                    "content": content[key]
                };
            }
        }

        return JSON.stringify(horoscopeJson, null, 2);
    } catch (error) {
        Logger.log("Error processing data: " + error.message);
        return null;
    }
}


