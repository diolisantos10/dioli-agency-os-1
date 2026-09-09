---
titulo: "Marketing API — /identity/music/authorization/ (autorização de música em anúncio)"
url: https://business-api.tiktok.com/portal/docs?id=1740218495869954
capturado_em: 2026-09-09
hash: 9c9ac5dbba3e69b8
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
Create an identity
Delete an identity
Get the identity list
Get info about an identity
Get posts under an identity
Get live videos under an identity
Get music authorization info of a video
Get info about TikTok posts
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
Comparing v1.2 and v1.3
Request
Example
Response
Example
Get music authorization info of a video

Use this endpoint to get music authorization information for videos under an identity.

Comparing v1.2 and v1.3

The following table outlines the differences between v1.2 and v1.3 endpoints.

Changes	v1.2	v1.3

Endpoint path
	
/v1.2/identity/music/authorization/
	
/v1.3/identity/music/authorization/

Request parameter data type
	
advertiser_id: number
item_id: number
	
advertiser_id: string
item_id: string

Response parameter name
	
list
song_id
	
music_authorization
music_id

Response parameter data type
	
item_id: number
	
item_id: string
Request

Endpoint

https://business-api.tiktok.com/open_api/v1.3/identity/music/authorization/

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
Required
	
string
	
Ad account ID.

item_id
Required
	
string
	
Tiktok post ID.

identity_id
Required
	
string
	
Identity ID.

identity_type
Required
	
string
	
Identity type. Enum values: AUTH_CODE (Authorized Post User), TT_USER (TikTok Business Account User), BC_AUTH_TT (TheTikTok account that a Business Center is authorized to access). See Identities for details.

identity_authorized_bc_id
Conditional
	
string
	
ID of the Business Center that a TikTok Account User in Business Center identity is associated with. Required when identity_type is BC_AUTH_TT.

locations
Required
	
string[]
	
List of targeting locations. You must use the same set of locations as when you create the ad.

start_time
Required
	
string
	
Ad deployment start time (UTC), in the format of "YYYY-MM-DD HH:MM:SS".

end_time
Required
	
string
	
Ad deployment end time (UTC), in the format of "YYYY-MM-DD HH:MM:SS".
Example
curl --get -H "Access-Token:xxx" \
--data-urlencode "advertiser_id=ADVERTISER_ID" \
--data-urlencode "item_id=ITEM_ID" \
--data-urlencode "identity_id=IDENTITY_ID" \
--data-urlencode "identity_type=IDENTITY_TYPE" \
--data-urlencode "identity_authorized_bc_id=IDENTITY_AUTHORIZED_BC_ID" \
--data-urlencode "locations=[\"LOCATIONS\"]" \
--data-urlencode "start_time=START_TIME" \
--data-urlencode "end_time=END_TIME" \
https://business-api.tiktok.com/open_api/v1.3/identity/music/authorization/

Response
Field	Data Type	Description

code
	
number
	
Response code. For the complete list of response codes and descriptions, see Appendix - Return Codes.

message
	
string
	
Response message. For details, see Appendix - Return Codes.

data
	
object
	
Returned data.

music_authorization
	
object[]
	
Music authorization information for TikTok posts.

item_id
	
string
	
TikTok post ID.

music_status
	
string
	
The aggregated authorization status for all the music in the TikTok post. Enum values: WITHOUT_SONG_ID,  AUTHORIZATION_MISSING, WITH_FULL_AUTHORIZATION.

authorization_infos
	
object[]
	
Authorization information for each music.

music_id
	
string
	
Song ID.

author
	
string
	
Performer.

title
	
string
	
Song title.

labels
	
string[]
	
Labels (tags) for this song.

lyricist
	
string
	
Lyricist.

composer
	
string
	
Music composer.

publisher
	
string
	
Music publisher.

authorization_type
	
string
	
Authorization type. Enum values: NOT_AUTHORIZED, AUTHORIZED.

request_id
	
string
	
The log id of the request, which uniquely identifies a request.
Example
HTTPS/1.1 200 OK
{
    "code": 0,
    "message": "OK",
    "request_id": "202208101819310102510031480D2B9AA4",
    "data": {
        "music_authorization": [
            {
                "music_status": MUSIC_STATUS,
                "item_id": "ITEM_ID",
                "authorization_infos": [
                    {
                        "title": "TITLE",
                        "composer":" COMPOSER",
                        "author": "AUTHOR,
                        "publisher": PUBLISHER,
                        "lyricist": "LYRICIST",
                        "labels": ["LABELS"],
                        "authorization_type": "AUTHORIZED",
                        "music_id": "MUSIC_ID"
                    }
                ]
            }
        ]
    }
}

Was the information helpful?
Yes
No