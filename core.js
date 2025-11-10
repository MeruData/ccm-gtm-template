const log = require("logToConsole");
log("data =", data);
const setDefaultConsentState = require("setDefaultConsentState");
const gtagSet = require("gtagSet");
const injectScript = require("injectScript");
const getCookieValues = require("getCookieValues");
const updateConsentState = require("updateConsentState");
const setInWindow = require("setInWindow");
const isConsentGranted = require("isConsentGranted");
const addEventCallback = require("addEventCallback");
const JSON = require("JSON");
const decode = require("decodeUriComponent");
const encodeUri = require("encodeUri");
const Object = require("Object");

const CONSENT_CATEGORIES = {
  AD_STORAGE: "ad_storage",
  AD_USER_DATA: "ad_user_data", 
  AD_PERSONALIZATION: "ad_personalization",
  ANALYTICS_STORAGE: "analytics_storage",
  FUNCTIONALITY_STORAGE: "functionality_storage",
  PERSONALIZATION_STORAGE: "personalization_storage",
  SECURITY_STORAGE: "security_storage"
};

const DEFAULT_CONSENT_STATE = {
  GRANTED: "granted",
  DENIED: "denied"
};

const CONFIG = {
  CONSENT_WAIT_TIME: 500,
  CCM_BASE_URL: "https://ccm.merudata.app/assets/",
  DEVELOPER_ID: "dYzUxZD",
  COOKIE_CONSENT_NAME: "mppCookie_Consent"
};

function isArray(value) {
  return typeof value === 'object' && value !== null && typeof value.length === 'number';
}

function getConfigValue(data, path, defaultValue) {
  const keys = path.split('.');
  let value = data;
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (value && typeof value === 'object' && value[key] !== undefined) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value !== undefined ? value : defaultValue;
}

function createDefaultDeniedPreferences() {
  const preferences = {};
  const categories = Object.values(CONSENT_CATEGORIES);
  for (let i = 0; i < categories.length; i++) {
    const categoryName = categories[i];
    preferences[categoryName] = categoryName === CONSENT_CATEGORIES.SECURITY_STORAGE 
      ? DEFAULT_CONSENT_STATE.GRANTED 
      : DEFAULT_CONSENT_STATE.DENIED;
  }
  return preferences;
}


const splitInput = (input) => {
  if (!input || typeof input !== 'string') {
    return [];
  }
  return input
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length !== 0);
};

function validateGtagRules(gtagRules) {
  if (!isArray(gtagRules)) {
    log("Warning: gtagRules is not an array, using empty array");
    return [];
  }
  return gtagRules;
}

function setPreferencesFromRules(categories, gtagRules) {
  log("setPreferencesFromRules - categories:", categories);
  log("setPreferencesFromRules - gtagRules:", gtagRules);
  
  const validRules = validateGtagRules(gtagRules);
  const preferences = createDefaultDeniedPreferences();
  
  if (!isArray(categories)) {
    log("Warning: categories is not an array");
    return preferences;
  }
  
  categories.forEach((optout) => {
    log("Processing category:", optout);
    validRules.forEach((rule) => {
      log("Checking rule:", rule);
      if (rule && rule.cm && rule.st && rule.cm == optout) {
        log("rule.cm: " + rule.cm + ", optout: " + optout + " - MATCH");
        preferences[rule.st] = DEFAULT_CONSENT_STATE.GRANTED;
      }
    });
  });
  
  if (validRules.length > 1 && validRules[1] && !validRules[1].cm && validRules[1].st) {
    preferences[validRules[1].st] = preferences[CONSENT_CATEGORIES.AD_STORAGE];
  }
  if (validRules.length > 2 && validRules[2] && !validRules[2].cm && validRules[2].st) {
    preferences[validRules[2].st] = preferences[CONSENT_CATEGORIES.AD_STORAGE];
  }
  
  log("Final preferences:", preferences);
  updateConsentState(preferences);
}

function onConsentUpdate() {
  const cookieConsentName = getConfigValue(data, 'cookieConsentName', '') || CONFIG.COOKIE_CONSENT_NAME;
  log("Cookie consent name:", cookieConsentName);

  const mppConsentCookie = getCookieValues(cookieConsentName)[0];
  log("Retrieved consent cookie:", mppConsentCookie);
  
  if (!mppConsentCookie) {
    log("No consent cookie found");
    return;
  }
  
  const consentCookie = JSON.parse(decode(mppConsentCookie));
  if (consentCookie && consentCookie.mappings && isArray(consentCookie.categories)) {
    const accepted_categories = consentCookie.categories;
    setPreferencesFromRules(accepted_categories, consentCookie.mappings);
  } else {
    log("Warning: Invalid consent cookie structure or failed to parse");
  }
}

function detectGpcSignal() {
  const gpcVariable = getConfigValue(data, 'gpcVariable', null);
  
  if (!gpcVariable) {
    log("No GPC variable configured");
    return false;
  }
  
  const gpcSignal = gpcVariable === true || gpcVariable === 'true';
  log("GPC signal from variable:", gpcSignal, "type:", typeof gpcVariable, "raw value:", gpcVariable);
  
  return gpcSignal;
}

function validateGpcConfiguration(gpcCategories) {
  if (!isArray(gpcCategories)) {
    log("GPC categories configuration is not an array, using defaults");
    return [];
  }
  
  const validCategories = [];
  const validCategoryNames = Object.values(CONSENT_CATEGORIES);
  
  for (let i = 0; i < gpcCategories.length; i++) {
    const row = gpcCategories[i];
    if (!row || typeof row !== 'object') {
      log("Invalid GPC category configuration at index " + i);
      continue;
    }
    
    if (!row.consentCategory || validCategoryNames.indexOf(row.consentCategory) === -1) {
      log("Invalid or missing category in GPC configuration:", row.consentCategory);
      continue;
    }
    
    if (row.consentCategory === CONSENT_CATEGORIES.SECURITY_STORAGE) {
      log("Warning: security_storage should not be denied via GPC");
      continue;
    }
    
    validCategories.push(row);
  }
  
  return validCategories;
}

function createSelectiveDeniedPreferences(configuredCategories) {
  const preferences = {};
  const categories = Object.values(CONSENT_CATEGORIES);
  
  for (let i = 0; i < categories.length; i++) {
    const categoryName = categories[i];
    preferences[categoryName] = isConsentGranted(categoryName) ? DEFAULT_CONSENT_STATE.GRANTED : DEFAULT_CONSENT_STATE.DENIED;
  }
  
  preferences[CONSENT_CATEGORIES.SECURITY_STORAGE] = DEFAULT_CONSENT_STATE.GRANTED;
  
  for (let i = 0; i < configuredCategories.length; i++) {
    const row = configuredCategories[i];
    if (row.consentCategory) {
      preferences[row.consentCategory] = DEFAULT_CONSENT_STATE.DENIED;
      log("GPC: Denying category " + row.consentCategory);
    }
  }
  
  return preferences;
}

function buildGpcPreferences() {
  const configuredCategories = validateGpcConfiguration(
    getConfigValue(data, 'gpcCategoriesTable', [])
  );
  
  if (configuredCategories.length === 0) {
    log("No specific GPC categories configured, denying all except security_storage");
    return createDefaultDeniedPreferences();
  }
  
  log("Using selective GPC category denial");
  return createSelectiveDeniedPreferences(configuredCategories);
}

function applyConsentPreferences(preferences) {
  log("Applying consent preferences:", preferences);
  updateConsentState(preferences);
}

function isGpcEnabled() {
  const gpcVariable = getConfigValue(data, 'gpcVariable', null);
  return gpcVariable !== null && gpcVariable !== undefined && gpcVariable !== '';
}

function handleGpcSignal() {
  if (!isGpcEnabled()) {
    log("GPC detection disabled");
    return;
  }

  const gpcSignal = detectGpcSignal();
  if (!gpcSignal) {
    log("GPC signal not detected or not enabled");
    return;
  }

  log("GPC signal is enabled, applying consent restrictions");
  const gpcPreferences = buildGpcPreferences();
  applyConsentPreferences(gpcPreferences);
}

const main = (data) => {
  const scriptGuid = getConfigValue(data, 'scriptGuid', '');
  const adsDataRedaction = getConfigValue(data, 'ads_data_redaction', false);
  const urlPassthrough = getConfigValue(data, 'url_passthrough', false);
  const defaultSettingRegionTable = getConfigValue(data, 'defaultSettingRegionTable', []);

  gtagSet("ads_data_redaction", adsDataRedaction);
  gtagSet("url_passthrough", urlPassthrough);
  gtagSet("developer_id." + CONFIG.DEVELOPER_ID, true);

  if (!isArray(defaultSettingRegionTable)) {
    log("Warning: defaultSettingRegionTable is not an array");
    return;
  }
  
  defaultSettingRegionTable.forEach((row) => {
    if (!row || typeof row !== 'object') {
      log("Warning: Invalid row in defaultSettingRegionTable");
      return;
    }
    
    const region = splitInput(getConfigValue(row, 'region', ''));
    let defaultConsentStatus = {
      ad_storage: getConfigValue(row, 'ad_storage', DEFAULT_CONSENT_STATE.DENIED),
      ad_user_data: getConfigValue(row, 'ad_user_data', DEFAULT_CONSENT_STATE.DENIED),
      ad_personalization: getConfigValue(row, 'ad_personalization', DEFAULT_CONSENT_STATE.DENIED),
      analytics_storage: getConfigValue(row, 'analytics_storage', DEFAULT_CONSENT_STATE.DENIED),
      functionality_storage: getConfigValue(row, 'functionality_storage', DEFAULT_CONSENT_STATE.DENIED),
      personalization_storage: getConfigValue(row, 'personalization_storage', DEFAULT_CONSENT_STATE.DENIED),
      security_storage: getConfigValue(row, 'security_storage', DEFAULT_CONSENT_STATE.GRANTED),
      wait_for_update: CONFIG.CONSENT_WAIT_TIME,
    };
    
    if(region.length > 0) {
      defaultConsentStatus.region = region;
    }
    
    log("Setting default consent state:", defaultConsentStatus);
    setDefaultConsentState(defaultConsentStatus);
  });

  onConsentUpdate();

  handleGpcSignal();

  if (!scriptGuid) {
    log("Warning: No scriptGuid provided, CCM loader will not be injected");
    return;
  }
  
  log("scriptGuid =", scriptGuid);
  
  const ccmBaseUrl = getConfigValue(data, 'ccmBaseUrl', '') || CONFIG.CCM_BASE_URL;
  const lastChar = ccmBaseUrl.charAt(ccmBaseUrl.length - 1);
  const baseUrlWithAssets = lastChar === '/' ? ccmBaseUrl + 'assets/' : ccmBaseUrl + '/assets/';
  const ccmLoaderUrl = encodeUri(baseUrlWithAssets + scriptGuid + "/ccm_loader.min.js");
  
  log("Using CCM Base URL:", ccmBaseUrl);
  log("Loading CCM from:", ccmLoaderUrl);
  
  injectScript(
    ccmLoaderUrl,
    function onSuccess() {
      log("CCM loader loaded successfully");
    },
    function onFailure() {
      log("Failed to load CCM loader from: " + ccmLoaderUrl);
    }
  );
};

function buildCCMVariables() {
  addEventCallback(function (ctid, eventData) {
    const categories = Object.values(CONSENT_CATEGORIES);
    const defaultConsent = {};
    
    for (let i = 0; i < categories.length; i++) {
      const categoryName = categories[i];
      defaultConsent[categoryName] = isConsentGranted(categoryName);
    }
    
    setInWindow("defaultCCMGtagConsent", defaultConsent, true);
    log("Tag count for container " + ctid + ": " + eventData.tags.length);
    log("CCM consent state:", defaultConsent);
  });
}

main(data);
buildCCMVariables();
data.gtmOnSuccess();