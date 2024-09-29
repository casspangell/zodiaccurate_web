// Service Account Setup

// Run this function once to set the credentials in script properties
function initialize() {
  setServiceAccountCredentials();
}

function getPrivateKey() {
  const projectId = 'zodiaccurate';  // Google Cloud Project ID
  const secretName = 'chatgpt-secret';  // Name of the secret
  const secretVersion = 'latest';  // Retrieve the latest version of the secret

  const url = `https://secretmanager.googleapis.com/v1/projects/${projectId}/secrets/${secretName}/versions/${secretVersion}:access`;

  const response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() === 200) {
    console.log("Private key successfully retrieved.");
    const result = JSON.parse(response.getContentText());
    const secretData = result.payload.data;

    // Decode the base64-encoded secret
    const decodedSecret = Utilities.newBlob(Utilities.base64Decode(secretData)).getDataAsString();

    return decodedSecret;  // Returns the decoded secret as a string
  } else {
    throw new Error(`Failed to access secret: ${response.getContentText()}`);
  }
}

// Function to set service account credentials in script properties
function setServiceAccountCredentials() {
  const projectId = 'zodiaccurate';  // Replace with your Google Cloud Project ID
  const secretName = 'service-account-credentials';  // Name of the secret in Secret Manager
  const secretVersion = 'latest';  // Get the latest version of the secret

  const url = `https://secretmanager.googleapis.com/v1/projects/${projectId}/secrets/${secretName}/versions/${secretVersion}:access`;

  const response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() === 200) {
    console.log("Service account credentials successfully retrieved.");
    const result = JSON.parse(response.getContentText());
    const secretData = result.payload.data;

    // Decode the base64-encoded secret JSON
    const decodedSecret = Utilities.newBlob(Utilities.base64Decode(secretData)).getDataAsString();

    // Parse the service account JSON to retrieve individual properties
    const serviceAccountJson = JSON.parse(decodedSecret);

    // Store the client_email and private_key in Script Properties
    PropertiesService.getScriptProperties().setProperty('private_key', serviceAccountJson.private_key);
    PropertiesService.getScriptProperties().setProperty('client_email', serviceAccountJson.client_email);

    return serviceAccountJson;  // Return the service account credentials if needed
  } else {
    throw new Error(`Failed to access secret: ${response.getContentText()}`);
  }
}

function getChatGPTApiKey() {
  const projectId = 'zodiaccurate';  // Replace with your Google Cloud Project ID
  const secretName = 'chatgpt-api-key';  // The name of the secret you created
  const secretVersion = 'latest';  // Retrieve the latest version of the secret

  const url = `https://secretmanager.googleapis.com/v1/projects/${projectId}/secrets/${secretName}/versions/${secretVersion}:access`;

  const response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
    },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() === 200) {
    const result = JSON.parse(response.getContentText());
    const secretData = result.payload.data;

    // Decode the base64-encoded secret
    const decodedSecret = Utilities.newBlob(Utilities.base64Decode(secretData)).getDataAsString();

    // Logger.log("ChatGPT API Key retrieved: " + decodedSecret);
    return decodedSecret;
  } else {
    throw new Error(`Failed to access secret: ${response.getContentText()}`);
  }
}

// Function to configure the OAuth2 service
function getOAuth2Service() {
  return OAuth2.createService('GoogleServiceAccount')
    .setTokenUrl('https://oauth2.googleapis.com/token')
    .setPrivateKey(PropertiesService.getScriptProperties().getProperty('private_key'))
    .setIssuer(PropertiesService.getScriptProperties().getProperty('client_email'))
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setScope('https://www.googleapis.com/auth/spreadsheets');
}

function getGoogleAPIKey() {
  const projectId = 'zodiaccurate';
  var secretName = "projects/"+projectId+"/secrets/GoogleAPI/versions/latest";
  var accessToken = ScriptApp.getOAuthToken();

  // Secret Manager API URL
  var url = "https://secretmanager.googleapis.com/v1/" + secretName + ":access";

  var options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };

  var response = UrlFetchApp.fetch(url, options);
  var jsonResponse = JSON.parse(response.getContentText());

  // The API key will be in the 'payload.data' field (Base64 encoded)
  var apiKey = Utilities.newBlob(Utilities.base64Decode(jsonResponse.payload.data)).getDataAsString();

  Logger.log("API Key: " + apiKey);

  return apiKey;
}
