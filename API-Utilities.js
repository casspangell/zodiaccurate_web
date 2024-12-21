// Constants for project configuration
const PROJECT_ID = 'zodiaccurate';
const LATEST_VERSION = 'latest';

// Retrieve a secret from Google Secret Manager
function getSecret(secretName) {
  const url = `https://secretmanager.googleapis.com/v1/projects/${PROJECT_ID}/secrets/${secretName}/versions/${LATEST_VERSION}:access`;

  const response = UrlFetchApp.fetch(url, {
    headers: { Authorization: `Bearer ${ScriptApp.getOAuthToken()}` },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() === 200) {
    const result = JSON.parse(response.getContentText());
    const secretData = result.payload.data;
    return Utilities.newBlob(Utilities.base64Decode(secretData)).getDataAsString();
  } else {
    console.error(`Failed to retrieve secret: ${response.getContentText()}`);
    throw new Error(`Failed to retrieve secret '${secretName}'.`);
  }
}

// Initialize service account credentials
function initializeServiceAccount() {
  const serviceAccountJson = JSON.parse(getSecret('service-account-credentials'));
  PropertiesService.getScriptProperties().setProperty('private_key', serviceAccountJson.private_key);
  PropertiesService.getScriptProperties().setProperty('client_email', serviceAccountJson.client_email);
}

// Retrieve the ChatGPT API key
function getChatGPTApiKey() {
  return getSecret('chatgpt-api-key');
}

// Test service account setup
function testServiceAccount() {
  const service = getOAuth2Service();
  if (!service.hasAccess()) {
    Logger.log("Service account authentication failed. Reauthorize the app.");
  } else {
    Logger.log("Service account authenticated successfully.");
  }
}

// Configure OAuth2 service for Google APIs
function getOAuth2Service() {
  return OAuth2.createService('GoogleServiceAccount')
      .setTokenUrl('https://oauth2.googleapis.com/token')
      .setPrivateKey(PropertiesService.getScriptProperties().getProperty('private_key'))
      .setIssuer(PropertiesService.getScriptProperties().getProperty('client_email'))
      .setPropertyStore(PropertiesService.getScriptProperties())
      .setScope('https://www.googleapis.com/auth/spreadsheets');
}

function testVersion2Secrets() {
  const serviceAccountKey = getSecret('service-account-credentials');
  const chatGPTKey = getChatGPTApiKey();

  Logger.log("Service Account Key Retrieved: " + serviceAccountKey.substring(0, 50) + "...");
  Logger.log("ChatGPT API Key Retrieved: " + chatGPTKey.substring(0, 5) + "...");
}

// Function to test secret retrieval
function validateSecrets() {
  try {
    const privateKey = getSecret('service-account-credentials');
    const chatGPTKey = getChatGPTApiKey();

    if (!privateKey || !chatGPTKey) {
      Logger.log("One or more secrets are missing or invalid.");
    } else {
      Logger.log("All secrets retrieved successfully.");
    }
  } catch (error) {
    Logger.log("Error validating secrets: " + error.message);
  }
}

// Run this function once to set the credentials in script properties
function initialize() {
  initializeServiceAccount();
  Logger.log("Service account initialized successfully.");
}

// Test function to retrieve API key and private key
function testInitialization() {
  try {
    Logger.log("ChatGPT API Key: " + getChatGPTApiKey().substring(0, 5) + "...");
    Logger.log("Service account private key retrieved successfully.");
  } catch (error) {
    Logger.log("Error during initialization: " + error.message);
  }
}
