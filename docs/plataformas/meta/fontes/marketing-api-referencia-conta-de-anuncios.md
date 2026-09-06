---
titulo: "Marketing API — referência de Ad Account (campos, limite de gasto, status)"
url: https://developers.facebook.com/docs/graph-api/reference/adaccount/
capturado_em: 2026-09-06
hash: 52bb50bf0bbd15ec
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Graph API
Visão geral
Introdução
Solicitações em lote
Solicitações de depuração
Solução de erros
Field Expansion
Secure Requests
Registro de alterações
Reference
/video
Ad Set
Ad
Ads Archive
Application
Binary Transparency Artifacts
Binary Transparency Proofs
Branded Content Search
CPASAdvertiser Partnership Recommendation
Canvas
Canvas Button
Canvas Carousel
Canvas Footer
Canvas Header
Canvas Photo
Canvas Product List
Canvas Product Set
Canvas Text
Canvas Video
Collaborative Ads Directory
Comentários de objetos
Comment
Conversa
Conversa
Curtidas em objetos
Token de depuração
Documento de grupo
Event
Extended Credit Allocation Config
Games IAPProduct
Group Message
Host de App Link
Image Copyright
Instagram Business Asset
Instagram Oembed
Link
Live Video Input Stream
Mailing Address
Marco
Media Fingerprint
Mensagem
Message Template Library
Messenger Business Template
Object Private Replies
Objeto "sharedposts"
Oembed Page
Oembed Post
Oembed Video
Offline Conversion Data Set Upload
Pagamento
Page
Page Call To Action
Page Post
Page Upcoming Change
Página/informações
Perfil
Photo
Place
Place Topic
Post
Reações de objetos
IGUser
Solicitação
Tag de local
Threat Exchange Impact Report
URL
User
Usuário de teste
Video Copyright
Video List
Video Poll
Video Poll Option
Whats App Business Account
Whats App Message Template
Álbum
Versão Graph API
v26.0
Ad Account

Represents a business, person or other entity who creates and manages ads on Facebook. Multiple people can manage an account, and each person can have one or more levels of access to an account, see Business Manager API.

In response to Apple’s new policy, we are announcing breaking changes that will affect SDKAdNetwork, Marketing API and Ads Insights API endpoints.

To learn more about how Apple’s iOS 14.5 requirements will impact Facebook advertising, visit our Business Help Center aricles and changelog:

Facebook SDK for iOS, App Events API and Mobile Measurement Partners Updates for Apple's iOS 14 Requirements
Facebook Pixel Updates for Apple's iOS 14 Requirements
January 19, 2021 - Breaking Changes

The agency_client_declaration field requires Admin privileges for all operations starting with v10.0 and will be required for all versions on May 25, 2021.

Ad Volume

You can view the volume of ads running or in review for your ad accounts. These ads will count against the ads limit per page that we will enact in early 2021. Query the number of ads running or in review for a given ad account.

Ad Limit Per Page enforcement begins for when a Page reaches its ad limit enforcement date. Enforcement date can be queried here.

When a Page is at its ad limit:

New ads (or ads scheduled to begin at that time) do not publish successfully.
Actions on existing ads are limited to pausing and archiving until the number of ads running or in review is below the ad limit.

To see the ads volume for your ad account:

curl -G 
  -d "access_token=<access_token>" 
  "https://graph.facebook.com/<API_VERSION>/act_<ad_account_ID>/ads_volume"

The response looks like this:

{"data":[{"ads_running_or_in_review_count":2}]}

For information on managing ads volume, see About Managing Ad Volume.

Running Or In Review

To see if an ad is running or in review, we check effective_status, configured_status, and the ad account's status:

If an ad has effective_status of 1 - active, we consider it a running or in review.
If an ad has configured_status of active and effective_status of 9 - pending review, or 17 - pending processing we consider it a running or in review.
The ad can be running or in review only if the ad account status is in 1 - active, 8 - pending settlement, 9 - in grace period.

We also determine if an ad is running or in review based on the ad set's schedule.

If start time is before current time, and current time is before end time, then we consider the ad running or in review.
If start time is before current time and the ad set has no end time, we also consider it running or in review.

For example, if the ad set is scheduled to run in the future, the ads are not running or in review. However if the ad set is scheduled to run from now until three months from now, we consider the ads running or in review.

If you are using special ads scheduling features, such as day-parting, we consider the ad running or in review the whole day, not just for the part of the day when the ad starts running.

Breakdown By Actors

We’ve added the show_breakdown_by_actor parameter to the act_123/ads_volume endpoint so you can query ad volume and ad limits-related information for each page. For more details, see Breakdown by Actors.

Limits
Limit	Value

Maximum number of ad accounts per person

	

25

Maximum number of people with access, per ad account

	

25

Maximum number of ads per regular ad account

	

6,000 non-archived non-deleted ads

Maximum number of ads per bulk ad account

	

50,000 non-archived non-deleted ads

Maximum number of archived ads per ad account

	

100,000 archived ads

Maximum number of ad sets per regular ad account

	

6,000 non-archived non-deleted ad sets

Maximum number of ad sets per bulk ad account

	

10,000 non-archived non-deleted ad sets

Maximum number of archived ad sets per ad account

	

100,000 archived ad sets

Maximum number of ad campaigns per regular ad account

	

6,000 non-archived non-deleted ad campaigns

Maximum number of ad campaigns per bulk ad account

	

10,000 non-archived non-deleted ad campaigns

Maximum number of archived ad campaigns per ad account

	

100,000 archived ad campaigns

Maximum number of images per ad account

	

Unlimited

Leitura

An ad account is an account used for managing ads on Facebook

Digital Services Act Saved Beneficiary/Payor Information
Use the following code examples to download the beneficiary and payor information.

Android SDK
      
GraphRequest request = GraphRequest.newGraphPathRequest(
 accessToken,
 "/act_<AD_ACCOUNT_ID>",
 new GraphRequest.Callback() {
   @Override
   public void onCompleted(GraphResponse response) {
     // Insert your code here
   }
});

Bundle parameters = new Bundle();
parameters.putString("fields", "default_dsa_payor,default_dsa_beneficiary");
request.setParameters(parameters);
request.executeAsync();
iOS SDK
FBSDKGraphRequest *request = [[FBSDKGraphRequest alloc]
    initWithGraphPath:@"/act_<AD_ACCOUNT_ID>"
           parameters:@{ @"fields": @"default_dsa_payor,default_dsa_beneficiary",}
           HTTPMethod:@"GET"];
[request startWithCompletionHandler:^(FBSDKGraphRequestConnection *connection, id result, NSError *error) {
    // Insert your code here
}];
Javascript SDK:
FB.api(
  '/act_<AD_ACCOUNT_ID>',
  'GET',
  {"fields":"default_dsa_payor,default_dsa_beneficiary"},
  function(response) {
      // Insert your code here
  }
);
cURL
curl -X GET \
"https://graph.facebook.com/v26.0/act_<AD_ACCOUNT_ID>?fields=default_dsa_payor%2Cdefault_dsa_beneficiary&access_token=<ACCESS_TOKEN>"
      
The return value is in JSON format. For example:
{"default_dsa_payor":"payor2","default_dsa_beneficiary":"bene2","id":"act_426197654150180"}

Parâmetros
Este ponto de extremidade não tem nenhum parâmetro.
Campos
Campo	Descrição

id
string
	

The string act_{ad_account_id}.

Padrão

account_id
numeric string
	

The ID of the Ad Account.

Padrão

account_status
unsigned int32
	

Status of the account:
1 = ACTIVE
2 = DISABLED
3 = UNSETTLED
7 = PENDING_RISK_REVIEW
8 = PENDING_SETTLEMENT
9 = IN_GRACE_PERIOD
100 = PENDING_CLOSURE
101 = CLOSED
201 = ANY_ACTIVE
202 = ANY_CLOSED

ad_account_promotable_objects
AdAccountPromotableObjects
	

Ad Account creation request purchase order fields associated with this Ad Account.

age
float
	

Amount of time the ad account has been open, in days.

agency_client_declaration
AgencyClientDeclaration
	

Details of the agency advertising on behalf of this client account, if applicable. Requires Business Manager Admin privileges.

amount_spent
numeric string
	

Current amount spent by the account with respect to spend_cap. Or total amount in the absence of spend_cap. See why amount spent is different in ad account spending limit for more info.

attribution_spec
list<AttributionSpec>
	

Deprecated due to iOS 14 changes. Please visit the changelog for more information.

balance
numeric string
	

Bill amount due for this Ad Account.

brand_safety_content_filter_levels
list<string>
	

Brand safety content filter levels set for in-content ads (Facebook in-stream videos and Ads on Facebook Reels) and Audience Network along with feed ads (Facebook Feed, Instagram feed, Facebook Reels feed and Instagram Reels feed) if applicable.

Refer to Placement Targeting for a list of supported values.

business
Business
	

The Business Manager, if this ad account is owned by one

business_city
string
	

City for business address

business_country_code
string
	

Country code for the business address

business_name
string
	

The business name for the account

business_state
string
	

State abbreviation for business address

business_street
string
	

First line of the business street address for the account

business_street2
string
	

Second line of the business street address for the account

business_zip
string
	

Zip code for business address

can_create_brand_lift_study
bool
	

If we can create a new automated brand lift study under the Ad Account.

capabilities
list<string>
	

List of capabilities an Ad Account can have. See capabilities

created_time
datetime
	

The time the account was created in ISO 8601 format.

currency
string
	

The currency used for the account, based on the corresponding value in the account settings. See supported currencies

default_dsa_beneficiary
string
	

This is the default value for creating L2 object of dsa_beneficiary

default_dsa_payor
string
	

This is the default value for creating L2 object of dsa_payor

direct_deals_tos_accepted
bool
	

Whether DirectDeals ToS are accepted.

disable_reason
unsigned int32
	

The reason why the account was disabled. Possible reasons are:
0 = NONE
1 = ADS_INTEGRITY_POLICY
2 = ADS_IP_REVIEW
3 = RISK_PAYMENT
4 = GRAY_ACCOUNT_SHUT_DOWN
5 = ADS_AFC_REVIEW
6 = BUSINESS_INTEGRITY_RAR
7 = PERMANENT_CLOSE
8 = UNUSED_RESELLER_ACCOUNT
9 = UNUSED_ACCOUNT
10 = UMBRELLA_AD_ACCOUNT
11 = BUSINESS_MANAGER_INTEGRITY_POLICY
12 = MISREPRESENTED_AD_ACCOUNT
13 = AOAB_DESHARE_LEGAL_ENTITY
14 = CTX_THREAD_REVIEW
15 = COMPROMISED_AD_ACCOUNT

end_advertiser
numeric string
	

The entity the ads will target. Must be a Facebook Page Alias, Facebook Page ID or an Facebook App ID.

end_advertiser_name
string
	

The name of the entity the ads will target.

existing_customers
list<string>
	

The custom audience ids that are used by advertisers to define their existing customers. This definition is primarily used by Automated Shopping Ads.

expired_funding_source_details
FundingSourceDetails
	

ID = ID of the payment method
COUPON = Details of the Facebook Ads Coupon from the payment method
COUPONS = List of active Facebook Ads Coupon from the ad account
COUPON_ID = ID of the Facebook Ads Coupon
AMOUNT = Amount of Facebook Ads Coupon
CURRENCY = Currency of the Facebook Ads Coupon
DISPLAY_AMOUNT = How the amount of Facebook Ads Coupon is displayed
EXPIRATION = When the coupon expired
START_DATE = When the coupon started
DISPLAY_STRING = How the payment method is shown
CAMPAIGN_IDS = List of campaigns the coupon can be applied to, empty if the coupon is applied on the ad account level.
ORIGINAL_AMOUNT = Amount of Facebook Ads Coupon When Issued
ORIGINAL_DISPLAY_AMOUNT = How the Facebook Ads Coupon displayed When Issued
TYPE = Type of the funding source
0 = UNSET
1 = CREDIT_CARD
2 = FACEBOOK_WALLET
3 = FACEBOOK_PAID_CREDIT
4 = FACEBOOK_EXTENDED_CREDIT
5 = ORDER
6 = INVOICE
7 = FACEBOOK_TOKEN
8 = EXTERNAL_FUNDING
9 = FEE
10 = FX
11 = DISCOUNT
12 = PAYPAL_TOKEN
13 = PAYPAL_BILLING_AGREEMENT
14 = FS_NULL
15 = EXTERNAL_DEPOSIT
16 = TAX
17 = DIRECT_DEBIT
18 = DUMMY
19 = ALTPAY
20 = STORED_BALANCE

To access this field, the user making the API call must have a MANAGE task permission for that specific ad account. See Ad Account, Assigned Users for more information.

extended_credit_invoice_group
ExtendedCreditInvoiceGroup
	

The extended credit invoice group that the ad account belongs to

failed_delivery_checks
list<DeliveryCheck>
	

Failed delivery checks

fb_entity
unsigned int32
	

fb_entity

funding_source
numeric string
	

ID of the payment method. If the account does not have a payment method it will still be possible to create ads but these ads will get no delivery. Not available if the account is disabled

funding_source_details
FundingSourceDetails
	

ID = ID of the payment method
COUPON = Details of the Facebook Ads Coupon from the payment method
COUPONS = List of active Facebook Ads Coupon from the ad account
COUPON_ID = ID of the Facebook Ads Coupon
AMOUNT = Amount of Facebook Ads Coupon
CURRENCY = Currency of the Facebook Ads Coupon
DISPLAY_AMOUNT = How the amount of Facebook Ads Coupon is displayed
EXPIRATION = When the coupon will expire
START_DATE = When the coupon starts
DISPLAY_STRING = How the payment method is shown
CAMPAIGN_IDS = List of campaigns the coupon can be applied to, empty if the coupon is applied on the ad account level.
ORIGINAL_AMOUNT = Amount of Facebook Ads Coupon When Issued
ORIGINAL_DISPLAY_AMOUNT = How the Facebook Ads Coupon displayed When Issued
TYPE = Type of the funding source
0 = UNSET
1 = CREDIT_CARD
2 = FACEBOOK_WALLET
3 = FACEBOOK_PAID_CREDIT
4 = FACEBOOK_EXTENDED_CREDIT
5 = ORDER
6 = INVOICE
7 = FACEBOOK_TOKEN
8 = EXTERNAL_FUNDING
9 = FEE
10 = FX
11 = DISCOUNT
12 = PAYPAL_TOKEN
13 = PAYPAL_BILLING_AGREEMENT
14 = FS_NULL
15 = EXTERNAL_DEPOSIT
16 = TAX
17 = DIRECT_DEBIT
18 = DUMMY
19 = ALTPAY
20 = STORED_BALANCE

To access this field, the user making the API call must have a MANAGE task permission for that specific ad account. See Ad Account, Assigned Users for more information.

has_migrated_permissions
bool
	

Whether this account has migrated permissions

has_page_authorized_adaccount
bool
	

Indicates whether a Facebook page has authorized this ad account to place ads with political content. If you try to place an ad with political content using this ad account for this page, and this page has not authorized this ad account for ads with political content, your ad will be disapproved. See Breaking Changes, Marketing API, Ads with Political Content and Facebook Advertising Policies

io_number
numeric string
	

The Insertion Order (IO) number.

is_attribution_spec_system_default
bool
	

If the attribution specification of ad account is generated from system default values

is_direct_deals_enabled
bool
	

Whether the account is enabled to run Direct Deals

is_in_3ds_authorization_enabled_market
bool
	

If the account is in a market requiring to go through payment process going through 3DS authorization

is_notifications_enabled
bool
	

Get the notifications status of the user for this ad account. This will return true or false depending if notifications are enabled or not

is_personal
unsigned int32
	

Indicates if this ad account is being used for private, non-business purposes. This affects how value-added tax (VAT) is assessed. Note: This is not related to whether an ad account is attached to a business.

is_prepay_account
bool
	

If this ad account is a prepay. Other option would be a postpay account.

To access this field, the user making the API call must have a ADVERTISE or MANAGE task permission for that specific ad account. See Ad Account, Assigned Users for more information.

is_tax_id_required
bool
	

If tax id for this ad account is required or not.

To access this field, the user making the API call must have a ADVERTISE or MANAGE task permission for that specific ad account. See Ad Account, Assigned Users for more information.

line_numbers
list<integer>
	

The line numbers

media_agency
numeric string
	

The agency, this could be your own business. Must be a Facebook Page Alias, Facebook Page ID or an Facebook App ID. In absence of one, you can use NONE or UNFOUND.

min_campaign_group_spend_cap
numeric string
	

The minimum required spend cap of Ad Campaign.

min_daily_budget
unsigned int32
	

The minimum daily budget for this Ad Account

name
string
	

Name of the account. If not set, the name of the first admin visible to the user will be returned.

offsite_clo_signal_status
int32
	

offsite_clo_signal_status

offsite_pixels_tos_accepted
bool
	

Indicates whether the offsite pixel Terms Of Service contract was signed. This feature can be accessible before v2.9

opportunity_score
float
	

On a 0-100 point scale, this score represents how optimized the ad account's campaigns, ad sets and ads are overall.

See Opportunity Score to learn more.

opportunity_score_weight
integer
	

This opportunity score weight represent the remaining budget for the ad account in cents, computed daily. This can be used with other ad accounts within the same business to compute the weighted opportunity score for a business.

See Opportunity Score to learn more about opportunity score.

owner
numeric string
	

The ID of the account owner

partner
numeric string
	

This could be Facebook Marketing Partner, if there is one. Must be a Facebook Page Alias, Facebook Page ID or an Facebook App ID. In absence of one, you can use NONE or UNFOUND.

rf_spec
ReachFrequencySpec
	

Reach and Frequency limits configuration. See Reach and Frequency

show_checkout_experience
bool
	

Whether or not to show the pre-paid checkout experience to an advertiser. If true, the advertiser is eligible for checkout, or they are already locked in to checkout and haven't graduated to postpay.

spend_cap
numeric string
	

The maximum amount that can be spent by this Ad Account. When the amount is reached, all delivery stops. A value of 0 means no spending-cap. Setting a new spend cap only applies to spend AFTER the time at which you set it. Value specified in basic unit of the currency, for example 'cents' for USD.

tax_id
string
	

Tax ID

tax_id_status
unsigned int32
	

VAT status code for the account.
0: Unknown
1: VAT not required- US/CA
2: VAT information required
3: VAT information submitted
4: Offline VAT validation failed
5: Account is a personal account

tax_id_type
string
	

Type of Tax ID

timezone_id
unsigned int32
	

The timezone ID of this ad account

timezone_name
string
	

Name for the time zone

timezone_offset_hours_utc
float
	

Time zone difference from UTC (Coordinated Universal Time).

tos_accepted
map<string, int32>
	

Checks if this specific ad account has signed the Terms of Service contracts. Returns 1, if terms were accepted.

user_tasks
list<string>
	

user_tasks

user_tos_accepted
map<string, int32>
	

Checks if a user has signed the Terms of Service contracts related to the Business that contains a specific ad account. Must include user's access token to get information. This verification is not valid for system users.

Bordas
Borda	Descrição

account_controls
Edge<AdAccountBusinessConstraints>
	

Account Controls is for Advantage+ shopping campaigns where advertisers can set audience controls for minimum age and excluded geo location.

activities
Edge<AdActivity>
	

The activities of this ad account

adcreatives
Edge<AdCreative>
	

The ad creatives of this ad account

ads_reporting_mmm_reports
Edge<AdsReportBuilderMMMReport>
	

Marketing mix modeling (MMM) reports generated for this ad account.

ads_reporting_mmm_schedulers
Edge<AdsReportBuilderMMMReportScheduler>
	

Get all MMM report schedulers by this ad account

advertisable_applications
Edge<Application>
	

All advertisable apps associated with this account

advideos
Edge<Video>
	

The videos associated with this account

applications
Edge<Application>
	

Applications connected to the ad accounts

asyncadcreatives
Edge<AdAsyncRequestSet>
	

The async ad creative creation requests associated with this ad account.

broadtargetingcategories
Edge<BroadTargetingCategories>
	

Broad targeting categories (BCTs) can be used for targeting

connected_instagram_accounts
Edge<ShadowIGUser>
	

Instagram accounts connected to the ad account

customaudiences
Edge<CustomAudience>
	

The custom audiences owned by/shared with this ad account

customaudiencestos
Edge<CustomAudiencesTOS>
	

The custom audiences term of services available to the ad account

customconversions
Edge<CustomConversion>
	

The custom conversions owned by/shared with this ad account

delivery_estimate
Edge<AdAccountDeliveryEstimate>
	

The delivery estimate for a given ad set configuration for this ad account

deprecatedtargetingadsets
Edge<AdCampaign>
	

Ad sets with deprecating targeting options for this ad account

dsa_recommendations
Edge<AdAccountDsaRecommendations>
	

dsa_recommendations

generatepreviews
Edge<AdPreview>
	

Generate previews for a creative specification

impacting_ad_studies
Edge<AdStudy>
	

The ad studies that contain this ad account or any of its descendant ad objects

instagram_accounts
Edge<ShadowIGUser>
	

Instagram accounts connected to the ad accounts

mcmeconversions
Edge<AdsMcmeConversion>
	

mcmeconversions

minimum_budgets
Edge<MinimumBudget>
	

Returns minimum daily budget values by currency

promote_pages
Edge<Page>
	

All pages that have been promoted under the ad account

reachestimate
Edge<AdAccountReachEstimate>
	

The reach estimate of a given targeting spec for this ad account

saved_audiences
Edge<SavedAudience>
	

Saved audiences in the account

targetingbrowse
Edge<AdAccountTargetingUnified>
	

Unified browse

targetingsearch
Edge<AdAccountTargetingUnified>
	

Unified search

targetingsuggestions
Edge<AdAccountTargetingUnified>
	

Unified suggestions

targetingvalidation
Edge<AdAccountTargetingUnified>
	

Unified validation

tracking
Edge<AdAccountTrackingData>
	

List of tracking specs for this Ad Account

Error Codes
Erro	Descrição
200	Permissions error
613	Calls to this api have exceeded the rate limit.
100	Invalid parameter
190	Invalid OAuth 2.0 Access Token
80004	There have been too many calls to this ad-account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting#ads-management.
3018	The start date of the time range cannot be beyond 37 months from the current date
2500	Error parsing graph query
1150	An unknown error occurred.
2635	You are calling a deprecated version of the Ads API. Please update to the latest version.
368	The action attempted has been deemed abusive or is otherwise disallowed
Criando

To create a new ad account for your business you must specify name, currency, timezone_id, end_advertiser, media_agency, and partner. Provide end_advertiser, media_agency, and partner:

They must be Facebook Page Aliases, Facebook Page ID or an Facebook app ID. For example, to provide your company as an end advertiser you specify my company or 20531316728.

The End Advertiser ID is the Facebook primary Page ID or Facebook app ID. Further reference to this field (for formatting and acceptable values) may be found here.

If your ad account has no End Advertiser, Media Agency, or Partner, specify NONE.

If your ad account has an End Advertiser, Media Agency, or Partner, that are not represented on Facebook by Page or app, specify UNFOUND.

Once you set end_advertiser to a value other than NONE or UNFOUND you cannot change it.

Create an ad account:

curl \
-F "name=MyAdAccount" \
-F "currency=USD" \
-F "timezone_id=1" \
-F "end_advertiser=<END_ADVERTISER_ID>" \
-F "media_agency=<MEDIA_AGENCY_ID>" \
-F "partner=NONE" \
-F "access_token=<ACCESS_TOKEN>" \
"https://graph.facebook.com/<API_VERSION>/<BUSINESS_ID>/adaccount"

If you have an extended credity line with Facebook, you can set invoice to true and we associate your new ad account to this credit line.

The response:

{
  "id": "act_<ADACCOUNT_ID>",
  "account_id": "<ADACCOUNT_ID>",
  "business_id": "<BUSINESS_ID>",
  "end_advertiser_id": "<END_ADVERTISER_ID>",
  "media_agency_id": "<MEDIA_AGENCY_ID>",
  "partner_id": "NONE"
}

You can make a POST request to product_audiences edge from the following paths:
/act_{ad_account_id}/product_audiences
When posting to this edge, an AdAccount will be created.
Exemplo
HTTPPHP SDKJavaScript SDKAndroid SDKiOS SDKcURLGraph API Explorer
POST /v26.0/act_<AD_ACCOUNT_ID>/product_audiences HTTP/1.1
Host: graph.facebook.com

name=Test+Iphone+Product+Audience&product_set_id=%3CPRODUCT_SET_ID%3E&inclusions=%5B%7B%22retention_seconds%22%3A86400%2C%22rule%22%3A%7B%22and%22%3A%5B%7B%22event%22%3A%7B%22eq%22%3A%22AddToCart%22%7D%7D%2C%7B%22userAgent%22%3A%7B%22i_contains%22%3A%22iPhone%22%7D%7D%5D%7D%7D%5D&exclusions=%5B%7B%22retention_seconds%22%3A172800%2C%22rule%22%3A%7B%22event%22%3A%7B%22eq%22%3A%22Purchase%22%7D%7D%7D%5D
Se quiser saber como usar a Graph API, leia nosso guia sobre Como usar a Graph API.
Parâmetros
Parâmetro	Descrição

associated_audience_id
int64
	

SELF_EXPLANATORY

creation_params
dictionary { string : <string> }
	

SELF_EXPLANATORY

description
string
	

SELF_EXPLANATORY

enable_fetch_or_create
boolean
	

enable_fetch_or_create

event_sources
array<JSON object>
	

event_sources

exclusions
list<Object>
	

SELF_EXPLANATORY

inclusions
list<Object>
	

SELF_EXPLANATORY

name
string
	

SELF_EXPLANATORY

Obrigatório

opt_out_link
string
	

SELF_EXPLANATORY

parent_audience_id
int64
	

SELF_EXPLANATORY

product_set_id
numeric string or integer
	

SELF_EXPLANATORY

Obrigatório

subtype
enum {CUSTOM, PRIMARY, WEBSITE, APP, OFFLINE_CONVERSION, CLAIM, MANAGED, PARTNER, VIDEO, LOOKALIKE, ENGAGEMENT, BAG_OF_ACCOUNTS, STUDY_RULE_AUDIENCE, FOX, MEASUREMENT, REGULATED_CATEGORIES_AUDIENCE, BIDDING, EXCLUSION, MESSENGER_SUBSCRIBER_LIST}
	

SELF_EXPLANATORY

Return Type
This endpoint supports read-after-write and will read the node represented by id in the return type.
Struct {
id: numeric string,
message: string,
}
Error Codes
Erro	Descrição
100	Invalid parameter
2654	Failed to create custom audience
You can make a POST request to ad_accounts edge from the following paths:
/{custom_audience_id}/ad_accounts
When posting to this edge, an AdAccount will be created.
Parâmetros
Parâmetro	Descrição

adaccounts
list<numeric string>
	

Array of new ad account IDs to receive access to the custom audience

permissions
string
	

targeting or targeting_and_insights. If targeting the recipient ad account can target the audience in ads. targeting_and_insights also allows recipient account to view the audience in Audience Insights tool

relationship_type
array<string>
	

relationship_type

replace
boolean
	

true or false. If true the list of adaccounts provided in the call will replace the existing set of ad accounts this audience is shared with.

Return Type
This endpoint supports read-after-write and will read the node to which you POSTed.
Struct {
success: bool,
sharing_data: List [
Struct {
ad_acct_id: string,
business_id: numeric string,
audience_share_status: string,
errors: List [
string
],
}
],
}
Error Codes
Erro	Descrição
200	Permissions error
You can make a POST request to adaccount edge from the following paths:
/{business_id}/adaccount
When posting to this edge, an AdAccount will be created.
Parâmetros
Parâmetro	Descrição

ad_account_created_from_bm_flag
boolean
	

ad_account_created_from_bm_flag

currency
ISO 4217 Currency Code
	

The currency used for the account

Obrigatório

end_advertiser
	

The entity the ads will target. Must be a Facebook Page Alias, Facebook Page ID or an Facebook App ID. In absence of one, you can use NONE or UNFOUND. Note that once a value other than NONE or UNFOUND is set, it cannot be modified any more.

Obrigatório

funding_id
numeric string or integer
	

ID of the payment method. If the account does not have a payment method it will still be possible to create ads but these ads will get no delivery.

invoice
boolean
	

If business manager has Business Manager Owned Normal Credit Line on file on the FB CRM, it will attach the ad account to that credit line.

invoice_group_id
numeric string
	

The ID of the invoice group this adaccount should be enrolled in

invoicing_emails
array<string>
	

Emails addressed where invoices will be sent.

io
boolean
	

If corporate channel is direct sales.

media_agency
string
	

The agency, this could be your own business. Must be a Facebook Page Alias, Facebook Page ID or an Facebook App ID. In absence of one, you can use NONE or UNFOUND

Obrigatório

name
string
	

The name of the ad account

Obrigatório

partner
string
	

The advertising partner for this account, if there is one. Must be a Facebook Page Alias, Facebook Page ID or an Facebook App ID. In absence of one, you can use NONE or UNFOUND.

Obrigatório

po_number
string
	

Purchase order number

timezone_id
unsigned int32
	

ID for the timezone. See here.

Obrigatório
Return Type
This endpoint supports read-after-write and will read the node represented by id in the return type.
Struct {
id: token with structure: AdAccount ID,
account_id: numeric string,
business_id: numeric string,
end_advertiser_id: string,
media_agency_id: string,
partner_id: string,
seer_ad_account_restricted_by_soft_desc_challenge: bool,
soft_desc_challenge_credential_id: string,
soft_desc_challenge_localized_auth_amount: int32,
}
Error Codes
Erro	Descrição
100	Invalid parameter
3979	You have exceeded the number of allowed ad accounts for your Business Manager at this time.
3980	One or more of the ad accounts in your Business Manager are currently in bad standing or in review. All of your accounts must be in good standing in order to create new ad accounts.
415	Two factor authentication required. User have to enter a code from SMS or TOTP code generator to pass 2fac. This could happen when accessing a 2fac-protected asset like a page that is owned by a 2fac-protected business manager.
3902	There was a technical issue and your new ad account wasn't created. Please try again.
457	The session has an invalid origin
190	Invalid OAuth 2.0 Access Token
23007	This credit card can't be set as your account's primary payment method, because your account is set up to be billed after your ads have delivered. This setup can't be changed. Please try a different card or payment method.
You can make a POST request to owned_ad_accounts edge from the following paths:
/{business_id}/owned_ad_accounts
When posting to this edge, an AdAccount will be created.
Parâmetros
Parâmetro	Descrição

adaccount_id
string
	

Ad account ID.

Obrigatório
Return Type
This endpoint supports read-after-write and will read the node to which you POSTed.
Struct {
access_status: string,
}
Error Codes
Erro	Descrição
3979	You have exceeded the number of allowed ad accounts for your Business Manager at this time.
3994	Personal accounts that do not have any history of activity are not eligible for migration to a business manager. Instead create an ad account inside your business manager.
100	Invalid parameter
3980	One or more of the ad accounts in your Business Manager are currently in bad standing or in review. All of your accounts must be in good standing in order to create new ad accounts.
415	Two factor authentication required. User have to enter a code from SMS or TOTP code generator to pass 2fac. This could happen when accessing a 2fac-protected asset like a page that is owned by a 2fac-protected business manager.
3936	You've already tried to claim this ad account. You'll see a notification if your request is accepted.
368	The action attempted has been deemed abusive or is otherwise disallowed
3944	Your Business Manager already has access to this object.
Atualizando

Notice:

The default_dsa_payor and default_dsa_beneficiary values can be set to both of them or none of them. The API does not allow only one of them to exist in the data storage.
To unset the values: pass two empty strings at the same time, the values will be unset in the data storage. It does not allow you to unset only one of them.
You can update an AdAccount by making a POST request to /act_{ad_account_id}.
Parâmetros
Parâmetro	Descrição

agency_client_declaration
dictionary { string : <string> }
	

Details of the agency advertising on behalf of this client account, if applicable. Requires Business Manager Admin privileges.

attribution_spec
list<Object>
	

Deprecated due to iOS 14 changes. Please visit the changelog for more information.

business_info
dictionary { string : <string> }
	

Business Info

custom_audience_info
JSON object
	

Custom audience info for Automated Shopping Ads.

default_dsa_beneficiary
string
	

This is the default value for creating L2 targeting EU's beneficiary.

default_dsa_payor
string
	

This is the default value for creating L2 targeting EU's payor.

end_advertiser
string
	

The entity the ads will target. Must be a Facebook Page Alias, Facebook Page ID or an Facebook App ID.

is_notifications_enabled
boolean
	

If notifications are enabled or not for this account

media_agency
string
	

The ID of a Facebook Page or Facebook App. Once it is set to any values other than NONE or UNFOUND, it cannot be modified any more

name
string
	

The name of the ad account

partner
string
	

The ID of a Facebook Page or Facebook App. Once it is set to any values other than NONE or UNFOUND, it cannot be modified any more

spend_cap
float
	

The total amount that this account can spend, after which all campaigns will be paused, based on amount_spent. A value of 0 signifies no spending-cap and setting a new spend cap only applies to spend AFTER the time at which you set it. Value specified in standard denomination of the currency, e.g. 23.50 for USD $23.50.

spend_cap_action
string
	

Setting this parameter to reset sets the amount_spent back to 0. Setting it to delete removes the spend_cap from the account.

Return Type
This endpoint supports read-after-write and will read the node to which you POSTed.
Struct {
success: bool,
}
Error Codes
Erro	Descrição
100	Invalid parameter
200	Permissions error
368	The action attempted has been deemed abusive or is otherwise disallowed
190	Invalid OAuth 2.0 Access Token
80004	There have been too many calls to this ad-account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting#ads-management.
You can update an AdAccount by making a POST request to /act_{ad_account_id}/assigned_users.
Parâmetros
Parâmetro	Descrição

tasks
array<enum {MANAGE, ADVERTISE, ANALYZE, DRAFT, AA_ANALYZE}>
	

AdAccount permission tasks to assign this user

user
UID
	

Business user id or system user id

Obrigatório
Return Type
This endpoint supports read-after-write and will read the node to which you POSTed.
Struct {
success: bool,
}
Error Codes
Erro	Descrição
100	Invalid parameter
200	Permissions error
2620	Invalid call to update account permissions
Excluindo
You can dissociate an AdAccount from an AdsPixel by making a DELETE request to /{ads_pixel_id}/shared_accounts.
Parâmetros
Parâmetro	Descrição

account_id
numeric string
	

SELF_EXPLANATORY

Obrigatório

business
numeric string or integer
	

SELF_EXPLANATORY

Obrigatório
Return Type
Struct {
success: bool,
}
Error Codes
Erro	Descrição
100	Invalid parameter
You can dissociate an AdAccount from a CustomAudience by making a DELETE request to /{custom_audience_id}/ad_accounts.
Parâmetros
Parâmetro	Descrição

adaccounts
list<numeric string>
	

Array of ad account IDs to revoke access to the custom audience

Return Type
Struct {
success: bool,
}
Error Codes
Erro	Descrição
100	Invalid parameter
Nesta Página
Ad Account
Ad Volume
Running Or In Review
Breakdown By Actors
Limits
Leitura
Digital Services Act Saved Beneficiary/Payor Information
Parâmetros
Campos
Bordas
Error Codes
Criando
Exemplo
Parâmetros
Return Type
Error Codes
Atualizando
Parâmetros
Return Type
Error Codes
Excluindo
Parâmetros
Return Type
Error Codes