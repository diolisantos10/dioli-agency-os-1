---
titulo: "Marketing API — /ad/create/ (criativo do anúncio: vídeo, texto, CTA, identidade)"
url: https://business-api.tiktok.com/portal/docs?id=1739953377508354
capturado_em: 2026-09-09
hash: e7c5e0c72e7571d6
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
Get ads
Create ads
Update ads
Update the statuses of ads
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
Create ads

Use this endpoint to upload your ad creatives (pictures, videos, texts, call-to-action) and create a regular ad. For different placements, the creative formats and requirements are different. Upload your ad creatives according to the placement requirements. See here to learn about how to create regular ads.

Important
Creating non-Spark Ads using Custom Identities in ad groups that deliver to Automatic Placement or Select Placement when TikTok is included is no longer supported for existing ad accounts. All new ad accounts created on or after January 15, 2026 cannot create non-Spark Ads using Custom Identities for these placements. Existing ads remain unaffected and editable. Ad campaigns that deliver only to Pangle or Global App Bundle placements are not be affected by Custom Identity deprecation. Learn more about changes coming to Custom Identity and migrate to Spark Ads.

Before you start

Review Campaign Creation and understand the available campaign creation use cases to know which scenario best fits your integration.

Each ad group can have up to 20 or 50 regular ads.

If the advertising objective of the campaign that the ad group belongs to is RF_REACH, the ad group can include at most 20 ads.
If the advertising objective of the campaign that the ad group belongs to is PRODUCT_SALES, the ad group can include at most 20 ads (when campaign_product_source is STORE) or 50 ads (when campaign_product_source is CATALOG).
If the advertising objective of the campaign that the ad group belongs to is not PRODUCT_SALES or RF_REACH, the ad group can include at most 50 ads.

To create Smart Creative ads, use the /ad/aco/create/ endpoint.

Before you migrate your calls to v1.3, please see Migrate campaign management APIs to learn about the highlighted differences between v1.2 and v1.3 campaign management APIs.

To learn about the mapping between TikTok Ads Manager (TTAM) features at the campaign, ad group, and ad levels and the corresponding API configurations, see Mapping between campaign features on TikTok Ads Manager and API configurations.

Comparing v1.2 and v1.3

The following table outlines the differences between v1.2 and v1.3 endpoints.

Changes	v1.2	v1.3

Endpoint path
	
/v1.2/ad/create/
	
/v1.3/ad/create/

Request parameter name
	
product_ids
open_url
open_url_type
is_creative_authorized
dpa_fallback_type
dpa_open_url_type
dpa_video_tpl_id
	
item_group_ids
deeplink
deeplink_type
creative_authorized
shopping_ads_fallback_type
shopping_ads_deeplink_type
shopping_ads_video_package_id

Request parameter data type
	
advertiser_id: number
adgroup_id: number
card_id: number
	
advertiser_id: string
adgroup_id: string
card_id: string

Request parameters deprecated in v1.3
	
/
	
premium_badge_id

New request parameters
	
/
	
product_specific_type
product_set_id
sku_ids
dynamic_format
vertical_video_strategy
dynamic_destination
instant_product_page_used
page_image_index
brand_safety_vast_url
viewability_postbid_partner
viewability_vast_url
utm_params
key
value
showcase_products (including all the parameters within the object)
tracking_app_id
tracking_offline_event_set_ids
music_id
carousel_image_index
tiktok_page_category
phone_region_code
phone_region_calling_code
phone_number
schedule_id
deeplink_format_type
deeplink_utm_params
cpp_url
aigc_disclosure_type
tracking_message_event_set_id
auto_message_id
end_card_cta
product_display_field_list
vehicle_ids
auto_disclaimer_types
ad_texts
creative_auto_enhancement_strategy_list

Other changes in Request
	
/
	
identity_type and identity_id are now required

Response parameter
	
/
	
We now return the full info of ad entity in v1.3. For details, see the Response section in this page.

Response parameter data type
	
ad_ids: number[]
	
ad_ids: string[]
Request

Endpoint https://business-api.tiktok.com/open_api/v1.3/ad/create/

Method POST

Header

Field	Type	Description

Access-Token
Required
	
string
	
Authorized access token. For details, see Authentication.

Content-Type
Required
	
string
	
Request message type.
Allowed value: application/json.

Parameters

Field	Data Type	Description

advertiser_id
Required
	
string
	
Advertiser ID.

adgroup_id
Required
	
string
	
Ad group ID.

creatives
Required
	
object[]
	
Advertising creatives.

Max size: 20.
Within an ad group, you can create a maximum of 20 ads in a single request. If you want to create additional ads within the same ad group, you need to make multiple calls to /ad/create/.

ad_name
Required
	
string
	
Ad name.

To make the ad name automatically generated, set this field to ""(empty string). The format of the auto-generated ad name is ad ID (ad_id).

Length limit: 512 and cannot contain emojis.

Note: Each word in Chinese or Japanese counts as two characters, while each letter in English counts as one character.

identity_type
Required
	
string
	
Identity type.

Enum values: CUSTOMIZED_USER, AUTH_CODE, TT_USER, BC_AUTH_TT.

For details about identities, see Identities.

identity_id
Required
	
string
	
Identity ID.

If you are not using Spark Ads, identity_id and identity_type (CUSTOMIZED_USER) can be used for better management of ads information.

identity_authorized_bc_id
Conditional
	
string
	
Required when identity_type is BC_AUTH_TT.

ID of the Business Center that a TikTok Account User in Business Center identity is associated with.

catalog_id
Conditional
	
string
	
Product catalog ID. Required for Shopping Ads with product source as catalog. Products whose links are shown in the ad are from this catalog.

Note: Starting June 30th, 2024, when product_source at the ad group level is STORE, you will no longer need to pass this field because it will be ignored.

product_specific_type
Conditional
	
string
	
Required only in any of the following scenarios:
shopping_ads_type is VIDEO and product_source is CATALOG.
shopping_ads_type is PRODUCT_SHOPPING_ADS and product_source is STORE.

Different dimensions to choose products.

Enum values:
ALL: Allow TikTok to dynamically choose from all products.
PRODUCT_SET: Specify a product set. TikTok will dynamically choose products from this set.
CUSTOMIZED_PRODUCTS: Specify a customized number of products.

When shopping_ads_type is VIDEO and product_source is CATALOG, you can set this field to ALL , PRODUCT_SET, or CUSTOMIZED_PRODUCTS.
If this field is set to ALL, you don't need to input sku_ids, item_group_ids and product_set_id.
If this field is set to PRODUCT_SET, you need to pass in either item_group_ids or product_set_id.
If this field is set to CUSTOMIZED_PRODUCTS, sku_ids is required.

When shopping_ads_type is PRODUCT_SHOPPING_ADS and product_source is STORE, you can set this field to ALL or CUSTOMIZED_PRODUCTS.
If this field is set to ALL, you don't need to input sku_ids, item_group_ids and product_set_id.
If this field is set to CUSTOMIZED_PRODUCTS, item_group_ids is required.

Note:

When shopping_ads_type is VIDEO and product_source is STORE, specify the products directly through item_group_ids.
When shopping_ads_type is VIDEO and product_source is SHOWCASE, specify the products directly through showcase_products.
When shopping_ads_type is LIVE, you don't need to specify the products.

item_group_ids
Conditional
	
string[]
	
If shopping_ads_type is VIDEO, product_source is CATALOG, and product_specific_type is PRODUCT_SET, you need to pass in either item_group_ids or product_set_id.
If shopping_ads_type is PRODUCT_SHOPPING_ADS, product_source is STORE, and product_specific_type is CUSTOMIZED_PRODUCTS, this field is required.

Product SPU IDs.

Max size:
20 when shopping_ads_type is VIDEO, product_source is CATALOG, and product_specific_type is PRODUCT_SET.
50 when shopping_ads_type is PRODUCT_SHOPPING_ADS, product_source is STORE, and product_specific_type is CUSTOMIZED_PRODUCTS,

product_set_id
Conditional
	
string
	
If shopping_ads_type is VIDEO, product_source is CATALOG, and product_specific_type is set to PRODUCT_SET, you need to pass in either item_group_ids or product_set_id.

The ID of the product set.

sku_ids
Conditional
	
string[]
	
Required when shopping_ads_type is VIDEO, product_source is CATALOG, and product_specific_type is CUSTOMIZED_PRODUCTS.

IDs of the SKUs.

Max size: 20.

vehicle_ids
Conditional
	
string[]
	
Required when the following conditions are met:

At the campaign level:
objective_type is LEAD_GENERATION.
catalog_enabled is true.
At the ad group level:
An Auto-Inventory or Auto-Model catalog is specified through catalog_id.
At the ad level:
product_specific_type is CUSTOMIZED_PRODUCTS.

IDs of vehicles.

Max size: 20.

showcase_products
Conditional
	
object[]
	
Required when you set product_source as SHOWCASE at the ad group level. See Create Video Shopping Ads with products from Showcase to learn more.
The list of Showcase products that you want to use in your ad. Max size: 20.
You can get the available Showcase products via /showcase/product/get/.

item_group_id
	
string
	
SPU ID of the product.

store_id
	
string
	
The ID of the store that the product (item_group_id) belongs to.
Note that the only supported store type is TikTok Shop.

catalog_id
	
string
	
The ID of the catalog that the product (item_group_id) belongs to.

Note: Starting June 30th, 2024, when product_source at the ad group level is STORE, you will no longer need to pass this field because it will be ignored.

ad_format
Required
	
string
	
The ad format.
Enum values: SINGLE_IMAGE, SINGLE_VIDEO, LIVE_CONTENT, CAROUSEL_ADS, CATALOG_CAROUSEL.
Required for the following scenarios:
For single video ads, set this field to SINGLE_VIDEO.
For single image ads, set this field to SINGLE_IMAGE.
For TikTok Standard Carousel ads, set this field to CAROUSEL_ADS.
For TikTok VSA Carousel ads, Automotive Carousel Ads for Inventory, or Automotive Carousel Ads for Models. set this field to CATALOG_CAROUSEL.
See here to learn about the steps of creating TikTok Carousel Ads.
For Live Shopping Ads, set this field to LIVE_CONTENT.

Note:

Once set to CAROUSEL_ADS or CATALOG_CAROUSEL, this field cannot be updated.

vertical_video_strategy
	
string
	
The video type that you use for Product Sales scenarios.

Enum values: UNSET (unset), SINGLE_VIDEO (single video), CATALOG_VIDEOS (catalog video using video templates), CATALOG_UPLOADED_VIDEOS (catalog video using uploaded videos),LIVE_STREAM (livestream video).

It must be UNSET if dynamic_format = DYNAMIC_CREATIVE.

To learn more about how to manage uploaded catalog videos to be used in VSA for Catalog, see Upload catalog videos to associate with catalog products.

Note:

Creating VSA for Catalog with catalog video format using uploaded catalog videos (with vertical_video_strategy as CATALOG_UPLOADED_VIDEOS) is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
If you set vertical_video_strategy to CATALOG_UPLOADED_VIDEOS, you cannot update this field to a different value.

dynamic_format
	
string
	
Dynamic format.

Enum values:
UNSET: Unset.
DYNAMIC_CREATIVE: Dynamic format. To display different videos, product cards and destinations to each person based on purchase intent, maximizing conversions.

video_id
Conditional
	
string
	
Required when ad_format is SINGLE_VIDEO and identity_type is CUSTOMIZED_USER.
When ad_format is SINGLE_VIDEO and identity_type is TT_USER or BC_AUTH_TT, you need to pass either video_id or tiktok_item_id.
Not supported when ad_format is SINGLE_IMAGE or CAROUSEL_ADS.

Video ID.

To obtain video IDs, use /file/video/ad/search/.

If you want to create Spark Ads, you can use video_id or tiktok_item_id. To learn more about Spark Ads, see Create Spark Ads.

Note: To ensure a smooth integration journey, we recommend that you use /file/video/ad/upload/(upload_type = UPLOAD_BY_VIDEO_ID) to bind video ID with your advertiser ID.

image_ids
Conditional
	
string[]
	
A list of image IDs (images used in an ad or as a video cover).

To obtain the image ID, use the /file/image/ad/search/ or /file/image/ad/upload/ endpoint.

When ad_format is SINGLE_VIDEO:
If you want to create video Spark Ads via Spark Ads Push or create video Non-Spark Ads, this field is required and the value of this field will be used as the video cover (thumbnail) (only one value is allowed), and the aspect ratio of the image should be the same as the video.
If you want to create video Spark Ads via Spark Ads Pull, this field is not supported. You need to pass tiktok_item_id instead.
When ad_format is set to CAROUSEL_ADS:
If you want to create Standard Carousel Spark Ads via Spark Ads Push or create Standard Carousel Non-Spark Ads, this field is required and the size range for this field is [1, 35], and the sequence of the image IDs specified via this field is the order in which the images are shown in the Carousel Ads.
See Create Carousel Ads to learn about the requirements for images that can be used in TikTok Standard Carousel Ads.
If you want to create Standard Carousel Spark Ads via Spark Ads Pull, this field is not supported. You need to pass tiktok_item_id instead.
When ad_format is set to CATALOG_CAROUSEL at the ad level and catalog_enabled is set to true at the campaign level, this field is required and the value of this field will be used as the summary photo in the Automotive Ad for Inventory or Automotive Ads for Models (only one value is allowed).
See Create Automotive Ads for Inventory or Automotive Ads for Models to learn about the requirements for the summary photo that can be used in Automotive Ads for Inventory or Automotive Ads for Models.
When ad_format is set to SINGLE_IMAGE, this field is required and you can only assign one image ID to this field.
To learn about the requirements for images that can be used in single image ads, see Create single image ads.

carousel_image_index
	
integer
	
Valid only for VSA Carousel ads where a list of additional image URLs has been configured for the specified products.
Not supported for Automotive Carousel Ads for Inventory or Automotive Carousel Ads for Models.

The index that specifies the additional images to be used in the VSA Carousel ad. If this field is not passed, the main images of catalog products will be used in the VSA Carousel ad.

Value range: [0, 9].
The number you set via this field represents the position of the product image within the additional image list (additional_image_urls) for each E-commerce catalog product. For instance, carousel_image_index = 1 means that you will use all the images specified via the second image URL in each additional_image_urls value as images in the Carousel Ad. You can retrieve the additional images configured for a product via additional_image_urls returned by /catalog/product/get/.
If you specify the additional image index using this field, the system will count the number of E-commerce products with available additional images. If the index you provide does not match any of the additional image URLs specified for the product or if the additional image fails to be fetched from the corresponding image URL, the product will not be counted.
When there are two or more products with available additional images, only those products will be displayed in the ads with the additional images used.
When there are fewer than two products with available additional images, all products will be displayed in the ads with the main images used.

end_card_cta
Conditional
	
string
	
Required when the following conditions are met:
At the campaign level:
objective_type is LEAD_GENERATION.
catalog_enabled is true.
At the ad group level:
An Auto-Inventory or Auto-Model catalog is specified through catalog_id.
At the ad level:
ad_format is CATALOG_CAROUSEL.

Call-to-action for the end card (image_ids) of an Automotive Carousel Ad for Inventory or Automotive Carousel Ad for Models.

Enum values:
SEARCH_INVENTORY (Recommended): Search inventory.
LEARN_MORE: Learn more.
SHOP_NOW: Shop now.
SIGN_UP: Sign up.
CONTACT_US: Contact us.
BOOK_NOW: Book now.
READ_MORE: Read more.
VIEW_MORE: View now.
ORDER_NOW: Order now.

product_display_field_list
	
string[]
	
Valid only when the following conditions are met:
At the campaign level:
objective_type is LEAD_GENERATION.
catalog_enabled is true.
At the ad group level:
An Auto-Inventory catalog is specified through catalog_id.
At the ad level:
ad_format is CATALOG_CAROUSEL.

A list of product details to display in your Automotive Carousel Ad for Inventory.

Max size: 2.

Enum values:
DEALER_NAME: the dealer_name field of vehicles.
MAKE: the make field of vehicles.
MODEL: the model field of vehicles.
YEAR: the year field of vehicles.
MILEAGE: the mileage field of vehicles.
PRICE: the price field of vehicles.
SALE_PRICE: the sale_price field of vehicles.
EXTERIOR_COLOR: the exterior_color field of vehicles.
TRIM: the trim field of vehicles.
ADDRESS_CITY: the city field of vehicles.
VEHICLE_STATE: the state_of_vehicle field of vehicles.

The title of each vehicle is displayed automatically. For instance, if you set this field to ["MILEAGE","YEAR"], the ad will display the mileage, price and title fields of each vehicle.
To retrieve the product detail fields of your vehicles in an Auto-Inventory catalog and check whether you need to update the details, use /catalog/product/get/.

Note: Once set, this field cannot be updated.

auto_disclaimer_types
	
string[]
	
Valid only when the following conditions are met:
At the campaign level:
objective_type is LEAD_GENERATION.
catalog_enabled is true.
At the ad group level:
An Auto-Model catalog is specified through catalog_id.
At the ad level:
ad_format is CATALOG_CAROUSEL.

The type of disclaimer to show in the Automotive Carousel Ads for Models.

Enum values:
EMISSION: Emssion disclaimer.
DISCOUNT: Discount or offer disclaimer.

Max size: 1.

music_id
Conditional
	
string
	
Required in any of the following scenarios:
ad_format is CAROUSEL_ADS and you want to create Standard Carousel Spark Ads via Spark Ads Push or Standard Carousel Non-Spark Ads.
ad_format is CATALOG_CAROUSEL.

The ID of the piece of music that you want to use in the TikTok Carousel Ad.
See Create Carousel Ads-Steps-Create an ad to learn about how to get music that can be used in TikTok Carousel Ads.

tiktok_item_id
Conditional
	
string
	
Required when identity_type is AUTH_CODE, or BC_AUTH_TT and you want to create Spark Ads through Spark Ads Pull.
Not supported when identity_type is CUSTOMIZED_USER.

The ID of the TikTok post to be used as Spark Ad.

To learn more about Spark Ads, see Create Spark Ads.

Pass in the item_id you get from the response of the /tt_video/info/ or /identity/video/get/ endpoint.

Note: By using Spark Ads, you confirm that you have the rights to use the music in the videos for commercial purposes.

promotional_music_disabled
	
boolean
	
Whether to disable the promotional use of the music in the Spark Ad. The default value is true. If you want to allow dueting and stitching for the TikTok video, you need to set this field to false. This field is only valid for Spark Ad posts.

item_duet_status
	
string
	
Whether to enable dueting for the Spark Ad. This field is valid only when promotional_music_disabled is set to false. Enum values: ENABLE, DISABLE. This field is only valid for Spark Ad posts.

item_stitch_status
	
string
	
Whether to enable stitching for the Spark Ad. This field is valid only when promotional_music_disabled is set to false. Enum values: ENABLE, DISABLE. This field is only valid for Spark Ad posts.

dark_post_status
	
string
	
You can set this field to either ON or OFF.
Default is ON.
If the ad is created as a dark post, it will not appear in the creator's homepage.

Note:

You can set this to OFF only if both the identity's "Show through ads only" mode is disabled and the ad account does not have mandatory "Show through ads only" mode enabled. If the ad account enforces mandatory "Ads-only mode", you can only set this field to ON when creating Spark Ads using Spark Ads Push. This prevents the posts from appearing on your TikTok profile and gaining organic traffic, regardless of the identity's own ads_only_mode setting. It's a safeguard to ensure your Spark Ads Push content remains ads-only and avoids accidental profile posts.
To confirm the "Show through ads only" mode status of an identity, use /identity/info/ and check the returned ads_only_mode.
To confirm the mandatory "Show through ads only" mode status of an ad account, use /advertiser/info/ and check the returned ads_only_mode.

shopping_ads_video_package_id
	
string
	
Product video package ID. Use the /catalog/video/get/ endpoint to get video package IDs.

ad_text
Conditional
	
string
	
For Spark Ads Push, ad_text is required.
For non-Spark Ads , either ad_text or ad_texts has to be set.
An ad text. It is shown to your audience as part of your ad creative, to deliver the message you intend to communicate to them. If you don't know how to create effective ad texts, you can try the Smart Text feature, which generates ad text recommendations based on the industry and language.
Length limit for the ad text: 100 characters long and cannot contain emoji.
Each word in Chinese or Japanese counts as two characters, while each letter in English counts as one character.

Note: If both ad_text and ad_texts are specified, ad_text will be ignored.

ad_texts
Conditional
	
string[]
	
For non-Spark Ads, either ad_text or ad_texts has to be set.
Valid only for Search Ads Campaigns.

A list of ad texts.
The ad text is shown to your audience as part of your ad creative, to deliver the message that you intend to communicate to them. When you specify multiple ad texts, the system will automatically select the most relevant to the audience and optimize for the best results.

If you don't know how to create effective ad texts, you can try the Smart Text feature, which generates ad text recommendations based on industry and language.

Size limit: 5.

Length limit for each ad text: 100 characters long and cannot contain emoji.
Each word in Chinese or Japanese counts as two characters, while each letter in English counts as one character.

Note:

If both ad_text and ad_texts are specified, ad_text will be ignored.

call_to_action
Conditional
	
string
	
Call-to-action text.

For TikTok ads, either this field or call_to_action_id must be specified. If both are specified, this field will be ignored.

For enum values, see Enumeration - Call-to-Action.

In a Live Shopping Ad where creative_type is set to SHORT_VIDEO_LIVE, this field is required and must be set to WATCH_LIVE.

call_to_action_id
Conditional
	
string
	
The ID of the CTA portfolio that you want to use in your ads. A CTA portfolio is a group of auto-optimized CTAs.

If both this field and call_to_action are specified, this field will be used, and call_to_action will be ignored.

For details about auto-optimized CTAs, see CTA Recommendations - Auto-Optimized CTAs.

card_id
	
string
	
Creative portfolio ID.

Pass the ID of one of the following creative portfolio types:
call-to-action text.
Display Card.
Website info card.
Download Card.
Product Card.
Product Tiles.
Countdown Sticker.
Gift Code Sticker.
Pop-up Showcase.
Gesture.
Superlike.

To create a creative portfolio, use /creative/portfolio/create/.

To learn about how to get the ID of a Display Card, Website info card, Download Card, Product Card, or Product Tiles portfolio, see Cards.
To learn about how to get the ID of a Countdown Sticker or Gift Code Sticker portfolio, see Stickers.
To learn about how to get the ID of a Pop-out Showcase, Gesture, or Superlike portfolio, see Premium Add-ons.

Note:

Once you include a Product Tiles portfolio in your ad, you cannot delete the portfolio from the ad. However, you have the option to update the portfolio to a different one.

landing_page_url
Conditional
	
string
	
The landing page that users will be redirected to.

The landing page URL can include URL parameters that are appended to the end of the URL. To learn more about URL parameters, see the description of the parameter utm_params.

Example: https://www.example.com?utm_source=TikTok&utm_medium=video&utm_campaign=Campaign1&utm_content=Content1

utm_params
	
object[]
	
This field is supported in any of the following scenarios:
Video Shopping Ads (VSA) for Catalog scenarios:
At the campaign level:
objective_type is set to PRODUCT_SALES
At the ad group level:
shopping_ads_type is set to VIDEO (Video Shopping Ads)
product_source is set to CATALOG
promotion_type is set to WEBSITE, APP_ANDROID, or APP_IOS
Automotive Ads for Inventory (AIA) or Automotive Ads for Models scenarios:
At the campaign level:
objective_type is set to LEAD_GENERATION
catalog_enabled is set to true
At the ad group level:
promotion_target_type is set to EXTERNAL_WEBSITE
Other scenarios:
At the campaign level:
objective_type is set to REACH, TRAFFIC, VIDEO_VIEWS, LEAD_GENERATION (with catalog_enabled as false), ENGAGEMENT, APP_PROMOTION (with app_promotion_type as APP_PREREGISTRATION), WEB_CONVERSIONS, or RF_REACH.

A list of URL parameters. URL parameters are snippets of code that can be added to the end of the URLs to help you track clicks across different channels and understand how visitors interact with a website through third-party analytics platforms. They consist of key-value pairs that are specified through key and value.

Max size : 14.

In VSA for Catalog scenarios:
If you use a product link in your ad (shopping_ads_fallback_type is SHOPPING_ADS), you can add URL parameters to the product link by passing utm_params. The URL parameters will be automatically appended to the product link upon ad delivery.
If you use a custom link (website URL) in your ad (shopping_ads_fallback_type is CUSTOM), you can manually add URL parameters to the custom link by directly setting landing_page_url to a URL that already includes URL parameters.
However, if you use a custom link in your ad and pass utm_params at the same time, the URL parameters will not be automatically appended to the custom link (landing_page_url) upon ad delivery. In such cases, you need to ensure that you specify a landing_page_url with the URL parameters already appended, and that utm_params exactly matches the used URL parameters. Otherwise, an error will occur.
In AIA or Automotive Ads for Models scenarios, you can add URL parameters to the product link (the landing_page_url of your catalog products) by passing utm_params. The URL parameters will be automatically appended to the product link upon ad delivery.
In other scenarios, if you set landing_page_url to a URL that already includes URL parameters, you can optionally pass utm_params at the same time to store the URL parameters used in the URL. In such cases, you need to ensure that utm_params exactly matches the used URL parameters. The URL parameters will not be automatically appended to the landing_page_url upon ad delivery.

key
	
string
	
The URL parameter.
You can specify a custom parameter or a UTM parameter.

The supported UTM parameters are:
utm_source: The app, site, etc., that brings traffic to your website. For example: TikTok.
utm_medium: The advertising or marketing medium. For example: cpm, cpc, banner, video.
utm_content: The creative content used for promotion. For example: ad name, CTA text, asset, color, etc.
utm_campaign: The individual campaign name, slogan, or promo code. For example: BlackFridayProm.
Note that UTM parameters are case-sensitive.

Length limit when you specify a custom parameter: 100 characters.

value
	
string
	
The value of the URL parameter.
You can specify a custom value or the name of a macro.

The supported macros are:
__CAMPAIGN_NAME__: This will be replaced by your campaign name.
__CAMPAIGN_ID__: This will be replaced by your campaign ID.
__AID_NAME__: This will be replaced by your ad group name.
__AID__: This will be replaced by your ad group ID.
__CID_NAME__: This will be replaced by your ad name.
__CID__: This will be replaced by your ad ID.
__PLACEMENT__: This will be replaced by your placement.

Length limit when you specify a custom value: 600 characters.

page_id
Conditional
	
number
	
Page ID.

To obtain pages within your ad account, use /page/get/.
To create instant pages, use Instant Page Editor SDK.

Instant Forms are for LEAD_GENERATION campaign objective. Only applicable for TikTok placement. Before creating for the first time, you need to sign the LeadAds agreement through the /term/confirm/ endpoint.

Note: We will sunset the Collection Ads on Feb.16,2023. To ensure a seamless experience, please don't set a storefront page as your instant page.

cpp_url
	
string
	
The Custom Product Page (CPP) URL.
CPPs are product pages with customized screenshots, promotional text, and app previews that can be used to highlight specific content or features of the promoted app, or reach specific audiences.

The Custom Product Page URL must be consistent with the promoted app (app_id).

Format: https://apps.apple.com/{region}/app/{app_name}/id{app_id}?ppid={ppid}.

Length limit: 512 characters.

Example: https://apps.apple.com/us/app/tiktok/id835599320?ppid=12345a6b-c789-12d3-e4f5-g6h78i91jk2l.

To learn about the scenarios where you can use CPPs in your ads and the detailed steps, see Custom Product Pages.

Note: Using Custom Product Pages in ads is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

tiktok_page_category
Conditional
	
string
	
Required when optimization_goal is PAGE_VISIT at the ad group level.

The category of the TikTok page that you want to promote.

Enum values:
PROFILE_PAGE: TikTok account profile page. You don't need to pass landing_page_url or page_id.
OTHER_TIKTOK_PAGE: Other TikTok pages, including Playlist Page, Hashtag Page, Music Page and Branded Effect Page. You need to specify the specific TikTok page URL via landing_page_url simultaneously.
To obtain a TikTok page URL, tap on the top right corner of the TikTok page you want to promote within your TikTok app, and click to copy the URL.
TIKTOK_INSTANT_PAGE: Custom TikTok Instant Page. You need to specify the specific TikTok Instant Page via page_id simultaneously.
To obtain Custom TikTok Instant Pages within your ad account, use /page/get/ and set business_type to TIKTOK_INSTANT_PAGE.

Note:

This field cannot be updated after creation.
If you set tiktok_page_category to OTHER_TIKTOK_PAGE, landing_page_url cannot be updated after ad creation.

phone_region_code
Conditional
	
string
	
If promotion_type is set to LEAD_GEN_CLICK_TO_CALL at the ad group level, the parameters phone_number, phone_region_calling_code, and phone_region_code are all required.

The region code for the phone number that the audience can click on the ad to call.

Example: US.

To learn about how to create a Lead Generation ad with promotion type as phone call, refer to here.
To obtain the region code (phone_region_code) and region calling code (phone_region_calling_code) for the region that is associated with a specific phone number, use /tool/phone_region_code/.

Note: Creating a Lead Generation ad with promotion type as phone call is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

phone_region_calling_code
Conditional
	
string
	
If promotion_type is set to LEAD_GEN_CLICK_TO_CALL at the ad group level, the parameters phone_number, phone_region_calling_code, and phone_region_code are all required.

The region calling code for the phone number that the audience can click on the ad to call.

Example: +1.

To learn about how to create a Lead Generation ad with promotion type as phone call, refer to here.
To obtain the region code (phone_region_code) and region calling code (phone_region_calling_code) for the region that is associated with a specific phone number, use /tool/phone_region_code/.

Note: Creating a Lead Generation ad with promotion type as phone call is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

phone_number
Conditional
	
string
	
If promotion_type is set to LEAD_GEN_CLICK_TO_CALL at the ad group level, the parameters phone_number, phone_region_calling_code, and phone_region_code are all required.

The phone number that the audience can click on the ad to call.

Example: 12638282.

To learn about how to create a Lead Generation ad with promotion type as phone call, refer to here.

Note: Creating a Lead Generation ad with promotion type as phone call is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

creative_auto_enhancement_strategy_list
	
string[]
	
The list of automatic enhancement strategies to apply to your ads.
The enhancements you specified will be automatically applied in real-time as your campaign is delivered.

Enum values:
VIDEO_QUALITY: Video quality. Improve overall visual quality with increased resolution and clarity.
MUSIC_REFRESH: Music refresh. Stay on-trend by swapping in music currently popular on TikTok.
IMAGE_QUALITY: Image quality. Improve overall visual quality with increased resolution and clarity.
IMAGE_RESIZE: Resize. Resize your image to take advantage of full-screen capabilities.

The default value for this field is determined by your allowlist status for the "automatic enhancements enabled by default" feature:
If you are allowlisted for certain strategies to be enabled by default, this field will default to a list of those strategies.
For example, if you are allowlisted for all these strategies to be enabled by default, this field will default to ["MUSIC_REFRESH","VIDEO_QUALITY","IMAGE_QUALITY","IMAGE_RESIZE"].
If you are not allowlisted for any strategies to be enabled by default, this field will default to an empty list ([]).

To learn about the scenarios where you can enable this setting, see Availability of Automatic Enhancements for Manual Ads.

Note: Automatic enhancements are available to all advertisers. However, having them turned on by default is currently a separate allowlist-only feature for each enhancement. If you would like to access it, please contact your TikTok representative.

deeplink
	
string
	
The specific location where you want your audience to go if they have your app installed.
See deeplink_type for more.

To learn about the supported scenarios for non-deferred deeplinks and deferred deeplinks, see the "Deeplink - Availability - Deeplink" section.

Note:

Deferred deeplinks are currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative. Note that implementing deferred deeplinks require technical resources and development capabilities.
Non-deferred deeplinks are currently an allowlist-only feature for some scenarios. To check the scenarios where non-deferred deeplinks are an allowlist-only feature, see the "Deeplink - Availability - Deeplink" section. If you would like to access it for these scenarios, please contact your TikTok representative.

deeplink_type
	
string
	
The deeplink type.

Enum values:
NORMAL: non-deferred deeplink.
DEFERRED_DEEPLINK: deferred deeplink.
Default value: NORMAL.

To learn about the supported scenarios for non-deferred deeplinks and deferred deeplinks, see the "Deeplink - Availability - Deeplink" section.

Note:

Deferred deeplinks are currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative. Note that implementing deferred deeplinks require technical resources and development capabilities.
Non-deferred deeplinks are currently an allowlist-only feature for some scenarios. To check the scenarios where non-deferred deeplinks are an allowlist-only feature, see the "Deeplink - Availability - Deeplink" section. If you would like to access it for these scenarios, please contact your TikTok representative.
Deferred deeplinks are not supported in Dedicated Campaigns. Therefore, if the campaign_type of the campaign that the ad belongs to is IOS14_CAMPAIGN, you cannot set this field to DEFERRED_DEEPLINK.

deeplink_format_type
Conditional
	
string
	
When objective_type is set to TRAFFIC at the campaign level and optimization_goal is set to DESTINATION_VISIT at the ad group level, deeplink_format_type and deeplink are required.

The format type of the deeplink.

Enum values:
UNIVERSAL_OR_APP_LINK: Apple’s universal link or Android App Link starting with http:// or https://.
SCHEME_LINK: Custom URL scheme, in the format of scheme://resource. For instance, a Custom URL scheme of WhatsApp should follow the format whatsapp://resource.

To learn more about how to use the optimization goal Destination Visit in a Traffic ad, see Optimize Destination visit in Traffic ads.

Note: Once set, this field cannot be updated.

shopping_ads_deeplink_type
	
string
	
The source of the deeplink to be used in the Shopping Ads.

Enum values:
NONE: No deeplink.
CUSTOM: Custom deeplink. Use the deeplink you provided in the ad. You need to specify deeplink at the same time.
SHOPPING_ADS: Product deeplink. Use the deeplink you've provided for each product in the catalog.

Default value: NONE.

The SHOPPING_ADS value is not supported when the following conditions are met:
At the ad group level:
shopping_ads_type is set to VIDEO (Video Shopping Ads)
And product_source is set to CATALOG
At the ad level:
ad_format is set to SINGLE_VIDEO and vertical_video_strategy is set to SINGLE_VIDEO
Or ad_format is set to CATALOG_CAROUSEL

To learn about the supported scenarios for non-deferred deeplinks and deferred deeplinks, see the "Deeplink - Availability - Deeplink" section.

Note:

Deferred deeplinks are currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative. Note that implementing deferred deeplinks require technical resources and development capabilities.
Non-deferred deeplinks are currently an allowlist-only feature for some scenarios. To check the scenarios where non-deferred deeplinks are an allowlist-only feature, see the "Deeplink - Availability - Deeplink" section. If you would like to access it for these scenarios, please contact your TikTok representative.

deeplink_utm_params
	
object[]
	
This field is supported only when the following conditions are all met:
At the ad group level:
shopping_ads_type is set to VIDEO (Video Shopping Ads)
product_source is set to CATALOG
promotion_type is set to WEBSITE, APP_ANDROID, or APP_IOS

A list of deeplink URL parameters. URL parameters are snippets of code that can be added to the end of the URLs to help you track clicks across different channels and understand how visitors interact with a website through third-party analytics platforms. They consist of key-value pairs that are specified through key and value.

Max size: 14.

If you use a product deeplink in your ad (shopping_ads_deeplink_type is SHOPPING_ADS), you can add deeplink URL parameters to the product deeplink by passing deeplink_utm_params. The URL parameters will be automatically appended to the product link upon ad delivery.
If you use a custom deeplink in your ad (shopping_ads_deeplink_type = CUSTOM), you can manually add deeplink URL parameters to the custom deeplink by directly setting deeplink to a deeplink that already includes URL parameters.
However, if you use a custom deeplink in your ad and pass deeplink_utm_params at the same time, the URL parameters will not be automatically appended to the custom deeplink (deeplink) upon ad delivery. In such cases, you need to ensure that deeplink_utm_params exactly matches the used deeplink URL parameters.

Note: Deeplink URL parameters are currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.

key
	
string
	
The deeplink URL parameter.
You can specify a custom parameter or a UTM parameter.

The supported UTM parameters are:
utm_source: The app, site, etc., that brings traffic to your website. For example: TikTok.
utm_medium: The advertising or marketing medium. For example: cpm, cpc, banner, video.
utm_content: The creative content used for promotion. For example: ad name, CTA text, asset, color, etc.
utm_campaign: The individual campaign name, slogan, or promo code. For example: BlackFridayProm.

Note that UTM parameters are case-sensitive.

Length limit when you specify a custom parameter: 100 characters.

value
	
string
	
The value of the deeplink URL parameter.
You can specify a custom value or the name of a macro.

The supported macros are:
__CAMPAIGN_NAME__: This will be replaced by your campaign name.
__CAMPAIGN_ID__: This will be replaced by your campaign ID.
__AID_NAME__: This will be replaced by your ad group name.
__AID__: This will be replaced by your ad group ID.
__CID_NAME__: This will be replaced by your ad name.
__CID__: This will be replaced by your ad ID.
__PLACEMENT__: This will be replaced by your placement.

Length limit when you specify a custom value: 600 characters.

shopping_ads_fallback_type
Conditional
	
string
	
In the Shopping Ads retargeting scenario, the fallback website type when the deeplink fails to be triggered.

Enum values:
DEFAULT: Unset.
CUSTOM: Custom link. Fall back to the web page link you provide. You need to pass in landing_page_url at the same time.
SHOPPING_ADS: Product link. Fall back to the web page link you've provided for each product in the catalog.

The SHOPPING_ADS value is not supported when the following conditions are met:
At the ad group level:
shopping_ads_type is set to VIDEO (Video Shopping Ads)
And product_source is set to CATALOG
At the ad level:
ad_format is set to SINGLE_VIDEO and vertical_video_strategy is set to SINGLE_VIDEO
Or ad_format is set to CATALOG_CAROUSEL

To learn about the supported scenarios for fallback types, see the "Deeplink - Availability - Fallback type" section.

fallback_type
	
string
	
Fallback Type. If the audience do not have the app installed, you can have them fall back to install the app, or to view a specific web page.

Enum values:
APP_INSTALL: the App Store or Google Play page for the promoted App that is specified through the app_id field at the ad group level.
WEBSITE: the promoted web page that is specified through landing_page_url.
UNSET: Unset.

If you set this field to WEBSITE, you need to pass the landing_page_url field.

To learn about the supported scenarios for fallback types, see the "Deeplink - Availability - Fallback type" section.

dynamic_destination
	
string
	
Dynamic destination strategy.
Enum values:
DLP: Dynamic Landing Page. Displaying different destinations including a custom website or Instant Product Page to each person based on their profile, behavior, and intent to maximize ad conversion.
UNSET: Unset.

You cannot set this field to DLP if promotion_type is APP_ANDROIDor APP_IOS.

Note: Dynamic destination is not supported for the optimization goals Click and Landing Page View in website-promoting Video Shopping Ads with product source as catalog. Therefore, this field cannot be specified as DLP when the following conditions are met:

At the ad group level:
shopping_ads_type is set to VIDEO (Video Shopping Ads).
product_source is set to CATALOG.
promotion_type is set to WEBSITE.
optimization_goal is set to CLICK or TRAFFIC_LANDING_PAGE_VIEW.

instant_product_page_used
	
boolean
	
Whether to use TikTok Instant Product Page, an auto-generated TikTok instant page that displays a range of products and provides a native experience landing page.
When dynamic_destination= DLP, you don't need this parameter.
When dynamic_destination = UNSET, you can set this field to true, and you don't need to pass in page_id.

page_image_index
	
integer
	
Valid only when you set instant_product_page_used to true, and a list of additional images has been configured for the specified products.

The index that specifies the additional images to be used on the TikTok Instant Product Page. If this field is not passed, the main images of catalog products will be used on the TikTok Instant Product Page.
Value range: [0, 9].
The number you set via this field represents the position of the product image within the additional image list (additional_image_urls) for each catalog product. For instance, page_image_index = 1 means that you will use all the images specified via the second image URL in each additional_image_urls value as images on the TikTok Instant Product Page. You can retrieve the additional images configured for a product via additional_image_urls returned by /catalog/product/get/.
If you set a number greater than the total number of additional Image URLs specified for the product, this field will be ignored, and the main image (image_url) for the product will be used. You can retrieve the main image for a product via image_url returned by /catalog/product/get/.

auto_message_id
Conditional
	
string
	
Required when promotion_type is LEAD_GEN_CLICK_TO_TT_DIRECT_MESSAGE at the ad group level.

The ID of the automatic message to use in a TikTok Direct Messaging Ad.

Currently, the only supported automatic message type is welcome message.

To obtain a list of welcome messages within your ad account, use /creative/auto_message/get/.
To create a welcome message within your ad account, use /creative/auto_message/create/.

To learn more about how to create TikTok Direct Messaging Ads with welcome messages, see Create a Lead Generation ad with optimization location as TikTok direct messages.

aigc_disclosure_type
	
string
	
Valid only when identity_type is CUSTOMIZED_USER.

Whether to turn on the AIGC (Artificial Intelligence Generated Content) self-disclosure toggle to indicate the ad contains AI-generated content. After the toggle is turned on, your ad will carry an "Advertiser labeled as Al-generated" label when viewed in full.

Enum values:
SELF_DISCLOSURE: To turn on the toggle to declare that the ad contains AI-generated content.
NOT_DECLARED: To not declare that the ad contains AI-generated content.
Default value: NOT_DECLARED.

To learn about the supported advertising objectives and ad formats for the toggle and the detailed steps for using the toggle, see AIGC self-disclosure toggle.

Note:

For Single Video or Carousel Ads, you can only update this field when you update the ad creative (video or image) itself. For example, if you only reorder the images in a Carousel Ad, this field cannot be updated.
For Dynamic Format, Catalog Video, and Catalog Carousel Ads, this field cannot be updated.

disclaimer_type
	
string
	
Type of disclaimer that you want to add to the ad. Enum values: TEXT_LINK(clickable disclaimers), TEXT_ONLY(text-only disclaimers). See Include disclaimers in ads to learn about how to configure disclaimer settings.

Note:

Disclaimers are currently an allowlist-only feature for advertisers not registered in Canada and America using auction ad objectives, and for all advertisers using Reach & Frequency ad objectives. If you would like to access it, please contact your TikTok representative.
The disclaimer feature only supports the following advertising objectives: APP_PROMOTION, WEB_CONVERSIONS, REACH, TRAFFIC, VIDEO_VIEWS, ENGAGEMENT, LEAD_GENERATION, RF_REACH.
The disclaimer feature only supports TikTok placement.
The disclaimer feature is not supported for Automated Creative Optimization ads.
Once added to your ads, the disclaimer cannot be deleted.

disclaimer_text
Conditional
	
object
	
The text-only disclaimer that you want to add to the ad.
Required when disclaimer_type = TEXT_ONLY.

text
	
string
	
The disclaimer text. Length limit: 90 characters.

disclaimer_clickable_texts
Conditional
	
object[]
	
The clickable disclaimer or clickable disclaimers that you want to add to the ad. Required when disclaimer_type = TEXT_LINK. Max size: 3.
If you use multiple clickable disclaimers, both the overall length for all the texts you pass in and the length of individual text need to be no more than 40 characters.

text
	
string
	
The disclaimer text. Length limit: 40 characters.

url
	
string
	
The URL for the clickable disclaimer. When users tap each text, they will be redirected to the URL and see more disclaimer details.

tracking_pixel_id
	
number
	
The pixel ID that you'd like to track. You can use this field to track offsite events. It supports the campaign objectives for both Auction ads (REACH, VIDEO_VIEWS, TRAFFIC, WEB_CONVERSIONS, LEAD_GENERATION, APP_PROMOTION, PRODUCT_SALES, ENGAGEMENT) and Reach & Frequency ads (RF_REACH).

For Auction objectives:
If pixel_id is specified at the ad group level and you want to use pixel to track offsite events, then the pixel ID you pass in the tracking_pixel_id field must be the same ID that you specified in the pixel_id field for the ad group. Otherwise, you can pass in any pixel ID that you'd like to track in the tracking_pixel_id field.
For Reach & Frequency objectives:
You can pass in any pixel ID that you'd like to track in the tracking_pixel_id field.

tracking_app_id
	
string
	
The ID of the application that you want to track. You can use this field to track offsite app events.
This field supports the campaign objectives for both Auction ads (REACH, VIDEO_VIEWS, TRAFFIC, WEB_CONVERSIONS, LEAD_GENERATION, APP_PROMOTION, PRODUCT_SALES, ENGAGEMENT) and Reach & Frequency ads (RF_REACH).
If app_id is specified at the ad group level and you want to track offsite app events, then the application ID you pass via this field must be the same ID that you specified at the ad group level. Otherwise, you can pass in any application ID that you'd like to track via this field.
You can get application ID (app_id) via /app/list/.

tracking_offline_event_set_ids
	
string[]
	
A list of Offline Event set IDs that you want to track. You can use this field to track and measure offline activity from people that see or interact with your ads.
Max size: 50.
See here to learn more about how to create and manage Offline Event sets.

Note:

Existing auto-tracking Offline Event sets have to be tracked under a newly created ad:
You can omit this parameter, then this field will automatically default to the IDs of all the existing auto-tracking Offline Event sets under the advertiser account, or
You can manually pass in this parameter. You need to specify via this field at least all the existing auto-tracking Offline Event set IDs, and non-auto-tracking ones are optional. To get the IDs of current auto-tracking Offline Event sets, call /offline/get/ to get all Offline Event set IDs and then select all the auto-tracking ones according to the returned auto_tracking parameter.
This field supports the following campaign objectives: REACH, VIDEO_VIEWS, TRAFFIC, LEAD_GENERATION, APP_PROMOTION, WEB_CONVERSIONS, ENGAGEMENT, and PRODUCT_SALES.
If the campaign objective (objective_type) is set to PRODUCT_SALES, you can only use this field in Video Shopping Ads with product source as catalog. Therefore, ensure the following requirements are both met at the ad group level:
shopping_ads_type = VIDEO
product_source = CATALOG

tracking_message_event_set_id
	
string
	
Valid when the following conditions are met:
promotion_type is LEAD_GEN_CLICK_TO_SOCIAL_MEDIA_APP_MESSAGE.
optimization_goal is CLICK.
messaging_app_type is MESSENGER or WHATSAPP.
page_id is not passed.

The ID of the message event set that you want to measure in the Instant Messaging Ad. You can use this field to measure when users have started conversation in your instant messaging app.

To obtain the list of available message event sets, use /ctm/message_event_set/get/.
To learn more about how to create Instant Messaging Ads, see Create a Lead Generation ad with optimization location as instant messaging apps.

Note: Once set, this field cannot be updated.

viewability_postbid_partner
	
string
	
Post-bid third-party viewability measurement partner. Enum values: MOAT, DOUBLE_VERIFY, IAS, ZEFR.

Note:

Post-bid third-party viewability measurement is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
See Brand safety to learn about the supported advertising objectives, supported markets, and the general introduction of post-bid measurement.
When you pass in both brand_safety_postbid_partner and viewability_postbid_partner:
If you set either of these two fields as IAS, you need to specify both as IAS, and assign the same value (the wrapped VAST URL that you obtain from the measurement partner IAS) to brand_safety_vast_url and viewability_vast_url.
If you set either of these two fields as ZEFR, you need to specify both as ZEFR.
If you set two different post-bid measurement partners, only the post-bid brand safety measurement setting will become valid.
Post-bid third-party measurement is not supported for ACO ads.
Post-bid third-party measurement is not supported for ad groups where promotion_type is set as LIVE_SHOPPING.

viewability_vast_url
Conditional
	
string
	
The wrapped VAST URL used by the post-bid third-party partner to measure viewability. Required when viewability_postbid_partner = IAS. You need to get the URL from the measurement partner IAS.

Note:

Post-bid third-party viewability measurement is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
When you set both brand_safety_postbid_partner and viewability_postbid_partner as IAS, brand_safety_vast_url should be the same as viewability_vast_url.
Post-bid third-party measurement is not supported for ACO ads.
Post-bid third-party measurement is not supported for ad groups where promotion_type is set as LIVE_SHOPPING.

brand_safety_postbid_partner
	
string
	
Post-bid third-party brand safety measurement partner. Enum values: DOUBLE_VERIFY, IAS, ZEFR.

Note:

Post-bid third-party brand safety measurement is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
See Brand safety to learn about the supported advertising objectives, supported markets, and the general introduction of post-bid measurement.
The pre-bid Brand Safety filtering setting at the ad group level will determine whether you can use both types of post-bid measurement:
If you have specified brand_safety_type as NO_BRAND_SAFETY at the ad group level, you can only pass in viewability_postbid_partner, but not brand_safety_postbid_partner at the ad level.
If you have specified brand_safety_type as a value other than NO_BRAND_SAFETY at the ad group level, you can pass in both viewability_postbid_partner and brand_safety_postbid_partner at the ad level.
When you pass in both brand_safety_postbid_partner and viewability_postbid_partner:
If you set either of these two fields as IAS, you need to specify both as IAS, and assign the same value (the wrapped VAST URL that you obtain from the measurement partner IAS) to brand_safety_vast_url and viewability_vast_url.
If you set two different post-bid measurement partners, only the post-bid brand safety measurement setting will become valid.
Post-bid third-party measurement is not supported for ACO ads.
Post-bid third-party measurement is not supported for ad groups where promotion_type is set as LIVE_SHOPPING.

brand_safety_vast_url
Conditional
	
string
	
The wrapped VAST URL used by the post-bid third-party partner to measure brand safety. Required when brand_safety_postbid_partner = IAS. You need to get the URL from the measurement partner IAS.

Note:

Post-bid third-party brand safety measurement is currently an allowlist-only feature. If you would like to access it, please contact your TikTok representative.
When you set both brand_safety_postbid_partner and viewability_postbid_partner as IAS, brand_safety_vast_url should be the same as viewability_vast_url.
Post-bid third-party measurement is not supported for ACO ads.
Post-bid third-party measurement is not supported for ad groups where promotion_type is set as LIVE_SHOPPING.

impression_tracking_url
	
string
	
Default Impression Tracking URL. URL generated by your data partner to track impression events in your ads. Generally you can find and copy the URL from their platform.
If the partner ID for the App (app_id specified at the ad group level ) that you want to track is 44 (TikTok Business SDK) or 49 (TikTok App API), you don't need to pass in this field. If you do, this field will be ignored. You can obtain the partner ID of an App through partner_id returned from /app/list/ or /app/info/.
If self-attribution has been enabled for the App (app_id specified at the ad group level ) that you want to track and the partner ID for the App is not 44 (TikTok Business SDK) or 49 (TikTok App API), you don't need to pass in this field because this field will default to the Default Impression Tracking URL you have configured for the App, and updates to the URL are not supported. You can check whether self-attribution has been enabled for the App through self_attribution_enabled returned from /app/list/ or /app/info/.

click_tracking_url
	
string
	
Click Tracking URL. URL generated by your data partner to track click events in your ads. Generally you can find and copy the URL from their platform.
If the partner ID for the App (app_id specified at the ad group level ) that you want to track is 44 (TikTok Business SDK) or 49 (TikTok App API), you don't need to pass in this field. If you do, this field will be ignored. You can obtain the partner ID of an App through partner_id returned from /app/list/ or /app/info/.
If self-attribution has been enabled for the App (app_id specified at the ad group level ) that you want to track and the partner ID for the App is not 44 (TikTok Business SDK) or 49 (TikTok App API), you don't need to pass in this field because this field will default to the Click Tracking URL you have configured for the App, and updates to the URL are not supported. You can check whether self-attribution has been enabled for the App through self_attribution_enabled returned from /app/list/ or /app/info/.
Currently Pangle does not support DCM, Sizmek or Flashtalking.

playable_url
	
string
	
Playable material url, valid in Pangle and TikTok placement. You can get the url via the /playable/get/ endpoint. Note that all ads in the same ad group share the same playable material.

Note: Starting September 30, 2024, you will no longer be able to create Playable Ads delivered to the TikTok placement.

operation_status
	
string
	

Note

For Reach & Frequency ads, please specify operation_status as ENABLE or do not pass in operation_status. Do not specify operation_status as DISABLE.

The status of the ad when created. Enum values:
ENABLE : The ad is enabled when created.
DISABLE : The ad is disabled when created.
Default value: ENABLE.
If you want to update the status of the ad after creation, use the /ad/status/update/ endpoint.

creative_type
Conditional
	
string
	
Creative type for Live Shopping Ads, Product Shopping Ads, App Pre-Registration, Automotive Ads for Inventory, or Automotive Ads for Models scenarios.
When shopping_ads_type is LIVE at the ad group level, this field is required and can be set to SHORT_VIDEO_LIVE or DIRECT_LIVE.
When shopping_ads_type is PRODUCT_SHOPPING_ADS at the ad group level, you can omit this field or set it to PSA.
When app_promotion_type is APP_PREREGISTRATION at the campaign level and promotion_website_type is set to TIKTOK_NATIVE_PAGE at the ad group level, you can omit this field or set it to CUSTOM_INSTANT_PAGE.
When objective_type is LEAD_GENERATION and catalog_enabled is true at the campaign level, you can omit this field or set it to AUTO_INVENTORY_INSTANT_PAGE. To learn about Automotive Ads for Inventory and Automotive Ads for Models, see Create Automotive Ads for Inventory and Automotive Ads for Models.

Enum values:
SHORT_VIDEO_LIVE: Short videos that direct traffic to live shopping room.
DIRECT_LIVE: Live shopping room. Each campaign can have only one live shopping room.
PSA: The product visuals will be used as ad creative.
CUSTOM_INSTANT_PAGE: Customized TikTok Instant Page.
AUTO_INVENTORY_INSTANT_PAGE：A video or carousel with an auto-generated Instant Product Page showcasing the inventory of the Auto-Inventory catalog in Automotive Ads for Inventory or the models of the Auto-Model Catalog in the Automotive Ads for Models.

video_view_tracking_url
	
string
	
The monitoring URL for video view.

app_name
Conditional
	
string
	
App name that is displayed in the ad. If not specified, the name in the app store will be used. Number of characters allowed: 1-40. If the name in the app store exceeds 40 characters, you must pass in a new app name with this field.

display_name
Conditional
	
string
	
The display name of landing page or pure exposure ad, length limit: 1-40 English characters, or 1-20 Chinese/Japanese/Korean characters, required when the promotion type is landing page or pure exposure

avatar_icon_web_uri
	
string
	
ID of the avatar image. It can be uploaded through the Upload an image endpoint (picture ratio requirement is 1: 1)

creative_authorized
	
boolean
	
Whether you grant displaying some of your ads in our TikTok For Business Creative Center. Only valid for non-US advertisers, the default value is false.

Note: creative_authorized can only be used for video ads.

schedule_id
	
string
	
Valid only for Reach & Frequency ads.

Schedule ID.

Use this field to associate a schedule ID with the ad you are creating within a Reach & Frequency ad group that has sequenced delivery enabled.

To obtain a schedule ID, call /adgroup/rf/create/ and set delivery_mode to SEQUENCE. After you associate the ad delivery information (schedule_id) with an ad, the value of is_draft will automatically be set to false, and the value of schedule_id will be the ID of the ad that you have associated the ad delivery information with. To confirm that the schedule ID has been successfully associated with the ad, call /adgroup/get/ and check the values for is_draft and schedule_id in the response.
Example
curl --location --request POST 'https://business-api.tiktok.com/open_api/v1.3/ad/create/' \
--header 'Access-Token: {{Access-Token}}' \
--header 'Content-Type: application/json' \
--data '{
    "advertiser_id": "{{advertiser_id}}",
    "adgroup_id": "{{adgroup_id}}",
    "creatives": [{
        "ad_name": "{{ad_name}}",
        "identity_type":"CUSTOMIZED_USER",
        "identity_id":"{{identity_id}}",
        "ad_format": "SINGLE_VIDEO",
        "video_id":"{{video_id}}",
        "image_ids":["{{image_id}}"],
        "ad_text": "{{ad_text}}",
        "call_to_action": "{{call_to_action}}",
        "landing_page_url":"{{landing_page_url}}"
    }]
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
	
The log ID of the request, which uniquely identifies a request.

data
	
object
	
Returned data.

ad_ids
	
string[]
	
Ad IDs.

creatives
	
object[]
	
A List of Ads. The returned fields are generated based on the fields specified in the request parameters. If not specified, all fields are returned by default.

advertiser_id
	
string
	
Advertiser ID.

campaign_id
	
string
	
Campaign ID.

campaign_name
	
string
	
Campaign name.

adgroup_id
	
string
	
Ad group ID.

adgroup_name
	
string
	
Ad group name.

ad_id
	
string
	
Ad ID.

ad_name
	
string
	
Ad name.

create_time
	
string
	
Time at which the ad was created.

modify_time
	
string
	
Time at which the ad was Modified.

identity_id
	
string
	
Identity ID.

identity_type
	
string
	
Identity type. Enum values: CUSTOMIZED_USER, AUTH_CODE, TT_USER, BC_AUTH_TT.

identity_authorized_bc_id
	
string
	
ID of the Business Center that a TikTok Account User in Business Center identity is associated with. Returned when identity_type is BC_AUTH_TT.

catalog_id
	
string
	
The catalog you choose for your ads.

Note: Starting June 30th, 2024, this field will no longer be returned for newly created Shopping Ads where product_source is STORE at the ad group level because the specified catalog_id will be ignored. Existing Shopping Ads where product_source is STORE will not be affected unless you update them. If you update the existing ads, the existing catalog_id, if present for the ad, will no longer be returned.

product_specific_type
	
string
	
Different dimensions to choose products.

Enum values:
ALL: Allow TikTok to dynamically choose from all products.
PRODUCT_SET: Specify a product set. TikTok will dynamically choose products from this set.
CUSTOMIZED_PRODUCTS: Specify a customized number of products.

item_group_ids
	
string[]
	
Product SPU IDs.

product_set_id
	
string
	
The ID of the product set.

sku_ids
	
string[]
	
IDs of the SKUs.

vehicle_ids
	
string[]
	
IDs of vehicles.

showcase_products
	
object[]
	
The list of Showcase products that you use in your ad.

item_group_id
	
string
	
SPU ID of the product.

store_id
	
string
	
The ID of the store that the product (item_group_id) belongs to.

catalog_id
	
string
	
The ID of the catalog that the product (item_group_id) belongs to.

Note: Starting June 30th, 2024, this field will no longer be returned for newly created Shopping Ads where product_source is STORE at the ad group level because the specified catalog_id within the showcase_products object array will be ignored. Existing Shopping Ads where product_source is STORE will not be affected unless you update them. If you update the existing ads, the existing catalog_id within the showcase_products object array, if present for the ad, will no longer be returned.

ad_format
	
string
	
The ad format. Enum values: SINGLE_IMAGE, SINGLE_VIDEO, LIVE_CONTENT, CAROUSEL_ADS (non-VSA Carousel Ads), CATALOG_CAROUSEL(VSA Carousel Ads).

vertical_video_strategy
	
string
	
The video type that you use for Product Sales scenarios.

Enum values: UNSET (unset), SINGLE_VIDEO (single video), CATALOG_VIDEOS (catalog video using video templates), CATALOG_UPLOADED_VIDEOS (catalog video using uploaded videos), LIVE_STREAM (livestream video).

dynamic_format
	
string
	
Dynamic format.

Enum values:
UNSET: Unset.
DYNAMIC_CREATIVE: smart creative. To display different videos, product cards and destinations to each person based on purchase intent, maximizing conversions.

video_id
	
string
	
The video ID.

If the ad is a Spark Ad created by pulling organic videos from linked Business Account, authorized posts, or authorized TikTok accounts in the Business Center, the value of this field will be null. You can get the the ID of a TikTok post via the tiktok_item_id field.

To learn more about Spark Ads, see Create Spark Ads.

image_ids
	
string[]
	
A list of image IDs.

carousel_image_index
	
integer
	
The index that specifies the additional images to be used in the VSA Carousel ad.
The number you set via this field represents the position of the product image within the additional image list (additional_image_urls) for each catalog product.

end_card_cta
	
string
	
Call-to-action for the end card (image_ids) of an Automotive Carousel Ad for Inventory or Automotive Carousel Ad for Models.

Enum values:
SEARCH_INVENTORY (Recommended): Search inventory.
LEARN_MORE: Learn more.
SHOP_NOW: Shop now.
SIGN_UP: Sign up.
CONTACT_US: Contact us.
BOOK_NOW: Book now.
READ_MORE: Read more.
VIEW_MORE: View now.
ORDER_NOW: Order now.

auto_disclaimer_types
	
string[]
	
The type of disclaimer to show in the Automotive Carousel Ads for Models.

Enum values:
EMISSION: Emssion disclaimer.
DISCOUNT: Discount or offer disclaimer.

product_display_field_list
	
string[]
	
A list of product details to display in your Automotive Carousel Ad for Inventory.

Max size: 2.

Enum values:
DEALER_NAME: the dealer_name field of vehicles.
MAKE: the make field of vehicles.
MODEL: the model field of vehicles.
YEAR: the year field of vehicles.
MILEAGE: the mileage field of vehicles.
PRICE: the price field of vehicles.
SALE_PRICE: the sale_price field of vehicles.
EXTERIOR_COLOR: the exterior_color field of vehicles.
TRIM: the trim field of vehicles.
ADDRESS_CITY: the city field of vehicles.
VEHICLE_STATE: the state_of_vehicle field of vehicles.

The title of each vehicle is displayed automatically. For instance, if you set this field to ["MILEAGE","YEAR"], the ad will display the mileage, price and title fields of each vehicle.
To retrieve the product detail fields of your vehicles in an Auto-Inventory catalog and check whether you need to update the details, use /catalog/product/get/.

music_id
	
string
	
The ID of the piece of music that is used in the TikTok Carousel Ad.

tiktok_item_id
	
string
	
The ID of the TikTok post that is used as Spark Ad.

To learn more about Spark Ads, see Create Spark Ads.

promotional_music_disabled
	
boolean
	
Whether to disable the promotional use of the music in the Spark Ad post. The default value is true. If you want to allow dueting and stitching for the Spark Ad post, you need to set this field to false. This field is only valid for Spark Ad posts.

item_duet_status
	
string
	
Whether to enable dueting for the Spark Ad post. This field is valid only when promotional_music_disabled is set to false. Enum values: ENABLE, DISABLE. This field is only valid for Spark Ad posts.

item_stitch_status
	
string
	
Whether to enable stitching for the Spark Ad post. This field is valid only when promotional_music_disabled is set to false. Enum values: ENABLE, DISABLE. This field is only valid for Spark Ad posts.

dark_post_status
	
string
	
Indicates whether the ad is a Spark Ads dark post. Value can be ON or OFF.

branded_content_disabled
	
boolean
	
Default is false. If branded_content_disabled is true, you cannot modify dark_post_status.

shopping_ads_video_package_id
	
string
	
Catalog video template ID.
Return when the corresponding campaign objective_type is PRODUCT_SALES.

ad_text
	
string
	
The ad text. It is shown to your audience as part of your ad creative, to deliver the message you intend to communicate to them.

ad_texts
	
string
	
A list of ad texts.

call_to_action
	
string
	
For call-to-action text, see Enumeration - Call-to-action.

call_to_action_id
	
string
	
The ID of the CTA portfolio that you want to use in your ads.

card_id
	
string
	
Creative portfolio ID.

landing_page_url
	
string
	
Landing page URL.

utm_params
	
object[]
	
A list of URL parameters.

key
	
string
	
The URL parameter.

value
	
string
	
The value of the URL parameter.

page_id
	
number
	
Page ID.

cpp_url
	
string
	
The Custom Product Page (CPP) URL.
CPPs are product pages with customized screenshots, promotional text, and app previews that can be used to highlight specific content or features of the promoted app, or reach specific audiences.

tiktok_page_category
	
string
	
The category of the TikTok page that you want to promote.

Enum values:
PROFILE_PAGE: TikTok account profile page.
OTHER_TIKTOK_PAGE: Other TikTok pages, including Playlist Page, Hashtag Page, Music Page and Branded Effect Page.
TIKTOK_INSTANT_PAGE: Custom TikTok Instant Page.

phone_region_code
	
string
	
Returned only when promotion_type is set to LEAD_GEN_CLICK_TO_CALL at the ad group level.

The region code for the phone number that the audience can click on the ad to call.

phone_region_calling_code
	
string
	
Returned only when promotion_type is set to LEAD_GEN_CLICK_TO_CALL at the ad group level.

The phone number that the audience can click on the ad to call.

phone_number
	
string
	
Returned only when promotion_type is set to LEAD_GEN_CLICK_TO_CALL at the ad group level.

The phone number that the audience can click on the ad to call.

creative_auto_enhancement_strategy_list
	
string[]
	
The list of automatic enhancement strategies to apply to your ads.
The enhancements you specified will be automatically applied in real-time as your campaign is delivered.

Enum values:
VIDEO_QUALITY: Video quality. Improve overall visual quality with increased resolution and clarity.
MUSIC_REFRESH: Music refresh. Stay on-trend by swapping in music currently popular on TikTok.
IMAGE_QUALITY: Image quality. Improve overall visual quality with increased resolution and clarity.
IMAGE_RESIZE: Resize. Resize your image to take advantage of full-screen capabilities.

deeplink
	
string
	
The specific location where you want your audience to go if they have your app installed.

deeplink_type
	
string
	
The deeplink type.

Enum values:
NORMAL: non-deferred deeplink.
DEFERRED_DEEPLINK: deferred deeplink.

deeplink_format_type
	
string
	
The format type of the deeplink.

Enum values:
UNIVERSAL_OR_APP_LINK: Apple’s universal link or Android App Link starting with http:// or https://.
SCHEME_LINK: Custom URL scheme, in the format of scheme://resource. For instance, a Custom URL scheme of WhatsApp should follow the format whatsapp://resource.
NONE: Not a deeplink.

shopping_ads_deeplink_type
	
string
	
The source of the deeplink to be used in the Shopping Ads.

Enum values:
NONE: No deeplink.
CUSTOM: Custom deeplink. Use the deeplink you provided in the ad.
SHOPPING_ADS: Product deeplink. Use the deeplink you've provided for each product in the catalog.

shopping_ads_fallback_type
	
string
	
In the Shopping Ads retargeting scenario, the fallback website type when the deeplink fails to be triggered.

Enum values:
DEFAULT: Unset.
CUSTOM: Custom link. Fall back to the web page link you provide.
SHOPPING_ADS: Product link. Fall back to the web page link you've provided for each product in the catalog.

deeplink_utm_params
	
object[]
	
A list of deeplink URL parameters.

key
	
string
	
The deeplink URL parameter.

value
	
string
	
The value of the deeplink URL parameter.

fallback_type
	
string
	
Fallback Type. If the audience do not have the app installed, you can have them fall back to install the app, or to view a specific web page.

Enum values:
APP_INSTALL: the App Store or Google Play page for the promoted App that is specified through the app_id field at the ad group level.
WEBSITE: the promoted web page that is specified through landing_page_url.
UNSET: Unset.

dynamic_destination
	
string
	
Dynamic destination strategy.
Enum values:
DLP: Dynamic Landing Page. Displaying different destinations including a custom website or Instant Product Page to each person based on their profile, behavior, and intent to maximize ad conversion.
UNSET: Unset.

auto_message_id
	
string
	
The ID of the automatic message to use in a TikTok Direct Messaging Ad.

Currently, the only supported automatic message type is welcome message.

aigc_disclosure_type
	
string
	
Whether to turn on the AIGC (Artificial Intelligence Generated Content) self-disclosure toggle to indicate the ad contains AI-generated content. After the toggle is turned on, your ad will carry an "Advertiser labeled as Al-generated" label when viewed in full.

Enum values:
SELF_DISCLOSURE: To turn on the toggle to declare that the ad contains AI-generated content.
NOT_DECLARED: To not declare that the ad contains AI-generated content.

disclaimer_type
	
string
	
Type of disclaimer in the ad. Enum values: TEXT_LINK(clickable disclaimers), TEXT_ONLY(text-only disclaimers).

disclaimer_text
	
object
	
The text-only disclaimer in the ad.

text
	
string
	
The disclaimer text.

disclaimer_clickable_texts
	
object[]
	
The clickable disclaimer or clickable disclaimers in the ad.

text
	
string
	
The disclaimer text.

url
	
string
	
The URL for the clickable disclaimer. When users tap each text, they will be redirected to the URL and see more disclaimer details.

tracking_pixel_id
	
number
	
The pixel ID that is tracked.

tracking_app_id
	
string
	
The ID of the application that is tracked.

tracking_offline_event_set_ids
	
string[]
	
A list of Offline Event set IDs that are tracked.

tracking_message_event_set_id
	
string
	
The ID of the message event set that is measured in the Instant Messaging Ad.

vast_moat_enabled
	
boolean
	
Whether Moat Viewability Verification is enabled for the ad. TikTok has partnered with Moat to launch viewability measurement for Brand Auction and Reach & Frequency In-feed ads purchased on TikTok for Business. Default value: false.

Note: If you want to enable Moat Viewability Measurement for the ad, we recommend setting viewability_postbid_partner to MOAT instead of using vast_moat_enabled.

viewability_postbid_partner
	
string
	
Post-bid third-party viewability measurement partner. Enum values: UNSET, MOAT, DOUBLE_VERIFY, IAS, ZEFR.

viewability_vast_url
	
string
	
The wrapped VAST URL used by the post-bid third-party partner to measure viewability. The value is null when viewability_postbid_partner is not IAS.

brand_safety_postbid_partner
	
string
	
Post-bid third-party brand safety measurement partner. Enum values: UNSET，DOUBLE_VERIFY, IAS, ZEFR.

brand_safety_vast_url
	
string
	
The wrapped VAST URL used by the post-bid third-party partner to measure brand safety. The value is null when brand_safety_postbid_partner is not IAS.

impression_tracking_url
	
string
	
Default Impression Tracking URL.

click_tracking_url
	
string
	
Click Tracking URL.

playable_url
	
string
	
Playable material URL.

operation_status
	
string
	
Operation status.

Enum values:
ENABLE : The ad is enabled (in 'ON' status).
DISABLE: The ad is disabled (in 'OFF' status).
FROZEN: The ad is terminated and cannot be enabled.

secondary_status
	
string
	
Ad secondary status. See Enumeration - Secondary Status.

creative_type
	
string
	
Creative type for Live Shopping Ads, Product Shopping Ads, App Pre-Registration, Automotive Ads for Inventory, or Automotive Ads for Models scenarios. Enum values:
SHOP_PDP: Shop ads with a single product link.
SHOP_PLP: Shop ads with 6-50 product links.
SHORT_VIDEO_LIVE: Short videos that direct traffic to live shopping room.
DIRECT_LIVE: Live shopping room. Each campaign can have only one live shopping room.
PSA: The product visuals will be used as ad creative.
CUSTOM_INSTANT_PAGE: Customized TikTok Instant Page.
Returned only when app_promotion_type is APP_PREREGISTRATION at the campaign level and promotion_website_type is set to TIKTOK_NATIVE_PAGE at the ad group level.
AUTO_INVENTORY_INSTANT_PAGE：A video or carousel with an auto-generated Instant Product Page showcasing the inventory of the Auto-Inventory catalog in Automotive Ads for Inventory or the models of the Auto-Model Catalog in the Automotive Ads for Models.
Returned only when objective_type is LEAD_GENERATION and catalog_enabled is set to true at the campaign level.

app_name
	
string
	
The display name of app download ad.

display_name
	
string
	
The display name of landing page or pure exposure ad.

profile_image_url
	
string
	
Avatar URL.

creative_authorized
	
boolean
	
Whether you grant displaying some of your ads in our TikTok For Business Creative Center. Only valid for non-US advertisers, the default value is false.

Note: creative_authorized can only be used for video ads.

is_aco
	
boolean
	
Whether the ad is an automated ad. Set to true for automated ad and false for non-automated ad.

is_new_structure
	
boolean
	
Whether the campaign is a new structure (for the same campaign, the structure of campaign, adgroups and ads are the same).

optimization_event
	
string
	
Conversion event for the ad group. See Conversion events for more.

page_info
	
object
	
Pagination information.

page
	
number
	
Current page number.

page_size
	
number
	
Paging size.

total_number
	
number
	
Total number of results.

total_page
	
number
	
Total pages of results.
Example
HTTPS/1.1 200 OK
{
    "code": 0,
    "message": "OK",
    "request_id": "{{request_id}}",
    "data": {
        "ad_ids": [
            "{{ad_id}}"
        ],
        "need_audit": false,
        "creatives": [
            {
                "ad_name": "{{ad_name}}",
                "avatar_icon_web_uri": "{{avatar_icon_web_uri}}",
                "creative_type": null,
                "adgroup_id": "{{adgroup_id}}",
                "campaign_id": "{{campaign_id}}",
                "playable_url": "",
                "operation_status": "ENABLE",
                "brand_safety_vast_url": null,
                "impression_tracking_url": null,
                "viewability_postbid_partner": "UNSET",
                "viewability_vast_url": null,
                "identity_id": "{{identity_id}}",
                "display_name": "{{display_name}}",
                "page_id": null,
                "ad_id": "{{ad_id}}",
                "identity_type": "CUSTOMIZED_USER",
                "landing_page_url": "{{landing_page_url}}",
                "campaign_name": "{{campaign_name}}",
                "landing_page_urls": null,
                "profile_image_url": "{{profile_image_url}}",
                "ad_text": "{{ad_text}}",
                "is_new_structure": true,
                "create_time": "{{create_time}}",
                "call_to_action_id": null,
                "advertiser_id": "{{advertiser_id}}",
                "video_id": "{{video_id}}",
                "adgroup_name": "{{adgroup_name}}",
                "creative_authorized": false,
                "deeplink_type": "NORMAL",
                "tracking_pixel_id": 0,
                "is_aco": false,
                "brand_safety_postbid_partner": "UNSET",
                "image_ids": [
                    "{{image_id}}"
                ],
                "deeplink": "",
                "fallback_type": "UNSET",
                "app_name": "",
                "vast_moat_enabled": false,
                "ad_format": "SINGLE_VIDEO",
                "optimization_event": null,
                "ad_texts": null,
                "click_tracking_url": null,
                "call_to_action": "{{call_to_action}}",
                "card_id": null,
                "modify_time": "{{modify_time}}"
            }
        ]
    }
}

Was the information helpful?
Yes
No