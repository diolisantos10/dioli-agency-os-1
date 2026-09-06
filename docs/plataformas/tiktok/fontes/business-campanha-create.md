---
titulo: "Marketing API — /campaign/create/ (objetivo, orçamento, tipo de compra)"
url: https://business-api.tiktok.com/portal/docs?id=1739318962329602
capturado_em: 2026-09-06
hash: 959f42de7b726e92
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

About the Guide
Overview
What's New
Get Started
TikTok for Business MCP Server
Skill management
FAQs
Use Cases
Marketing API
Organic API
Business Messaging API
API Reference
Accounts
Ads
Ad Accounts
Ad Comments
Ad Comments - Blocked Words
Ad Diagnosis
Ad Groups
Ad Review
Audience
Authentication
Automated Rules
BC Management
BC Payments
BC Payment Portfolios
BC Assets
BC Asset Groups
BC Billing Groups
BC Partners
BC Members
BC Invoices
BC Reporting
Brand Safety
Business Messaging
Campaign
Get campaigns
Create a campaign
Update a campaign
Update the operation statuses of campaigns
Get the quota for a SKAN Dedicated Campaign per ad network
Create an asynchronous copy task for a Manual Campaign
Get the results of an asynchronous copy task for a Manual Campaign
(Deprecated) Get the quota for an iOS 14 Dedicated Campaign
Catalog Management
Catalog Event Sources
Catalog Feeds
Catalog Products
Catalog Product Sets
Catalog Videos
Catalog Video Templates
Catalog Diagnostics
Catalog Insights
Change Log
Creative Pre-review
Creative Portfolios
Creative Reports
Creative Tools
Custom Conversions
Discovery
(Deprecated) Dynamic Scene
Events 2.0
Events 1.0
Files
GMV Max
Identity
Images
Leads
Media Mix Modeling
MCP Authorization
Mentions
Music
Negative Keywords
Page
Pangle
Playable Ads
Reach & Frequency
Reporting
Showcase
Smart Creative
(To be deprecated) Legacy Smart+
Upgraded Smart+
Spark Ads Recommendation
Spark Ads Using Authorized Posts
Super Split Test
Subscription
Terms
TikTok One
TikTok Store
Tools
User
Video
Verification
Welcome Messages
API Playground
API Service Status Page
Appendix
SDK
Before you start
Comparing v1.2 and v1.3
Request
Example
Response
Example
Create a campaign

Use this endpoint to create a campaign. Each ad account can have up to 999 campaigns. A campaign can contain one or more ad groups.

Before you migrate your calls to v1.3, please see Migrate campaign management APIs to learn about the highlighted differences between v1.2 and v1.3 campaign management APIs.

To learn about the mapping between TikTok Ads Manager (TTAM) features at the campaign, ad group, and ad levels and the corresponding API configurations, see Mapping between campaign features on TikTok Ads Manager and API configurations.

Important
By using this endpoint, you agree to TikTok's Online Data Terms.

Online Data Terms: By using this endpoint, to the extent that you and TikTok share personal data for the purposes of your campaign (for example, if you choose to use an advertiser tool such as TikTok Pixel or to work with a measurement partner), you agree to TikTok's Online Data Terms, including the Business Products (Data) Terms, Controller to Controller Data Terms and all component parts.

You agree that Section 13 of the TikTok Commercial Terms of Service shall apply to any and all liability arising under or in connection with the Online Data Terms, whether arising in contract, tort (including without limitation negligence) or otherwise.

For more information, see TikTok Advertiser Tools and Related Terms and TikTok Controller to Controller Data Terms.

Before you start

Review the step-by-step guides in Campaign creation to understand the parameter requirements for different types of campaigns or ads. If the type of ad or campaign you want to create is not covered in the existing guides and you would like to request additional documentation, contact your TikTok representative to submit the request.

Comparing v1.2 and v1.3

The following table outlines the differences between v1.2 and v1.3 endpoints.

Changes	v1.2	v1.3

Endpoint path
	
/v1.2/campaign/create/
	
/v1.3/campaign/create/

Request parameter name
	
budget_optimize_switch
industry_types
	
budget_optimize_on
special_industries

Request parameter data type
	
advertiser_id:number
	
advertiser_id: string

New request parameters
	
/
	
app_id
campaign_type
app_promotion_type
campaign_app_profile_page_state
rf_campaign_type
request_id
campaign_product_source
postback_window_mode
is_advanced_dedicated_campaign
rta_id
rta_product_selection_enabled
disable_skan_campaign
catalog_enabled
rta_bid_enabled
virtual_objective_type
sales_destination
is_search_campaign
po_number

Request parameters deprecated in v1.3
	
/
	
budget_optimize_switch
bid_type
deep_bid_type
roas_bid
optimize_goal

Response parameters
	
We now return the full info of ad entity (including new parameters app_id, app_promotion_type, campaign_app_profile_page_state, rf_campaign_type,disable_skan_campaign, bid_align_type, catalog_enabled, rta_bid_enabled,virtual_objective_type, sales_destination, and po_number) in v1.3. For details, see the "Response" section on this page.
Request

Endpoint https://business-api.tiktok.com/open_api/v1.3/campaign/create/

Method POST

Header

Field	Data Type	Description

Access-Token
Required
	
string
	
Authorized access token. For details, see Authentication.

Content-Type
Required
	
string
	
Request message type
Allowed format: application/json.

Parameters

Field	Data Type	Description

advertiser_id
Required
	
string
	
Advertiser ID.

objective_type
Required
	
string
	
Advertising objective.

For enum values and descriptions, see Objectives.

app_promotion_type
Conditional
	
string
	
Required when objective_type is APP_PROMOTION.
App promotion type.
Enum values:
APP_INSTALL: App install. Get new users to install your app.
APP_RETARGETING: App retargeting. Re-engage existing users to take action in your app.
APP_PREREGISTRATION: App pre-registration. Get new users to pre-register before your app launches. To learn about how to create App Pre-registration ads, refer to here.

Note:

APP_INSTALL can be used in an iOS14 Dedicated Campaign, while APP_RETARGETING and APP_PREREGISTRATION cannot be used.
App Pre-Registration is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

virtual_objective_type
	
string
	
The new objective type.

Enum value: SALES.

Use this field to create a campaign with the Sales objective, the combined objective for Website Conversions and Product Sales objectives. Learn more about the Sales objective.

sales_destination
Conditional
	
string
	
Required and valid only when virtual_objective_type is specified.

Sales destination, the destination where you want to drive your sales.

Enum values:
TIKTOK_SHOP: TikTok Shop. Drive sales on your TikTok Shop.
WEBSITE: Website. Drive sales on your website.
APP: App. Drive sales on your app (product catalog required).
WEB_AND_APP: Website and app. Drive sales on both your website and your app.
To learn about how to create ads with this setting, see Create ads with Website and App Optimization.

Note: Creating ads with Website and App Optimization (with sales_destination set to WEB_AND_APP) is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

is_search_campaign
	
boolean
	
Whether to create a Search Ads Campaign.
With Search Ads Campaigns, you can select keywords and serve ads within TikTok's search result page. To learn more about how to create such campaigns, see Create Search Ads Campaigns.

Supported values: true, false.

Note:

Search Ads Campaigns are currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
Once set, this field cannot be updated.

campaign_type
	
string
	
Campaign type.

Enums values: REGULAR_CAMPAIGN, IOS14_CAMPAIGN.

The value IOS14_CAMPAIGN supports the advertising objectives of PRODUCT_SALES and APP_PROMOTION( its app_promotion_type = APP_INSTALL) .
If app_promotion_type is specified as APP_RETARGETING or APP_PREREGISTRATION, campaign_type can only be set to REGULAR_CAMPAIGN.
For iOS Dedicated Campaigns with other objectives, set campaign_type as REGULAR_CAMPAIGN.

To learn more about Dedicated Campaigns, see Dedicated Campaign.

app_id
Conditional
	
string
	
Required when the campaign is an iOS 14 Dedicated Campaign (camapign_type=IOS14_CAMPAIGN) with the advertising objective (objective_type) as PRODUCT_SALES, or APP_PROMOTION( its app_promotion_type = APP_INSTALL).

The Application ID of the promoted app.

You can get app_id by using the /app/list/ endpoint.

Note: You cannot specify an App that has not activated the SAN module on your MMP through this field to create iOS Dedicated Campaigns. To ensure that TikTok SAN integration is enabled for your App, see How to transition to SAN for existing apps and How to integrate to SAN for new apps.

is_advanced_dedicated_campaign
	
boolean
	
Whether the campaign is an Advanced Dedicated Campaign. Advanced Dedicated Campaigns leverage advanced delivery models that benefit from real-time signals.

Enum values: true, false.
Default value: false.

To learn about how to create such campaigns, see Create Advanced Dedicated Campaigns.

Note: Once set, this field cannot be updated.

disable_skan_campaign
	
boolean
	
Valid only when the following conditions are all met:
objective_type is APP_PROMOTION.
app_promotion_type is APP_INSTALL.
campaign_type is IOS14_CAMPAIGN.
app_id is set to the ID of an iOS app that is eligible for Advanced Dedicated Campaigns. To confirm whether an app is eligible for Advanced Dedicated Campaigns, use /app/list/ and check the returned advanced_dedicated_campaign_allowed.

Whether to disable SKAN (SKAdNetwork) attribution, Apple's conversion attribution solution for iOS campaigns

Enum values:
true: To disable SKAN attribution. The campaign will not be bound by Dedicated Campaign quota limits and you will be able to retrieve Self Attribution Network (SAN) metrics for the campaign. However, you cannot retrieve SKAN reporting metrics for the campaign. Learn more about SAN integration.
For a Dedicated Campaign using an app that is eligible for Advanced Dedicated Campaigns, you need to enable SKAN attribution or Advanced Dedicated Campaign or both. You cannot disable SKAN attribution and Advanced Dedicated Campaign simultaneously.
false: To enable SKAN attribution. The campaign will be bound by Dedicated Campaign quota limits and you will be able to retrieve SKAN metrics for the campaign.
If you enable Advanced Dedicated Campaign by setting is_advanced_dedicated_campaign to true simultaneously, you'll be able to retrieve both SAN and SKAN reporting metrics for the campaign.

Note:

Disabling SKAN attribution for Dedicated Campaigns is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
If you are allowlisted for disabling SKAN attribution for Dedicated Campaigns, you cannot set bid_type to BID_TYPE_CUSTOM at the ad group level when the following conditions are all met:
At the campaign level:
is_advanced_dedicated_campaign is false.
disable_skan_campaign is false.
At the ad group level:
optimization_goal is INSTALL or IN_APP_EVENT.
Once set, this field cannot be updated.
Getting access to Advanced Dedicated Campaign requires the app to meet certain criteria. If your app is ineligible for Advanced Dedicated Campaign, reach out to your TikTok representative. Your TikTok representative will be able to provide troubleshooting support to help your app get access to Advanced Dedicated Campaign.

campaign_app_profile_page_state
	
string
	
Whether to use app profile page to optimize delivery.

Enum values: ON, OFF.

Default value: OFF.

You can use the field only when objective_type is APP_PROMOTION and your campaign is an iOS14 Dedicated Campaign. Otherwise, an error will occur.

rf_campaign_type
	
string
	
When objective_type is specified as RF_REACH, use this field to set the campaign as a TikTok Pulse campaign, then you can get available premium contextual tags.

Do not pass in this field when objective_type is not specified as RF_REACH.

Enum values: STANDARD (Reach & Frequency campaign), PULSE(TikTok Pulse campaign).

Note:

This is an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
This field cannot be updated after creation.
If you select rf_campaign_type to PULSE , then you must enter contextual tags of PREMIUM type in the contextual_tag_ids field in /adgroup/rf/create/. In this case, the CPM in your ad group is fixed.
If you set rf_campaign_type to PULSE, then the targeting locations cannot be updated in /adgroup/rf/update/.
If you set rf_campaign_type to PULSE, then feed_type cannot be TOP_FEED in /adgroup/rf/create/.

campaign_product_source
Conditional
	
string
	
Required when objective_type is set to PRODUCT_SALES.
Product source of the campaign.
Enum values:
CATALOG: Catalog.
STORE: TikTok Shop, or TikTok Showcase.

Note:

The objective PRODUCT_SALES is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
For Video Shopping Ads, the product source setting at the campaign level determines the product source available at the ad group level:
If this field is set to CATALOG, you need to set the product_source of ad groups under the campaign to CATALOG.
If this field is set to STORE, you need to set the product_source of ad groups under the campaign to STORE or SHOWCASE.

catalog_enabled
	
boolean
	
Whether to use your catalog to automatically advertise relevant products or services to people based on their unique interests, intent and actions.

Supported values: true, false.

Default value: false.

Set this field to true only when you want to create Automotive Ads for Inventory or Automotive Ads for Models.

When the following conditions are met, the field will be overwritten to true:
objective_type is PRODUCT_SALES.
campaign_product_source is CATALOG.

Note: Once set, this field cannot be updated.

campaign_name
Required
	
string
	
Campaign name.

Length limit: 512 characters. Emoji is not supported.

Each word in Chinese or Japanese counts as two characters, while each letter in English counts as one character.

request_id
	
string
	
Request ID with which you can create campaigns with duplicate names.
To create campaigns with duplicate names, send two requests for creating campaigns with the same campaign_name and different request_id.

It also supports idempotency to prevent you from sending the same request twice within 10 seconds. If you retry requests with the same request ID multiple times within 10 seconds, then only one will succeed.

It is different from the request_id returned in the response parameters, which is used to uniquely identify an HTTP request.

The value should be a string representation of a 64-bit integer number.

Example: 123456789

special_industries
	
string[]
	
Special ad categories.

By selecting a housing, employment, or credit category for your campaign, you certify not to use TikTok to discriminate based on protected characteristics in ads relating to housing, employment, or credit and to adhere to TikTok's special ad category policy.

Once you use this field to indicate that your campaign is promoting opportunities in any of the ad categories, the targeting options at the ad group level will be limited to help you comply with anti-discrimination laws in these categories. See Targeting requirements for ad groups in a campaign with special ad categories to learn about the requirements.

Enum values:
HOUSING: Ads for real estate listings, homeowners insurance, mortgage loans or other related opportunities.
EMPLOYMENT: Ads for job offers, internship, professional certification programs or other related opportunities.
CREDIT: Ads for credit card offers, auto loans, long-term financing or other related opportunities.

Note:

Using special ad categories in Shopping Ads with campaign product source as Catalog and in Shopping Ads with campaign product source as non-Catalog are currently separate allowlist-only features. If you would like to access them, please contact your TikTok representative.
This field is generally available to advertisers registered in America or Canada. Advertisers who are not registered in America or Canada but want to target these countries with special ad categories need to apply for an additional allowlist.
Once you select special ad categories for a campaign, you can remove the special ad categories, but you cannot change them or enable the special ad categories for an existing campaign if the special ad categories are currently disabled.

budget_optimize_on
	
boolean
	
Whether to enable Campaign Budget Optimization (CBO).

Enum values: true (enabled).

For details about CBO, see Campaign Budget Optimization.

Note: CBO for Video Shopping Ads with product source as catalog is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

budget_mode
Conditonal
	
string
	
Required when objective_type is NOT RF_REACH.
When objective_type is RF_REACH, budget_mode only supports BUDGET_MODE_INFINITE.

Budget mode.

When Campaign Budget Optimization (CBO) is enabled, budget_mode at the campaign level supports the following enum values:
BUDGET_MODE_TOTAL: Lifetime budget.
BUDGET_MODE_DYNAMIC_DAILY_BUDGET: Dynamic daily budget. It is the average daily budget over a week. Daily costs will not exceed 125% of the average daily budget. Weekly costs will not exceed the average daily budget * 7.
When objective_type is TRAFFIC, APP_PROMOTION, WEB_CONVERSIONS, LEAD_GENERATION, PRODUCT_SALES (Video Shopping Ads only), REACH, VIDEO_VIEWS, or ENGAGEMENT, and you want to set a non-lifetime budget, set this field to BUDGET_MODE_DYNAMIC_DAILY_BUDGET.

Note: BUDGET_MODE_DYNAMIC_DAILY_BUDGET for campaign objectives REACH, VIDEO_VIEWS, and ENGAGEMENT is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

BUDGET_MODE_DAY: Daily budget.
When objective_type is REACH, VIDEO_VIEWS, or ENGAGEMENT, we recommend that you use dynamic daily budget (BUDGET_MODE_DYNAMIC_DAILY_BUDGET) instead of daily budget (BUDGET_MODE_DAY).

When CBO is disabled, budget_mode at the campaign level supports the following enum values:
BUDGET_MODE_INFINITE: Unlimited budget.
BUDGET_MODE_TOTAL: Lifetime budget.
BUDGET_MODE_DAY: Daily budget.

Note: For non-CBO campaigns, BUDGET_MODE_DAY is deprecated for campaign objectives REACH, VIDEO_VIEWS, and ENGAGEMENT.

To learn about how to set budget modes, see Budget.

budget
Conditional
	
float
	
Required when budget_mode is BUDGET_MODE_DAY or BUDGET_MODE_DYNAMIC_DAILY_BUDGET or BUDGET_MODE_TOTAL.

Campaign budget.

To learn about the minimum budget and how to set budget modes, see Budget. To directly see the daily budget value range for a currency, see Currency-Daily budget value range.

rta_id
	
string
	
Realtime API (RTA) ID, the RTA strategy identifier.

To obtain the list of RTA IDs associated with your ad account, contact your TikTok representative.
To learn about the prerequisites for and the steps of enabling RTA for your ads, see Realtime API.

Note: Enabling RTA for your ads is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative. You will need to complete the onboarding process to be able to receive and respond to RTA requests sent to your system first.

rta_bid_enabled
	
boolean
	
Whether to use RTA bid.

Supported values:
true: enabled.
false: not enabled.
Default value: false.

You can only set this field to true when the following conditions are met:
objective_type is set to APP_PROMOTION, WEB_CONVERSIONS, or PRODUCT_SALES.
rta_id is passed.

Note: Enabling RTA bid is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

rta_product_selection_enabled
	
boolean
	
Whether to use RTA to automatically select products.

Enum values:
true: enabled.
false: not enabled.
Default value: false.

You can only set this field to true when the following conditions are met:
objective_type is set to PRODUCT_SALES.
campaign_product_source is set to CATALOG.
rta_id is passed.

operation_status
	
string
	

Note

For Reach & Frequency campaigns, please specify operation_status as ENABLE or do not pass in operation_status. Do not specify operation_status as DISABLE.

The status of the campaign when created. Enum values:
ENABLE : The campaign is enabled when created.
DISABLE : The campaign is disabled when created.
Default value: ENABLE.
If you want to update the status of the campaign after creation, use the /campaign/status/update/ endpoint.

postback_window_mode
	
string
	
Valid only when campaign_type is IOS14_CAMPAIGN and operation_status is DISABLE.

You can specify this field when you create a disabled campaign or when you disable an existing campaign by using /campaign/status/update/. The recommended practice is to specify this field when disabling an existing campaign.

The mode that determines which SKAN (SKAdNetwork) 4.0 postback you want to secure. Options with longer windows require more time to receive, and as a result, more time to release the campaign back to the available number.

Enum values:
POSTBACK_WINDOW_MODE1: This option secures the first postback, which corresponds to the 0-2 day attribution window. The data can take up to 4 days to return, and the campaign will wait for 4 days to release the campaign quota.
POSTBACK_WINDOW_MODE2: This mode secures the first two postbacks, which correspond to the 3-7 day attribution window. The data can take up to 13 days to return, and the campaign will wait for 13 days to release the campaign quota.
POSTBACK_WINDOW_MODE3: This mode secures all three postbacks, which correspond to the 8-35 day attribution window. The data can take up to 41 days to return, and the campaign will wait for 41 days to release the campaign quota.

To learn more about SKAN 4.0 attribution window configuration and campaign quota, see Dedicated Campaigns.

Note:

If you have set up Mobile Measurement Partner (MMP) Tracking with Adjust, Airbridge, Appsflyer, Branch, Kochava, or Singular for your App and your MMP SDK version is updated to a SKAN 4.0 supported SDK, you can transition your App to SKAN 4.0 on Events Manager. To learn about how to set up MMP tracking for your App, see How to Set Up App Attribution in TikTok Ads Manager. To learn more about how to transition your App to SKAN 4.0, see About SKAN 4.0 and TikTok and How to transition to SKAN 4.0.
Once set, this field cannot be updated.
If operation_status is set to ENABLE or not passed, this field will be ignored.
If you pass in this field when you have not enabled SKAN 4.0 for your App (app_id), an error will occur.
If this field is not passed when campaign_type is set to IOS14_CAMPAIGN, operation_status is set to DISABLE, and you have enabled SKAN 4.0 for your App, this field will default to POSTBACK_WINDOW_MODE1.
If you have enabled SKAN 4.0 for your App, ensure that you target devices running iOS 16.1 and later so that you can receive SKAN 4.0 postbacks. To only target iOS 16.1+ devices, set min_ios_version to 16.1 at the ad group level.

po_number
	
string
	
PO (purchase order) number.
PO numbers are useful for invoice tracking and reconciliation.

Learn more about PO numbers on monthly invoices.
Example
curl --location --request POST 'https://business-api.tiktok.com/open_api/v1.3/campaign/create/' \
--header 'Access-Token: {{Access-Token}}' \
--header 'Content-Type: application/json' \
--data '{
    "advertiser_id": "{{advertiser_id}}",
    "objective_type": "TRAFFIC",
    "campaign_name": "{{campaign_name}}",
    "budget_mode": "BUDGET_MODE_TOTAL",
    "budget": {{budget}}
}'

Response
Field	Data Type	Description

code
	
number
	
The response code. For the complete list of response codes and descriptions, see Appendix - Return Codes.

message
	
string
	
The response message. For details, see Appendix - Return Codes.

request_id
	
string
	
The log id of a request, which uniquely identifies the request.

data
	
object
	
Returned data.

advertiser_id
	
string
	
Advertiser ID.

campaign_id
	
string
	
Campaign ID.

create_time
	
string
	
Time at which the campaign was created.

modify_time
	
string
	
Time at which the campaign was Modified.

objective_type
	
string
	
Advertising objective.

For enum values, see Enumeration-Advertising Objectives.

app_promotion_type
	
string
	
App promotion type.

Enum values:
APP_INSTALL: App install. Get new users to install your app.
APP_RETARGETING: App retargeting. Re-engage existing users to take action in your app.
APP_PREREGISTRATION: App pre-registration. Get new users to pre-register before your app launches.

virtual_objective_type
	
string
	
The new objective type.

Enum value: SALES.

Use this field to create a campaign with the Sales objective, the combined objective for Website Conversions and Product Sales objectives. Learn more about the Sales objective.

sales_destination
	
string
	
Sales destination, the destination where you want to drive your sales.

Enum values:
TIKTOK_SHOP: TikTok Shop. Drive sales on your TikTok Shop.
WEBSITE: Website. Drive sales on your website.
APP: App. Drive sales on your app (product catalog required).
WEB_AND_APP: Website and app. Drive sales on both your website and your app.

is_search_campaign
	
boolean
	
Whether the campaign is a Search Ads Campaign. With Search Ads Campaigns, you can select keywords and serve ads within TikTok's search result page.

Supported values: true, false.

is_smart_performance_campaign
	
boolean
	
Whether the campaign is an automated campaign type.

Supported values:
true: The campaign is either a Smart+ Campaign or a Smart Performance Web Campaign.
false: The campaign is a standard campaign type.

Note: If is_smart_performance_campaign is true and objective_type is WEB_CONVERSIONS, you can confirm whether the web campaign is a Smart+ Web Campaign or Smart Performance Web Campaign by checking the returned spc_type from /campaign/spc/get/.

campaign_type
	
string
	
Campaign Type, which indicates the campaign is a regular campaign or iOS 14 campaign.

Enum values: REGULAR_CAMPAIGN, IOS14_CAMPAIGN.

app_id
	
string
	
The Application ID of the promoted app.

You can get app_id by using the /app/list/ endpoint.

is_advanced_dedicated_campaign
	
boolean
	
Whether the campaign is an Advanced Dedicated Campaign. Advanced Dedicated Campaigns leverage advanced delivery models that benefit from real-time signals.

Enum values: true, false.

disable_skan_campaign
	
boolean
	
Whether to disable SKAN (SKAdNetwork) attribution, Apple's conversion attribution solution for iOS campaigns.

Enum values:
true: To disable SKAN attribution. The campaign will not be bound by Dedicated Campaign quota limits and you will be able to retrieve Self Attribution Network (SAN) metrics for the campaign. However, you cannot retrieve SKAN reporting metrics for the campaign. Learn more about SAN integration.
false: To enable SKAN attribution. The campaign will be bound by Dedicated Campaign quota limits and you will be able to retrieve SKAN metrics for the campaign.

bid_align_type
	
string
	
The attribution type for the Dedicated Campaign. The type determines which attribution network the target CPA (conversion_bid_price) or ROAS (roas_bid) at the ad group level is based on.

Enum values:
SAN: SAN.
SKAN: SKAN.

campaign_app_profile_page_state
	
string
	
Indicates the status of App Profile Page.

Enum values: INVALID, UNSET, ON, OFF.

rf_campaign_type
	
string
	
When objective_type is specified as RF_REACH, this field shows whether the campaign has been set as a TikTok Pulse campaign.

Enum values: STANDARD (Reach & Frequency campaign), PULSE (TikTok Pulse campaign).

campaign_product_source
	
string
	
Returned only when objective_type for the campaign is PRODUCT_SALES and the product source is configured for the campaign.

Product source of the campaign.

Enum values:
CATALOG : Catalog.
STORE: TikTok Shop, or TikTok Showcase.

catalog_enabled
	
boolean
	
Whether to use your catalog to automatically advertise relevant products or services to people based on their unique interests, intent and actions.

campaign_name
	
string
	
Campaign name.

special_industries
	
string[]
	
Special ad categories.

Enum values:
HOUSING: Ads for real estate listings, homeowners insurance, mortgage loans or other related opportunities.
EMPLOYMENT: Ads for job offers, internship, professional certification programs or other related opportunities.
CREDIT: Ads for credit card offers, auto loans, long-term financing or other related opportunities.

budget_optimize_on
	
boolean
	
Returned only for campaigns with CBO enabled.

Whether CBO is enabled.

Enum values: true (enabled).

For details about CBO, see Campaign Budget Optimization.

bid_type
	
string
	
Bidding strategy on the campaign level.

deep_bid_type
	
string
	
Bidding strategy for in-app events.

For enum values and their descriptions, see Enumeration - Deep-level Bidding Strategy.

roas_bid
	
float
	
ROAS goal for Value Optimization.

optimization_goal
	
string
	
Optimization goal.

budget_mode
	
string
	
Budget mode.

Enum values:
BUDGET_MODE_INFINITE: Unlimited budget.
BUDGET_MODE_TOTAL: Lifetime budget.
BUDGET_MODE_DAY : Daily budget.
BUDGET_MODE_DYNAMIC_DAILY_BUDGET: Dynamic daily budget. It is the average daily budget over a week. Daily costs will not exceed 125% of the average daily budget. Weekly costs will not exceed the average daily budget * 7.

budget
	
float
	
Campaign budget.

rta_id
	
string
	
Realtime API (RTA) ID, the RTA strategy identifier.

rta_bid_enabled
	
boolean
	
Whether to use RTA bid.

Supported values:
true: enabled.
false: not enabled.

rta_product_selection_enabled
	
boolean
	
Whether to use RTA to automatically select products.

Enum values:
true: enabled.
false: not enabled.

operation_status
	
string
	
Operation status.

Enum values:
ENABLE : The campaign is enabled (in 'ON' status).
DISABLE: The campaign is disabled (in 'OFF' status).

secondary_status
	
string
	
Campaign status (Secondary status).

postback_window_mode
	
string
	
The mode that determines which SKAN 4.0 postback you want to secure.

Enum values:
POSTBACK_WINDOW_MODE1: This option secures the first postback, which corresponds to the 0-2 day attribution window. The data can take up to 4 days to return, and the campaign will wait for 4 days to release the campaign quota.
POSTBACK_WINDOW_MODE2: This mode secures the first two postbacks, which correspond to the 3-7 day attribution window. The data can take up to 13 days to return, and the campaign will wait for 13 days to release the campaign quota.
POSTBACK_WINDOW_MODE3: This mode secures all three postbacks, which correspond to the 8-35 day attribution window. The data can take up to 41 days to return, and the campaign will wait for 41 days to release the campaign quota.

is_new_structure
	
boolean
	
Whether the campaign is a new structure (for the same campaign, the structure of campaign, ad groups and ads are the same)

objective
	
string
	
Campaign type (application or landing page).

Enum values: APP(application), LANDING_PAGE(Landing page).

po_number
	
string
	
PO (purchase order) number.
PO numbers are useful for invoice tracking and reconciliation.

Learn more about PO numbers on monthly invoices.
Example
HTTPS/1.1 200 OK
{
    "code": 0,
    "message": "OK",
    "request_id": "{{request_id}}",
    "data": {
        "operation_status": "ENABLE",
        "modify_time": "{{modify_time}}",
        "create_time": "{{create_time}}",
        "campaign_id": "{{campaign_id}}",
        "roas_bid": 0,
        "campaign_name": "{{campaign_name}}",
        "campaign_type": "REGULAR_CAMPAIGN",
        "is_new_structure": true,
        "advertiser_id": "{{advertiser_id}}",
        "is_smart_performance_campaign": false,
        "objective": "LANDING_PAGE",
        "secondary_status": "CAMPAIGN_STATUS_ENABLE",
        "budget_mode": "BUDGET_MODE_TOTAL",
        "budget": {{budget}},
        "objective_type": "TRAFFIC",
        "deep_bid_type": null
    }
}

Was the information helpful?
Yes
No