---
titulo: "Marketing API — /report/integrated/get/ (relatórios: dimensões, métricas, filtros)"
url: https://business-api.tiktok.com/portal/docs?id=1740302848100353
capturado_em: 2026-09-09
hash: d66e58caadeb55c2
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
Run a synchronous report
Create an asynchronous report task
Get the status of an async report task
Download the output of an async report task
Cancel an asynchronous report task
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
Comparing v1.2 and v1.3
Request
Example
Retrieving the ad (asset group) level data of an Upgraded Smart+ Ad Group through a basic report
Retrieving the creative level data of an Upgraded Smart+ Ad Group through a basic report
Filtering by Upgraded Smart+ Ad (Asset Group) IDs through ad_id_v2
Response
Example
Retrieving the ad (asset group) level data of Upgraded Smart+ Ads in a basic report
Retrieving the creative level data of Upgraded Smart+ Ads in a basic report
Filtering by Upgraded Smart+ Ad (Asset Group) IDs through ad_id_v2
Run a synchronous report

Use this endpoint to create a synchronous report task.

This endpoint can currently return the reporting data of up to 20,000 advertisements. If your number of advertisements exceeds 20,000, please use campaign_ids / adgroup_ids / ad_ids as a filter to obtain the reporting data of all advertisements in batches. If you use campaign_ids / adgroup_ids / ad_ids as a filter, you can pass in up to 100 IDs at a time.

To learn about how to run a synchronous report, see Run a synchronous report.
To find out the supported dimensions, metrics, and use cases for different report types, see Report types.
To learn about the relationship between advertising service type, report type and report data level, see Overview-Data level.
To find out answers to common questions regarding reporting, see FAQ.

Important
If you want to retrieve the reporting data of GMV Max Campaigns, run GMV Max Campaign reports for your Product GMV Max Campaigns or Live GMV Max Campaigns using /gmv_max/report/get/ instead.

Note
If you compare the synchronous report with a report downloaded from TTAM (TikTok Ads Manager）, you will discover data inconsistency because the downloaded report should be compared with its counterpart, an asynchronous report, rather than a synchronous report. Both the TTAM downloaded report and the API asynchronous report do not implement the 20,000-truncation for ads.

Comparing v1.2 and v1.3

The following table outlines the differences between v1.2 and v1.3 endpoints.

Changes	v1.2	v1.3

Endpoint path
	
/v1.2/reports/integrated/get/
	
/v1.3/report/integrated/get/

Request parameter name
	
filters
	
filtering

Request parameter data type
	
advertiser_id: number
	
advertiser_id: string

Request parameter deprecated in v1.3
	
/
	
lifetime(replaced by the new request parameter query_lifetime)

New request parameter
	
/
	
query_lifetime
bc_id
enable_total_metrics
advertiser_ids

Response parameter data type
	
advertiser_id: number
campaign_id: number
adgroup_id: number
ad_id: number
	
advertiser_id: string
campaign_id: string
adgroup_id: string
ad_id: string

New response parameter
	
/
	
X-Tt-Ads-Throttle: string
contextual_tag: string

Dimensions
	
/
	
See the corresponding articles under Report types to find out the dimension changes in each report type.

Metrics
	
/
	
See the corresponding articles under Report types to find out the metric changes in each report type.
Request

Endpoint https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/

Method GET

Header

Field	Data Type	Description

Access-Token
Required
	
string
	
Authorized access token. For details, see Authentication.

Parameters

Field	Data Type	Description

advertiser_id
Conditional
	
string
	
You need to pass in either advertiser_id/advertiser_ids or bc_id.
When report_type is set to BASIC or AUDIENCE, pass in advertiser_id or advertiser_ids. If you pass in both advertiser_id and advertiser_ids, advertiser_id will be ignored.
When report_type is set to PLAYABLE_MATERIAL, CATALOG, or TT_SHOP, pass in advertiser_id.
When report_type is set to BC, pass in bc_id.

Advertiser ID.

advertiser_ids
conditional
	
string[]
	
When report_type is set to BASIC or AUDIENCE, you need to pass in either advertiser_id or advertiser_ids. If you pass in both advertiser_id and advertiser_ids, advertiser_id will be ignored.
Valid when report_type is BASIC or AUDIENCE.

A list of advertiser IDs.
Max size: 5.

Please be aware of the following information when working with this field:
When advertiser_ids is used, we will return up to 20,000 IDs in response. The cutoff logic for IDs is based on the creation time of campaigns, ad groups, or ads in descending order, but we cannot guarantee that each advertiser will have an evenly distributed number of IDs.
When advertiser_ids is used, the returned metrics data in the response will include currency, timezone, and advertiser_id.
Different advertisers might have different time zones. You can use multi_adv_report_in_utc_time to determine whether the data returned should be set to the UTC+0 timezone for all advertisers or set to the local timezone for each respective advertiser.
Different advertisers might have different currencies, and we will return the corresponding currency for each advertiser in the returned metrics. These metric data will be presented without a decimal point. For instance, a spend of "100 USD" will be displayed as 100 without any decimal indicator such as ".000".
If you want to view the total added-up metrics for all advertiser IDs, enable enable_total_metrics in your request. The returned total_metrics in the response will include currency, timezone, and advertiser_id, but all with a value of -.

Note:

If you use advertiser_ids but do not include any ID dimensions in the dimensions field, we will return 0 as the value for currency, timezone, and advertiser_id and - as the value of cost-related metrics, such as spend, in the metrics object of the response.
The advertisers specified in advertiser_ids should all belong to the same TikTok for Business user. Otherwise, an error will occur. Use /oauth2/advertiser/get/ to retrieve a list of advertiser IDs that belong to the same TikTok for Business user.

bc_id
Conditional
	
string
	
You need to pass in either advertiser_id/advertiser_ids or bc_id.
When report_type is set to BASIC or AUDIENCE,, pass in advertiser_idor advertiser_ids.
When report_type is set to PLAYABLE_MATERIAL, CATALOG, or TT_SHOP, pass in advertiser_id.
When report_type is set to BC, pass in bc_id.

ID of a Business Center that you have access to.

To get a list of Business Centers that you have access to, use /bc/get/.

service_type
	
string
	
Not supported when report_type is BC.

Ad service type.

Enum values:
AUCTION: auction ads, or both auction ads and reservation ads.
RESERVATION (deprecated) : reservation ads.

Default value when report_type is not set to BC: AUCTION.

Note: To retrieve the reporting data of TopView ads, use the basic reports or audience reports and specify the value RESERVATION_TOP_VIEW for the buying_type filter.

report_type
Required
	
string
	
Report type.

Enum values:
BASIC: basic report.
AUDIENCE: audience report.
PLAYABLE_MATERIAL: playable ads report.
CATALOG: DSA report.
BC: Business Center report.
TT_SHOP (to-be-deprecated): GMV max ads report.

When service_type is AUCTION, BASIC, AUDIENCE, PLAYABLE_MATERIAL, CATALOG, and TT_SHOP reports are all supported.
When report_type is BC, you don't need to pass service_type.

Important: GMV max ads reports (with report_type as TT_SHOP) only provide limited data and will be deprecated in the next API version. To ensure a smooth integration experience, run GMV Max Campaign reports for your Product GMV Max Campaigns or Live GMV Max Campaigns using /gmv_max/report/get/ instead.

data_level
Conditional
	
string
	
Not supported when report_type is BC.
Required when report_type is BASIC,AUDIENCE or CATALOG.

The data level that you'd like to query in reports.

Enum values:
AUCTION_AD: auction ads or both auction ads and reservation ads, ad level.
AUCTION_ADGROUP: auction ads or both auction ads and reservation ads, ad group level.
AUCTION_CAMPAIGN: auction ads or both auction ads and reservation ads, campaign level.
AUCTION_ADVERTISER: auction ads or both auction ads and reservation ads, advertiser level.
RESERVATION_AD(deprecated): reservation ads, ad level.
RESERVATION_ADGROUP(deprecated): reservation ads, ad group level.
RESERVATION_CAMPAIGN(deprecated): reservation ads, campaign level.
RESERVATION_ADVERTISER(deprecated): reservation ads, advertiser level.

Note:

If you specify this field as AUCTION_ADVERTISER, data of all Auction Ads and Reservation Ads under the advertiser account will be returned.
When report_type is BASIC, AUDIENCE or CATALOG:
If you set this field to AUCTION_CAMPAIGN, the data for all ads under undeleted auction campaigns will be returned, because by default the campaign_status filter is applied and defaults to STATUS_NOT_DELETE.
If you set this field to AUCTION_ADGROUP, the data for all ads under undeleted auction ad groups will be returned, because by default the adgroup_status filter is applied and defaults to STATUS_NOT_DELETE.
If you set this field to AUCTION_AD, only the data for undeleted ads under all auction campaigns will be returned, because by default the ad_status filter is applied and defaults to STATUS_NOT_DELETE.
If you want to get the data for all ads under all auction campaigns, set the ad_status filter to STATUS_ALL (filtering=[{"field_name":"ad_status","filter_type":"IN","filter_value":"[\"STATUS_ALL\"]"}]).
When report_type is TT_SHOP, you can only set this field to AUCTION_ADVERTISER or AUCTION_CAMPAIGN.

dimensions
Required
	
string[]
	
Grouping conditions. For example: ["campaign_id", "stat_time_day"] indicates that both campaign_id and stat_time_day (days) are grouped.

Different report types support different dimensions.
Supported dimensions in basic reports
Supported dimensions in audience reports
Supported dimensions in playable ad reports
Supported dimensions in DSA reports
Supported dimensions in Business Center reports
Supported dimensions in GMV max ads reports

Note:

If report_type is not set to BC:
When dimensions contains stat_time_day, the query time range cannot exceed 30 days.
When dimensions contains stat_time_hour, the query time range cannot exceed 1 day.
If your query dimensions contains more than xx_id and there is no ads reporting within the query time range, an empty list will be returned.

metrics
	
string[]
	
Metrics to query.

Different report types support different metrics. For supported metrics for each report type, see the corresponding articles under Report types.

When report_type is set to BASIC, AUDIENCE, PLAYABLE_MATERIAL, or CATALOG, the default value is ["spend", "impressions"].
When report_type is set to BC, the default value is all the metrics supported by the dimension grouping specified through dimensions.
When report_type is set to TT_SHOP, the default value is ["spend", "billed_cost"].

Note that the amount of currency metrics are based on the currency set by the advertiser's account.

enable_total_metrics
	
boolean
	
Whether to enable the total added-up data for your requested metrics.
When enable_total_metrics is enabled, we will provide the aggregate data for all pages as you query different pages. Under this condition, you only need to specify this field when requesting data for the first page.
Due to the 20,000-truncation limitation, when enable_total_metrics is enabled, we will provide the total added-up data for up to 20,000 IDs.

Note:

It only supports auction basic reports and GMV max ads reports.
It is only valid when one ID dimension and(or) stat_time_day is specified in the dimensions field. Examples: ["campaign_id"], ["campaign_id", "stat_time_day"].
It can not be used in the sandbox environment.

start_date
Conditional
	
string
	
This field is required when query_lifetime is false or not specified.

Query start date (closed interval) in the format of YYYY-MM-DD. The date is based on the ad account time zone.

Note:

When report_type is not set to BC and the value of dimensions does not include stat_time_day, the maximum time range you can specify through start_date and end_date is 365 days.
When report_type is not set to BC and the value of dimensions includes stat_time_day, the maximum time range you can specify through start_date and end_date is 30 days.
When report_type is set to BC, the maximum time range you can specify through start_date and end_date is 365 days.

end_date
Conditional
	
string
	
This field is required when query_lifetime is false or not specified.

Query end date (closed interval) in the format of YYYY-MM-DD. The date is based on the ad account time zone.

Note:

When report_type is not set to BC and the value of dimensions does not include stat_time_day, the maximum time range you can specify through start_date and end_date is 365 days.
When report_type is not set to BC and the value of dimensions includes stat_time_day, the maximum time range you can specify through start_date and end_date is 30 days.
When report_type is set to BC, the maximum time range you can specify through start_date and end_date is 365 days.

query_lifetime
	
boolean
	
Supported when report_type is BASIC or PLAYABLE_MATERIAL.

Whether to request the lifetime metrics. Default value: False. If query_lifetime = True, the start_date and end_date parameters will be ignored. The lifetime metric name is the same as the normal one.

Note:

Breakdown by time or audience is not supported when querying for lifetime metrics.
Breakdown by location code (country_code) is not supported when querying for lifetime metrics.
Audience reports, DSA reports, Business Center reports, and GMV max ads reports do not support lifetime metrics.

multi_adv_report_in_utc_time
	
boolean
	
Supported when you have used advertiser_ids in your request.

Whether to set the returned metrics in the local timezone of each respective advertiser.

Default value: false. If it is set to true, the returned metrics will be set to the UTC+0 timezone for all advertisers.

order_field
	
string
	
Sorting field.

All supported metrics (excluding attribute metrics) support sorting. Not sorting by default.

order_type
	
string
	
Sorting order.

Enum values: ASC, DESC.

Default value: DESC.

filtering
	
object[]
	
Supported when report_type is BASIC, AUDIENCE, PLAYABLE_MATERIAL, CATALOG, or BC.
Not supported when report_type is TT_SHOP.

Filtering conditions.

Supported filtering conditions vary based on service_type and data_level. For filters supported in different report types, refer to the articles under Report types.

Note:

When you pass in filtering, make sure you specify the fields field_name, filter_type, and filter_value at the same time as an object in a list.
If you want to use country_code as your grouping filter, then please specify country_code in the dimensions field of the request. Note that country_code works with basic report (sync and async), audience report (sync and async), playable ad report (sync only), and Business Center report (sync only).

field_name
Conditional
	
string
	
Filter field name.

filter_type
Conditional
	
string
	
Filter type.

Enum values:
IN: Contain any of (exact matching). When you use this filter type, the filtered value must be a valid JSON array character string.
CONTAIN_ANY_OF: Contain any of (fuzzy matching). When you use this filter type, the filtered value must be a valid JSON array character string.
MATCH: Match. This filter type is equivalent to like operations in MySQL and supports fuzzy matching.
NOT_IN: Does not contain any of (exact matching). When you use this filter type, the filtered value must be a valid JSON array character string.
GREATER_EQUAL: Greater than or equal to.
GREATER_THAN: Greater than.
LOWER_EQUAL: Less than or equal to.
LOWER_THAN: Less than.
BETWEEN: Between. When you use this filter type, the filtered value must be a valid JSON array character string containing exactly two string values.

filter_value
Conditional
	
string
	
The value to filter.

When filter_type is IN ,CONTAIN_ANY_OF, or NOT_IN, filter_value must be a valid JSON array character string.

query_mode
to be deprecated
	
string
	
Not supported when report_type is BC.

The way data is queried.

Enum values: REGULAR, CHUNK.

Default value: REGULAR.

With CHUNK mode on, data can be returned much faster in a more stable way. Meanwhile, pagination will not be working with CHUNK.

Note:

CHUNK mode will be deprecated soon. To ensure a smooth integration, we recommend that you do not use this mode.
CHUNK mode is only supported in synchronous basic reports.

page
	
number
	
Current page number.

Default value: 1.

page_size
	
number
	
Pagination size.

Value range: 1-1,000.

Default value: 10.
Example
Retrieving the ad (asset group) level data of an Upgraded Smart+ Ad Group through a basic report
curl --location --request GET 'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?advertiser_id={{advertiser_id}}&report_type=BASIC&dimensions=["ad_id_v2","stat_time_day"]&metrics=["campaign_automation_type","ad_name","ad_id_v2","spend","impressions"]&filtering=[{"field_name":"campaign_automation_type","filter_type":"IN","filter_value":"[\"UPGRADED_SMART_PLUS\"]"},{"field_name":"adgroup_ids","filter_type":"IN","filter_value":"[\"{{adgroup_id}}\"]"}]&data_level=AUCTION_AD&start_date=2025-12-03&end_date=2025-12-03&page=1&page_size=1000' \
--header 'Access-Token: {{Access-Token}}'

Retrieving the creative level data of an Upgraded Smart+ Ad Group through a basic report
curl --location --request GET 'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?advertiser_id={{advertiser_id}}&report_type=BASIC&dimensions=["ad_id","stat_time_day"]&metrics=["campaign_automation_type","ad_name","ad_id","spend","impressions"]&filtering=[{"field_name":"campaign_automation_type","filter_type":"IN","filter_value":"[\"UPGRADED_SMART_PLUS\"]"},{"field_name":"adgroup_ids","filter_type":"IN","filter_value":"[\"{{adgroup_id}}\"]"}]&data_level=AUCTION_AD&start_date=2025-12-03&end_date=2025-12-03&page=1&page_size=1000' \
--header 'Access-Token: {{Access-Token}}' \

Filtering by Upgraded Smart+ Ad (Asset Group) IDs through ad_id_v2
curl --location --request GET 'https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/' \
--header 'Access-Token: "{{Access-Token}}"' \
--header 'Content-Type: application/json' \
--data '{
    "advertiser_id": "{{advertiser_id}}",
    "service_type": "AUCTION",
    "report_type": "BASIC",
    "data_level": "AUCTION_AD",
    "dimensions": [
        "ad_id_v2"
    ],
    "metrics": [
        "spend",
        "ad_id_v2"
    ],
    "filtering": [
        {
            "field_name": "ad_ids_v2",
            "filter_type": "IN",
            "filter_value": "[\"{{ad_id_v2}}\",\"{{ad_id_v2}}\"]"
        }
    ],
    "start_date": "2025-07-01",
    "end_date": "2025-07-30",
    "page": "1",
    "page_size": "1000"
}'

Response

Response Header

Field	Data Type	Description

X-Tt-Ads-Throttle
	
string
	
A warning message to indicate the request's over limit issue.
E. g. When the number of ad ids of queried advertiser account is more than 20,000: X-Tt-Ads-Throttle:"Number of ad ids is equal or more than 20k, only return the top 20k id's results, sorting by create time desc order."

Response Parameters

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
	
Return data.

total_metrics
	
object
	
The total added-up data for your requested metrics. Returned when you enable enable_total_metrics in the request.

campaign_name
	
string
	
Auction Ads Campaign Name / Reservation Ads Group Name. Metrics that cannot be aggregated, such as campaign_name, will be returned as -.

spend
	
string
	
The total added-up data for spend.

impressions
	
string
	
The total added-up data for impressions.

reach
	
string
	
The total added-up data for reach.

{Other metrics}
	
string
	
The total added-up data for other metrics.

list
	
object[]
	
Data list.

dimensions
	
object
	
All requested dimension data.

advertiser_id
	
string
	
Returned when dimensions contains advertiser_id.

Advertiser ID.

campaign_id
	
string
	
Returned when dimensions contains campaign_id.

Campaign ID.

adgroup_id
	
string
	
Returned when dimensions contains adgroup_id.

Ad Group ID.

ad_id
	
string
	
Returned when dimensions contains ad_id.

Ad ID.

The types of data you can get from this metric include:
the ad level data for Manual Ads.
the ad level data for Smart+ Campaigns.
the creative level data for Upgraded Smart+ Ads.

ad_id_v2
	
string
	
Returned when dimensions contains the dimension ad_id_v2.

Ad ID v2.

The types of data you can get from this metric include:
the ad level data for Manual Ads.
the ad level data for Smart+ Campaigns.
the ad level data for Upgraded Smart+ Ads.

stat_time_day
	
string
	
Returned when dimensions contains stat_time_day.

The time (days) when the reporting occurred.

Format: 2020-01-01 00:00:00.

stat_time_hour
	
string
	
Returned when dimensions contains stat_time_hour.

The time (hours) when the reporting occurred.

Format: 2020-01-01 10:00:00.

ac
	
string
	
Returned when dimensions contains ac.

Audience internet connection types. See Enumeration - Connection Type for details.

age
	
string
	
Returned when dimensions contains age.

Audience age group. See Enumeration - Age Group for details.

country_code
	
string
	
Returned when dimensions contains country_code.

Audience country or region code. For enum values, see Appendix - Location code.

interest_category
	
string
	
Returned when dimensions contains interest_category.

Old first-level interest category.

Note: Old first-level interest categories will be deprecated in the next API version.

interest_category_v2
	
string
	
Returned when dimensions contains interest_category.

New first-level interest category.

Use /tool/interest_category/ endpoint to get the complete list of interest categories.

gender
	
string
	
Returned when dimensions contains gender.

Targeting gender. Enum values: FEMALE, MALE, NONE.

language
	
string
	
Returned when dimensions contains language.

Targeting language. See Enumeration - Languages for details.

placement
	
string
	
Returned when dimensions contains placement.

Placement. See Enumeration - Placement for details.

platform
	
string
	
Returned when dimensions contains platform.

Targeting operating system. See Enumeration - Operating System for details.

contextual_tag
	
string
	
dimensions contains contextual_tag.

Contextual tag.

metrics
	
object
	
All requested metric data.

campaign_name
	
string
	
Auction Ads Campaign Name / Reservation Ads Group Name.

spend
	
string
	
Total spend.

impressions
	
string
	
Number of impression.

reach
	
string
	
Number of reach.

{Other metrics}
	
string
	
For metrics supported in different report types, refer to the articles under Report types.

advertiser_id
	
string
	
Returned when you have specified advertiser_ids in your request.

Advertiser ID.

timezone
	
string
	
Returned when you have specified advertiser_ids in your request.

Your advertiser's timezone.

currency
	
string
	
Returned when you have specified advertiser_ids in your request.

Your advertiser's currency.

campaign_automation_type
	
string
	
Returned when metrics contains the campaign_automation_type metric in the request.

Campaign automation type.

Enum values:
MANUAL: Manual Campaigns.
SMART_PLUS: Smart+ Campaigns.
UPGRADED_SMART_PLUS: Upgraded Smart+ Campaigns. To learn more about Upgraded Smart+ Campaigns, see Upgraded Smart+ Campaign.
When campaign_automation_type is UPGRADED_SMART_PLUS, the returned ad_id_v2 is the ID of the Upgraded Smart+ Ad.
UPGRADED_SMART_PLUS_CREATIVE: Upgraded Smart+ Campaigns. To learn more about Upgraded Smart+ Campaigns, see Upgraded Smart+ Campaign.
When campaign_automation_type is UPGRADED_SMART_PLUS_CREATIVE, the returned ad_id is the ID of a creative in the Upgraded Smart+ Ad.

ad_id_v2
	
string
	
Returned when metrics contains the ad_id_v2 metric in the request.

Ad ID v2.

The types of data you can get from this metric include:
The ad IDs of Manual Ads
The ad IDs of Smart+ Campaigns
The ad IDs of Upgraded Smart+ Ads

ad_text_list
	
string[]
	
Returned when the following conditions are met:
dimensions contains the dimension ad_id_v2 and ad_id_v2 is an Upgraded Smart+ Ad.
metrics contains ad_text.
report_type is BASIC, AUDIENCE, or CATALOG.

A list of ad texts.

call_to_action_list
	
string[]
	
Returned when the following conditions are met:
dimensions contains the dimension ad_id_v2 and ad_id_v2 is an Upgraded Smart+ Ad.
metrics contains call_to_action.
report_type is BASIC or AUDIENCE.

A list of call-to-actions.

ad_profile_image_list
	
string[]
	
Returned when the following conditions are met:
dimensions contains the dimension ad_id_v2.
metrics contains ad_profile_image.
report_type is BASIC or AUDIENCE.

A list of ad level profile images.

ad_url_list
	
string[]
	
Returned when the following conditions are met:
dimensions contains the dimension ad_id_v2 and ad_id_v2 is an Upgraded Smart+ Ad.
metrics contains ad_url.
report_type is BASIC or AUDIENCE.

A list of ad level URLs.

image_mode_list
	
string[]
	
Returned when the following conditions are met:
dimensions contains the dimension ad_id_v2 and ad_id_v2 is an Upgraded Smart+ Ad.
metrics contains image_mode.
report_type is BASIC or AUDIENCE.

A list of formats.

image_info_list
	
string[]
	
Returned when the following conditions are met:
dimensions contains the dimension ad_id_v2 and ad_id_v2 is an Upgraded Smart+ Ad.
metrics contains image_info.
report_type is BASIC or AUDIENCE.

A list of images.

ad_display_name_list
	
string[]
	
Returned when the following conditions are met:
dimensions contains the dimension ad_id_v2 and ad_id_v2 is an Upgraded Smart+ Ad.
metrics contains ad_display_name.
report_type is BASIC or AUDIENCE.

A list of ad display names.

identity_type_list
	
string[]
	
Returned when the following conditions are met:
dimensions contains the dimension ad_id_v2 and ad_id_v2 is an Upgraded Smart+ Ad.
metrics contains identity_type.
report_type is BASIC or AUDIENCE.

A list of identity types.

profile_image_list
	
string[]
	
Returned when the following conditions are met:
dimensions contains the dimension ad_id_v2 and ad_id_v2 is an Upgraded Smart+ Ad.
metrics contains profile_image.
report_type is BASIC or AUDIENCE.

A list of profile images.

page_info
	
object
	
Pagination information.

page
	
number
	
Current page number.

page_size
	
number
	
Page size.

total_number
	
number
	
Total number of results.

total_page
	
number
	
Total pages of results.
Example
Retrieving the ad (asset group) level data of Upgraded Smart+ Ads in a basic report
{
    "code": 0,
    "message": "OK",
    "request_id": "{{request_id}}",
    "data": {
        "page_info": {
            "page": 1,
            "page_size": 1000,
            "total_page": 1,
            "total_number": 2
        },
        "list": [
            {
                "dimensions": {
                    // "ad_id_v2" returns ad level data
                    "ad_id_v2": "{{ad_id_v2}}",
                    "stat_time_day": "2025-12-03 00:00:00"
                },

                "metrics": {
                    // ad ID
                    "ad_id_v2": "{{ad_id_v2}}",
                    // ad name
                    "ad_name": "{{ad_name}}",
                    "impressions": "1079",
                    "spend": "14.68",
                    "campaign_automation_type": "UPGRADED_SMART_PLUS"
                }
            },
            {
                "dimensions": {
                    "ad_id_v2": "{{ad_id_v2}}",
                    "stat_time_day": "2025-12-03 00:00:00"
                },
                "metrics": {
                    "ad_id_v2": "{{ad_id_v2}}",
                    "ad_name": "{{ad_name}}",
                    "impressions": "52",
                    "spend": "0.70",
                    "campaign_automation_type": "UPGRADED_SMART_PLUS"
                }
            }
        ]
    }
}

Retrieving the creative level data of Upgraded Smart+ Ads in a basic report
{
    "code": 0,
    "message": "OK",
    "request_id": "{{request_id}}",
    "data": {
        "page_info": {
            "page": 1,
            "page_size": 1000,
            "total_page": 1,
            "total_number": 3
        },
        "list": [
            {
                "dimensions": {
                   // "ad_id" returns creative level data
                    "ad_id": "{{ad_id}}",
                    "stat_time_day": "2025-12-03 00:00:00"
                },
                "metrics": {
                    // creative ID
                    "ad_id": "{{ad_id}}",
                    // creative name
                    "ad_name": "{{ad_name}}",
                    "impressions": "513",
                    "spend": "7.97",
                    "campaign_automation_type": "UPGRADED_SMART_PLUS_CREATIVE"
                }
            },
            {
                "dimensions": {
                    "ad_id": "{{ad_id}}",
                    "stat_time_day": "2025-12-03 00:00:00"
                },
                "metrics": {
                    "ad_id": "{{ad_id}}",
                    "ad_name": "{{ad_name}}",
                    "impressions": "37",
                    "spend": "0.58",
                    "campaign_automation_type": "UPGRADED_SMART_PLUS_CREATIVE"
                }
            },
            {
                "dimensions": {
                    "ad_id": "{{ad_id}}",
                    "stat_time_day": "2025-12-03 00:00:00"
                },
                "metrics": {
                    "ad_id": "{{ad_id}}",
                    "ad_name": "{{ad_name}}",
                    "impressions": "10",
                    "spend": "0.08",
                    "campaign_automation_type": "UPGRADED_SMART_PLUS_CREATIVE"
                }
            }
        ]
    }
}

Filtering by Upgraded Smart+ Ad (Asset Group) IDs through ad_id_v2
{
    "code": 0,
    "message": "OK",
    "request_id": "{{request_id}}",
    "data": {
        "page_info": {
            "page": 1,
            "page_size": 2,
            "total_number": 2,
            "total_page": 1
        },
        "list": [
            {
                "dimensions": {
                    "ad_id_v2": "{{ad_id_v2}}"
                },
                "metrics": {
                    "spend": "0.00",
                    "ad_id_v2": "{{ad_id_v2}}"
                }
            },
            {
                "dimensions": {
                    "ad_id_v2": "{{ad_id_v2}}"
                },
                "metrics": {
                    "spend": "186.78",
                    "ad_id_v2": "{{ad_id_v2}}"
                }
            }
        ]
    }
}

Was the information helpful?
Yes
No