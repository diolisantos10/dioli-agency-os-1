---
titulo: "Marketing API — /adgroup/create/ (posicionamento, público, orçamento, otimização, lance)"
url: https://business-api.tiktok.com/portal/docs?id=1739499616346114
capturado_em: 2026-09-08
hash: 27d8ef8150992b34
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
Get ad groups
Get the dynamic quota on active ad groups
Estimate audience size
Create an ad group
Update an ad group
Update the statuses of ad groups
Update the budgets of ad groups
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
Ad groups for iOS 14 Dedicated Campaigns
Comparing v1.2 and v1.3
Request
Corresponding billing event for an optimization goal
Example
Response
Example
Create an ad group

Use this endpoint to create an ad group. At the ad group level, you can configure placement, audience settings (see Ad Targeting), budget, schedules, as well as bidding and optimization options for ads. To learn about the procedure and the essential data fields to create an ad group, see Create an Ad Group.

Before you migrate your calls to v1.3, please see Migrate campaign management APIs to learn about the highlighted differences between v1.2 and v1.3 campaign management APIs.

To learn about the mapping between TikTok Ads Manager (TTAM) features at the campaign, ad group, and ad levels and the corresponding API configurations, see Mapping between campaign features on TikTok Ads Manager and API configurations.

Note
If you have specified special_industries at the campaign level, ensure that ad groups in the campaign meet the targeting requirements outlined in Targeting requirements for ad groups in a campaign with special ad categories.

Ad groups for iOS 14 Dedicated Campaigns

For an iOS 14 dedicated campaign, you can have up to 2 active ad groups. To create the ad group for an iOS 14 Dedicated Campaign, set the ios14_targeting field to IOS14_PLUS, which stands for devices where the iOS privacy updates have been enforced. You can see the iOS 14 Dedicated Campaign guide here.

Comparing v1.2 and v1.3

The following table outlines the differences between v1.2 and v1.3 endpoints.

Changes	v1.2	v1.3

Endpoint path
	
/v1.2/adgroup/create/
	
/v1.3/adgroup/create/

Request parameter name
	
placement
external_type
age
operation_system
connection_type
device_price
android_osv
ios_osv
ios_target_device
optimize_goal
external_action
deep_external_action
bid
conversion_bid
deep_cpabid
daily_retention_ratio
action_v2
user_actions
include_custom_actions
exclude_custom_actions
dpa_retargeting_type
dpa_retargeting_actions_days
brand_safety
enable_expansion
ad_app_profile_page_type
	
placements
promotion_type
age_groups
operating_systems
network_types
device_price_ranges
min_android_version
min_ios_version
ios14_targeting
optimization_goal
optimization_event
secondary_optimization_event
bid_price
conversion_bid_price
deep_cpa_bid
next_day_retention
actions
video_user_actions
included_custom_actions
excluded_custom_actions
shopping_ads_retargeting_type
shopping_ads_retargeting_actions_days
brand_safety_type
expansion_enabled
adgroup_app_profile_page_state

Request parameter data type
	
advertiser_id: number
campaign_id: number
app_id: number
store_id: number
pixel_id: number
catalog_id: number
skip_learning_phase: number
	
advertiser_id: string
campaign_id: string
app_id: string
store_id: string
pixel_id: string
catalog_id: string
skip_learning_phase: boolean

Request parameter name and data type
	
is_comment_disable: number
store_authorized_bc: number
audience: number[]
excluded_audience: number[]
location: number[]
interest_category_v2: number[]
interest_keywords: number[]
device_models: number[]
carriers_v2: number[]
video_download: string
pangle_block_app_list_id: number[]
action_categories: number[]
pangle_audience_package_include: number[]
pangle_audience_package_exclude: number[]
catalog_authorized_bc: number
automated_targeting: string
	
comment_disabled: boolean
store_authorized_bc_id: string
audience_ids: string[]
excluded_audience_ids: string[]
location_ids: string[]
interest_category_ids: string[]
interest_keyword_ids : string[]
device_model_ids : string[]
carrier_ids: string[]
video_download_disabled: boolean
blocked_pangle_app_ids: string[]
action_category_ids: string[]
included_pangle_audience_package_ids: string[]
excluded_pangle_audience_package_ids: string[]
catalog_authorized_bc_id: string
auto_targeting_enabled: boolean

New request parameters
	
/
	
shopping_ads_type
product_source
contextual_tag_ids
purchase_intention_keyword_ids
spending_power
request_id
share_disabled
promotion_target_type
zipcode_ids
isp_ids
category_exclusion_ids
vertical_sensitivity_id
search_result_enabled
click_attribution_window
view_attribution_window
attribution_event_count
shopping_ads_retargeting_custom_audience_relation
saved_audience_id
smart_audience_enabled
smart_interest_behavior_enabled
engaged_view_attribution_window
vbo_window
tiktok_subplacements
messaging_app_type
messaging_app_account_id
phone_region_code
phone_region_calling_code
phone_number
message_event_set_id
deep_funnel_optimization_status
deep_funnel_event_source
deep_funnel_event_source_id
deep_funnel_optimization_event
search_keywords
automated_keywords_enabled
app_config
custom_conversion_id
is_lhf_compliance

Request parameters deprecated in v1.3
	
/
	
cpv_video_duration
carriers

Enum values deprecated in v1.3
	
/
	
VIDEO_VIEW deprecated in the optimization_goal field
CPMVdeprecated in the bid_display_mode field

Response parameter
	
/
	
We now return the full info of ad entity in v1.3. For details, see the Response section in this page.

Response parameter data type
	
adgroup_id: number
	
adgroup_id: string
Request

Endpoint https://business-api.tiktok.com/open_api/v1.3/adgroup/create/

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
Allowed format: "application/json".

Parameters

Field	Data Type	Description

advertiser_id
Required
	
string
	
Advertiser ID.

campaign_id
Required
	
string
	
The ID of the campaign that the ad group belongs to.

adgroup_name
Required
	
string
	
Ad group name.

Length limit: 512 characters and cannot contain emoji.

request_id
	
string
	
Request ID with which you can create ad groups with duplicate names.
To create ad groups with duplicate names, send two requests for creating ad groups with the same adgroup_name and different request_id.

It also supports idempotency to prevent you from sending the same request twice within 10 seconds. If you retry requests with the same request ID multiple times within 10 seconds, then only one will succeed.

It is different from the request_id returned in the response parameters, which is used to uniquely identify an HTTP request.

The value should be a string representation of a 64-bit integer number.

Example: 123456789

shopping_ads_type
Conditional
	
string
	
Required and valid only when objective_type is PRODUCT_SALES.

Shopping ads type.

Enum values:
VIDEO: Video Shopping Ads.
LIVE: Live Shopping Ads.
PRODUCT_SHOPPING_ADS: Product Shopping Ads.

To find out the introduction to different Shopping Ads types and the steps of creating Video Shopping Ads, Live Shopping Ads, and Product Shopping Ads, see Create Shopping Ads.

identity_id
Conditional
	
string
	
Required and valid only when shopping_ads_type is VIDEO and product_source is SHOWCASE or shopping_ads_type is LIVE.

Identity ID.

identity_type
Conditional
	
string
	
Required and valid only when shopping_ads_type is VIDEO and product_source is SHOWCASE or shopping_ads_type is LIVE.

Identity type.

Enum values: AUTH_CODE (Authorized Post User), TT_USER (TikTok Business Account User), BC_AUTH_TT(The TikTok account that a Business Center is authorized to access).

See Identities for details.

identity_authorized_bc_id
Conditional
	
string
	
Required when identity_type is BC_AUTH_TT.

ID of the Business Center that a TikTok Account User in Business Center identity is associated with.

product_source
Conditional
	
string
	
Required only for Video Shopping Ads and Product Shopping Ads.

Product source where you want to get products for promotion.

Enum values: UNSET ,CATALOG(Catalog) , STORE (TikTok Shop),SHOWCASE(TikTok Showcase).

For Video Shopping Ads:
The product source setting at the campaign level via campaign_product_source determines the product source available at the ad group level:
If campaign_product_source is set to CATALOG at the campaign level, you can only set this field to CATALOG.
If campaign_product_source is set to STORE at the campaign level, you can only set this field to STORE or SHOWCASE.
If campaign_product_source is not set at the campaign level, and you have at least one historical ad group with product_source set as CATALOG and one with product_source set as STORE or SHOWCASE under the same campaign, you cannot create new ad groups under the campaign.
The product sources of ad groups under the same campaign should be CATALOG only, or a combination of STORE and SHOWCASE (STORE only, or SHOWCASE only, or both STORE and SHOWCASE).
For Product Shopping Ads, set this field to STORE.

catalog_id
Conditional
	
string
	
When product_source is CATALOG or STORE, this field is required.
When shopping_ads_type is LIVE, the parameters catalog_id, catalog_authorized_bc_id, store_id, store_authorized_bc_id are optional. If you specify a TikTok Shop through these parameters for your Live Shopping Ads, sales of products belonging to the TikTok Shop will be reported. If you don't specify a TikTok Shop, sales of products showcased in the TikTok account (identity_id) will be reported.

Catalog ID.

When product_source is CATALOG, set this field to the catalog that you want to promote products from.
When product_source is STORE, set this field to the catalog bound to the TikTok Shop that you want to promote products from.
You can use /store/list/ to get the catalog_id, store_id and store_authorized_bc_id for available stores under an ad account.

Note: Starting June 30th, 2024, when product_source is STORE, you will no longer need to pass catalog_id because it will be ignored.

catalog_authorized_bc_id
Conditional
	
string
	
Required when shopping_ads_type is VIDEO and product_source is CATALOG or STORE.
Optional when shopping_ads_type is LIVE.
Not supported when shopping_ads_type is PRODUCT_SHOPPING_ADS and product_source is STORE.

ID of the Business Center that has permission for the catalog.

For catalogs in Business Center, you must specify the ID of the Business Center that a catalog belongs to.

Note: Starting June 30th, 2024, when product_source is STORE, you will no longer need to pass catalog_authorized_bc_id because it will be ignored.

store_id
Conditional
	
string
	
Required in any of the following scenarios:
shopping_ads_type is VIDEO and product_source is STORE.
shopping_ads_type is PRODUCT_SHOPPING_ADS and product_source is STORE.
Optional when shopping_ads_type is LIVE.
ID of the TikTok Shop.

Note: To get the TikTok Shop ID, you can use /bc/asset/get/:

When in the response asset_type is TIKTOK_SHOP, the returned asset_id is the TikTok Shop ID.

store_authorized_bc_id
Conditional
	
string
	
Required when store_id is passed.

ID of the Business Center that is authorized to access the store (store_id).

promotion_type
Conditional
	
string
	
Promotion type (Optimization location).
You need to specify the field when advertising objective (objective_type) for your campaign is NOT set as REACH, VIDEO_VIEWS, or ENGAGEMENT.

For enum values, see Enumeration - Promotion Type.

Note: If objective_type is ENGAGEMENT at the campaign level, you can only use EXTERNAL_OR_DISPLAY in this field.

promotion_target_type
	
string
	
Valid when objective_type at the campaign level is LEAD_GENERATION.

The promotion type for Lead Generation objective. You can find out how to create lead generation ads in Lead Generation Ads.

Enum values:
INSTANT_PAGE：Instant Form. To create a fast-loading in-app TikTok Instant Form to collect more leads.
EXTERNAL_WEBSITE：Website Form. To use a landing page that has the Website Form or the TikTok Instant Page that redirects to the website with the Website Form to collect more leads.

Once this field is set to EXTERNAL_WEBSITE and optimization_goal is CLICK, do not pass pixel_id and optimization_event.

messaging_app_type
Conditional
	
string
	
Valid only when promotion_type is LEAD_GEN_CLICK_TO_SOCIAL_MEDIA_APP_MESSAGE.
When optimization_goal is CONVERSATION, this field is required.
When optimization_goal is CLICK, the default value for this field is IM_URL.

The type of instant messaging app or customized URL to use in the Instant Messaging Ad Group.

Enum values:
MESSENGER: Messenger. You need to simultaneously specify a Facebook Page ID via messaging_app_account_id.
WHATSAPP: WhatsApp. You need to simultaneously specify phone_region_code, phone_region_calling_code, and phone_number, which will be used to automatically populate the corresponding WhatsApp phone number.
ZALO: Zalo. You need to simultaneously specify phone_region_code, phone_region_calling_code, and phone_number to automatically populate the corresponding Zalo phone number.
LINE: Line. You need to simultaneously specify a LINE Business ID via messaging_app_account_id.
IM_URL: Instant Messaging URL.

To learn more about how to create TikTok Instant Messaging Ads, see Create a Lead Generation ad with optimization location as instant messaging apps.

Note:

When optimization_goal is CONVERSATION, you cannot set this field to ZALO, LINE, or IM_URL.
Once set, this field cannot be updated.

messaging_app_account_id
Conditional
	
string
	
Required when messaging_app_type is MESSENGER or LINE.
Ignored when messaging_app_type is WHATSAPP, ZALO, or IM_URL.

The ID of the instant messaging app account.
When messaging_app_type is MESSENGER, specify the Facebook Page ID via this field.
To find your Facebook Page ID, go to your Facebook Page and click About below your cover photo, then click Page transparency.
When messaging_app_type is LINE, specify the LINE Business ID via this field.
To find your LINE Business ID, go to your LINE official account page.
When messaging_app_type is WHATSAPP, this field will be ignored and be set as the corresponding WhatsApp phone number automatically populated based on the specified phone_region_code, phone_region_calling_code, and phone_number.

Note: Once set, this field cannot be updated.

phone_region_code
Conditional
	
string
	
Required when messaging_app_type is WHATSAPP or ZALO.

The region code for the WhatsApp or Zalo phone number.

Example: US.

To obtain the region code (phone_region_code) and region calling code (phone_region_calling_code) for the region that is associated with a specific phone number, use /tool/phone_region_code/.

Note: Once set, this field cannot be updated.

phone_region_calling_code
Conditional
	
string
	
Required when messaging_app_type is WHATSAPP or ZALO.

The region calling code for the WhatsApp or Zalo phone number.

Example: +1.

To obtain the region code (phone_region_code) and region calling code (phone_region_calling_code) for the region that is associated with a specific phone number, use /tool/phone_region_code/.

Note: Once set, this field cannot be updated.

phone_number
Conditional
	
string
	
Required when messaging_app_type is WHATSAPP or ZALO.

The WhatsApp or Zalo phone number.

For WhatsApp, use the same WhatsApp phone number connected to the Messagement Management Tool (MMT).

Note: Once set, this field cannot be updated.

promotion_website_type
Conditional
	
string
	
TikTok Instant Page type in the ad group.

Enum values:
UNSET: To not use TikTok Instant Page.
TIKTOK_NATIVE_PAGE: To use TikTok Instant Page.
If this field is set to TIKTOK_NATIVE_PAGE at the ad group level, pixel_id is not supported and you need to specify a TikTok Instant Page through page_id at the ad level.
To learn about how to create App Pre-registration ads, refer to here.

Note: When app_promotion_type at the campaign level is APP_PREREGISTRATION, this field is required.

app_id
Conditional
	
string
	
The App ID of the app to promote.

You can get app_id by using the /app/list/ endpoint.

Required in the following use cases:
When objective_type is APP_PROMOTION and app_promotion_type is APP_RETARGETING (App retargeting).
When objective_type is APP_PROMOTION , app_promotion_type is APP_INSTALL(App install) or APP_PREREGISTRATION (App Pre-registration), and it is not an iOS14 Dedicated Campaign.

Note: You cannot specify an App that has not activated the SAN module on your MMP through this field to create ad groups. To ensure that TikTok SAN integration is enabled for your App, see How to transition to SAN for existing apps and How to integrate to SAN for new apps.

pixel_id
Conditional
	
string
	
Required when optimization_goal is set to CONVERT or VALUE.
Not supported when optimization_goal is not set to CONVERT or VALUE.

Pixel ID.

To obtain the list of Pixel IDs within your ad account, use /pixel/list/.

optimization_event
Conditional
	
string
	
Required in any of the following scenarios:
pixel_id is specified.
pixel_id is not specified and optimization_goal is IN_APP_EVENT or VALUE.

Conversion event.

For the supported app and pixel events, see Conversion events.
To find out the supported events for your app, use /app/optimization_event/.

Note

For new ad groups created under one CBO campaign, this field should be the same as the first ad group.
When optimization_goal is PAGE_VISIT, optimization_event will be automatically set as PAGE_VISIT.

custom_conversion_id
	
string
	
The ID of the Custom Conversion to use in the ad group.

Valid only when the following conditions are all met:
Either pixel_id or app_id is specified.
A Custom Conversion has been configured for the pixel_id or app_id.
The optimization_goal is set to CONVERT or IN_APP_EVENT.
The parameter optimization_event is specified and matches the Standard Event associated with the Custom Conversion.
The status of the Custom Conversion is Active or No recent activity.

To obtain the list of Custom Conversions associated with a Pixel or an App, use /custom_conversion/list/.
To confirm the eligibility of the Custom Conversion for ad group creation:
Ensure the returned optimization_event matches the optimization_event specified during ad group creation.
Ensure the activity_status is NO_RECENT_ACTIVITY or ACTIVE.

app_config
Conditional
	
object[]
	
Required when sales_destination is WEB_AND_APP at the campaign level.

Details of the app or apps to promote.

Max size: 2.

You can specify any of the following in this field:
an Android app
an iOS app
an Android app and an iOS app

app_id
Conditional
	
string
	
Required when app_config is specified.

The App ID of the app to promote.

To obtain the list of App IDs within your ad account, use /app/list/ and check the returned app_id.

deep_funnel_optimization_status
	
string
	
Valid only when promotion_type is LEAD_GENERATION.

The status of deep funnel optimization.
Deep funnel optimization optimizes both your upper funnel events and deeper funnel events. You can select a secondary event alongside the primary optimization event, which can help improve campaign effectiveness.

Enum values:
ON: To enable deep funnel optimization.
OFF: To disable deep funnel optimization.
Default value: OFF.

To learn about how to configure deep funnel optimization for Lead Generation ads, see Lead Generation ad with optimization location as Instant Form and Lead Generation ad with optimization location as Website.

Note:

Deep funnel optimization with CRM events is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
Deep funnel optimization with Pixel or Offline events is generally available.

deep_funnel_event_source
Conditional
	
string
	
Required when deep_funnel_optimization_status is ON.

The event source type.

Enum values:
PIXEL: Pixel.
OFFLINE: Offline Event Set.
CRM: CRM Event Set.

deep_funnel_event_source_id
Conditional
	
string
	
Required when deep_funnel_optimization_status is ON.

Event Source ID.

When deep_funnel_event_source is PIXEL, specify a Pixel ID via this field.
To obtain a list of Pixels, use /pixel/list/.
When deep_funnel_event_source is OFFLINE, specify an Offline Event Set ID via this field.
To obtain a list of Offline Event Set IDs, use /offline/get/.
When deep_funnel_event_source is CRM, specify a CRM Event Set ID via this field.
To obtain a list of CRM Event Set IDs, use /crm/list/.

deep_funnel_optimization_event
Conditional
	
string
	
Required when deep_funnel_optimization_status is ON.

Deep funnel optimization event.

To find out the supported values for Standard Events available for Pixels, Offline Event Sets, and CRM Event Sets, see the "Event name for ad creation" column in Supported Pixel events.
To find the list of optimization events for a Pixel, use /pixel/list/ and check the returned optimization_event.

Example: SHOPPING.

placement_type
	
string
	
The placement strategy that decides where your ads will be shown.

Enum values:
PLACEMENT_TYPE_AUTOMATIC: Automatic placement. TikTok's ad system will use smart calculations to give you the best combination of ad placements across all apps.
PLACEMENT_TYPE_NORMAL: Select placement. By selecting your placement manually, you'll be able to choose the apps to deliver your ads on.

Default value: PLACEMENT_TYPE_NORMAL.

Note:

placement_type cannot be updated after the ad group has been created.
If you set this field to PLACEMENT_TYPE_AUTOMATIC, the actual supported placements will be shown in the returned placements. For instance, if the actual supported placement is TikTok only, the returned placements value will be PLACEMENT_TIKTOK.

placements
Conditional
	
string[]
	
When placement_type is PLACEMENT_TYPE_NORMAL, this field is required.
When placement_type is PLACEMENT_TYPE_AUTOMATIC, this field is ignored and overwritten to the combination of ad placements that the TikTok ad system selects for your ad.

The apps where you want to deliver your ads.

Note:

placements cannot be updated after the ad group has been created.
Currently, we support PLACEMENT_TIKTOK, PLACEMENT_PANGLE and PLACEMENT_GLOBAL_APP_BUNDLE. Please don't select PLACEMENT_TOPBUZZ or PLACEMENT_HELO as your placements since they've been deprecated. For a full list of enum values, see Enumeration - Placement.
The available locations you can target with the Global App Bundle placement (PLACEMENT_GLOBAL_APP_BUNDLE) are: Brazil, Indonesia, Vietnam, the Philippines, Thailand, Malaysia, Mexico, Saudi Arabia, and Japan.
The Global App Bundle placement (PLACEMENT_GLOBAL_APP_BUNDLE) does not support the optimization goal Landing Page View (optimization_goal=TRAFFIC_LANDING_PAGE_VIEW). To learn about the optimization goal, refer to the section Enumerations-Optimization goal.
Using the Global App Bundle placement (PLACEMENT_GLOBAL_APP_BUNDLE) in your Auction Reach ad group is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
If objective_type is REACH at the campaign level and you include PLACEMENT_GLOBAL_APP_BUNDLE in the placements value at the ad group level, you cannot simultaneously specify contextual_tag_ids.
If objective_type is REACH at the campaign level and you set placements to ["PLACEMENT_GLOBAL_APP_BUNDLE"] at the ad group level, you cannot set brand_safety_type to THRID_PARTY.
For Product Sales campaigns (objective_type = PRODUCT_SALES), only TikTok placement (PLACEMENT_TIKTOK) is supported.

tiktok_subplacements
	
string[]
	
Valid only when the following conditions are met:
At the campaign level: objective_type is REACH, VIDEO_VIEWS, or ENGAGEMENT.
At the ad group level: placements is ["PLACEMENT_TIKTOK"] and placement_type is PLACEMENT_TYPE_NORMAL.

The subplacements within TikTok for your ads, allowing you to choose where your ads will appear.

Enum values:
IN_FEED: In-feed. Ads will be placed in the For You feed and might also be placed in Profile Page and Following feeds.
SEARCH_FEED: Search feed.
TIKTOK_LITEto-be-deprecated: TikTok Lite, a streamlined version of TikTok that features a smaller app size and faster video loading speed. The TikTok Lite subplacement is currently available for Japan or South Korea as targeting locations.
LEMON8: Lemon8, a community app for lifestyle content, focusing on real-life experiences, tips, guides, and product reviews. By including Lemon8 as a subplacement, your ads will appear in its For You feed, Search feed, and Immersive Video feed. Learn more about Lemon8.
You can only include LEMON8 in tiktok_subplacements when objective_type is REACH.

If you pass tiktok_subplacements, you need to at least include IN_FEED in the tiktok_subplacements value.
To include TIKTOK_LITE in the tiktok_subplacements value, you need to include locations in Japan or South Korea in your targeted locations (location_ids). Otherwise, an error will occur.
If you include SEARCH_FEED, TIKTOK_LITE, or LEMON8 in the tiktok_subplacements value, you cannot set brand_safety_type to THRID_PARTY.
If objective_type is REACH at the campaign level and you include LEMON8 in the tiktok_subplacements value at the ad group level, you cannot simultaneously specify contextual_tag_ids.

Note:

Starting July 19th, 2025, you will no longer be able to create or copy ad groups using the TikTok Lite subplacement (TIKTOK_LITE). To ensure a smooth and uninterrupted ad creation experience, we recommend that you avoid creating new ad groups with this subplacement or copying campaigns that contain such ad groups.
Using the TikTok Lite subplacement (TIKTOK_LITE) in your ad group is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
Using the Search feed subplacement (SEARCH_FEED) in your ad group is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
Using the Lemon8 subplacement (LEMON8) in your Auction Reach ad group is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
Once set, this field cannot be updated.
If you create an ad group with TIKTOK_LITE in the tiktok_subplacements value, you cannot update the ad group to exclude Japan and South Korea from your targeted locations (location_ids).
The only interactive add-on type that the Search feed subplacement (SEARCH_FEED) supports is Display Card. However, the interactive add-on type might not be supported for your advertising objective. To learn about the detailed compatibility information between Display Card and advertising objectives, see Cards.
The only interactive add-on types that the TikTok Lite subplacement (TIKTOK_LITE) supports are Display Card, Countdown Sticker, and Gift Code Sticker. However, the interactive add-on types might not be supported for your advertising objective. To learn about the detailed compatibility information between these add-ons and advertising objectives, see Cards and Stickers.

search_result_enabled
	
boolean
	
Whether to include your ads in Search Ads, namely to show your ads to users when they search for your business on TikTok.

If the advertising objective (objective_type) is one of the following objectives: APP_PROMOTION, WEB_CONVERSIONS , TRAFFIC, LEAD_GENERATION, and you specify placement_type as PLACEMENT_TYPE_AUTOMATIC, or specify placement_type as PLACEMENT_TYPE_NORMAL and include PLACEMENT_TIKTOK in placements, this field will be automatically set to true. In this case, you can either omit the field or set this field as true to enable Automatic Search Placement. Alternatively, you can set this field as false to disable Automatic Search Placement.
If the advertising objective (objective_type) is WEB_CONVERSIONS, TRAFFIC, or LEAD_GENERATION with is_search_campaign as true, this field will be automatically set to false because the Search Ads Campaign is incompatible with the Automatic Search Placement. In this case, you cannot set this field as true.
If the advertising objective (objective_type) is not one of the following objectives: APP_PROMOTION, WEB_CONVERSIONS , TRAFFIC, LEAD_GENERATION or if you specify placement_type as PLACEMENT_TYPE_NORMAL and do not include PLACEMENT_TIKTOK in placements, this field will be automatically set to false. In this case, you cannot set this field as true.

To learn more about Search Ads, see Create Search Ads.

automated_keywords_enabled
	
boolean
	
Valid only when at the campaign level is_search_campaign is true.

Whether to enable automated keywords and let the system automatically generate keywords after you add ads. This expands high-quality traffic to improve performance. View high-performing automated keywords in reporting.

Supported values: true, false.
Default value: false.

Note:

Automated keywords in Search Ads Campaigns are currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

search_keywords
Conditional
	
object[]
	
Required for Search Ads Campaigns (is_search_campaign is true at the campaign level).
Not supported for non-Search Ads Campaigns (is_search_campaign is false at the campaign level).

A list of search keywords, that is, words or phrases that are used to match your ads with the terms people are searching for.

Max size: 1,000.

To confirm whether a campaign is a Search Ads Campaign, call /campaign/get/ and check the is_search_campaign returned for the campaign.

To learn more about Search Ads Campaigns, see Create Search Ads Campaigns.

Note:

For each ad group, you can configure a maximum of 1,000 search keywords.

keyword
Conditional
	
string
	
When search_keywords is passed, you need to provide at least one keyword and the corresponding match_type.

The search keyword.

Length limit: 80 characters.
The name needs to exclude emojis and the following special characters: ! # $ % & ( ) * - / : ; < > ? @ \ ^ _ ¥ ……. Otherwise, an error will occur.

To obtain the review result for search keywords, call /adgroup/get/ and check the audit_status within the search_keywords object array.

Important: Search keywords must comply with TikTok's Advertising Terms and Community Guidelines.

If all of your keywords are found to be non-compliant, your campaign will not be delivered.
If part of your search keywords are rejected, you need to remove the violative keyword(s) or replace them with a suitable alternative by using /adgroup/update/. Your campaign will continue with the approved keywords.

match_type
Conditional
	
string
	
When search_keywords is passed, you need to provide at least one keyword and the corresponding match_type.

The match type for the search keyword.

Enum values:
PRECISE_WORD: exact match. Your ads will only show for user search queries that exactly match these keywords.
PHRASE_WORD: phrase match. Your ads will only show for these specific keywords if users search these keywords in the same order.
BROAD_WORD: broad match. Your ads will show for user search queries for any of the words you have included, even if the words are in a different order.

keyword_bid_type
	
string
	
The bid type for the keyword and match type combination.

Enum values:
FOLLOW_ADGROUP: To use the ad group level bid (bid_price) as the keyword_bid.
CUSTOM: To customize the bid via keyword_bid.

Default value: FOLLOW_ADGROUP.

The enum value CUSTOM is valid only when the following conditions are met:
At the campaign level:
objective_type is TRAFFIC
is_search_campaign is true.
At the ad group level:
bid_type is BID_TYPE_CUSTOM
bid_price is specified.

keyword_bid
Conditional
	
float
	
Required and valid only when keyword_bid_type is CUSTOM.
Ignored when keyword_bid_type is FOLLOW_ADGROUP.

The bid price for the keyword and match type combination.

Value range: >0.

comment_disabled
	
boolean
	
Whether to allow comments on your ads on TikTok.

video_download_disabled
	
boolean
	
Whether users can download your video ads on TikTok(cannot be updated once created).

share_disabled
	
boolean
	
Whether to disable sharing of ads in this ad group to third-party platforms.

Default value: false.

The value trueis valid when the conditions below are all met:
objective_type at the campaign level is set as one of the following objectives: APP_PROMOTION, WEB_CONVERSIONS, REACH, TRAFFIC, VIDEO_VIEWS, ENGAGEMENT, LEAD_GENERATION.
Placement:
placement_type= PLACEMENT_TYPE_AUTOMATIC or
placement_type= PLACEMENT_TYPE_NORMAL, and placements = PLACEMENT_TIKTOK

blocked_pangle_app_ids
	
string[]
	
Pangle app block list ID.

You can get an ID via the app_package_id field returned by Get Pangle block list. It only takes effect when Pangle placement is selected.

saved_audience_id
	
string
	
This field is supported under the following conditions:
The category of Housing, Employment, or Credit (specical_industries) is NOT specified in your campaign.
AND the advertising objective (objective_type) is NOT Product Sales (PRODUCT_SALES) in your campaign.
AND TikTok placement is selected in your ad group (i.e., placement_type is set as PLACEMENT_TYPE_AUTOMATIC or placement_type is set as PLACEMENT_TYPE_NORMAL and PLACEMENT_TIKTOK is included in placements).
AND automatic targeting is NOT used in your ad group(i.e., auto_targeting_enabled is NOT set to true).

Saved Audience ID.
Before using this field, call /dmp/saved_audience/create/ to create a Saved Audience and get the Saved Audience ID in response. The advertiser ID associated with your Saved Audience should be the same as the advertiser ID in your ad group. Otherwise, an error will occur.
If you use saved_audience_id to create an ad group, we will return both the Saved Audience ID and the targeting options that are included within your Saved Audience in response.
See Create a Saved Audience to find out the detailed workflow and code examples.

Note:
When creating a Saved Audience via /dmp/saved_audience/create/, you can specify targeting options such as gender. However, if you are creating an ad group using a Saved Audience, you must avoid concurrently setting both the saved_audience_id and targeting options (like gender) already within your Saved Audience. Otherwise, an error will occur.
If the device setting of your Saved Audience is in conflict with the device settings of the ad group, an error will occur. Examples include:
When the operating system for your Saved Audience is Android, but while creating an ad group, you set ios14_targeting as IOS14_PLUS.
When you specify APP_PROMOTION as the objective_type field at the campaign level and use the App ID of an Android App in your ad group, yet your Saved Audience's operating system is iOS.
If your API request throws an error that is associated with a conflict between your Saved Audience configurations and ad group configurations, the current error message will indicate that the issue pertains to your audience targeting option. To resolve this, we recommend using /dmp/saved_audience/list/ to check the details of the corresponding targeting option to identify the source of the problem and then create a new Saved Audience if necessary.
If the saved_audience_id was created with age_groups specified, the age restriction rules outlined in New age restrictions for ads on TikTok for different advertising objectives also apply. Make sure that the age targeting setting is allowed before you use the Saved Audience (saved_audience_id ) in the ad group.

auto_targeting_enabled
To be deprecated
	
boolean
	
Whether to enable automated targeting.

Note: Starting June, 2024, you can no longer enable Automatic targeting or Targeting expansion for your ad groups. To ensure a smooth API integration, we recommend you migrate to Smart Targeting.

shopping_ads_retargeting_type
Conditional
	
string
	
Required when shopping_ads_type is VIDEO and product_source is CATALOG.

The retargeting type of shopping ads.

Enum values:
LAB1: Retargeting audiences who viewed products or added products to cart but didn't purchase products.
LAB2: Retargeting audiences who added products to cart but didn't purchase products.
LAB3: Retargeting audiences using custom combination.
OFF: No retargeting.

shopping_ads_retargeting_actions_days
Conditional
	
number
	
Required when shopping_ads_retargeting_type is LAB1 or LAB2.

The valid time range for the specified audience action. Audiences who have completed the specified action within the time range will be retargeted by the shopping ads.

Value range: 1, 2, 3, 7, 14, 30, 60, 90, 180.

included_custom_actions
Conditional
	
object[]
	
When shopping_ads_retargeting_type is LAB3, you need to pass in either included_custom_actions or excluded_custom_actions.

The custom action that you want to use as "Include" conditions for filtering out the shopping ads audiences to be retargeted.

code
	
string
	
The custom action used to filter out the audiences to be retargeted.

Enum values:
VIEW_PRODUCT: The audience viewed the product.
ADD_TO_CART: The audience added the product to the cart.
PURCHASE: The audience purchased the product.

days
	
integer
	
The time range used to filter out the audiences that completed the specified action.

Value range: [1,180].

excluded_custom_actions
Conditional
	
object[]
	
When shopping_ads_retargeting_type is LAB3, you need to pass in either included_custom_actions or excluded_custom_actions.

The custom action that you want to use as "Exclude" conditions for filtering out the shopping ads audiences to be retargeted.

code
	
string
	
The custom action used to filter out the audiences to be retargeted.

Enum values:
VIEW_PRODUCT: The audience viewed the product.
ADD_TO_CART: The audience added the product to the cart.
PURCHASE: The audience purchased the product.

days
	
integer
	
The time range used to filter out the audiences that didn't complete the specified action.

Value range: [1,180].

shopping_ads_retargeting_custom_audience_relation
	
string
	
Valid only when the following conditions are all met:
shopping_ads_type is set to VIDEO.
product_source is set to CATALOG.
shopping_ads_retargeting_type is passed and set to LAB1, LAB2, or LAB3.
audience_ids is passed.

The logical relation between the Video Shopping Ads (VSA) retargeting audience specified by shopping_ads_retargeting_type and the custom audience specified by audience_ids.

Enum values:
OR: To combine the VSA retargeting audience and the custom audience to create the targeted audience. The targeted audience will consist of individuals who belong to either the VSA retargeting audience or the custom audience.
AND: To intersect between the VSA retargeting audience and the custom audience to create the targeted audience. The targeted audience will consist of individuals who belong to both the VSA retargeting audience and the custom audience.

If this field is not set, the targeted audience will consist of individuals who belong to both the VSA retargeting audience and the custom audience.

Note: Once set, this field cannot be manually updated to a null value.

location_ids
Conditional
	
string[]
	
You need to set location_ids or zipcode_ids or both.

IDs of the locations that you want to target.

Max size: 3,000. If you provide both location_ids and zipcode_ids, the combined total of location IDs, zip code IDs, and postal code IDs cannot exceed 3,000 per ad group.

To get the available locations and corresponding IDs based on your placement and objective, use the /tool/targeting/search/ or /tool/region/ endpoint. To get the list of location IDs, see Location IDs.

Note:

Overlapping targeted locations are not supported. For instance, you cannot target the U.S. and the state of California at the same time.
If you target locations in the US via location_ids or zipcode_ids during ad group creation, you can subsequently update those IDs to other US locations but you cannot remove all US locations to target only non-US countries.

zipcode_ids
Conditional
	
string[]
	
You need to set location_ids or zipcode_ids or both.

Zip code IDs or postal code IDs that you want to use to target locations.

Max size: 3,000. If you provide both location_ids and zipcode_ids, the combined total of location IDs, zip code IDs, and postal code IDs cannot exceed 3,000 per ad group.

You can get the available zip code IDs or postal code IDs based on your placement, objective and keyword via geo_id (when geo_type = ZIP_CODE) returned from the /tool/targeting/search/ endpoint.

Note:

Zip code targeting is currently only supported for the US and postal code targeting is currently only supported for Canada, Brazil, Indonesia, Thailand, and Vietnam.
Targeting postal code areas in Brazil, Indonesia, Thailand, and Vietnam is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
You cannot use zip code targeting or postal code targeting in campaigns that have enabled special ad categories (special_industries).
You cannot use zip code targeting or postal code targeting in campaigns with the objective_type as RF_REACH.
You can only use zip code targeting or postal code targeting on TikTok placement. Therefore, the placements value needs to include PLACEMENT_TIKTOK.
Overlapping targeted locations are not supported. For instance, you cannot target the US and the state of California at the same time.
If you target locations in the US via location_ids or zipcode_ids during ad group creation, you can subsequently update those IDs to other US locations but you cannot remove all US locations to target only non-US countries.
To get information about the zip code IDs or postal code IDs, you can only use /tool/targeting/info/.

languages
	
string[]
	
Codes of the languages that you want to target.

For the list of languages codes supported, see Enumeration - Language Code.

You can get language codes via /tool/language/, and if you don't want to limit the languages you target, assign an empty value to this field or do not pass in this field.

gender
	
string
	
Gender that you want to target.

Enum values: GENDER_FEMALE,GENDER_MALE,GENDER_UNLIMITED.

age_groups
	
string[]
	
Age groups you want to target.

For enum values, see Enumeration - Age Group.

In certain scenarios, creation of ad groups that target the age group 13-17 (AGE_13_17) in the US, Latin America, the European Economic Area, the UK, Switzerland, or Canada will not be allowed. See New age restrictions for ads on TikTok to learn more.
If you use targeting options that are not supported for the age group 13-17 in the US , Latin America, the European Economic Area, the UK, Switzerland, or Canada and leave the age_groups field unspecified or set it as [], the field will default to ["AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_54", "AGE_55_100"].

Note: If the ad group targets the age group 13-17 (AGE_13_17) in the US, Latin America, the European Economic Area, the UK, Switzerland, or Canada and you typically leave the age_groups field unspecified or set it as [], we recommend that you explicitly specify the exact age groups that you want to target, such as AGE_18_24, in the field.

spending_power
	
string
	
Spending power that you want to target.

Enum values: ALL, HIGH.
If it is set to HIGH, you can target high spending users who typically spend more on purchases on TikTok ads than average users.

Note:

This field does not support the advertising objectives PRODUCT_SALES and RF_REACH at the campaign level. See Advertising objectives for details.
This field supports Automatic Placement and Select Placement with TikTok included. Therefore, you need to set placement_type to PLACEMENT_TYPE_AUTOMATIC, or include PLACEMENT_TIKTOK in the value of placements. Note that if you specify Pangle as a placement, the spending power targeting won't take effect on Pangle.
When auto_targeting_enabled is true at the ad group level, then spending_power will be automatically set to ALL.

household_income
	
string[]
	
Household income that you want to target.

Enum values: TOP5(Top 5% of ZIP codes), TOP10(Top 10% of ZIP codes), TOP10_25(Top 10% -25% of ZIP codes), TOP25_50(Top 25% - 50% of ZIP codes).

Note:

It only supports the ad objectives for Auction ads. See Advertising objectives for details.
It is only applicable to the TikTok Placement in the US.

audience_ids
	
string[]
	
List of audience IDs.

You can get audience IDs by using the /dmp/custom_audience/list/ endpoint.

smart_audience_enabled
	
boolean
	
Whether to turn on Smart audience.

Supported values: true, false.

To learn more about Smart audience and how to turn on Smart audience, see Smart Targeting.

excluded_audience_ids
	
string[]
	
List of audience ID to be excluded.

You can get audience IDs by using the /dmp/custom_audience/list/ endpoint.

interest_category_ids
	
string[]
	
IDs of general interest categories that you want to use to target audiences.

To search for or list general interest category IDs, use /targeting/search/ (recommended) or /tool/interest_category/.
To get recommended interest category IDs based on your industry, use /tool/targeting_category/recommend/.

interest_keyword_ids
	
string[]
	
IDs of additional interest categories that you want to use to target audience.

To search for additional interest categories, use /targeting/search/ (recommended) or /tool/interest_keyword/recommend/.

purchase_intention_keyword_ids
	
string[]
	
IDs of purchase intention categories that you want to use to target audiences with an interest in purchases related to a content category.

To search for or list purchase intention category IDs, use /targeting/search/.

Note:

Do not pass in purchase_intention_keyword_ids and interest_keyword_ids at the same time. Otherwise, keyword conflict will occur.
purchase_intention_keyword_ids only supports Auction ads with theobjective_type as APP_PROMOTION,WEB_CONVERSIONS，LEAD_GENERATION, TRAFFIC, or PRODUCT_SALES with product_source as CATALOG, and the placement setting should include TikTok (PLACEMENT_TIKTOK) or Pangle (PLACEMENT_PANGLE).

actions
	
object[]
	
A list of targeting behavioral category objects.

action_scene
	
string
	
The type of user behavior that you want to target.

Enum values:
VIDEO_RELATED: Video interactions.
CREATOR_RELATED: Creator interactions.
HASHTAG_RELATED: Hashtag interactions.

action_period
	
number
	
Select a time period to include behaviors from.

Enum values: 0, 7, 15.

If action_scene is CREATOR_RELATED or HASHTAG_RELATED, 0 will be used regardless of the value you pass in. 0 means that there is no definite timeframe to select actions from.

Note: Currently, when creating an ad group with video interactions targeting (action_scene= VIDEO_RELATED) via TikTok Ads Manager, you cannot select the time period (action_period), and 15 days (15) will be used by default. However, when creating ad groups via API, 0, 7, or 15 can still be passed.

video_user_actions
	
string[]
	
The specific user interactions that you want to target for the user behavior type.

If action_scene is VIDEO_RELATED, the allowed values are: WATCHED_TO_END,LIKED,COMMENTED,SHARED.
If action_scene is CREATOR_RELATED, the allowed values are: FOLLOWING, VIEW_HOMEPAGE.
If action_scene is HASHTAG_RELATED, the allowed value is VIEW_HASHTAG.

Note:
Currently, when creating an ad group via TikTok Ads Manager (TTAM), you cannot define the kind of user actions (video_user_actions). By default, the ad group created via TTAM will use the options as follows:

For an ad group with video interaction targeting (action_scene= VIDEO_RELATED), all the four options (["WATCHED_TO_END","LIKED","COMMENTED","SHARED"]) will be used.
For an ad group with creator interaction targeting (action_scene=CREATOR_RELATED), both options(["FOLLOWING","VIEW_HOMEPAGE"]) will be used.
However, when creating ad groups via API, you can still pass in the desired enum value combinations, for example: ["LIKED","COMMENTED"] if action_scene=VIDEO_RELATED.

action_category_ids
	
string[]
	
Valid only when TikTok placement is the only placement selected.

IDs of the video interactions categories, creator interactions categories, hashtags, or hashtag bundles that you want to use to target audiences.

To search for or list video interactions category IDs or creator interactions category IDs, use /targeting/search/ (recommended) or /tool/action_category/.
To get hashtag IDs or hashtag bundle IDs, use /targeting/search/ (recommended) or /tool/hashtag/recommend/.
To get recommended video interactions category IDs, creator interactions category IDs, hashtag IDs, or hashtag bundle IDs based on your industry, use /tool/targeting_category/recommend/.

smart_interest_behavior_enabled
	
boolean
	
Whether to turn on Smart interests & behaviors.

Supported values: true, false.

To learn more about Smart interests & behaviors and how to turn on Smart interests & behaviors, see Smart Targeting.

included_pangle_audience_package_ids
	
string[]
	
Valid only for Pangle placement. Do not specify this field and excluded_pangle_audience_package_ids at the same time.

IDs of the Pangle audiences that you want to include.

You can get audience IDs (package_id) by using the /pangle_audience_package/get/ endpoint. The bind_type for the package should be INCLUDE.

excluded_pangle_audience_package_ids
	
string[]
	
Valid only for Pangle placement. Do not specify this field and included_pangle_audience_package_ids at the same time.

IDs of the Pangle audiences that you want to exclude.

You can get audience IDs (package_id) by using the /pangle_audience_package/get/ endpoint. The bind_type for the package should be EXCLUDE.

operating_systems
Conditional
	
string[]
	
Device operating systems that you want to target.

Only one value is allowed.

Enum values: ANDROID, IOS.

This field is required in two scenarios:
objective_type is APP_PROMOTION
objective_type is TRAFFIC and promotion_type is APP_IOS or APP_ANDROID

min_android_version
	
string
	
Minimum device Android version.

For enum values, see Enumeration - Minimum Android Version.

ios14_targeting
Conditional
	
string
	
Required and must be specified as IOS14_PLUS when campaign_type at the campaign level is IOS14_CAMPAIGN.

The iOS devices that you want to target.

Enum values:
UNSET: Devices with iOS 14.4 or earlier versions.
IOS14_MINUS: Devices with versions earlier than iOS 14.0, which are not affected by the iOS 14 privacy update.
IOS14_PLUS: Devices with iOS 14.5 or later versions. The iOS 14 privacy update has been enforced in this group of devices. This value is only supported for Dedicated Campaigns. Specify this value if you want to create an iOS 14 campaign. Each iOS 14 campaign can have up to 2 active ad groups.
ALL: Devices with iOS 14.5 or later versions. The iOS 14 privacy update has been enforced in this group of devices. This value is only supported for iOS App Retargeting ads and iOS retargeting Video Shopping Ads with product source as catalog and optimization location as App.
To target devices with iOS 14.5 or later versions in App Retargeting ads, you need to set ios14_targeting to ALL and set min_ios_version to 14.5 or a later version. Otherwise, an error will occur.
To target devices with iOS 14.4 or earlier versions in App Retargeting ads, you don't need to pass ios14_targeting.

For the following two scenarios, the value ALL will be used regardless of the value you pass in.
iOS App Retargeting ads:
app_promotion_type is APP_RETARGETING
and promotion_type is APP_IOS
iOS retargeting Video Shopping Ads with product source as catalog and optimization location as App:
shopping_ads_type is VIDEO
product_source is CATALOG
promotion_type is APP_IOS
and shopping_ads_retargeting_type is not OFF
For other scenarios, the default value is UNSET.

Once set to IOS14_PLUS, this field cannot be updated, and the following requirements must be met.
At the ad group level:
app_id is set to the ID of an iOS App.
To get iOS App IDs, use /app/list/. The platform of an iOS App should be IOS.
operating_systems is set to ["IOS"].
min_ios_version is passed and the value should be consistent with the value of ios14_targeting.
optimization_goal is set to CLICK, INSTALL, IN_APP_EVENT or VALUE.
The following fields are not specified:
min_android_version
shopping_ads_retargeting_type
shopping_ads_retargeting_actions_days
At the ad level:
deeplink_type is not set to DEFERRED_DEEPLINK.

min_ios_version
Conditional
	
string
	
Required when ios14_targeting is specified.

Minimum iOS version.

For enum values, see Enumeration - Minimum iOS Version.

device_model_ids
	
string[]
	
IDs of the device models that you want to target.

Use /tool/device_model/ to get the complete list of device model IDs and their statuses, and only active devices (is_active = True in the response of /tool/device_model/) can be used to create ads.

Note: Device model (device_model_ids) and device price (device_price_ranges) cannot be set at the same time.

network_types
	
string[]
	
Device connection types that you want to target.

For enum values, see Enumeration - Connection Type.

carrier_ids
	
string[]
	
Carriers that you want to target.

The carriers must be consistent with the location(s) that you want to target.

Use /tool/carrier/ to get the enum values. A carrier is valid only when the in_use field for the carrier is true.

isp_ids
	
string[]
	
Valid only when you specify a valid location ID at the country or region level via location_ids at the same time.

IDs of the Internet service providers (ISP) that you want to target.

You can use /tool/targeting/list/ to get the ISP IDs that you can target for a location ID.

Note: When you pass in isp_ids, you cannot set the placement as Global App Bundle only (placements =PLACEMENT_GLOBAL_APP_BUNDLE).

device_price_ranges
	
number[]
	
Targeting device price range.

10000 means 1000+. The numbers must be in multiples of 50.

Important: The upper limit you set will be added by 50 and the resulting new number will be used as the actual upper limit for device targeting. The actual upper limit is shown in the ad group settings in TikTok Ads Manager. If you set and get the price range of [0, 250], it actually means [0, 300].

targeting_expansion
To be deprecated
	
object
	
Settings about targeting expansion.

Note: Starting June, 2024, you can no longer enable Automatic targeting or Targeting expansion for your ad groups. To ensure a smooth API integration, we recommend you migrate to Smart Targeting.

expansion_enabled
	
boolean
	
Whether to enable targeting expansion

expansion_types
Conditional
	
string[]
	
Required when expansion_enabled is true.

The target audience types that you want to expand.

Target audience types that are eligible for expanding must already have a value or selection.

Enum values:
AGE
GENDER
INTEREST_AND_BEHAVIOR: This type includes ad_tag_v2, video_action, action_categories, and action_scene.
CUSTOM_AUDIENCE: This type includes retargeting_tags and retargeting_tags_exclude

audience_type
Conditional
	
string
	
Required and valid only when app_promotion_type is APP_RETARGETING at the campaign level.
Not supported when app_promotion_type is not set to APP_RETARGETING at the campaign level.

App retargeting audience type.

Enum value:NEW_CUSTOM_AUDIENCE (retargeting custom audience).

If you want to specify an empty retargeting custom audience for your App Retargeting ads, do not pass audience_ids and excluded_audience_ids.
If you want to specify a non-empty retargeting custom audience for your App Retargeting ads, you can specify an Include Audience via audience_ids, or an Exclude Audience via excluded_audience_ids , or both simultaneously.
If both audience_ids and excluded_audience_ids are specified, they cannot contain the same IDs.

audience_rule
	
object
	
Rules that specify your audience, valid if objective_type is TRAFFIC or APP_PROMOTION.

For details, see Audience Rules.

contextual_tag_ids
	
string[]
	
Contextual tag IDs.

You can use /tool/contextual_tag/get/ to get available contextual tags.

See Contextual targeting to learn more about how to use contextual targeting.

Note:

This is an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
Only supports REACH and VIDEO_VIEWS as objectives (objective_type) at the campaign level.
Not supported when brand_safety_type is set to THIRD_PARTY.

brand_safety_type
	
string
	
Valid only when placements is set to ["PLACEMENT_TIKTOK"].

Brand safety type.

Default value: NO_BRAND_SAFETY.
Enum values:
NO_BRAND_SAFETY (to be deprecated in the next API version): To not use any brand safety solution. Full inventory, which means your ads may appear next to some content featuring mature themes.
EXPANDED_INVENTORY: Use TikTok's brand safety solution. Expanded inventory means that your ads will appear next to content where most inappropriate content has been removed, and that does not contain mature themes. In the next API version, EXPANDED_INVENTORY will replace NO_BRAND_SAFETY and will be the default brand safety option.
STANDARD_INVENTORY: Use TikTok's brand safety solution. Standard inventory means that ads will appear next to content that is appropriate for most brands.
LIMITED_INVENTORY: Use TikTok's brand safety solution. Limited inventory means that your ads will not appear next to content that contains mature themes.
THIRD_PARTY: Use a third-party brand safety solution. You also need to pass a value to the brand_safety_partner field.
To get the countries and regions that your ads can be deployed to based on your brand safety settings, use the /tool/region/ endpoint.

Note:

Pre-bid first-party Brand Safety filtering for APP_PROMOTION, WEB_CONVERSIONS, TRAFFIC, LEAD_GENERATION and PRODUCT_SALES objectives in Auction ads are currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
Pre-bid third-party brand safety solutions are currently allowlist-only features. If you would like to access them, please contact your TikTok representative.
See Brand safety to learn about the supported advertising objectives, supported markets, and the general introduction of pre-bid Brand Safety filtering.

brand_safety_partner
Conditional
	
string
	
Required only when brand_safety_type is THIRD_PARTY, and placements needs to be set to ["PLACEMENT_TIKTOK"].

Brand safety partner.

Enum values: IAS, OPEN_SLATE(The partner is named DoubleVerify on TikTok Ads Manager because the partner has been acquired by DoubleVerify).
To get the countries and regions that your ads can be deployed to based on your brand safety settings, use the /tool/region/ endpoint. You need to pass in the brand safety type and brand safety partner.

Note:

Pre-bid third-party brand safety solutions are currently allowlist-only features. If you would like to access them, please contact your TikTok representative.
Once set, this field cannot be modified.

category_exclusion_ids
	
string[]
	
Valid only when the following conditions are met:
At the campaign level:
objective_type is REACH, VIDEO_VIEWS, ENGAGEMENT, RF_REACH, APP_PROMOTION,WEB_CONVERSIONS,TRAFFIC, or LEAD_GENERATION.
At the ad group level:
placements is set to ["PLACEMENT_TIKTOK"].
brand_safety_type is set to STANDARD_INVENTORY or LIMITED_INVENTORY.
Content exclusion category IDs.

You can use /tool/content_exclusion/get/ to get a list of content category IDs (excluded_category_list) that can be excluded from being displayed next to your ads.

vertical_sensitivity_id
	
string
	
Valid only when the following conditions are met:
At the campaign level:
objective_type is REACH, VIDEO_VIEWS or ENGAGEMENT.
At the ad group level:
placements is set to ["PLACEMENT_TIKTOK"].
brand_safety_type is set to STANDARD_INVENTORY or LIMITED_INVENTORY.
Vertical sensitivity category ID.

You can use /tool/content_exclusion/get/ to get a list of vertical categories containing sensitive content (vertical_sensitivity_list) that can be excluded from appearing next to your ads.

budget_mode
Required
	
string
	
Ad group budget mode.

When Campaign Budget Optimization (CBO) is enabled, budget_mode at the ad group level will be ignored.

When CBO is disabled, budget_mode at the ad group level supports the following enum values:
BUDGET_MODE_TOTAL: Lifetime budget.
BUDGET_MODE_DYNAMIC_DAILY_BUDGET: Dynamic daily budget. It is the average daily budget over a week. Daily costs will not exceed 125% of the average daily budget. Weekly costs will not exceed the average daily budget * 7.
When objective_type is TRAFFIC, APP_PROMOTION, WEB_CONVERSIONS, LEAD_GENERATION, PRODUCT_SALES (Video Shopping Ads only), REACH, VIDEO_VIEWS, or ENGAGEMENT, and you want to set a non-lifetime budget, set this field to BUDGET_MODE_DYNAMIC_DAILY_BUDGET.

Note: BUDGET_MODE_DYNAMIC_DAILY_BUDGET for campaign objectives REACH, VIDEO_VIEWS, and ENGAGEMENT is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

BUDGET_MODE_DAY: Daily budget.
When objective_type is REACH, VIDEO_VIEWS, or ENGAGEMENT, we recommend that you use dynamic daily budget (BUDGET_MODE_DYNAMIC_DAILY_BUDGET) instead of daily budget (BUDGET_MODE_DAY).

To learn about how to set budget modes, see Budget.

Note:

If this field is set to BUDGET_MODE_DAY, then schedule_type can be either SCHEDULE_START_END or SCHEDULE_FROM_NOW.
If this field is set to BUDGET_MODE_TOTAL, then schedule_type must be SCHEDULE_START_END, which requires an end date (schedule_end_time).

budget
Required
	
float
	
Ad group budget.

The setting will be ignored when Campaign Budget Optimization (budget_optimize_on = TRUE) is enabled.

For how to configure budget settings, see Budget. To directly see the daily budget value range for a currency, see Currency-Daily budget value range.

schedule_type
Required
	
string
	
The schedule type can be either SCHEDULE_START_END or SCHEDULE_FROM_NOW.

If you choose SCHEDULE_START_END, you need to specify a start time and an end time.
If you choose SCHEDULE_FROM_NOW, you only need to specify a start time and the end time will be automatically set to 10 years later than the start time.
If budget_mode is BUDGET_MODE_TOTAL, this field must be set to SCHEDULE_START_END.

schedule_start_time
Required
	
datetime
	
Schedule start time (UTC+0), in the format of "YYYY-MM-DD HH:MM:SS".

The start time can be up to 12 hours earlier than the current time, but cannot be later than "2028-01-01 00:00:00".

schedule_end_time
Conditional
	
datetime
	
Required when schedule_type is SCHEDULE_START_END or budget_mode is BUDGET_MODE_TOTAL.

Schedule end time (UTC+0), in the format of "YYYY-MM-DD HH:MM:SS".

The end time cannot be later than "2038-01-01 00:00:00".

dayparting
	
string
	
Ad delivery arrangement, in the format of a string that consists of 48 x 7 characters. Each character is mapped to a 30-minute timeframe from Monday to Sunday. Each character can be set to either 0 or 1. 1 represents delivery in the 30-minute timeframe, and 0 stands for non-delivery in the 30-minute timeframe. The first character is mapped to 0:01-0:30 of Monday; The second character is mapped to 0:31-1:00 of Monday, and the last character represents 23:31-0:00 Sunday.

Note: If not specified, all-0, or all-1 are considered as full-time delivery.

optimization_goal
Required
	
string
	
The measurable results you'd like to drive with your ads.

For a complete list of enum values, see Enumeration - Optimization Goal.
For enum values supported for CBO campaigns, see Campaign Budget Optimization-Supported optimization goals.

For each optimization goal, you need to manually specify the corresponding billing_event simultaneously. To learn about the billing event associated with a specific optimization goal, see Corresponding billing event for an optimization goal.

To use the optimization goal "Install with in-app event" on Pangle placement or Global App Bundle placement or both in an ad group, set optimization_goal to INSTALL, specify a valid secondary_optimization_event value, and only include PLACEMENT_PANGLE or PLACEMENT_GLOBAL_APP_BUNDLE or both in the placements value.

Note:

When promotion_type is LEAD_GEN_CLICK_TO_TT_DIRECT_MESSAGE, LEAD_GEN_CLICK_TO_SOCIAL_MEDIA_APP_MESSAGE, or LEAD_GEN_CLICK_TO_CALL, the default value for this field will be CLICK.
Starting November 30th, 2024, you will no longer be able to create or copy ad groups with the optimization goal "Install with in-app event" on TikTok placement or Automatic Placement. This change affects ad groups with the following configuration:
At the campaign level: objective_type is APP_PROMOTION
At the ad group level:
optimization_goal is INSTALL and a valid secondary_optimization_event value is specified
placement_type is PLACEMENT_TYPE_NORMAL with placements as ["PLACEMENT_TIKTOK"], or placement_type is PLACEMENT_TYPE_AUTOMATIC
Existing "Install with in-app event" ad groups on TikTok placement will not be affected. Additionally, Pangle placement and Global App Bundle placement (where placement_type is PLACEMENT_TYPE_NORMAL and placements includes only PLACEMENT_PANGLE or PLACEMENT_GLOBAL_APP_BUNDLE or both) will not be impacted. Please be aware of this change and make appropriate adjustments to your integration if necessary.
You can no longer use VIDEO_VIEW in the optimization_goal field, and when objective_type is VIDEO_VIEWS at the campaign level, we recommend that you use ENGAGED_VIEW or ENGAGED_VIEW_FIFTEEN as your optimization goal.
For new ad groups created under one CBO campaign, this field should be the same as the first ad group.

secondary_optimization_event
	
string
	
The secondary goal when optimization goal (optimization_goal) is Install (INSTALL) or Value (VALUE).

For enum values, see Conversion events - Secondary-goal events.

Note:

Starting November 30th, 2024, you will no longer be able to create or copy ad groups with the optimization goal "Install with in-app event" on TikTok placement or Automatic Placement. This change affects ad groups with the following configuration:
At the campaign level: objective_type is APP_PROMOTION
At the ad group level:
optimization_goal is INSTALL and a valid secondary_optimization_event value is specified
placement_type is PLACEMENT_TYPE_NORMAL with placements as ["PLACEMENT_TIKTOK"], or placement_type is PLACEMENT_TYPE_AUTOMATIC
Existing "Install with in-app event" ad groups on TikTok placement will not be affected. Additionally, Pangle placement and Global App Bundle placement (where placement_type is PLACEMENT_TYPE_NORMAL and placements includes only PLACEMENT_PANGLE or PLACEMENT_GLOBAL_APP_BUNDLE or both) will not be impacted. Please be aware of this change and make appropriate adjustments to your integration if necessary.
When secondary_optimization_event is specified, you need to pass in deep_bid_type at the same time.

message_event_set_id
Conditional
	
string
	
Required when the following conditions are met:
promotion_type is LEAD_GEN_CLICK_TO_SOCIAL_MEDIA_APP_MESSAGE.
optimization_goal is CONVERSATION.
The instant messaging app account in your ad group settings doesn't match any existing message event set.

The ID of the message event set to use in the Instant Messaging Ad Group.

If the instant messaging app account, either the Messenger account specified via messaging_app_account_id or the WhatsApp account populated from the specified phone_region_code, phone_region_calling_code, and phone_number, in your ad group settings matches an existing event set, this field will be ignored and automatically populated with the unique message event set associated with the instant messaging app account you choose.
To confirm whether a unique message event set is associated with the instant messaging app account you choose, use /ctm/message_event_set/get/ and check the returned matched_event_set.
If the instant messaging app account in your ad group settings doesn't match any existing message event set (matched_event_set returned from /ctm/message_event_set/get/ is empty), use /ctm/message_event_set/get/ to obtain the message event sets available for ad creation via the response parameter message_event_set_list.

Note: Once set, this field cannot be updated.

frequency
Conditional
	
number
	
Frequency, together with frequency_schedule, controls how often people see your ad (only available for REACH ads).

The below conditions should be both met:
1 <= frequency <= 1000
1 <= frequency_schedule <= 30
For example, frequency = 2 & frequency_schedule = 3 means "show ads no more than twice every 3 day".

frequency_schedule
Conditional
	
number
	
Frequency schedule, together with frequency, controls how often people see your ad (only available for REACH ads).

See frequency fields for more.

bid_type
Conditional
	
string
	
Bidding strategy that determines how the system manages your cost per result, spends your budget, and how it delivers ads.

Required when Campaign Budget Optimization (CBO) is enabled (budget_optimize_on = TRUE).

For enum values, see Enumeration - Bidding Strategy.

Note
For new ad groups created under one CBO campaign, this field should be the same as the first ad group.

bid_price
Conditional
	
float
	
Required when bid_type is BID_TYPE_CUSTOM and billing_event is CPC, CPM, or CPV.

Bid price. The average cost per result that you want to achieve (for Cost Cap bidding strategy).

When Campaign Budget Optimization (budget_optimize_on) is on, we suggest that you set the same bid value for all ad groups in the campaign.

bid_price needs to be lower than budget set at the campaign level and ad group level. See Bidding-Bidding limits to learn more about the bid verification mechanism.

conversion_bid_price
Conditional
	
float
	
Required when bid_type is BID_TYPE_CUSTOM and billing_event is OCPM.

Where you can set a target cost per conversion for oCPM(Optimized Cost per Mille).

conversion_bid_price needs to be lower than budget set at the campaign level and ad group level.

See Bidding-Bidding limits to learn more about the bid verification mechanism.

deep_bid_type
Conditional
	
string
	
Bidding strategy for in-app events.

Required when Campaign Budget Optimization (CBO) is enabled (budget_optimize_on = true) and optimization_goal is VALUE.

Enum values: VO_MIN_ROAS (allowlisted), VO_HIGHEST_VALUE (allowlisted).

For details, see Enumeration - Deep Event Bidding Strategy.

Note: When secondary_optimization_event is specified, you need to pass in deep_bid_type at the same time.

roas_bid
Conditional
	
float
	
Required when deep_bid_type is VO_MIN_ROAS.

ROAS goal for Value Optimization.

Value range:
For in-app advertising scenarios (objective_type is APP_PROMOTION, optimization_goal is VALUE, and optimization_event is AD_REVENUE_VALUE): 0.01-10.
For Product Shopping Ads with product source as TikTok Shop (shopping_ads_type is PRODUCT_SHOPPING_ADS and product_source is STORE): 0.01-20.
For other scenarios: 0.01-1,000.

vbo_window
	
string
	
The time window of the specified bidding strategy for VBO IAA (Value-Based Optimization for in-app advertising) or VBO IAP (Value-Based Optimization for in-app purchase).

Enum values:
SEVEN_DAYS: The first seven days (day 7).
ZERO_DAY: The current day (day 0).
Default value: SEVEN_DAYS.

When the Minimum ROAS (Target ROAS) bidding strategy is used, this field represents the window type of the target ROAS value (Day 7 ROAS or Day 0 ROAS). The system will aim to keep your average ROAS of the seventh day or of the current day around or higher than the target ROAS value, regardless of your budget.
When the Highest Value bidding strategy is used, this field represents the Highest Value window type (Day 7 Highest Value or Day 0 Highest Value). The system will aim to spend your budget fully and maximize the value of results within the first seven days or within the current day.

To learn more about how to use VBO IAA for your ad groups, see Enable VBO for App.

Note:

VBO IAP and VBO IAA in different scenarios are currently allowlist-only features. If you would like to access them, please contact your TikTok representative.
Day 0 or day 7 bidding (vbo_window is ZERO_DAY or SEVEN_DAYS) for VBO IAP in Advanced Dedicated Campaign or Android campaign scenarios are currently allowlist-only features. If you would like to access them, please contact your TikTok representative.
Day 0 or day 7 bidding (vbo_window is ZERO_DAY or SEVEN_DAYS) for VBO IAA in Advanced Dedicated Campaign or Android campaign scenarios are currently allowlist-only features. If you would like to access them, please contact your TikTok representative.
Once set, this field cannot be updated.

bid_display_mode
Conditional
	
string
	
Required and must be set to CPV(Cost per One View) when objective_type is VIDEO_VIEW.

How you calculate and measure Cost per View.

Note:

bid_display_mode cannot be updated after creation.
You don't need to specify this field if your objective_type is not VIDEO_VIEW.
The enum value of CPMV is deprecated in v1.3.

next_day_retention
	
float
	
Valid only when placements is PLACEMENT_PANGLE and secondary_optimization_event is NEXT_DAY_OPEN.

Day 2 retention ratio.

Formula: next_day_retention = conversion_bid_price/deep_cpa_bid.

Value range: (0,1].

Note: If you want to use this field, please pass in conversion_bid_price, deep_cpa_bid, and next_day_retention at the same time, and make sure the value of them meets the calculation formula. Otherwise there might be unexpected errors.

click_attribution_window
	
string
	
Click-through window for the ad group. This attribution window is the time between when a person clicks your ad and then takes an action.
Use this field to define the timeframe during which conversions can be attributed to the ad group.

Enum values:
OFF: Off.
ONE_DAY: 1-day click.
SEVEN_DAYS: 7-day click.
FOURTEEN_DAYS: 14-day click.
TWENTY_EIGHT_DAYS: 28-day click.

To learn about the allowed values of this field for different advertising objective scenarios, refer to Attribution window and event count.

Note:

If you want to manually configure the attribution windows, you need to pass at least click_attribution_window and view_attribution_window simultaneously, and optionally engaged_view_attribution_window. Note that the engaged_view_attribution_window, once passed, must be accompanied by click_attribution_window and view_attribution_window.
If you don't manually pass click_attribution_window, engaged_view_attribution_window, view_attribution_window and attribution_event_count, then default settings, if any, will be used. To confirm whether a default setting is used when you don't manually pass this field, use /adgroup/get/.
Once set, this field cannot be updated.

engaged_view_attribution_window
	
string
	
Engaged view-through window for the ad group. This attribution window is the time after someone watches at least 6 seconds of your video ad that a conversion is counted.
Use this field to define the timeframe during which conversions can be attributed to the ad group.

Enum values:
ONE_DAY: 1-day engaged view.
SEVEN_DAYS: 7-day engaged view.

To learn about the allowed values of this field for different advertising objective scenarios, refer to Attribution window and event count.

Note:

If you want to manually configure the attribution windows, you need to pass at least click_attribution_window and view_attribution_window simultaneously, and optionally engaged_view_attribution_window. Note that the engaged_view_attribution_window, once passed, must be accompanied by click_attribution_window and view_attribution_window.
If you don't manually pass click_attribution_window, engaged_view_attribution_window, view_attribution_window and attribution_event_count, then default settings, if any, will be used. To confirm whether a default setting is used when you don't manually pass this field, use /adgroup/get/.
Once set, this field cannot be updated.

view_attribution_window
	
string
	
View-through window for the ad group. This attribution window is the time between when a person views your ad and then takes an action.
Use this field to define the timeframe during which conversions can be attributed to the ad group.

Enum values:
OFF: Off.
ONE_DAY: 1-day view.
SEVEN_DAYS: 7-day view.

To learn about the allowed values of this field for different advertising objective scenarios, refer to Attribution window and event count.

Note:

If you want to manually configure the attribution windows, you need to pass at least click_attribution_window and view_attribution_window simultaneously, and optionally engaged_view_attribution_window. Note that the engaged_view_attribution_window, once passed, must be accompanied by click_attribution_window and view_attribution_window.
If you don't manually pass click_attribution_window, engaged_view_attribution_window, view_attribution_window and attribution_event_count, then default settings, if any, will be used. To confirm whether a default setting is used when you don't manually pass this field, use /adgroup/get/.
Once set, this field cannot be updated.

attribution_event_count
	
string
	
Event count (Statistic type) for the ad group.
The way that people's actions are counted after only viewing or clicking an ad.

Enum values:
UNSET: Unset.
EVERY: Every. To count multiple events from someone as separate conversions.
ONCE: Once. To count multiple events from someone as 1 conversion.

To learn about the allowed values of this field for different advertising objective scenarios, refer to Attribution window and event count.

Note:

If you don't manually pass click_attribution_window, engaged_view_attribution_window, view_attribution_window and attribution_event_count, then default settings, if any, will be used. To confirm whether a default setting is used when you don't manually pass this field, use /adgroup/get/.
Once set, this field cannot be updated.

billing_event
Required
	
string
	
Events that you want to pay for.

For enum values, see Enumeration - Billing Event.

To learn about the billing event associated with a specific optimization goal, see Corresponding billing event for an optimization goal.

pacing
Required
	
string
	
You can choose between PACING_MODE_SMOOTH and PACING_MODE_FAST. For PACING_MODE_SMOOTH, the budget is allocated evenly within the scheduled time. PACING_MODE_FAST would consume budget and produce results as soon as possible. When Campaign Budget Optimization (budget_optimize_on) is on, your setting will be ignored and it will be set as PACING_MODE_SMOOTH. Otherwise, this field is required.

statistic_type
	
string
	
Conversion bid statistic type, bid for EVERYTIME (Each Purchase)/ NONE (Unique Purchase). You can get statistic_type values suitable for your app event by using the /app/optimization_event/ endpoint.

is_hfss
	
boolean
	
Whether the promoted content is HFSS (High Fat, Salt, Sugar) Product/Brand.

If your ad is promoting or prominently featuring a product/brand classed as high in fat, salt or sugar, set this field to true.

In regulated regions, HFSS ads must only be targeted to users aged 18 or over.

You can set this field to true when your targeting locations include locations in the UK, Australia, New Zealand, and the European Union.

Supported values: true,false.
Default value: false.

is_lhf_compliance
	
boolean
	
Whether the promoted content complies with LHF (Less Healthy Foods) regulations.

By setting is_lhf_compliance to true, you confirm that any food or drink products you advertise on TikTok in the UK comply with the 2024 Less Healthy Foods Regulations and all other applicable laws.

Supported values: true,false.
Default value: false.

Note: Starting January 1st, 2026, when your ad targets locations in the UK and is_hfss is true, is_lhf_compliance is required and must be set to true.

operation_status
	
string
	
The status of the ad group when created.

Enum values:
ENABLE : The ad group is enabled when created.
DISABLE : The ad group is disabled when created.
Default value: ENABLE.
If you want to update the status of the ad group after creation, use the /adgroup/status/update/ endpoint.

creative_material_mode
	
string
	
The strategy that your creatives will be delivered.

Enum values: CUSTOM (custom).
Default value: CUSTOM (custom).

Note: Automated ads (creative_material_mode = DYNAMIC) have been deprecated. We recommend that you create Smart Creative ads ( creative_material_mode = CUSTOM) to ensure a smoother migration journey. See here to find out how to create Smart Creative ads.

adgroup_app_profile_page_state
	
string
	
Whether to use App Profile Page or not.

Enum values: ON, OFF.

Note: App Profile Page is not supported in a Dedicated Campaign with optimization goal as in-app event and bid strategy as cost cap. Therefore, you cannot set this field to ON when the following conditions are all met:

ios14_targeting is set to IOS14_PLUS
optimization_goal is set to IN_APP_EVENT
bid_type is set to BID_TYPE_CUSTOM

conversion_window (deprecated)
	
string
	
The time frame when you would like a conversion to happen after a user clicks on or views your ad. Your ad delivery will be optimized using the conversion data during the time frame you select. This setting will not impact your attribution data.
Currently, this field is available only when your promotion product is an app. If no value is specified for this field, the default values will be used. For different optimize goals, the default values are different. If the optimize goal(optimization_goal) is INSTALL, the default value is ONE_DAY_CLICK_OR_ONE_DAY_VIEW. If the optimize goal(optimization_goal) is IN_APP_EVENT, the default value is SEVEN_DAY_CLICK_OR_ONE_DAY_VIEW. For enum values, see Enumeration - Conversion Window.
Corresponding billing event for an optimization goal

When you specify an optimization goal for your ad group, you need to manually specify the corresponding billing event simultaneously. The following table lists the billing event associated with each optimization goal.

optimization_goal value	Corresponding billing_event value

CLICK
	
CPC

PAGE_VISIT
	
CPC

CONVERT
	
OCPM

INSTALL
	
OCPM

IN_APP_EVENT
	
OCPM

TRAFFIC_LANDING_PAGE_VIEW
	
OCPM

LEAD_GENERATION
	
OCPM

CONVERSATION
	
OCPM

FOLLOWERS
	
OCPM

VALUE
	
OCPM

AUTOMATIC_VALUE_OPTIMIZATION
	
OCPM

PRODUCT_CLICK_IN_LIVE
	
OCPM

MT_LIVE_ROOM
	
OCPM

DESTINATION_VISIT
	
OCPM

SHOW
	
CPM

REACH
	
CPM

ENGAGED_VIEW
	
CPV

ENGAGED_VIEW_FIFTEEN
	
CPV
Example
curl --location --request POST 'https://business-api.tiktok.com/open_api/v1.3/adgroup/create/' \
--header 'Access-Token: {{Access-Token}}' \
--header 'Content-Type: application/json' \
--data '{
    "advertiser_id": "{{advertiser_id}}",
    "campaign_id": "{{campaign_id}}",
    "adgroup_name": "{{adgroup_name}}",
    "promotion_type": "WEBSITE",
    "placement_type": "PLACEMENT_TYPE_NORMAL",
    "placements": ["PLACEMENT_TIKTOK"],
    "video_download_disabled": false,
    "location_ids": ["{{location_id}}"],
    "gender": "GENDER_UNLIMITED",
    "operating_systems": ["ANDROID"],
    "budget_mode": "BUDGET_MODE_TOTAL",
    "budget": {{budget}},
    "schedule_type": "SCHEDULE_START_END",
    "schedule_end_time": "{{schedule_end_time}}",
    "schedule_start_time": "{{schedule_start_time}}",
    "optimization_goal": "CLICK",
    "bid_type": "BID_TYPE_NO_BID",
    "billing_event": "CPC",
    "pacing": "PACING_MODE_SMOOTH",
      "operation_status": "ENABLE"
}'

Response
Field	Data Type	Description

code
	
number
	
Response code. For the complete list of response codes and descriptions, see Appendix - Return Codes.

message
	
string
	
Response message. For details, see Appendix - Return Codes.

request_id
	
string
	
The log id of a request, which uniquely identifies the request.

data
	
object
	
Returned data

advertiser_id
	
string
	
Advertiser ID

campaign_id
	
string
	
Campaign ID

campaign_name
	
string
	
The name of the campaign that the ad group belongs to.

adgroup_id
	
string
	
Ad group ID

adgroup_name
	
string
	
Ad group Name

create_time
	
string
	
The time at which the ad group was created, in the format of "YYYY-MM-DD HH:MM:SS".

Example: "2023-01-01 00:00:01".

modify_time
	
string
	
The time at which the ad group was modified, in the format of "YYYY-MM-DD HH:MM:SS".

Example: "2023-01-01 00:00:01".

shopping_ads_type
	
string
	
Returned when objective_type at the campaign level is PRODUCT_SALES.

Shopping ads type.

Enum values:
VIDEO: Video Shopping Ads.
LIVE: Live Shopping Ads.
PRODUCT_SHOPPING_ADS: Product Shopping Ads.
CATALOG_LISTING_ADS: Catalog Listing Ads.
UNSET: Unset.

identity_id
	
string
	
Returned when shopping_ads_type is VIDEO and product_source is SHOWCASE or shopping_ads_type is LIVE.

Identity ID.

identity_type
	
string
	
Returned when shopping_ads_type is VIDEO and product_source is SHOWCASE or shopping_ads_type is LIVE.

Identity type.

Enum values: AUTH_CODE (Authorized Post User), TT_USER (TikTok Business Account User), BC_AUTH_TT(the TikTok account that a Business Center is authorized to access).

See Identities for details.

identity_authorized_bc_id
	
string
	
Returned when identity_type is BC_AUTH_TT.

ID of the Business Center that a TikTok Account User in Business Center identity is associated with.

product_source
	
string
	
Returned for Video Shopping Ads and Product Shopping Ads.

Product source where you want to get products for promotion.

Enum values: UNSET ,CATALOG(Catalog) , STORE (TikTok Shop),SHOWCASE(TikTok Showcase).

catalog_id
	
string
	
Returned in any of the following scenarios:
product_source is CATALOG or STORE.
shopping_ads_type is LIVE and this field is specified in the request.

Catalog ID.

Note: Starting June 30th, 2024, catalog_id will no longer be returned for newly created Shopping Ads where product_source is STORE because the specified catalog_id will be ignored. Existing Shopping Ads where product_source is STORE will not be affected unless you update them. If you update the existing ad groups, the existing catalog_id, if present for the ad groups, will no longer be returned.

catalog_authorized_bc_id
	
string
	
Returned in any of the following scenarios:
shopping_ads_type is VIDEO and product_source is CATALOG or STORE.
shopping_ads_type is LIVE and this field is specified in the request.

For catalogs in Business Center, this field returns the ID of the Business Center that a catalog belongs to.

Note: Starting June 30th, 2024, catalog_authorized_bc_id will no longer be returned for newly created Shopping Ads where product_source is STORE because the specified catalog_authorized_bc_id will be ignored. Existing Shopping Ads where product_source is STORE will not be affected unless you update them. If you update the existing ad groups, the existing catalog_authorized_bc_id, if present for the ad groups, will no longer be returned.

store_id
	
string
	
Returned in any of the following scenarios:
shopping_ads_type is VIDEO and product_source is STORE.
shopping_ads_type is PRODUCT_SHOPPING_ADS and product_source is STORE.
shopping_ads_type is LIVE and this field is specified in the request.

ID of the TikTok Shop.

store_authorized_bc_id
	
string
	
Returned when store_id is passed.

ID of the Business Center that is authorized to access the store (store_id).

promotion_type
	
string
	
Promotion type (Optimization location).
You can decide where you'd like to promote your products using this field.

For value definitions, see Enumeration - Promotion Type.

promotion_target_type
	
string
	
The promotion type for Lead Generation objective.

Enum values:
INSTANT_PAGE：Instant Form. To create a fast-loading in-app TikTok Instant Form to collect more leads.
EXTERNAL_WEBSITE：Website Form. To use a landing page that has the Website Form or the TikTok Instant Page that redirects to the website with the Website Form to collect more leads.
UNSET.

messaging_app_type
	
string
	
The type of instant messaging app or customized URL to use in the Instant Messaging Ad Group.

Enum values:  
MESSENGER: Messenger.
WHATSAPP: WhatsApp.
ZALO: Zalo.
LINE: Line.
IM_URL: Instant Messaging URL.

messaging_app_account_id
	
string
	
The ID of the instant messaging app account.
When messaging_app_type is MESSENGER, this field represents the Facebook Page ID.
When messaging_app_type is LINE, this field represents the LINE Business ID.
When messaging_app_type is WHATSAPP, this field represents the WhatsApp phone number automatically populated based on the specified phone_region_code, phone_region_calling_code, and phone_number.

phone_region_code
	
string
	
The region code for the WhatsApp or Zalo phone number.

Example: US.

phone_region_calling_code
	
string
	
The region calling code for the WhatsApp or Zalo phone number.

Example: +1.

phone_number
	
string
	
The WhatsApp or Zalo phone number.

promotion_website_type
	
string
	
TikTok Instant Page type in the ad group.

Enum values:
UNSET: To not use TikTok Instant Page.
TIKTOK_NATIVE_PAGE: To use TikTok Instant Page.

app_id
	
string
	
The App ID of the app to promote.

You can get app_id by using the /app/list/ endpoint.

app_type
	
string
	
The type of the promoted app.

Enum values: APP_ANDROID (Android), APP_IOS (iOS).

app_download_url
	
string
	
App download link.

pixel_id
	
string
	
Pixel ID.

optimization_event
	
string
	
Conversion event for the ad group.

See Conversion events for more.

custom_conversion_id
	
string
	
The ID of the Custom Conversion used in the ad group.

app_config
	
object[]
	
Returned when sales_destination is WEB_AND_APP at the campaign level.

Details of the app or apps to promote.

app_id
	
string
	
The App ID of the app to promote.

deep_funnel_optimization_status
	
string
	
The status of deep funnel optimization.
With deep funnel optimization, you can select a secondary event alongside the primary optimization event, which can help improve campaign effectiveness.  

Enum values:  
ON: enabled.  
OFF: disabled.  

deep_funnel_event_source
	
string
	
Returned when deep_funnel_optimization_status is ON.  

The event source type.

Enum values:
PIXEL: Pixel.  
OFFLINE: Offline Event Set.
CRM: CRM Event Set.

deep_funnel_event_source_id
	
string
	
Returned when deep_funnel_optimization_status is ON.

Event Source ID.  

When deep_funnel_event_source is PIXEL , this field represents a Pixel ID.
When deep_funnel_event_source is OFFLINE, this field represents an Offline Event Set ID.  
When deep_funnel_event_source is CRM, this field represents a CRM Event Set ID.

deep_funnel_optimization_event
	
string
	
Returned when deep_funnel_optimization_status is ON.  

Deep funnel optimization event.  

Example: SHOPPING.

placement_type
	
string
	
The placement strategy that decides where your ads will be shown.

Enum values: PLACEMENT_TYPE_AUTOMATIC (Automatic placement), PLACEMENT_TYPE_NORMAL (Select placement).

placements
	
string[]
	
The apps where you want to deliver your ads.

For enum values, see Enumeration - Placement.

Note:

If placement_type of the ad group is PLACEMENT_TYPE_AUTOMATIC (Automatic placement), the placements supported for your advertising objective will be returned for this field. For instance, if the actual supported placement is TikTok only, the returned value for this field will be PLACEMENT_TIKTOK.
However, if PLACEMENT_GLOBAL_APP_BUNDLE is supported for your objective, but you are not allowlisted for the Global App Bundle placement feature, PLACEMENT_GLOBAL_APP_BUNDLE will not be included in the returned value for this field.
If placement_type of the ad group is PLACEMENT_TYPE_NORMAL (Select placement), the placements you specified through placements in the request will usually be returned for this field.
The only exception is that if PLACEMENT_GLOBAL_APP_BUNDLE is specified through placements in the request, but you are not allowlisted for the Global App Bundle placement feature, PLACEMENT_GLOBAL_APP_BUNDLE will be filtered out from the returned value for this field. For instance, if you specify placements as ["PLACEMENT_TIKTOK", "PLACEMENT_GLOBAL_APP_BUNDLE"] in the request, but you are not allowlisted for Global App Bundle, the returned value for this field will be ["PLACEMENT_TIKTOK"].

tiktok_subplacements
	
string[]
	
The subplacements within TikTok for your ads, allowing you to choose where your ads will appear.

Enum value:
IN_FEED: In-feed. Ads will be placed in the For You feed and might also be placed in Profile Page and Following feeds.
SEARCH_FEED: Search feed.
TIKTOK_LITE: TikTok Lite, a streamlined version of TikTok that features a smaller app size and faster video loading speed. The TikTok Lite subplacement is currently available for Japan or South Korea as targeting locations.
LEMON8: Lemon8, a community app for lifestyle content, focusing on real-life experiences, tips, guides, and product reviews. By including Lemon8 as a subplacement, your ads will appear in its For You feed, Search feed, and Immersive Video feed. Learn more about Lemon8.

Note: If tiktok_subplacements is not specified when you create the ad group, the value of this field will be an empty list ([]).

search_result_enabled
	
boolean
	
Whether to include your ads in Search Ads, namely to show your ads to users when they search for your business on TikTok.

automated_keywords_enabled
	
boolean
	
Whether to enable automated keywords and let the system automatically generate keywords after you add ads. This expands high-quality traffic to improve performance. View high-performing automated keywords in reporting.

Supported values: true, false.

search_keywords
	
object[]
	
Returned only for Search Ads Campaigns.

A list of search keywords, that is, words or phrases that are used to match your ads with the terms people are searching for.

keyword
	
string
	
The search keyword.

match_type
	
string
	
The match type for the search keyword.

Enum values:
PRECISE_WORD: exact match. Your ads will only show for user search queries that exactly match these keywords.
PHRASE_WORD: phrase match. Your ads will only show for these specific keywords if users search these keywords in the same order.
BROAD_WORD: broad match. Your ads will show for user search queries for any of the words you have included, even if the words are in a different order.

keyword_bid_type
	
string
	
The bid type for the keyword and match type combination.

Enum values:
FOLLOW_ADGROUP: To use the ad group level bid (bid_price) as the keyword_bid.
CUSTOM: To customize the bid via keyword_bid.

keyword_bid
	
float
	
The bid price for the keyword and match type combination.

audit_status
	
string
	
The review status of the search keyword.

Enum values:
AUDITING: The keyword is under review.
PASS: The keyword has passed review and can be delivered.
REJECTED: The keyword failed to pass the review and cannot be delivered.

reject_info
	
object[]
	
Returned only when audit_status is REJECTED.

Details about the rejection.

forbidden_location
	
string
	
The targeted region that failed the review.

For enum values, see Appendix - Location codes.

reject_reasons
	
object[]
	
List of rejection reasons.

reason
	
string
	
The rejection reason.

comment_disabled
	
boolean
	
Whether to allow comments on your ads on TikTok.

video_download_disabled
	
boolean
	
Whether users can download your video ads on TikTok.

share_disabled
	
boolean
	
Whether sharing to third-party platforms is disabled for ads in this ad group.

blocked_pangle_app_ids
	
string[]
	
Pangle app block list ID.

audience_rule
	
object
	
Rules that specify your audience.

audience_type
	
string
	
App retargeting audience type.

For enum values, see Enumeration - App Retargeting Audience Type.

saved_audience_id
	
string
	
Returned when you have specified saved_audience_id in the request.
Saved Audience ID.

auto_targeting_enabled
To be deprecated
	
boolean
	
Whether to enable automated targeting.

shopping_ads_retargeting_type
	
string
	
Returned when shopping_ads_type is VIDEO and product_source is CATALOG.

The retargeting type of shopping ads.

Enum values:
LAB1: Retargeting audiences who viewed products or added products to cart but didn't purchase products.
LAB2: Retargeting audiences who added products to cart but didn't purchase products.
LAB3: Retargeting audiences using custom combination.
OFF: No retargeting.

shopping_ads_retargeting_actions_days
	
number
	
Returned when shopping_ads_retargeting_type is LAB1 or LAB2.

The valid time range for the specified audience action. Audiences who have completed the specified action within the time range will be retargeted by the shopping ads.

Value range: 1, 2, 3, 7, 14, 30, 60, 90, 180.

included_custom_actions
	
object[]
	
The custom action that you want to use as "Include" conditions for filtering out the shopping ads audiences to be retargeted.

code
	
string
	
The custom action used to filter out the audiences to be retargeted.

Enum values:
VIEW_PRODUCT: The audience viewed the product.
ADD_TO_CART: The audience added the product to the cart.
PURCHASE: The audience purchased the product.

days
	
integer
	
The time range used to filter out the audiences that completed the specified action. Value range: [1,180].

excluded_custom_actions
	
object[]
	
The custom action that you want to use as "Exclude" conditions for filtering out the shopping ads audiences to be retargeted.

code
	
string
	
The custom action used to filter out the audiences to be retargeted.

Enum values:
VIEW_PRODUCT: The audience viewed the product.
ADD_TO_CART: The audience added the product to the cart.
PURCHASE: The audience purchased the product.

days
	
integer
	
The time range used to filter out the audiences that didn't complete the specified action. Value range: [1,180].

shopping_ads_retargeting_custom_audience_relation
	
string
	
The logical relation between the Video Shopping Ads (VSA) retargeting audience specified by shopping_ads_retargeting_type and the custom audience specified by audience_ids.

Enum values:
OR: To combine the VSA retargeting audience and the custom audience to create the targeted audience. The targeted audience will consist of individuals who belong to either the VSA retargeting audience or the custom audience.
AND: To intersect between the VSA retargeting audience and the custom audience to create the targeted audience. The targeted audience will consist of individuals who belong to both the VSA retargeting audience and the custom audience.

location_ids
	
string[]
	
IDs of the targeted locations.

Use Get locations to get available locations.

zipcode_ids
	
string[]
	
Zip code IDs or postal code IDs of the targeted locations.

languages
	
string[]
	
Codes of the languages that you want to target.

For the list of languages codes supported, see Enumeration - Language Code.

gender
	
string
	
Gender that you want to target.

Enum values: GENDER_FEMALE,GENDER_MALE,GENDER_UNLIMITED

age_groups
	
string[]
	
Age groups you want to target.

For enum values, see Enumeration - Age Group.

spending_power
	
string
	
Spending power that you want to target.

Enum values: ALL, HIGH.
If it is set to HIGH, you can target high spending users who typically spend more on purchases on TikTok ads than average users.

household_income
	
string[]
	
Household income that you want to target.

Enum values: TOP5(Top 5% of ZIP codes), TOP10(Top 10% of ZIP codes), TOP10_25(Top 10% -25% of ZIP codes), TOP25_50(Top 25% - 50% of ZIP codes).

audience_ids
	
string[]
	
A list of audience IDs.

smart_audience_enabled
	
boolean
	
Whether Smart audience is turned on.

Supported values: true, false.

excluded_audience_ids
	
string[]
	
A list of excluded audience ID.

interest_category_ids
	
string[]
	
IDs of general interest keywords that you want to use to target audiences.

interest_keyword_ids
	
string[]
	
IDs of additional interest keywords that you want to use to target audiences.

purchase_intention_keyword_ids
	
string[]
	
IDs of purchase intention categories used to target audiences with an interest in purchases related to a content category.

actions
	
object[]
	
A list of targeting behavioral category objects.

action_scene
	
string
	
The type of user behavior that you want to target.

Enum values:
VIDEO_RELATED: Video interactions.
CREATOR_RELATED: Creator interactions.
HASHTAG_RELATED: Hashtag interactions.

action_period
	
number
	
The time period to include behaviors from.

video_user_actions
	
string[]
	
The specific user interactions that you want to target for the user behavior type.

If action_scene is VIDEO_RELATED, the allowed values are: WATCHED_TO_END,LIKED,COMMENTED,SHARED.
If action_scene is CREATOR_RELATED, the allowed values are: FOLLOWING, VIEW_HOMEPAGE.
If action_scene is HASHTAG_RELATED, the allowed value is VIEW_HASHTAG.

action_category_ids
	
string[]
	
IDs of the video interactions categories, creator interactions categories, hashtags, or hashtag bundles that you want to use to target audiences.

smart_interest_behavior_enabled
	
boolean
	
Whether Smart interests & behaviors is turned on.

Supported values: true, false.

included_pangle_audience_package_ids
	
string[]
	
IDs of the Pangle audiences that you want to include.

excluded_pangle_audience_package_ids
	
string[]
	
IDs of the Pangle audiences that you want to exclude.

operating_systems
	
string[]
	
Device operating systems that you want to target.

Enum values: ANDROID, IOS

min_android_version
	
string
	
Minimum Android version.

For enum values, see Enumeration - Minimum Android Version.

ios14_targeting
	
string
	
The iOS devices that you want to target.

Enum values:
UNSET: Devices with iOS 14.4 or earlier versions.
IOS14_MINUS: Devices with iOS 14.0 or earlier version that are not affected by the iOS 14 privacy update.
IOS14_PLUS: Devices with iOS 14.5 or later versions. The iOS 14 privacy update has been enforced in this group of devices. This value is only supported for Dedicated Campaigns.
ALL: Devices with iOS 14.5 or later versions. The iOS 14 privacy update has been enforced in this group of devices. This value is only supported for iOS App Retargeting ads and iOS retargeting Video Shopping Ads with product source as catalog and optimization location as App.

min_ios_version
	
string
	
Audience minimum ios version.

For enum values, see Enumeration - Minimum iOS Version.

ios14_quota_type
	
string
	
Whether the campaign will be counted against the iOS 14 dedicated campaign quota.

Enum values: OCCUPIED, UNOCCUPIED. For non-R&F campaigns, when ios14_targeting is IOS14_PLUS, this field is automatically set to OCCUPIED.

device_model_ids
	
string[]
	
List of device model IDs.

For more details about device models, see Device Models.

network_types
	
string[]
	
Network types that you want to target.

For enum values, see Enumeration - Connection Type.

carrier_ids
	
string[]
	
Carriers that you want to target.

For detailed information, see get carriers. A carrier is valid only when the in_use field for the carrier is true.

isp_ids
	
string[]
	
IDs of the targeted Internet service providers.

device_price_ranges
	
number[]
	
Targeting device price range. 10000 means 1000+. The numbers must be in multiples of 50.
Important: The upper limit you set will be added by 50 and the resulting new number will be used as the actual upper limit for device targeting. The actual upper limit is shown in the ad group settings in TikTok Ads Manager. If you set and get the price range of [0, 250], it actually means [0, 300].

targeting_expansion
To be deprecated
	
object
	
Settings about targeting expansion

expansion_enabled
	
boolean
	
Whether to enable targeting expansion

expansion_types
	
string[]
	
The target audience types that you want to expand

contextual_tag_ids
	
string[]
	
Contextual tag IDs.

brand_safety_type
	
string
	
Brand safety type.

Enum values:
NO_BRAND_SAFETY: To not use any brand safety solution. Full inventory, which means your ads may appear next to some content featuring mature themes.
EXPANDED_INVENTORY: Use TikTok's brand safety solution. Expanded inventory means that your ads will appear next to content where most inappropriate content has been removed, and that does not contain mature themes. In the next API version, EXPANDED_INVENTORY will replace NO_BRAND_SAFETY and will be the default brand safety option.
STANDARD_INVENTORY: Use TikTok's brand safety solution. Standard inventory means that ads will appear next to content that is appropriate for most brands.
LIMITED_INVENTORY: Use TikTok's brand safety solution. Limited inventory means that your ads will not appear next to content that contains mature themes.
THIRD_PARTY: Use a third-party brand safety solution.
To get the countries and regions that your ads can be deployed to based on your brand safety settings, use the /tool/region/ endpoint.

brand_safety_partner
	
string
	
Brand safety partner.

Enum values: IAS, OPEN_SLATE(The partner is named DoubleVerify on TikTok Ads Manager because the partner has been acquired by DoubleVerify).

To get the countries and regions that your ads can be deployed based on your brand safety settings, use the /tool/region/ endpoint. You need to pass in the brand safety type and brand safety partner.

inventory_filter_enabled
	
boolean
	
Inventory filtering (filtering security videos, hides unsafe videos), valid only for the PLACEMENT_TIKTOK placement. Optional values are: true to filter, false not to filter.

category_exclusion_ids
	
string[]
	
Content exclusion category IDs.

vertical_sensitivity_id
	
string
	
Vertical sensitivity category ID.

budget_mode
	
string
	
Budget mode.

If Campaign Budget Optimization is enabled, BUDGET_MODE_INFINITE will be returned.

For more information about budget modes, see Budget.

budget
	
float
	
Ad budget. Returns 0.0 when Campaign Budget Optimization (budget_optimize_on) is on.

scheduled_budget
	
float
	
Scheduled ad budget for next day. A value not equal to 0 means the scheduled budget is set and the value represents the budget; a value equals to 0 means the scheduled budget is not set.

schedule_type
	
string
	
The schedule type can be either SCHEDULE_START_END or SCHEDULE_FROM_NOW. If you choose SCHEDULE_START_END, you need to specify a start time and an end time. If you choose SCHEDULE_FROM_NOW, you only need to specify a start time.

schedule_start_time
	
datetime
	
Ad delivery start time (UTC+0). Format should be YYYY-MM-DD HH:MM:SS

schedule_end_time
	
datetime
	
Ad delivery end time (UTC+0). Format should be YYYY-MM-DD HH:MM:SS

delivery_mode
	
string
	
The strategy for sequencing and scheduling your ad delivery in a Reach & Frequency ad group.

Enum values:
STANDARD: Standard delivery. Your ads will be distributed evenly and are expected to achieve similar traffic size.
SCHEDULE: Scheduled delivery. Set specific time periods to deliver each ad in.
SEQUENCE: Sequenced delivery. Set a specific sequence to deliver your ads in.
OPTIMIZE: Optimized delivery that delivers ads to achieve the best performance.

dayparting
	
string
	
Ad delivery arrangement, in the format of a string that consists of 48 x 7 characters. Each character is mapped to a 30-minute timeframe from Monday to Sunday. Each character can be set to either 0 or 1. 1 represents delivery in the 30-minute timeframe, and 0 stands for non-delivery in the 30-minute timeframe. The first character is mapped to 0:01-0:30 of Monday; The second character is mapped to 0:31-1:00 of Monday, and the last character represents 23:31-0:00 Sunday.

Note
Not specified, all-0, or all-1 are considered as full-time delivery.

optimization_goal
	
string
	
The measurable results that you'd like to drive your ads with. For enum values, see Enumeration - Optimization Goal.

secondary_optimization_event
	
string
	
The secondary goal when optimization goal (optimization_goal) is Install (INSTALL) or Value (VALUE). For enum values, see Conversion events - Secondary-goal events.

message_event_set_id
	
string
	
The ID of the message event set to use in the Instant Messaging Ad Group.

If the instant messaging app account, either the Messenger account specified via messaging_app_account_id or the WhatsApp account matched from the specified phone_region_code, phone_region_calling_code, and phone_number, in your ad group settings matches an existing event set, this field will be automatically populated with the unique message event set associated with the instant messaging app account you choose.

frequency
	
number
	
Frequency, together with frequency_schedule, controls how often people see your ad (only available for REACH ads). For example, frequency = 2 frequency_schedule = 3 means "show ads no more than twice every 3 day".

frequency_schedule
	
number
	
Fequency schedule, together with frequency, controls how often people see your ad (only available for REACH ads). See frequency fields for more.

bid_type
	
string
	
Bidding strategy that determines how the system manages your cost per result, spends your budget, and how it delivers ads.
See Enumeration - Bidding Strategy.

bid_price
	
float
	
Bid price. The average cost per result that you want to achieve (for Cost Cap bidding strategy).

conversion_bid_price
	
float
	
Where you can set a target cost per conversion for oCPM(Optimized Cost per Mille).

deep_bid_type
	
string
	
Bidding strategy for in-app events.

For enum values and their descriptions, see Enumeration - Deep-level Bidding Strategy.

roas_bid
	
float
	
ROAS goal for Value Optimization.

vbo_window
	
string
	
The time window of the specified bidding strategy for VBO IAA (Value-Based Optimization for in-app advertising) or VBO IAP (Value-Based Optimization for in-app purchase).

Enum values:
SEVEN_DAYS: The first seven days (day 7).
ZERO_DAY: The current day (day 0).

bid_display_mode
	
string
	
How you calculate and measure Cost per View.

deep_cpa_bid
	
float
	
Specify bid price in this field after you've chosen a bidding strategy for in-app events, for example VO_MIN.

cpv_video_duration
	
string
	
Optimized video playback duration
Optional values include: SIX_SECONDS (video playback 6 seconds) and TWO_SECONDS (video playback 2 seconds)

next_day_retention
	
float
	
Day 2 retention ratio. Formula: next_day_retention = conversion_bid_price/deep_cpa_bid. Value range is (0,1]. Only valid when placements is PLACEMENT_PANGLE and secondary_optimization_event is NEXT_DAY_OPEN.

click_attribution_window
	
string
	
Click-through window for the ad group. This attribution window is the time between when a person clicks your ad and then takes an action.

Enum values:
OFF: Off.
ONE_DAY: 1-day click.
SEVEN_DAYS: 7-day click.
FOURTEEN_DAYS: 14-day click.
TWENTY_EIGHT_DAYS: 28-day click.

engaged_view_attribution_window
	
string
	
Engaged view-through window for the ad group. This attribution window is the time after someone watches at least 6 seconds of your video ad that a conversion is counted.

Enum values:
ONE_DAY: 1-day engaged view.
SEVEN_DAYS: 7-day engaged view.

view_attribution_window
	
string
	
View-through window for the ad group. This attribution window is the time between when a person views your ad and then takes an action.

Enum values:
OFF: Off.
ONE_DAY: 1-day view.
SEVEN_DAYS: 7-day view.

attribution_event_count
	
string
	
Event count (Statistic type) for the ad group.
The way that people's actions are counted after only viewing or clicking an ad.

Enum values:
UNSET: Unset.
EVERY: Every. To count multiple events from someone as separate conversions.
ONCE: Once. To count multiple events from someone as 1 conversion.

billing_event
	
string
	
Billing event.
To learn about the enum values, see Enumerations - Billing Event.

pacing
	
string
	
You can choose between PACING_MODE_SMOOTH and PACING_MODE_FAST. For PACING_MODE_SMOOTH, the budget is allocated evenly within the scheduled time. PACING_MODE_FAST would consume budget and produce results as soon as possible. When Campaign Budget Optimization (budget_optimize_on) is on, your setting will be ignored and it will be set as PACING_MODE_SMOOTH. Otherwise, this field is required.

operation_status
	
string
	
Operation status.

Enum values:
ENABLE : The ad group is enabled (in 'ON' status).
DISABLE: The ad group is disabled (in 'OFF' status).
FROZEN: The ad group is terminated and cannot be enabled.

secondary_status
	
string
	
Ad group status
See Enumeration - Ad group status for optional values.

statistic_type
	
string
	
conversion bid statistic type, bid for EVERYTIME (Each Purchase)/ NONE (Unique Purchase)

is_hfss
	
boolean
	
Whether the promoted content is HFSS (High Fat, Salt, Sugar) Product/Brand.

Supported values: true,false.

is_lhf_compliance
	
boolean
	
Whether the promoted content complies with LHF (Less Healthy Foods) regulations.

When is_lhf_compliance is true, you confirm that any food or drink products you advertise on TikTok in the UK comply with the 2024 Less Healthy Foods Regulations and all other applicable laws.

Supported values: true,false.

creative_material_mode
	
string
	
The strategy that your creatives will be delivered.

Enum values: CUSTOM(custom).

adgroup_app_profile_page_state
	
string
	
Whether the ad group is using App Profile Page. Enum values: INVALID, UNSET, ON, OFF.

rf_purchased_type
	
string
	
Billing method of Reach & Frequency ad groups. For more details, see Enumeration - Reach & Frequency Buy Type.

Note: The value of this field will always be null.

purchased_impression
	
number
	
Impressions to be purchased.

Note: The value of this field will always be null.

purchased_reach
	
number
	
Purchased user reach.

Note: The value of this field will always be null.

rf_estimated_cpr
	
number
	
The estimated cost per mile reach.

Note: The value of this field will always be null.

rf_estimated_frequency
	
number
	
The estimated show frequency.

Note: The value of this field will always be null.

is_new_structure
	
boolean
	
Whether the campaign is a new structure

skip_learning_phase
	
boolean
	
Whether to skip the learning stage.

conversion_window (deprecated)
	
string
	
The time frame when you would like a conversion to happen after a user clicks on or views your ad. Your ad delivery will be optimized using the conversion data during the time frame you select. This setting will not impact your attribution data. For enum values, ee Enumeration - Conversion Window.

page_info
	
object
	
Paging information.

page
	
number
	
current page number

page_size
	
number
	
Page size.

total_number
	
number
	
Total, the total number of eligible ad groups.

total_page
	
number
	
total pages.
Example
HTTPS/1.1 200 OK
{
    "code": 0,
    "message": "OK",
    "request_id": "{{request_id}}",
    "data": {
        "frequency_schedule": null,
        "schedule_type": "SCHEDULE_START_END",
        "optimization_goal": "CLICK",
        "conversion_window": null,
        "adgroup_name": "{{adgroup_name}}",
        "campaign_id": "{{campaign_id}}",
        "video_download_disabled": false,
        "skip_learning_phase": false,
        "interest_keyword_ids": [],
        "audience_ids": [],
        "deep_bid_type": null,
        "feed_type": null,
        "dayparting": "111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111",
        "network_types": [],
        "adgroup_app_profile_page_state": null,
        "excluded_audience_ids": [],
        "ios14_quota_type": "UNOCCUPIED",
        "bid_display_mode": "CPMV",
        "billing_event": "CPC",
        "modify_time": "{{modify_time}}",
        "schedule_end_time": "{{schedule_end_time}}",
        "pacing": "PACING_MODE_SMOOTH",
        "app_type": null,
        "age_groups": null,
        "languages": [],
        "interest_category_ids": [],
        "promotion_type": "WEBSITE",
        "rf_estimated_cpr": null,
        "category_id": "0",
        "auto_targeting_enabled": false,
        "gender": "GENDER_UNLIMITED",
        "budget_mode": "BUDGET_MODE_TOTAL",
        "purchased_reach": null,
        "brand_safety_partner": null,
        "delivery_mode": null,
        "is_hfss": false,
        "create_time": "{{create_time}}",
        "adgroup_id": "{{adgroup_id}}",
        "actions": [],
        "frequency": null,
        "schedule_infos": null,
        "rf_purchased_type": null,
        "conversion_bid_price": 0,
        "creative_material_mode": "CUSTOM",
        "rf_estimated_frequency": null,
        "brand_safety_type": "NO_BRAND_SAFETY",
        "scheduled_budget": 0,
        "is_new_structure": true,
        "placement_type": "PLACEMENT_TYPE_NORMAL",
        "advertiser_id": "{{advertiser_id}}",
        "comment_disabled": false,
        "operating_systems": [
            "ANDROID"
        ],
        "schedule_start_time": "{{schedule_start_time}}",
        "secondary_status": "ADGROUP_STATUS_CREATE",
        "next_day_retention": null,
        "bid_type": "BID_TYPE_NO_BID",
        "keywords": null,
        "inventory_filter_enabled": false,
        "app_download_url": null,
        "purchased_impression": null,
        "location_ids": [
            "{{location_id}}"
        ],
        "operation_status": "ENABLE",
        "statistic_type": null,
        "secondary_optimization_event": null,
        "app_id": null,
        "deep_cpa_bid": 0,
        "optimization_event": null,
        "placements": [
            "PLACEMENT_TIKTOK"
        ],
        "device_price_ranges": null,
        "share_disabled": false,
        "bid_price": 0,
        "campaign_name": "{{campaign_name}}",
        "search_result_enabled": false,
        "budget": {{budget}},
        "pixel_id": null
    }
}

Was the information helpful?
Yes
No