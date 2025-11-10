# CCM-GTM-Template
GTM template for Meru Data Cookie Consent Manager (CCM).

## Overview

The **Meru Data Cookie Consent Manager Integration Template** provides seamless integration between **Meru Data Cookie Consent Manager (CCM)** and **Google Consent Mode**. This template ensures accurate synchronization of consent preferences with Google's consent types, enabling businesses to:

- Comply with privacy regulations like GDPR and CCPA.
- Maintain effective website and app functionality.
- **NEW**: Support Global Privacy Control (GPC) signals for enhanced privacy compliance.

## New in Version 1.1.0 - Global Privacy Control Support

### Global Privacy Control (GPC) Features
- **Automatic GPC Detection**: Detects `navigator.globalPrivacyControl` signal from user's browser
- **Configurable Categories**: Choose which consent categories to deny when GPC is enabled
- **CCPA Compliance**: Automatically honors "Do Not Sell" preferences
- **Backwards Compatible**: Existing configurations continue working unchanged
- **Opt-in Configuration**: GPC features are disabled by default

### How GPC Works
1. **Detection**: Template automatically detects if user has GPC enabled in their browser
2. **Configuration Options**:
   - **Default Behavior**: Deny all categories except `security_storage` when GPC detected
   - **Selective Denial**: Configure specific categories to deny (recommended)
3. **Application**: GPC preferences are applied after default consent but before cookie consent

### GPC Configuration

#### Enable GPC Support
1. In the template configuration, expand **"Global Privacy Control (GPC) Settings"**
2. Check **"Enable Global Privacy Control Detection"**
3. (Optional) Configure specific categories to deny in the **"GPC Categories to Deny"** table

#### Recommended GPC Categories for CCPA Compliance
- `ad_storage` - Advertising cookies and identifiers
- `ad_user_data` - User data for advertising
- `ad_personalization` - Personalized advertising

#### Browser Compatibility
- **Firefox**: Enable GPC in privacy settings
- **Chrome**: Use privacy extensions like Privacy Badger
- **Safari**: Enable Privacy Report features
- **Other browsers**: Graceful degradation (no errors)

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
