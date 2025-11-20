# CCM-GTM-Template
GTM template for Meru Data Cookie Consent Manager (CCM).

## Overview

The **Meru Data Cookie Consent Manager Integration Template** provides seamless integration between **Meru Data Cookie Consent Manager (CCM)** and **Google Consent Mode**. This template ensures accurate synchronization of consent preferences with Google's consent types, enabling businesses to:

- Comply with privacy regulations like GDPR and CCPA.
- Maintain effective website and app functionality.
- **NEW**: Support Global Privacy Control (GPC) and Do Not Track (DNT) signals for enhanced privacy compliance.

## Privacy Signal Support (GPC & DNT)

### Global Privacy Control (GPC) Features
The Meru Data CCM template now supports Global Privacy Control (GPC) signals to automatically respect user privacy preferences when GPC is enabled in their browser.

### How GPC Works
1. **Detection**: Uses a Custom JavaScript Variable to detect `navigator.globalPrivacyControl` signal
2. **Automatic Denial**: When GPC is detected, consent categories are automatically denied
3. **Override Behavior**: GPC preferences override any existing cookie consent
4. **Compliance**: Ensures CCPA "Do Not Sell" compliance automatically

### GPC Implementation Steps

#### Step 1: Create GPC Detection Variable
1. Go to **Variables** section in Google Tag Manager
2. Click **New** under **User-Defined Variables**
3. Select **Custom JavaScript** as the Variable Type
4. Enter this Custom JavaScript code:
```javascript
function() {
  try {
    return !!(navigator && navigator.globalPrivacyControl);
  } catch (e) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'gtm_js_exception',
      errorMessage: e.message,
      errorStack: e.stack
    });
    return false;
  }
}
```
5. Save the variable with name: `GPC Enabled`

#### Step 2: Configure GPC in Template
1. In the Meru Data CCM template configuration
2. Expand **"Global Privacy Control (GPC) Settings"**
3. **Enable GPC**: Check **"Enable Global Privacy Control"** to activate GPC support
4. Set **"GPC Detection Variable"** to `{{GPC Enabled}}`
5. Configure **"GPC Consent Settings by Region"** table:
   - **Region**: Enter region codes (e.g., `US-CA`, `US-TX`, `CA`, `UK`) or leave empty for global settings
   - **Consent Categories**: Set each category to `granted` or `denied` when GPC is detected
   - **Default Behavior**: If no configuration is provided, all categories except `security_storage` will be denied when GPC is detected
   - **CCPA Compliance**: For California compliance, consider setting all ad-related categories to `denied`

Example configurations:
- **Global GPC Settings**: Leave Region empty, set desired consent states
- **California-specific**: Region = `US-CA`, deny all ad categories
- **EU-specific**: Region = `UK,DE,FR`, customize based on GDPR requirements

#### Optional Feature
GPC support is **completely optional**. If you don't need GPC functionality:
- Simply leave **"Enable Global Privacy Control"** unchecked
- The template will function normally without any GPC processing
- No performance impact when disabled

### Do Not Track (DNT) Support

#### Do Not Track (DNT) Features
The template also supports the legacy Do Not Track (DNT) standard for broader browser compatibility.

#### How DNT Works
1. **Detection**: Uses a Custom JavaScript Variable to detect `navigator.doNotTrack` signal
2. **Automatic Denial**: When DNT is detected, consent categories are automatically denied
3. **Priority**: GPC takes precedence over DNT when both are active
4. **Fallback**: Provides privacy support for browsers without GPC

#### DNT Implementation Steps

**Step 1: Create DNT Detection Variable**
1. Go to **Variables** section in Google Tag Manager
2. Click **New** under **User-Defined Variables**
3. Select **Custom JavaScript** as the Variable Type
4. Enter this Custom JavaScript code:
```javascript
function() {
  try {
    return navigator.doNotTrack === '1';
  } catch (e) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'gtm_js_exception',
      errorMessage: e.message,
      errorStack: e.stack
    });
    return false;
  }
}
```
5. Save the variable with name: `DNT Enabled`

**Step 2: Configure DNT in Template**
1. In the Meru Data CCM template configuration
2. Expand **"Do Not Track (DNT) Settings"**
3. **Enable DNT**: Check **"Enable Do Not Track"** to activate DNT support
4. Set **"DNT Detection Variable"** to `{{DNT Enabled}}`
5. Configure **"DNT Consent Settings by Region"** table:
   - **Region**: Enter region codes (e.g., `US-CA`, `US-TX`, `CA`, `UK`) or leave empty for global settings
   - **Consent Categories**: Set each category to `granted` or `denied` when DNT is detected
   - **Default Behavior**: If no configuration is provided, all categories except `security_storage` will be denied when DNT is detected

#### Privacy Signal Precedence
When both GPC and DNT are enabled:
- **GPC takes priority**: GPC is a stronger, legally-binding signal
- **DNT as fallback**: DNT preferences only apply if GPC is not active
- **Clear compliance**: Ensures legal requirements are met while maximizing privacy coverage

#### Optional Feature
DNT support is **completely optional**. If you don't need DNT functionality:
- Simply leave **"Enable Do Not Track"** unchecked
- The template will function normally without any DNT processing
- No performance impact when disabled

### Browser Compatibility Summary
- **DNT**: All major browsers (Chrome, Firefox, Safari, Edge, IE 11+)
- **GPC**: Firefox (native), Chrome with extensions (OptMeowt, Privacy Badger), Safari (partial)
- **Graceful Degradation**: No errors on unsupported browsers
- **Recommendation**: Enable both for maximum privacy signal coverage

## Consent Types Supported

- **ad_storage**: Manages storage for advertising, including cookies or device identifiers.
- **ad_user_data**: Controls consent for sending user data to Google for advertising purposes.
- **ad_personalization**: Enables or disables consent for personalized advertising.
- **analytics_storage**: Manages storage for analytics purposes, such as session duration tracking.
- **functionality_storage**: Supports storage for website or app functionality, e.g., language settings.
- **personalization_storage**: Manages storage for personalized experiences, such as video recommendations.
- **security_storage**: Handles storage for security-related features like authentication and fraud prevention.

## G-Tag Configuration of Meru Data CCM

### Contents   
- [Steps to Create a New Tag](#steps-to-create-a-new-tag)  
- [Steps to Create a New User Defined Variable](#steps-to-create-a-new-user-defined-variable)  
- [Steps to Create New Triggers](#steps-to-create-new-triggers)  
  - [Steps to Create Strictly Necessary Trigger](#steps-to-create-strictly-necessary-trigger)  
  - [Steps to Create Functional Trigger](#steps-to-create-functional-trigger)  
  - [Steps to Create Analytics Trigger](#steps-to-create-analytics-trigger)  
  - [Steps to Create Social Media Trigger](#steps-to-create-social-media-trigger)  
  - [Steps to Create Targeting Trigger](#steps-to-create-targeting-trigger)  
- [Steps to Configure Triggers to Tags](#steps-to-configure-triggers-to-tags)

---

### Steps to Create a New Tag  
1. In the **New Tag Creation** window, select **Custom Meru Data CCM** as the Tag type.  
2. In the **Meru Data CCM Script Guid** field, enter the guid from Meru Data Dgt Application  
3. In the **Cookie Consent Name** field, enter the cookie name configured in Meru Data Dgt Application

#### Default Settings Configuration  
4. Below **Default Settings**, click on **Add Row**:  
   - For **Global**:  
     - **Region**: Leave empty.  
     - **Granted Consent Types**:  
       `ad storage, ad user data, ad personalization, personalization storage, analytics storage, functionality storage, security storage`.  
     - Click the **Add** button.  
5. Click **Add Row** again for **California**:  
   - **Region**: `US-CA`  
   - **Granted Consent Types**: `functionality storage, security storage`.  
   - **Denied Consent Types**:  
     `ad storage, ad user data, ad personalization, personalization storage, analytics storage`.  
   - Click the **Add** button.  

#### Advanced Settings Configuration  
6. Under **Advanced Settings**, select **Cookie Settings**.  
7. Set **Additional Consent Checks** to:  
   `No additional consent required`.  

#### Trigger Configuration  
8. In the **Triggering** section, select:  
   `Consent Initialisation - All pages`.  

9. Save the tag with the name:  
   `Meru Data CCM`.  

---

### Steps to Create a New User Defined Variable  
1. Go to the **Variable** section in Google Tag Manager.  
2. Click on **New** under **User-Defined Variables**.  
3. Select **Data Layer Variable** as the Variable type.  
4. Set the **Data Layer Variable Name** to:  
   `consentType`.  
5. Save it with the name:  
   `Datalayer Consent Type`.  

---

### Steps to Create New Triggers  

Create five new triggers for each cookie category in the cookie banner:  
- **Strictly Necessary**  
- **Functional**  
- **Analytics / Performance**  
- **Social Media**  
- **Targeting**  

#### Steps to Create Strictly Necessary Trigger  
1. In the **Trigger** section, click on **New** in the top-right corner.  
2. Set the **Trigger Type** to:  
   `Custom Trigger`.  
3. Set the **Event Name** to:  
   `onMeruCcmConsentGranted`.  
4. Set **This Trigger Fires On** to:  
   `Some Custom Events`.  
5. Configure the condition:  
   - **Datalayer Consent Type**: `security_storage`.  
6. Save the trigger with the name:  
   `OnMeruCCM – Necessary`.  

#### Steps to Create Functional Trigger  
1. In the **Trigger** section, click on **New** in the top-right corner.  
2. Set the **Trigger Type** to:  
   `Custom Trigger`.  
3. Set the **Event Name** to:  
   `onMeruCcmConsentGranted`.  
4. Set **This Trigger Fires On** to:  
   `Some Custom Events`.  
5. Configure the condition:  
   - **Datalayer Consent Type**: `functionality_storage`.  
6. Save the trigger with the name:  
   `OnMeruCCM – Functional`.  

#### Steps to Create Analytics Trigger  
1. Repeat the above steps but set **Datalayer Consent Type** to:  
   `analytics_storage`.  
2. Save the trigger with the name:  
   `OnMeruCCM – Analytics`.  

#### Steps to Create Social Media Trigger  
1. Repeat the above steps but set **Datalayer Consent Type** to:  
   `personalization_storage`.  
2. Save the trigger with the name:  
   `OnMeruCCM – Social Media`.  

#### Steps to Create Targeting Trigger  
1. Repeat the steps for creating a trigger but add multiple conditions:  
   - **Datalayer Consent Type**:  
     - `ad_storage`.  
     - `ad_user_data`.  
     - `ad_personalization`.  
2. Save the trigger with the name:  
   `OnMeruCCM – Targeting`.  

---

### Steps to Configure Triggers to Tags  

Configure triggers based on the required consent types in the tag’s **Advanced Settings**:  

| Consent Type            | Trigger Name                 |  
|-------------------------|-----------------------------|  
| `security_storage`      | `OnMeruCCM – Necessary`     |  
| `functionality_storage` | `OnMeruCCM – Functional`    |  
| `analytics_storage`     | `OnMeruCCM – Analytics`     |  
| `personalization_storage` | `OnMeruCCM – Social Media` |  
| `ad_storage, ad_user_data, ad_personalization` | `OnMeruCCM – Targeting` |  

For example, if a tag requires `personalization_storage`, set the trigger `OnMeruCCM – Social Media` for that tag.

---
