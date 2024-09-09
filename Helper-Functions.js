function getColumnNumberByHeader(sheet, headerName) {
  // Get the header row (assuming it's the first row)
  var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Loop through the headers to find the column number
  for (var col = 0; col < headerRow.length; col++) {
    if (headerRow[col] === headerName) {
      return col + 1; // Column numbers are 1-indexed in Apps Script
    }
  }
  
  // If the header is not found, return -1 or throw an error
  return -1;
}

function getDataFromRowByHeader(sheet, headerName) {
  // Get the header row (assuming it's the first row)
  var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Find the column number for the given header name
  var columnNumber = -1;
  for (var col = 0; col < headerRow.length; col++) {
    if (headerRow[col] === headerName) {
      columnNumber = col + 1; // Columns are 1-indexed
      break;
    }
  }
  
  if (columnNumber === -1) {
    throw new Error('Header "' + headerName + '" not found.');
  }

  // Get the last row number with data in the sheet
  var lastRow = sheet.getLastRow();
  
  // Get the data from the last row in the specified column
  var lastRowData = sheet.getRange(lastRow, columnNumber).getValue();
  
  return lastRowData;
}

function sanitizeEmail(email) {
    return email.replace(/\./g,'_dot_').replace(/@/g, '_at_');  // Replace '.' with ',' and '@' with '_at_'
}

function generateUUID(formUrl) {
  var baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSexpPmDP1R22xUemGUIU3TaDNvSwZVO7c0NZ8bC9piTn-B9XQ/viewform?edit2=";
  
  var startIndex = formUrl.indexOf(baseUrl);
  
  if (startIndex !== -1) {
    return formUrl.substring(startIndex + baseUrl.length);
  } else {
    return "";
  }
}

function trimJsonFormatting(responseData) {
  // Ensure the input is a string
  responseData = String(responseData);

  // Remove the "```json\n" prefix if it exists
  if (responseData.startsWith("```json\n")) {
    responseData = responseData.slice(7); // Remove the first 7 characters
  }

  // Remove the trailing "\n```" if it exists
  if (responseData.endsWith("\n```")) {
    responseData = responseData.slice(0, -4); // Remove the last 4 characters
  }

  // Remove any remaining backticks '`' from the response
  responseData = responseData.replace(/`/g, '');

  return responseData;
}

// Example usage:
function testTrimJsonFormatting() {
  const response = "```json\n{\"key\": \"value\"}\n```";
  const trimmedResponse = trimJsonFormatting(response);
  Logger.log(trimmedResponse);  // Output: {"key": "value"}
}


// function extractJsonFromResponse(responseText) {
//     console.log("HF-Extracting Json from response");

//   if(isValidJson(responseText)) {
//     console.log("HF- Response is valid json");
//     return responseText;

//   } else {
//     console.log("HF- Response is not valid json using regex");
//     try {
//         // Convert responseText to string if it's not already
//         if (typeof responseText !== 'string') {
//             responseText = responseText.toString();
//         }

//         // Split the response by lines
//         var lines = responseText.split('\n');

//         // Initialize an object to store extracted sections
//         var extractedJson = {
//             "Overview": "",
//             "Career and Finances": "",
//             "Relationships": "",
//             "Parenting Guidance": "",
//             "Health": "",
//             "Personal Guidance": "",
//             "Local Weather": ""
//         };

//         // Regular expression to match each section heading
//         var sectionRegex = /^(?:\d+\. )?\*\*(.*?):\*\*/;

//         // Track the current section being processed
//         var currentSection = null;

//         lines.forEach(line => {
//             var match = line.match(sectionRegex);
//             if (match) {
//                 // Update current section based on the heading found
//                 currentSection = match[1];
//             } else if (currentSection && line.trim() !== "") {
//                 // Append text to the current section
//                 extractedJson[currentSection] += line.trim() + " ";
//             }
//         });

//         // Trim each section's content to clean up extra spaces
//         Object.keys(extractedJson).forEach(key => {
//             extractedJson[key] = extractedJson[key].trim();
//         });

//         return extractedJson;

//     } catch (e) {
//         console.log("Error parsing structured data from response: " + e.message);
//         return null;
//     }
//   }
// }


function extractJsonFromText(text) {
    try {
        // Use regex to find and extract JSON object from the text
        const jsonMatch = text.match(/{[\s\S]*}/);
        
        if (jsonMatch && jsonMatch.length > 0) {
            // Parse the extracted string as JSON
            const jsonObject = JSON.parse(jsonMatch[0]);
            return jsonObject;
        } else {
            return(text);
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
    }
}

function createJsonModel(responseText) {
  console.log("HF- DATA COMING IN TO BE TURNED INTO JSON: ", responseText);
    responseText = String(responseText);

    var jsonModel = {};
    
    // Split the response by double newlines to separate each section
    var sections = responseText.split(/\n\n+/);

    sections.forEach(function(section) {
        // Find the first newline to split the header and content
        var firstLineBreak = section.indexOf('\n');
        if (firstLineBreak !== -1) {
            // Extract the header and content
            var header = section.substring(0, firstLineBreak).replace(/\*\*/g, '').trim(); // Remove asterisks and trim whitespace
            var content = section.substring(firstLineBreak + 1).trim(); // Extract the content

            // Add to the JSON model
            jsonModel[header] = content;
        }
    });

    return jsonModel;
}

function parseHtmlToJson(response) {
  // Extract the content from the response
  var htmlContent = response; 
  
  // Regular expression to match headers and their associated content
  var sectionRegex = /<h2>(.*?)<\/h2>\s*<p>(.*?)<\/p>/g;
  var weatherRegex = /<div class="quote">\s*<p>(.*?)<\/p>/;

  // Object to hold the parsed sections
  var parsedSections = {};
  var match;

  // Loop through all matches of headers and paragraphs
  while ((match = sectionRegex.exec(htmlContent)) !== null) {
    var header = match[1].trim(); // Extract the header text
    var content = match[2].trim(); // Extract the paragraph text
    parsedSections[header] = content; // Add to the JSON object
  }

  // Extract the weather section separately
  var weatherMatch = weatherRegex.exec(htmlContent);
  if (weatherMatch) {
    parsedSections["Local Weather"] = weatherMatch[1].trim();
  }

  // Convert the parsed sections object to a JSON string
  var jsonString = JSON.stringify(parsedSections, null, 2);
  Logger.log(jsonString);

  return jsonString;
}

function extractFirstParagraph(description) {
  var firstParagraph = description.match(/<p>(.*?)<\/p>/);
  if (firstParagraph && firstParagraph[1]) {
    return firstParagraph[1].replace(/\n/g, ""); // Removes any newline characters
  }
  return null;
}

function isValidJson(data) {
  try {
    JSON.parse(data);
    return true;
  } catch (e) {
    Logger.log("Invalid JSON: " + e.message);
    return false;
  }
}

function getDate() {
  var date = new Date(); // Get the current date
  var timeZone = Session.getScriptTimeZone(); // Get the user's timezone
  var formattedDate = Utilities.formatDate(date, timeZone, "MMMM d, yyyy");
  return formattedDate;
}

