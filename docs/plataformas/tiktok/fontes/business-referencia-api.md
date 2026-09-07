---
titulo: "Marketing API — API Reference (índice completo dos endpoints v1.3)"
url: https://business-api.tiktok.com/portal/docs/api-reference/v1.3
capturado_em: 2026-09-07
hash: e23f19df46937243
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
Request URL format
List of available endpoints
API Reference
Request URL format

For non-MCP endpoints, request URLs are in the format of <base_url>/<api_version>/<endpoint>.

base_url: https://business-api.tiktok.com/open_api
api_version: The current version is "v1.3".
endpoint: Endpoints that are shown in the table below and referred to in our API docs.

For MCP endpoints, request URLs are in the format of <base_url>/<endpoint>.

base_url: https://business-api.tiktok.com
endpoint: Endpoints that are shown in the table below and referred to in our API docs.
List of available endpoints
Category	Endpoint	Description	Scope of permission

Accounts
	
-
	
-
	
-

-
	
/tt_user/token_info/get/
	
Get the authorized TikTok account permission scopes via access token.
	
No permission needed.

-
	
/business/get/
	
Get profile data of a TikTok account.
	
TikTok Accounts > Account User

-
	
/business/video/list/
	
Get post data of a TikTok account.
	
TikTok Accounts > Get Account Media

-
	
/business/benchmark/
	
Get benchmarks for a business category.
	
TikTok Accounts > Business Benchmark

-
	
/business/video/settings/
	
Get the post privacy settings of a TikTok account.
	
TikTok Accounts > Account Post Content > Video Publish

-
	
/business/comment/list/
	
Access all the comments (along with related information) - both public and hidden - that have been created against a specific organic video posted by an owned TikTok account.
	
TikTok Accounts > Account Comment > Get Business Comment

-
	
/business/comment/reply/list/
	
Access all replies to a specific comment (along with related information) - both public and hidden - that have been created against a comment on an organic video posted by an owned TikTok account.
	
TikTok Accounts > Account Comment > Get Business Comment

-
	
/business/comment/create/
	
Create a new comment on an organic video posted by an owned TikTok account.
	
TikTok Accounts > Account Comment > Manage Account Comment

-
	
/business/comment/image/upload/
	
Upload an image for a new comment or for a reply to an existing comment.
	
TikTok Accounts > Account Comment > Manage Account Comment

-
	
/business/comment/reply/create/
	
Create a reply to an existing comment on an organic video posted by an owned TikTok account.
	
TikTok Accounts > Account Comment > Manage Account Comment

-
	
/business/comment/like/
	
Like/unlike an existing comment on an organic video posted by an owned TikTok account.
	
TikTok Accounts > Account Comment > Manage Account Comment

-
	
/business/comment/hide/
	
Hide/unhide an existing comment on an organic video posted by an owned TikTok account.
	
TikTok Accounts > Account Comment > Manage Account Comment

-
	
/business/comment/delete/
	
Delete an owned comment on an organic video posted by an owned TikTok account.
	
TikTok Accounts > Account Comment > Manage Account Comment

-
	
/business/video/publish/
	
Publish a public video to an owned TikTok account, specifying the video file to be published, the video caption, and the enabled forms of user engagement (comments/stitches/duets).
	
TikTok Accounts > Account Post Content > Video Publish

-
	
/business/photo/publish/
	
Publish a photo post to an owned account.
	
TikTok Accounts > Account Post Content > Photo Publish

-
	
/business/publish/status/
	
Get the publishing status of a TikTok post.
	
TikTok Accounts > Account Post Content > Video Publish

-
	
/business/hashtag/suggestion/
	
Get recommended hashtags for TikTok accounts.
	
TikTok Accounts > Account Post Content > Video Publish

-
	
/business/publish/location/
	
Get the location tags for a TikTok account.
	
TikTok Accounts > Account Post Content > Video Publish

-
	
/business/post/authorize/setting/
	
Enable or disable the ad authorization setting for a TikTok post.
	
TikTok Accounts > Auth Code Management

-
	
/business/post/authorize/
	
Extend the authorization validity period of a TikTok post.
	
TikTok Accounts > Auth Code Management

-
	
/business/post/authorize/status/
	
Get the authorization status of a TikTok post.
	
TikTok Accounts > Auth Code Management

-
	
/business/post/authorize/delete/
	
Delete the authorization code of a TikTok post.
	
TikTok Accounts > Auth Code Management

-
	
/business/property/add/
	
Add a URL property to an ad account.
	
No permission needed

-
	
/business/property/verify/
	
Check the URL property verification result.
	
No permission needed

-
	
/business/property/delete/
	
Delete the verified ownership of a URL property.
	
No permission needed

-
	
/business/property/list/
	
Get the list of added URL properties under an ad account.
	
No permission needed

-
	
/business/webhook/update/
	
Create or update a TikTok account Webhook configuration.
	
No permission needed

-
	
/business/webhook/list/
	
Get TikTok account Webhook configurations.
	
No permission needed

-
	
/business/webhook/delete/
	
Delete a TikTok account Webhook configuration.
	
No permission needed

Ads
	
-
	
-
	
-

-
	
/ad/get/
	
Get all ads or use filters to get certain ads.
	
Ads Management > Ad > Read Ads

-
	
/ad/create/
	
Create an ad.
	
Ads Management > Ad > Create and Update Ads

-
	
/ad/update/
	
Update an ad.
	
Ads Management > Ad > Create and Update Ads

-
	
/ad/status/update/
	
Update ad status.
	
Ads Management > Ad > Create and Update Ads

Ad Account
	
-
	
-
	
-

-
	
/oauth2/advertiser/get/
	
Get a list of advertisers that have granted you the permission to manage their accounts on their behalf.
	
Ad Account Management > Ad Account Information > Read Ad Account Information

-
	
/advertiser/info/
	
Get advertiser information such as account name, email and contacts.
	
Ad Account Management > Ad Account Information > Read Ad Account Information

Ad Comments
	
-
	
-
	
-

-
	
/comment/list/
	
Get comments for your ads.
	
Ad Comments > Ad Comment Management > Read Comments

-
	
/comment/reference/
	
Get related comments.
	
Ad Comments > Ad Comment Management > Read Comments

-
	
/comment/status/update/
	
Use this endpoint to change the status of a list of comments from public to hidden, or vice versa.
	
Ad Comments > Ad Comment Management > Write Comments

-
	
/comment/post/
	
Reply to comments.
	
Ad Comments > Ad Comment Management > Write Comments

-
	
/comment/delete/
	
For users who added comments to TikTok ads that are created by users linked to Customized User or TTBA types of identities, they can delete their own comments.
	
Ad Comments > Ad Comment Management > Write Comments

-
	
/comment/task/create/
	
Create comment export task.
	
Ad Comments > Ad Comment Management > Read Comments

-
	
/comment/task/check/
	
Get comment export status.
	
Ad Comments > Ad Comment Management > Read Comments

-
	
/comment/task/download/
	
Download exported comments.
	
Ad Comments > Ad Comment Management > Read Comments

Ad Comments - Blocked Words
	
-
	
-
	
-

-
	
/blockedword/create/
	
Add words to the block list.
	
Ad Comments > Blocked Word Management > Write Blocked Words

-
	
/blockedword/update/
	
Replace a blocked word with another word.
	
Ad Comments > Blocked Word Management > Write Blocked Words

-
	
/blockedword/check/
	
Check if a list of words is blocked.
	
Ad Comments > Blocked Word Management > Read Blocked Words

-
	
/blockedword/list/
	
Get the list of blocked words for an ad account.
	
Ad Comments > Blocked Word Management > Read Blocked Words

-
	
/blockedword/delete/
	
Delete one or more blocked words.
	
Ad Comments > Blocked Word Management > Write Blocked Words

-
	
/blockedword/task/create/
	
Create a task to export blocked words.
	
Ad Comments > Blocked Word Management > Read Blocked Words

-
	
/blockedword/task/check/
	
Check the status of the export task.
	
Ad Comments > Blocked Word Management > Read Blocked Words

-
	
/blockedword/task/download/
	
Download the exported blocked words.
	
Ad Comments > Blocked Word Management > Read Blocked Words

Ad Diagnosis
	
-
	
-
	
-

-
	
/tool/diagnosis/get/
	
Get diagnosis, including possible issues and suggestions for correction or improvements, for your active ad groups.
	
Ad Diagnosis > Get and Adopt Diagnosis Suggestion

Ad Groups
	
-
	
-
	
-

-
	
/adgroup/get/
	
Get all ad groups or use filters to get certain ad groups.
	
Ads Management > Ad Group > Read Ad Groups

-
	
/adgroup/quota/
	
Get the dynamic quota on active ad groups.
	
Ads Management > Ad Group > Read Ad Groups

-
	
/ad/audience_size/estimate/
	
Get estimated audience size.
	
Ads Management > Ad Group > Create and Update Ad Groups

-
	
/adgroup/create/
	
Create an ad group.
	
Ads Management > Ad Group > Create and Update Ad Groups

-
	
/adgroup/update/
	
Update an ad group.
	
Ads Management > Ad Group > Create and Update Ad Groups

-
	
/adgroup/status/update/
	
Update ad group status.
	
Ads Management > Ad Group > Create and Update Ad Groups

-
	
/adgroup/budget/update/
	
Update ad group budget.
	
Ads Management > Ad Group > Create and Update Ad Groups

Ad Review
	
-
	
-
	
-

-
	
/adgroup/review_info/
	
Get ad group review information.
	
Ads Management > Ad Group> Read Ad Groups

-
	
/ad/review_info/
	
Get ad review information.
	
Ads Management > Ad > Read Ads

-
	
/adgroup/appeal/
	
Appeal the rejection decision if your ad group was rejected during review.
	
No permission needed.

Audience
	
-
	
-
	
-

-
	
/dmp/custom_audience/file/upload/
	
Upload audience files.
	
Audience Management > Create and Update Custom Audiences

-
	
/dmp/custom_audience/create/
	
Create audience by file.
	
Audience Management > Create and Update Custom Audiences

-
	
/segment/audience/
	
You can use this endpoint to create or delete audience segments.
	
Audience Management > Create and Update Custom Audiences

-
	
/segment/mapping/
	
You can use this endpoint to add mappings to audience segments.
	
Audience Management > Create and Update Custom Audiences

-
	
/dmp/custom_audience/update/
	
Update details of an audience.
	
Audience Management > Create and Update Custom Audiences

-
	
/dmp/custom_audience/list/
	
Get all audiences.
	
Audience Management > Read Custom Audiences

-
	
/dmp/custom_audience/get/
	
Get audience details.
	
Audience Management > Read Custom Audiences

-
	
/dmp/custom_audience/rule/create/
	
Create audience by rule.
	
Audience Management > Create and Update Custom Audiences

-
	
/dmp/custom_audience/lookalike/create/
	
Create lookalike audience.
	
Audience Management > Create and Update Custom Audiences

-
	
/dmp/custom_audience/lookalike/update/
	
Manually refresh a Lookalike Audience.
	
Audience Management > Create and Update Custom Audiences

-
	
/dmp/custom_audience/delete/
	
Delete an audience.
	
Audience Management > Create and Update Custom Audiences

-
	
/dmp/custom_audience/share/
	
Ad account owners, or users in Admin or Operator roles can share custom audiences with other advertisers.
	
Audience Management > Share Custom Audiences

-
	
/dmp/custom_audience/share/cancel/
	
Ad account owners, or users in Admin or Operator roles can stop sharing custom audiences with other advertisers.
	
Audience Management > Share Custom Audiences

-
	
/dmp/custom_audience/share/log/
	
Ad account owners, or users in Admin or Operator roles can get the sharing log of a custom audience.
	
Audience Management > Share Custom Audiences

-
	
/dmp/custom_audience/apply/
	
Apply audience to or disconnect audience from multiple ad groups.
	
Audience Management > Create and Update Custom Audiences

-
	
/dmp/custom_audience/apply/log/
	
Get the latest application log of custom audiences.
	
Audience Management > Create and Update Custom Audiences

-
	
/dmp/saved_audience/create/
	
Create a Saved Audience.
	
Audience Management > Create and Update Custom Audiences

-
	
/dmp/saved_audience/list/
	
Get the details of Saved Audiences.
	
Audience Management > Read Custom Audiences

-
	
/dmp/saved_audience/delete/
	
Delete Saved Audiences.
	
Audience Management > Create and Update Custom Audiences

-
	
/audience/insight/info/
	
Get details of potential audiences.
	
Audience Management > Read Custom Audiences

-
	
/audience/insight/overlap/
	
Get details of audience overlap.
	
Audience Management > Read Custom Audiences

Authentication
	
-
	
-
	
No permission needed.

-
	
/oauth2/access_token/
	
Obtain a long-term access token with Content-Type as application/json.
	

-
	
/oauth/token/
	
Obtain a long-term access token with Content-Type as application/x-www-form-urlencoded or application/json.
	

-
	
/oauth2/revoke_token/
	
Revoke a long-term access token.
	

-
	
/tt_user/oauth2/token/
	
Obtain a short-term access token.
	

-
	
/tt_user/oauth2/refresh_token/
	
Renew a short-term access token.
	

-
	
/tt_user/oauth2/revoke/
	
Revoke a short-term access token.
	

Automated Rules
	
-
	
-
	
-

-
	
/optimizer/rule/create/
	
Create an automated rule.
	
Automated Rules > Create and Update Automated Rules

-
	
/optimizer/rule/get/
	
Get rules by rule IDs.
	
Automated Rules > Read Automated Rules

-
	
/optimizer/rule/list/
	
Get rules based on the values of certain filters.
	
Automated Rules > Read Automated Rules

-
	
/optimizer/rule/result/list/
	
Get rule results.
	
Automated Rules > Read Automated Rules

-
	
/optimizer/rule/result/get/
	
Get result details.
	
Automated Rules > Read Automated Rules

-
	
/optimizer/rule/update/
	
Update an automated rule.
	
Automated Rules > Create and Update Automated Rules

-
	
/optimizer/rule/update/status/
	
Turn on, turn off, or delete a group of rules.
	
Automated Rules > Create and Update Automated Rules

-
	
/optimizer/rule/batch_bind/
	
Bind objects to rules.
	
Automated Rules > Create and Update Automated Rules

BC Management
	
-
	
-
	
-

-
	
/bc/get/
	
Get Business Centers that you have access to.
	
Ad Account Management > Business Center > Read Business Center

-
	
/changelog/get/
	
Get the activity log of a Business Center.
	
Ads Management > Change Log > Change Log

BC Payments
	
-
	
-
	
-

-
	
/bc/transfer/
	
Process payments (recharge money to or deduct money from an ad account in a Business Center.
	
Ad Account Management > Business Center > Ad Account Balance and Transaction

-
	
/advertiser/balance/get/
	
Get ad account balance and budget.
	
Ad Account Management > Business Center > Ad Account Balance and Transaction

-
	
/bc/balance/get/
	
Get the balance of a Business Center.
	
Ad Account Management > Business Center > Read Business Center

-
	
/bc/account/transaction/get/
	
Get the transaction records of a BC or ad accounts
	
Ad Account Management > Business Center > Ad Account Balance and Transaction

-
	
/advertiser/transaction/get/
	
Get transaction records of an ad account.
	
Ad Account Management > Business Center > Ad Account Balance and Transaction

-
	
/bc/transaction/get/
	
Get translaction records of a Business Center.
	
Ad Account Management > Business Center > Read Business Center

-
	
/bc/account/budget/changelog/get/
	
Get the budget change history of an ad account.
	
Ad Account Management > Business Center > Ad Account Balance and Transaction

-
	
/bc/account/cost/get/
	
Get the cost records of a BC and ad accounts.
	
Ad Account Management > Business Center > Ad Account Balance and Transaction

BC Payment Portfolios
	
-
	
-
	
-

-
	
/payment_portfolio/get/
	
Get Payment Portfolios.
	
Payment Portfolio > Read

-
	
/payment_portfolio/create/
	
Create a Payment Portfolio.
	
Payment Portfolio > Write

-
	
/payment_portfolio/advertiser/update/
	
Link ad accounts to a Payment Portfolio.
	
Payment Portfolio > Write

-
	
/payment_portfolio/credit_line/update/
	
Allocate the credit line to Payment Portfolios.
	
Payment Portfolio > Write

-
	
/payment_portfolio/advertiser/get/
	
Get ad accounts linked to a Payment Portfolio.
	
Payment Portfolio > Read

-
	
/payment_portfolio/user/get/
	
Get authorized users for a Payment Portfolio.
	
Payment Portfolio > Read

BC Assets
	
-
	
-
	
-

-
	
/bc/advertiser/create/
	
Create an ad account under a Business Center.
	
Ad Account Management > Business Center > Create Ad Account

-
	
/advertiser/update/
	
Update an ad account.
	
Ad Account Management > Business Center > Create Ad Account

-
	
/bc/advertiser/disable/
	
Disable ad accounts.
	
Ad Account Management > Business Center > Create Ad Account

-
	
/bc/image/upload/
	
Upload certificate images for an ad account.
	
Ad Account Management > Business Center > Create Ad Account

-
	
/bc/advertiser/qualification/get/
	
Get qualifications within a Business Center.
	
Ad Account Management > Business Center > Create Ad Account

-
	
/bc/advertiser/unionpay_info/check/
	
Check the UnionPay verification requirement for a business license.
	
Ad Account Management > Business Center > Create Ad Account

-
	
/bc/advertiser/unionpay_info/submit/
	
Submit UnionPay verification for a business license.
	
Ad Account Management > Business Center > Create Ad Account

-
	
/bc/oa/create/
	
Create an Organization Account in a Business Center.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/get/
	
Get assets of a Business Center.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/admin/get/
	
Get assets of a Business Center as admins.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/assign/
	
Assign assets to a user.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/unassign/
	
Revoke the access to an asset from a user.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/account/authorization/
	
Obtain a TikTok account ad delivery authorization URL.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/advertiser/assign/
	
Link a TikTok account to an ad account in Business Center.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/advertiser/unassign/
	
Unlink a TikTok account from an ad account in Business Center.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/advertiser/assigned/
	
Get ad accounts linked to a TikTok account in Business Center.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/pixel/transfer/
	
Transfer Pixel from Advertiser to BC.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/pixel/link/update/
	
Use this endpoint to link and unlink pixel to advertiser accounts.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/pixel/link/get/
	
Use this endpoint to get a list of ad accounts that have been linked to the request pixel.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/partner/get/
	
Get partners by assets.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/member/get/
	
Get members by assets.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/bc/asset/admin/delete/
	
Delete assets.
	
Ad Account Management > Business Center > Business Center Asset

-
	
/asset/bind/quota/
	
Understand how many ads an asset has been binded to, and how many more ads this asset can be binded to.
	
Ad Account Management > Business Center > Business Center Asset

BC Billing Group
	
-
	
-
	
-

-
	
/bc/billing_group/create/
	
Create a billing group in a Business Center.
	
Ad Account Management > Business Center > Business Center Billing Group Management

-
	
/bc/billing_group/update/
	
Update settings of a billing group.
	
Ad Account Management > Business Center > Business Center Billing Group Management

-
	
/bc/billing_group/get/
	
Get all billing groups in a Business Center.
	
Ad Account Management > Business Center > Business Center Billing Group Management

-
	
/bc/billing_group/advertiser/list/
	
Get all billing groups in a Business Center.
	
Ad Account Management > Business Center > Business Center Billing Group Management

BC Asset Groups
	
-
	
-
	
-

-
	
/bc/asset_group/create/
	
Create an Asset Group in your Business Center.
	
Ad Account Management > Business Center > Asset Group

-
	
/bc/asset_group/update/
	
Update assets, members or the name of an Asset Group.
	
Ad Account Management > Business Center > Asset Group

-
	
/bc/asset_group/list/
	
Get all Asset Groups in your Business Center.
	
Ad Account Management > Business Center > Asset Group

-
	
/bc/asset_group/get/
	
Get the assets or members of an Asset Group in a Business Center.
	
Ad Account Management > Business Center > Asset Group

-
	
/bc/asset_group/delete/
	
Remove members' access to an Asset Group.
	
Ad Account Management > Business Center > Asset Group

BC Partners
	
-
	
-
	
-

-
	
/bc/partner/get/
	
Get partners.
	
Ad Account Management > Business Center > Business Center Partner Management

-
	
/bc/partner/add/
	
Add partner to Business Center.
	
Ad Account Management > Business Center > Business Center Partner Management

-
	
/bc/partner/delete/
	
Delete partner.
	
Ad Account Management > Business Center > Business Center Partner Management

-
	
/bc/partner/asset/delete/
	
Cancel asset sharing.
	
Ad Account Management > Business Center > Business Center Partner Management

-
	
/bc/partner/asset/get/
	
Get partner assets.
	
Ad Account Management > Business Center > Business Center Partner Management

BC Members
	
-
	
-
	
-

-
	
/bc/member/get/
	
Get BC members.
	
Ad Account Management > Business Center > Business Center Member Management

-
	
/bc/member/invite/
	
Invite members to BC.
	
Ad Account Management > Business Center > Business Center Member Management

-
	
/bc/member/update/
	
Update member information.
	
Ad Account Management > Business Center > Business Center Member Management

-
	
/bc/member/delete/
	
Delete a member or revoke a member invitation.
	
Ad Account Management > Business Center > Business Center Member Management

BC Invoice
	
-
	
-
	
-

-
	
/bc/invoice/get/
	
Finance Managers and Finance Analysts of a Business Center account can use this endpoint to get invoices of their Business Center accounts.
	
Ad Account Management > Business Center > Invoice Management

-
	
/bc/invoice/unpaid/get/
	
Finance Managers and Finance Analysts of a Business Center account can use this endpoint to get total unpaid amount of their Business Center accounts.
	
Ad Account Management > Business Center > Invoice Management

-
	
/bc/invoice/download/
	
Finance Managers and Finance Analysts of a Business Center account can use this endpoint to download invoices via synchronous downloads.
	
Ad Account Management > Business Center > Invoice Management

-
	
/bc/invoice/task/create/
	
Create an asynchronous download task.
	
Ad Account Management > Business Center > Invoice Management

-
	
/bc/invoice/task/get/
	
Check whether the asynchronous download task (BILLING_REPORT type) has completed.
	
Ad Account Management > Business Center > Invoice Management

-
	
/bc/invoice/task/list/
	
Check whether the asynchronous download task (INVOICE_LIST or INVOICE_BATCH type) has completed.
	
Ad Account Management > Business Center > Invoice Management

BC Reporting
	
-
	
-
	
-

-
	
/bc/advertiser/attribute/
	
Get currencies and registration areas for ad accounts.
	
Ad Account Management > Business Center > Create Ad Account

Brand Safety
	
-
	
-
	
-

-
	
/tiktok_inventory_filters/get/
	
Get the Brand Safety Hub settings of an ad account.
	
Brand Safety > TikTok Inventory Filters

-
	
/tiktok_inventory_filters/update/
	
Set or update the Brand Safety Hub settings of an ad account.
	
Brand Safety > TikTok Inventory Filters

Business Messaging
	
-
	
-
	
-

-
	
/business/message/send/
	
Send a message to a conversation.
	
Business Messaging > Business Messaging Send

-
	
/business/message/conversation/list/
	
Get a list of conversations.
	
Business Messaging > Business Messaging Read

-
	
/business/message/content/list/
	
Get a list of messages.
	
Business Messaging > Business Messaging Read

-
	
/business/message/media/upload/
	
Upload an image.
	
Business Messaging > Business Messaging Send

-
	
/business/message/media/download/
	
Download an image from a message.
	
Business Messaging > Business Messaging Read

-
	
/business/message/capabilities/get/
	
Check the capability of a Business Account for a conversation.
	
Business Messaging > Business Messaging Read

-
	
/business/message/direct_reply/update/
	
Enable or disable Comment-to-Message for a Business Account.
	
Business Messaging > Business Messaging Send

-
	
/business/message/direct_reply/get/
	
Get the Comment-to-Message setting of a Business Account.
	
Business Messaging > Business Messaging Read

-
	
/business/webhook/update/
	
Create a Business Messaging Webhook configuration.
	
No permission needed

-
	
/business/webhook/list/
	
Get a Business Messaging Webhook configuration.
	
No permission needed

-
	
/business/webhook/delete/
	
Delete a Business Messaging Webhook configuration.
	
No permission needed

-
	
/business/message/auto_message/create/
	
Create an automatic message for a Business Account.
	
Business Messaging > Auto Message Setting

-
	
/business/message/auto_message/update/
	
Update the automatic message for a Business Account.
	
Business Messaging > Auto Message Setting

-
	
/business/message/auto_message/status/update/
	
Turn on or turn off an automatic message for a Business Account.
	
Business Messaging > Auto Message Setting

-
	
/business/message/auto_message/get/
	
Get the automatic messages for a Business Account.
	
Business Messaging > Auto Message Setting

-
	
/business/message/auto_message/delete/
	
Delete the automatic message for a Business Account.
	
Business Messaging > Auto Message Setting

-
	
/business/message/auto_message/sort/
	
Sort the automatic message for a Business Account.
	
Business Messaging > Auto Message Setting

Campaign
	
-
	
-
	
-

-
	
/campaign/get/
	
Get all campaigns or use filters to get certain campaigns.
	
Ads Management > Campaign > Read Campaigns

-
	
/campaign/create/
	
Create a campaign.
	
Ads Management > Campaign > Create and Update Campaigns

-
	
/campaign/update/
	
Update a campaign.
	
Ads Management > Campaign > Create and Update Campaigns

-
	
/campaign/status/update/
	
Update campaign status.
	
Ads Management > Campaign > Create and Update Campaigns

-
	
/campaign/quota/get/
	
Get iOS14 campaign quota.
	
Ads Management > Campaign > Read Campaigns

-
	
/campaign/quota/info/
	
Get the quota for an iOS 14 Dedicated Campaign per ad network.
	
Ads Management > Campaign > Read Campaigns

-
	
/campaign/copy/task/create/
	
Create an asynchronous copy task for a Manual Campaign.
	
Ads Management > Campaign > Create and Update Campaigns

-
	
/campaign/copy/task/check/
	
Get the results of an asynchronous copy task for a Manual Campaign.
	
Ads Management > Campaign > Read Campaigns

Catalogs
	
-
	
-
	
-

-
	
/catalog/create/
	
Create a catalog by specifying information such as name, targeted locations, and currency.
	
DPA Catalog Management > Catalog Management > Create and Update Catalogs

-
	
/catalog/update/
	
Use this endpoint to update the name of a catalog. The catalog must be under a Business Center.
	
DPA Catalog Management > Catalog Management > Create and Update Catalogs

-
	
/catalog/delete/
	
Delete a catalog.
	
DPA Catalog Management > Catalog Management > Create and Update Catalogs

-
	
/catalog/get/
	
Get all catalogs or a particular catalog.
	
DPA Catalog Management > Catalog Management > Read Catalogs

-
	
/catalog/lexicon/get/
	
Get the lexicon for your catalog. A lexicon means a list of variables that you can use in ad texts when promoting your catalog.
	
DPA Catalog Management > Catalog Management > Read Catalogs

-
	
/catalog/capitalize/
	
If your catalogs are still under your ad account, use this endpoint to migrate them to your Business Center.
	
DPA Catalog Management > Catalog Management > Create and Update Catalogs

-
	
/catalog/available_country/get/
	
the countries and regions that ads for a catalog can be delivered to.
	
DPA Catalog Management > Catalog Management > Read Catalogs

-
	
/catalog/location_currency/get/
	
Get the list of locations (country or region abbreviations) that are supported by Catalog API and the corresponding currencies for each location.
	
DPA Catalog Management > Catalog Management > Read Catalogs

-
	
/catalog/overview/
	
You can get the number of products in different audit status (approved, rejected, and processing) in a catalog.
	
DPA Catalog Management > Catalog Management > Read Catalogs

Catalog Event Sources
	
-
	
-
	
-

-
	
/catalog/eventsource/bind/
	
Bind app or website event sources to a catalog in a Business Center.
	
DPA Catalog Management > Event Source Bind > Create and Delete Event Source Bind

-
	
/catalog/eventsource/unbind/
	
Unbind event sources from a catalog.
	
DPA Catalog Management > Event Source Bind > Create and Delete Event Source Bind

-
	
/catalog/eventsource_bind/get/
	
Get event source binding information.
	
DPA Catalog Management > Event Source Bind > Read Event Source Bind

Catalog Feeds
	
-
	
-
	
-

-
	
/catalog/feed/create/
	
Create a feed.
	
DPA Catalog Management > Feed > Post Feed

-
	
/catalog/feed/get/
	
Get all feeds or a particular feed.
	
DPA Catalog Management > Feed > Get Feed

-
	
/catalog/feed/update/
	
Update a feed.
	
DPA Catalog Management > Feed > Post Feed

-
	
/catalog/feed/delete/
	
Delete a feed.
	
DPA Catalog Management > Feed > Post Feed

-
	
/catalog/feed/log/
	
Get the last 10 operations of a feed.
	
DPA Catalog Management > Feed > Get Feed

-
	
/catalog/feed/switch/
	
Update the schedule status of a feed
	
DPA Catalog Management > Feed > Post Feed

Catalog Products
	
-
	
-
	
-

-
	
/catalog/product/file/
	
Upload products via file URL.
	
DPA Catalog Management > Product Management > Create and Update Product

-
	
/catalog/product/upload/
	
Upload products.
	
DPA Catalog Management > Product Management > Create and Update Product

-
	
/catalog/product/update/
	
Update products in bulk.
	
DPA Catalog Management > Product Management > Create and Update Product

-
	
/catalog/product/delete/
	
Delete products in bulk.
	
DPA Catalog Management > Product Management > Create and Update Product

-
	
/catalog/product/get/
	
Get a list of products in your product catalog.
	
DPA Catalog Management > Product Management > Read Products

-
	
/catalog/product/log/
	
Use this endpoint to find out if a product was uploaded or deleted successfully, and what to do if it failed.
	
DPA Catalog Management > Product Management > Read Products

Catalog Product Sets
	
-
	
-
	
-

-
	
/catalog/set/get/
	
Get product sets.
	
DPA Catalog Management > Get Catalog Set

-
	
/catalog/set/product/get/
	
Get products in a product set.
	
DPA Catalog Management > DPA Set Management > Get Catalog Set

-
	
/catalog/set/create/
	
Create a product set by conditions.
	
DPA Catalog Management > DPA Set Management > Post Catalog Set

-
	
/catalog/set/upload/
	
Create a product set by file.
	
DPA Catalog Management > DPA Set Management > Post Catalog Set

-
	
/catalog/set/update/
	
Update a product set.
	
DPA Catalog Management > DPA Set Management > Post Catalog Set

-
	
/catalog/set/delete/
	
Delete product sets.
	
DPA Catalog Management > DPA Set Management > Post Catalog Set

Catalog Videos
	
-
	
-
	
-

-
	
/catalog/video/file/
	
Upload catalog videos via a file URL.
	
DPA Catalog Management > Catalog Video Management > Post Catalog Video

-
	
/catalog/video/log/
	
Get the catalog video handling log.
	
DPA Catalog Management > Catalog Video Management > Get Catalog Video

-
	
/catalog/video/get/
	
Get the uploaded catalog videos within a catalog.
	
DPA Catalog Management > Catalog Video Management > Get Catalog Video

-
	
/catalog/video/delete/
	
Delete uploaded catalog videos.
	
DPA Catalog Management > Catalog Video Management > Post Catalog Video

Catalog Video Templates
	
-
	
-
	
-

-
	
/catalog/video_package/get/
	
Get video packages.
	
DPA Catalog Management > Catalog Video Management > Get Catalog Video

-
	
/catalog/video_package/create/
Deprecated
	
Create video package.
	
DPA Catalog Management > Catalog Video Management > Post Catalog Video

-
	
/catalog/video_package/update/
Deprecated
	
Update video package.
	
DPA Catalog Management > Catalog Video Management > Post Catalog Video

-
	
/catalog/video_package/delete/
Deprecated
	
Delete video package.
	
DPA Catalog Management > Catalog Video Management > Post Catalog Video

-
	
/catalog/template/upload/
Deprecated
	
Upload a custom video template to Business Center and associate it with a group of catalogs.
	
DPA Catalog Management > Template > Template

-
	
/catalog/template_preview/create/
Deprecated
	
Preview a video template.
	
DPA Catalog Management > Template > Template

Catalog Diagnostics
	
-
	
-
	
-

-
	
/diagnostic/catalog/
	
Get synchronous catalog product diagnostic information.
	
DPA Catalog Management > Diagnostic > Diagnostic

-
	
/diagnostic/catalog/product/task/create/
	
Create an asynchronous download task for catalog product diagnostic information.
	
DPA Catalog Management > Diagnostic > Diagnostic

-
	
/diagnostic/catalog/product/task/get/
	
Download asynchronous catalog product diagnostic information.
	
DPA Catalog Management > Diagnostic > Diagnostic

-
	
/diagnostic/catalog/eventsource/issue/
	
Get catalog event source diagnostic information.
	
DPA Catalog Management > Event Source Bind > Read Event Source Bind

-
	
/diagnostic/catalog/eventsource/metric/
	
Get catalog event trends and match rate.
	
DPA Catalog Management > Event Source Bind > Read Event Source Bind

Catalog Insights
	
-
	
-
	
-

-
	
/catalog/insight/filter/get/
	
Get filters for catalog product insights.
	
DPA Catalog Management > Catalog Insight > Catalog Insight

-
	
/catalog/insight/product/get/
	
Get trending catalog products.
	
DPA Catalog Management > Catalog Insight > Catalog Insight

-
	
/catalog/insight/category/get/
	
Get trending catalog product categories.
	
DPA Catalog Management > Catalog Insight > Catalog Insight

Change Log
	
-
	
-
	
-

-
	
/changelog/task/create/
	
Initiate a task to download change logs for an ad account based on the parameters that you specify.
	
Ads Management > Change Log > Change Log

-
	
/changelog/task/check/
	
Check whether a log download file has been completed or not.
	
Ads Management > Change Log > Change Log

-
	
/changelog/task/download/
	
Get the log file that has been downloaded.
	
Ads Management > Change Log > Change Log

Creative Insights
	
-
	
-
	
-

-
	
/report/ad_benchmark/get/
	
Use this endpoint to get benchmarks about the performance of an ad.
	
Reporting > Ad Insight Report

-
	
/report/video_performance/get/
	
Get in-second performance data about a video.
	
Reporting > Ad Insight Report

Creative Pre-review
	
-
	
-
	
-

-
	
/creative/pre_review/task/create/
	
Create a creative pre-review task.
	
Creative Management > Creative Pre-review

-
	
/creative/pre_review/task/get/
	
Get the result of a creative pre-review task.
	
Creative Management > Creative Pre-review

Creative Portfolios
	
-
	
-
	
-

-
	
/creative/portfolio/create/
	
Create a portfolio.
	
Creative Management > Creative Recommendation > CTA Recommendation

-
	
/creative/portfolio/get/
	
Get a portfolio by ID.
	
Creative Management > Creative Recommendation > CTA Recommendation

-
	
/creative/portfolio/list/
	
Get portfolios within an ad account.
	
Creative Management > Creative Recommendation > CTA Recommendation

-
	
/creative/portfolio/delete/
	
Delete portfolios.
	
Creative Management > Creative Recommendation > CTA Recommendation

Creative reports
	
-
	
-
	
-

-
	
/creative/report/get/
	
Use this endpoint to run a report of creative assets.
	
Creative Management > Get Creative Report

Creative tools
	
-
	
-
	
-

-
	
/creative/status/get/
deprecated
	
Get the task status of the asynchronous creative endpoints.
	
Creative Management > Creative tool

-
	
/creative/image/edit/
	
Edit an image according to the size you want as well as apply creative trimmings.
	
Creative Management > Creative tool

-
	
/creative/ads_preview/create/
	
Preview an ad or a creative.
	
Creative Management > Creative tool

-
	
/creative/video_soundtrack/create/
deprecated
	
Create a Smart Video Soundtrack task.
	
Creative Management > Creative tool

-
	
/creative/quick_optimization/create/
deprecated
	
Create a video optimization task simply and quickly.
	
Creative Management > Creative tool

-
	
/creative/smart_video/create/
deprecated
	
Generate smart video.
	
Creative Management > Creative tool

-
	
/creative/asset/share/
	
Share creative assets with other advertiser accounts.
	
Creative Management > Creative tool

-
	
/creative/asset/delete/
	
Delete creative assets.
	
Creative Management > Creative tool

-
	
/creative/smart_text/generate/
	
Use smart text.
	
Creative Management > Creative Recommendation > Smart Text

-
	
/creative/smart_text/feedback/
	
Send back the text being used.
	
Creative Management > Creative Recommendation > Smart Text

-
	
/creative/cta/recommend/
	
You can get recommended CTAs that you can use to create or update your ads.
	
Creative Management > Creative Recommendation > CTA Recommendation

-
	
/video/fix/task/create/
	
Use this endpoint to create a task to detect and fix video issues.
	
Creative Management > Smart Fix > Fix Task management

-
	
/video/fix/task/get/
	
Use this endpoint to get smart fix task results.
	
Creative Management > Smart Fix Fix > Fix Task management

-
	
/creative_fatigue/get/
	
Use this endpoint to detect whether Creative Fatigue occurred for an ad within a specified time range in the past.
	
Reporting > Creative Fatigue Insight

Custom Conversions
	
-
	
-
	
-

-
	
/custom_conversion/list/
	
Get Custom Conversions associated with an event source.
	
Custom Conversion Management > Read Custom Conversion

-
	
/custom_conversion/get/
	
Get the details of a Custom Conversion.
	
Custom Conversion Management > Read Custom Conversion

-
	
/custom_conversion/create/
	
Create a Custom Conversion.
	
Custom Conversion Management > Create and Update Custom Conversion

-
	
/custom_conversion/update/
	
Update a Custom Conversion.
	
Custom Conversion Management > Create and Update Custom Conversion

-
	
/custom_conversion/delete/
	
Delete a Custom Conversion.
	
Custom Conversion Management > Create and Update Custom Conversion

Discovery
	
-
	
-
	
-

-
	
/discovery/trending_list/
	
Get popular hashtags.
	
Creative Management > Discovery

-
	
/discovery/detail/
	
Get details of a popular hashtag.
	
Creative Management > Discovery

-
	
/discovery/video_list/
	
Get trending videos related to hashtags.
	
Creative Management > Discovery

-
	
/discovery/cml/trending_list/
	
Get popular tracks from the Commercial Music Library.
	
Creative Management > Discovery

-
	
/discovery/cml/video_list/
	
Get trending videos related to tracks.
	
Creative Management > Discovery

-
	
/discovery/trending/search/
	
Get trending search keywords.
	
Creative Management > Discovery

-
	
/discovery/trending/search/keyword/
	
Get recommended search keywords.
	
Creative Management > Discovery

Dynamic Scene
(Deprecated)
	
-
	
-
	
-

-
	
/dynamic_scene/material/submit/
Deprecated
	
Use this endpoint to submit materials for dynamic scene creation.
	
Creative Management > Dynamic Scene > Core Functions

-
	
/dynamic_scene/task/create/
Deprecated
	
Use this endpoint to create a task that generates videos. You can get a maximum of 8 videos for each task.
	
Creative Management > Dynamic Scene > Core Functions

-
	
/dynamic_scene/task/get/
Deprecated
	
Use this endpoint to get task results.
	
Creative Management > Dynamic Scene > Core Functions

-
	
/dynamic_scene/get/
Deprecated
	
Use this endpoint to get all videos that are generated from a material package.
	
Creative Management > Dynamic Scene > Core Functions

-
	
/dynamic_scene/report/get/
Deprecated
	
Use this endpoint to run a report of dynamic scene videos.
	
Creative Management > Dynamic Scene > Core Functions

Events 2.0
	
-
	
-
	
-

-
	
/event/track/
	
Report a single App, Web, or Offline event, or multiple App, Web, or Offline events in batch.
	
Measurement > Report Conversion Event

Events 1.0
	
-
	
-
	
-

-
	
/app/track/
	
Report a single app event.
	
Measurement > Report App Event

-
	
/app/batch/
	
Report app events in bulk.
	
Measurement > Report App Event

-
	
/app/info/
	
Obtain the details of an App.
	
App Management > Read Apps

-
	
/app/create/
	
Create a mobile App.
	
App Management > Create and Update Apps

-
	
/app/update/
	
Update a mobile App.
	
App Management > Create and Update Apps

-
	
/app/list/
	
Obtain the list of apps under your account
	
App Management > Read Apps

-
	
/app/optimization_event/
	
Obtain information about an app conversion event
	
App Management > Read Apps

-
	
/app/optimization_event/retargeting/
	
Obtain information about an App Retargeting Event
	
App Management > Read Apps

-
	
/pixel/track/
	
Report a single pixel event.
	
Measurement > Report Pixel Event

-
	
/pixel/batch/
	
Report pixel events in bulk.
	
Measurement > Report Pixel Event

-
	
/pixel/list/
	
Obtain a list of Pixel information.
	
Pixel Management > Read Pixels

-
	
/pixel/create/
	
Create a Pixel.
	
Pixel Management > Create and Update Pixels

-
	
/pixel/update/
	
Update a Pixel.
	
Pixel Management > Create and Update Pixels

-
	
/pixel/event/create/
	
Choose either an industry or custom template to define your events.
	
Pixel Management > Create and Update Pixels

-
	
/pixel/event/update/
	
Update the name of a Pixel event and the conversion value.
	
Pixel Management > Create and Update Pixels

-
	
/pixel/event/delete/
	
Delete Pixel events.
	
Pixel Management > Create and Update Pixels

-
	
/pixel/instant_page/event/
	
Get the supported events for Instant Pages based on your objective types and optimization goals.
	
Pixel Management > Create and Update Pixels

-
	
/pixel/event/stats/
	
View statistics of an event data over a period of time.
	
Pixel Management > Pixel Level Reporting

-
	
/offline/create/
	
Create a new Offline Event set.
	
Offline Events Management > Create/Manage Offline Events

-
	
/offline/update/
	
Update an Offline Event set.
	
Offline Events Management > Create/Manage Offline Events

-
	
/offline/delete/
	
Delete an Offline Event set.
	
Offline Events Management > Create/Manage Offline Events

-
	
/offline/get/
	
Get Offline Event sets.
	
Offline Events Management > Read Offline Events

-
	
/offline/track/
	
Report an offline event.
	
Offline Events Management > Report Offline Events One by One

-
	
/offline/batch/
	
Report offline events in bulk.
	
Offline Events Management > Report Offline Events in Bulk

-
	
/crm/list/
	
Get CRM Event Sets.
	
CRM Event Management > Read CRM Event Sets

-
	
/crm/create/
	
Create a CRM Event Set within an advertiser account.
	
CRM Event Management > Create/Manage CRM Event Sets

-
	
/ctm/message_event_set/get/
	
Get the message event sets for ad creation.
	
CTX Events Management > Create/Manage CTM event sets

Files
	
-
	
-
	
-

-
	
/file/temporarily/upload/
	
Upload a file.
	
No permission needed.

-
	
/file/start/upload/
	
Start chunked file upload.
	
No permission needed.

-
	
/file/transfer/upload/
	
Transfer file chunk.
	
No permission needed.

-
	
/file/finish/upload/
	
Finish chunk upload.
	
No permission needed.

-
	
/file/name/check/
	
Check the names of files.
	
Creative Management > File Name Check

GMV Max
	
-
	
-
	
-

-
	
/gmv_max/campaign/get/
	
Get GMV Max Campaigns.
	
Ads Management > Campaign > Read Campaigns

-
	
/campaign/gmv_max/info/
	
Get the details of a GMV Max Campaign.
	
Ads Management > Campaign > Read Campaigns

-
	
/campaign/gmv_max/create/
	
Create a GMV Max Campaign.
	
Ads Management > Campaign > Create and Update Campaigns

-
	
/campaign/gmv_max/update/
	
Update a GMV Max Campaign.
	
Ads Management > Campaign > Create and Update Campaigns

-
	
/gmv_max/bid/recommend/
	
Get the recommended GMV Max ROI target and budget.
	
Ads Management > Campaign > Read Campaigns

-
	
/campaign/gmv_max/session/create/
	
Create a max delivery or creative boost session.
	
Ads Management > GMV MAX > Session

-
	
/campaign/gmv_max/session/update/
	
Update a max delivery or creative boost session.
	
Ads Management > GMV MAX > Session

-
	
/campaign/gmv_max/session/list/
	
Get max delivery or creative boost sessions within a campaign.
	
Ads Management > GMV MAX > Session

-
	
/campaign/gmv_max/session/get/
	
Get details of max delivery or creative boost sessions.
	
Ads Management > GMV MAX > Session

-
	
/campaign/gmv_max/session/delete/
	
Delete a max delivery or creative boost session.
	
Ads Management > GMV MAX > Session

-
	
/campaign/gmv_max/creative/update/
	
Remove or add back creatives in a GMV Max Campaign
	
Ads Management > GMV MAX > Identity And Video

-
	
/gmv_max/store/list/
	
Get TikTok Shops for GMV Max Campaigns.
	
Ads Management > GMV MAX > Store Management

-
	
/gmv_max/store/shop_ad_usage_check/
	
Check the availability of a TikTok Shop for Product GMV Max Campaigns.
	
Ads Management > GMV MAX > Store Management

-
	
/gmv_max/identity/get/
	
Get identities for GMV Max Campaigns.
	
Ads Management > GMV MAX > Identity And Video

-
	
/gmv_max/occupied_custom_shop_ads/list/
	
Check the occupancy of identities or products in Shopping Ads
	
Ads Management > GMV MAX > Store Management

-
	
/gmv_max/video/get/
	
Get posts for a Product GMV Max Campaign.
	
Ads Management > GMV MAX > Identity And Video

-
	
/gmv_max/custom_anchor_video_list/get/
	
Get details of videos in customized posts.
	
Ads Management > GMV MAX > Identity And Video

-
	
/gmv_max/creation/custom_anchor_video_list/create/
	
Create shop-level customized TikTok posts.
	
Ads Management > GMV MAX > custom anchor

-
	
/gmv_max/creation/custom_anchor_video_list/get/
	
Get customized TikTok posts.
	
Ads Management > GMV MAX > custom anchor

-
	
/gmv_max/creation/custom_anchor_video_list/delete/
	
Delete customized TikTok posts.
	
Ads Management > GMV MAX > custom anchor

-
	
/gmv_max/creation/shop_video/video_anchors/
	
Get product linkage details of videos in customized posts.
	
Ads Management > GMV MAX > custom anchor

-
	
/gmv_max/exclusive_authorization/get/
	
Get the TikTok Shop exclusive authorization status of an ad account.
	
Ads Management > GMV MAX > Exclusive Authorization

-
	
/gmv_max/exclusive_authorization/create/
	
Grant an ad account exclusive authorization for a TikTok Shop.
	
Ads Management > GMV MAX > Exclusive Authorization

-
	
/gmv_max/report/get/
	
Run a GMV Max Campaign report.
	
Reporting > GMV MAX Report

Identity
	
-
	
-
	
-

-
	
/identity/create/
	
Create an identity.
	
Creative Management > TikTok Posts Management > Create Identity

-
	
/identity/delete/
	
Delete an identity.
	
Creative Management > TikTok Posts Management > Delete Identity

-
	
/identity/get/
	
Get the identity list.
	
Creative Management > TikTok Posts Management > Query Identity

-
	
/identity/info/
	
Get info about an identity.
	
Creative Management > TikTok Posts Management > Query Identity

-
	
/identity/video/get/
	
Get videos under an identity.
	
Creative Management > TikTok Posts Management > Query Identity

-
	
/identity/live/get/
	
Get live videos under an identity.
	
Creative Management > TikTok Posts Management > Query Identity

-
	
/identity/music/authorization/
	
Get music authorization info of a video.
	
Creative Management > TikTok Posts Management > Query Identity

-
	
/identity/video/info/
	
Get info about TikTok posts.
	
Creative Management > TikTok Posts Management > Query Identity

Images
	
-
	
-
	
-

-
	
/file/image/ad/upload/
	
Upload an image to the creative repository.
	
Creative Management > Image Management > Create and Update Images

-
	
/file/image/ad/update/
	
Update image name.
	
Creative Management > Image Management > Create and Update Images

-
	
/file/image/ad/info/
	
Get image information.
	
Creative Management > Image Management > Read Image Library

-
	
/file/image/ad/search/
	
Search for image creative in an advertising account's material library.
	
Creative Management > Image Management >Read Image Library

Leads
	
-
	
-
	
-

-
	
/page/lead/mock/create/
	
Create test lead.
	
Lead Management > Test Leads

-
	
/page/lead/mock/get/
	
Get test leads.
	
Lead Management > Test Leads

-
	
/page/lead/mock/delete/
	
Delete test lead.
	
Lead Management > Test Leads

-
	
/page/lead/task/
	
Create lead download task.
	
Lead Management > Test Leads

-
	
/page/lead/task/download/
	
Download the lead data after the task completes.
	
Lead Management > Test Leads

-
	
/page/library/get/
	
Get form libraries.
	
Creative Management > Instant Page Management

-
	
/page/library/transfer/
	
Migrate leads to Business Center.
	
-

-
	
/page/field/get/
	
You can use this endpoint to get the fields of an instant page.
	
Lead Management > Test Leads

-
	
/lead/field/get/
	
Get fields of an Instant Form or direct message leads.
	
Lead Management > Leads Retrieval

-
	
/lead/get/
	
Get an Instant Form lead or a direct message lead.
	
Lead Management > Leads Retrieval

Media Mix Modeling
	
-
	
-
	
-

-
	
/mmm/api/create/
	
Create an MMM data request.
	
Reporting > MMM Data Report

-
	
/mmm/api/check/
	
Check the status of an MMM data request.
	
Reporting > MMM Data Report

-
	
/mmm/api/download/
	
Obtain the download URL for MMM data.
	
Reporting > MMM Data Report

-
	
/mmm/api/history/
	
Get the MMM data request history.
	
Reporting > MMM Data Report

MCP Authorization
	
-
	
-
	
-

-
	
/open_mcp/{server}/oauth/.well-known/openid-configuration/
	
Get authorization server metadata.
	
No permission needed

-
	
/.well-known/oauth-protected-resource/open_mcp/{server}/
	
Discover authorization servers.
	
No permission needed

-
	
/open_mcp/{server}/oauth/register/
	
Register a client application.
	
No permission needed

-
	
/portal/mcp-tt4b-authorize/
	
Request user authorization.
	
No permission needed

-
	
/open_mcp/{server}/oauth/token/
	
Exchange an MCP authorization code for tokens.
	
No permission needed

-
	
/open_mcp/{server}/oauth/token/
	
Refresh an MCP access token.
	
No permission needed

-
	
/open_mcp/{server}/oauth/revoke/
	
Revoke an MCP token.
	
No permission needed

-
	
/open_mcp/{server}/
	
Use MCP tools.
	
No permission needed

Mentions
	
-
	
-
	
-

-
	
/business/mention/video/list/
	
Get top 1000 mentioned posts.
	
Mentions > Content

-
	
/business/mention/video/get/
	
Get the details of a mentioned post from mentions webhook.
	
Mentions > Content

-
	
/business/mention/top_word/list/
	
Get frequent hashtags used in top 1000 mentioned posts.
	
Mentions > Content

-
	
/business/mention/top_hashtag/list/
	
Get frequent keywords used in top 1000 mentioned posts.
	
Mentions > Content

-
	
/business/mention/hashtag/video/list/
	
Get mention content for top 1000 brand hashtag posts.
	
Mentions > Content

-
	
/business/mention/hashtag/verify/list/
	
Get valid brand mention hashtags for a Business Account.
	
Mentions > Content

-
	
/business/mention/hashtag/add/
	
Enable brand hashtags for a Business Account.
	
Mentions > Content

-
	
/business/mention/hashtag/manage/list/
	
Get all enabled brand hashtags for a Business Account.
	
Mentions > Content

-
	
/business/mention/hashtag/remove/
	
Delete an enabled brand hashtag for a Business Account.
	
Mentions > Content

-
	
/business/mention/comment/list/
	
Get top 1000 comment mentions on posts.
	
Mentions > Comment

-
	
/business/mention/comment/get/
	
Get the details of a comment mention from webhooks.
	
Mentions > Comment

Music
	
-
	
-
	
-

-
	
/file/music/upload/
	
Upload music.
	
Creative Management > Music management > Upload music file

-
	
/file/music/get/
	
Get music list.
	
Creative Management > Music management > Read music library

Negative Keywords
	
-
	
-
	
-

-
	
/search_ad/negative_keyword/get/
	
Get negative keywords.
	
Ads Management > Search Ads > Negative Keywords

-
	
/search_ad/negative_keyword/add/
	
Create negative keywords.
	
Ads Management > Search Ads > Negative Keywords

-
	
/search_ad/negative_keyword/update/
	
Update a negative keyword.
	
Ads Management > Search Ads > Negative Keywords

-
	
/search_ad/negative_keyword/delete/
	
Delete negative keywords.
	
Ads Management > Search Ads > Negative Keywords

-
	
/search_ad/negative_keyword/download/
	
Download negative keywords.
	
Ads Management > Search Ads > Negative Keywords

Page
	
-
	
-
	
-

-
	
/page/get/
	
Get the page ID.
	
Creative Management > Instant Page Management > Instant Page Management

-
	
/oauth2/access_token/tip_sdk/create/
	
Create a TIP Editor SDK access token.
	
No permission needed.

-
	
/oauth2/access_token/tip_sdk/validate/
	
Validate a TIP Editor SDK access token.
	
No permission needed.

-
	
/oauth2/access_token/tip_sdk/renew/
	
Renew a TIP Editor SDK access token.
	
No permission needed.

Pangle
	
-
	
-
	
-

-
	
/pangle_block_list/get/
	
Get Pangle block list.
	
Ad Account Management > Pangle Block List Management > Pangle Block List Management

-
	
/pangle_block_list/update/
	
Update Pangle block list.
	
Ad Account Management > Pangle Block List Management > Pangle Block List Management

-
	
/pangle_audience_package/get/
	
Get the audience for Pangle placement.
	
Ad Account Management > Pangle Audience Packages > Pangle Audience Packages

Playable ads
	
-
	
-
	
-

-
	
/playable/upload/
	
You can use this endpoint to upload Playable Ad contents.
	
Creative Management > Playable Ads > Create/Manage Playable Ads

-
	
/playable/validate/
	
Check the status of the playable.
	
Creative Management > Playable Ads > Read Playable Ads

-
	
/playable/save/
	
Use this endpoint to save a playable.
	
Creative Management > Playable Ads > Create/Manage Playable Ads

-
	
/playable/get/
	
Use this endpoint to get a list of playables.
	
Creative Management > Playable Ads > Read Playable Ads

-
	
/playable/delete/
	
Delete a playable ad.
	
Creative Management > Playable Ads > Create/Manage Playable Ads

Reach & Frequency
	
-
	
-
	
-

-
	
/rf/inventory/estimate/
	
Get inventory estimates.
	
Reach & Frequency > Inventory and Orders

-
	
/adgroup/rf/create/
	
Create R&F ad group.
	
Reach & Frequency > Create and Update Ad Groups

-
	
/adgroup/rf/update/
	
Update R&F ad group.
	
Reach & Frequency > Create and Update Ad Groups

-
	
/rf/order/cancel/
	
Cancel R&F ad order.
	
Reach & Frequency > Inventory and Orders

-
	
/adgroup/rf/estimated/info/
	
Get estimated daily cost and frequency distribution.
	
Reach & Frequency > Create and Update Ad Groups

-
	
/rf/contract/query/
	
Validate R&F contracts.
	
Reach & Frequency > Tools

-
	
/rf/delivery/timezone/
	
Get time zones based on country or region codes.
	
Reach & Frequency > Tools

Reporting
	
-
	
-
	
-

-
	
/report/integrated/get/
	
Run an integrated report to get data about ad spend and performance, audience data, playable ads, or DSA. This is a GET request to get synchronous reporting data only.
	
Reporting > Consolidated Report

-
	
/report/task/create/
	
Create a standard (synchronous) report and an asynchrounous report.
	
Reporting > Consolidated Report

-
	
/report/task/check/
	
Check the status of an asynchronous report task.
	
Reporting > Consolidated Report

-
	
/report/task/download/
	
Download the data of an asynchronous report.
	
Reporting > Consolidated Report

-
	
/report/task/cancel/
	
Cancel an asynchronous report task
	
Reporting > Consolidated Report

Showcase
	
-
	
-
	
-

-
	
/showcase/identity/get/
	
Get identities with Showcase permission under an ad account.
	
Ads Management > Ad > Read Ads

-
	
/showcase/region/get/
	
Get the available regions for a Showcase via identity.
	
Ads Management > Ad > Read Ads

-
	
/showcase/product/get/
	
Get the available products in a Showcase.
	
Ads Management > Ad > Read Ads

Smart Creative
	
-
	
-
	
-

-
	
/ad/aco/create/
	
Create Smart Creative ads.
	
Ads Management > Ad > Create and Update Ads

-
	
/ad/aco/get/
	
Get Smart Creative materials.
	
Ads Management > Ad > Read Ads

-
	
/ad/aco/update/
	
Update Smart Creative materials.
	
Ads Management > Ad > Create and Update Ads

-
	
/ad/aco/material_status/update/
	
Update the statuses of Smart Creative materials.
	
Ads Management > Ad > Create and Update Ads

(To be deprecated) Smart+
	
-
	
-
	
-

-
	
/campaign/spc/quota/get/to-be-deprecated
	
Get the dynamic quota on active Smart+ Campaigns.
	
Ads Management > Campaign > Read Campaigns

-
	
/campaign/spc/create/to-be-deprecated
	
Create a Smart+ Campaign.
	
Ads Management > Campaign > Create and Update Campaigns

-
	
/campaign/spc/update/to-be-deprecated
	
Update a Smart+ Campaign.
	
Ads Management > Campaign > Create and Update Campaigns

-
	
/campaign/spc/get/to-be-deprecated
	
Get information of Smart+ Campaigns.
	
Ads Management > Campaign > Read Campaigns

-
	
/campaign/spc/material_status/update/to-be-deprecated
	
Disable or enable creatives in a Smart+ Campaign.
	
Ads Management > Campaign > Create and Update Campaigns

-
	
/campaign/spc/report/get/to-be-deprecated
	
Run a Smart+ Campaign report.
	
Reporting > Consolidated Report

Upgraded Smart+
	
-
	
-
	
-

-
	
/smart_plus/campaign/get/
	
Get Upgraded Smart+ Campaigns.
	
Ads Management > Read Campaigns

-
	
/smart_plus/campaign/create/
	
Create an Upgraded Smart+ Campaign.
	
Ads Management > Create and Update Campaigns

-
	
/smart_plus/campaign/update/
	
Update an Upgraded Smart+ Campaign.
	
Ads Management > Create and Update Campaigns

-
	
/smart_plus/campaign/status/update/
	
Update the operation statuses of Upgraded Smart+ Campaigns.
	
Ads Management > Create and Update Campaigns

-
	
/smart_plus/campaign/copy/task/create/
	
Create an asynchronous copy task for an Upgraded Smart+ Campaign.
	
Ads Management Create and Update Campaigns

-
	
/smart_plus/campaign/copy/task/check/
	
Get the results of an asynchronous copy task for an Upgraded Smart+ Campaign.
	
Ads Management > Read Campaigns

-
	
/smart_plus/adgroup/get/
	
Get Upgraded Smart+ Ad Groups.
	
Ads Management > Ad Group > Read Ad Groups

-
	
/smart_plus/adgroup/create/
	
Create an Upgraded Smart+ Ad Group.
	
Ads Management > Ad Group > Create and Update Ad Groups

-
	
/smart_plus/adgroup/update/
	
Update an Upgraded Smart+ Ad Group.
	
Ads Management > Ad Group > Create and Update Ad Groups

-
	
/smart_plus/adgroup/status/update/
	
Update the operation statuses of Upgraded Smart+ Ad Groups.
	
Ads Management > Ad Group > Create and Update Ad Groups

-
	
/smart_plus/adgroup/budget/update/
	
Update the budgets of Upgraded Smart+ Ad Groups.
	
Ads Management > Ad Group > Create and Update Ad Groups

-
	
/smart_plus/ad/get/
	
Get Upgraded Smart+ Ads.
	
Ads Management > Ad > Read Ads

-
	
/smart_plus/ad/create/
	
Create an Upgraded Smart+ Ad.
	
Ads Management > Ad > Create and Update Ads

-
	
/smart_plus/ad/update/
	
Update an Upgraded Smart+ Ad.
	
Ads Management > Ad > Create and Update Ads

-
	
/smart_plus/ad/status/update/
	
Update the operation statuses of Upgraded Smart+ Ads.
	
Ads Management > Ad > Create and Update Ads

-
	
/smart_plus/ad/material_status/update/
	
Disable or enable creatives in an Upgraded Smart+ Ad.
	
Ads Management > Ad > Create and Update Ads

-
	
/smart_plus/ad/preview/
	
Preview Upgraded Smart+ Ads.
	
Creative Management > Creative tool

-
	
/smart_plus/ad/review_info/
	
Get the review info of Upgraded Smart+ Ads.
	
Ads Management > Ad > Read Ads

-
	
/smart_plus/material/review_info/
	
Get the review info of Upgraded Smart+ Ad creatives.
	
Ads Management > Ad > Read Ads

-
	
/smart_plus/ad/appeal/
	
Appeal rejection of an Upgraded Smart+ Ad.
	
Ads Management > Ad > Create and Update Ads

-
	
/smart_plus/material_report/overview/
	
Run an Upgraded Smart+ Creative Overview Report.
	
Reporting > Upgraded Smart+ Report

-
	
/smart_plus/material_report/breakdown/
	
Run an Upgraded Smart+ Creative Breakdown Report.
	
Reporting > Upgraded Smart+ Report

Spark Ads
	
-
	
-
	
-

-
	
/tt_video/info/
	
Get Spark Ad post.
	
Creative Management > TikTok Posts Management > Query TikTok Posts

-
	
/tt_video/authorize/
	
Apply authorization code.
	
Creative Management > TikTok Posts Management > Authorize TikTok Posts

-
	
/tt_video/list/
	
Get Spark Ad posts.
	
Creative Management > TikTok Posts Management > Authorize TikTok Posts

-
	
/tt_video/unbind/
	
Unbind Spark Ad post.
	
Creative Management > TikTok Posts Management > Authorize TikTok Posts

Spark Ads Recommendation
	
-
	
-
	
-

-
	
/business/video/recommend/
	
Get Spark Ads video recommendations for a Business Account.
	
Business Recommendation > Video Spark Ads Recommendation

-
	
/spark_ad/recommend/
	
Get Spark Ads video recommendations for a TTO account.
	
Business Recommendation > Creator Spark Ads Recommendation

-
	
/business/spark_ad/create/
	
Create a campaign, an ad group, and a Spark Ad in one step.
	
Ads Management > Campaign > Create and Update Campaigns

Split test
	
-
	
-
	
-

-
	
/split_test/create/
	
Create a split test.
	
Ads Management >Split Test > Split Test

-
	
/split_test/update/
	
Update split test time.
	
Ads Management >Split Test > Split Test

-
	
/split_test/end/
	
End a split test.
	
Ads Management >Split Test > Split Test

-
	
/split_test/result/get/
	
Get split test results.
	
Ads Management >Split Test > Split Test

-
	
/split_test/promote/
	
Run the winning ad group.
	
Ads Management >Split Test > Split Test

Subscription
	
-
	
-
	
No permission needed.

-
	
/subscription/subscribe/
	
Create a subscription.
	
-

-
	
/subscription/get/
	
Get subscriptions.
	
-

-
	
/subscription/unsubscribe/
	
Cancel subscription.
	
-

Terms
	
-
	
-
	
-

-
	
/term/get/
	
Get agreements (terms) that you need to sign before you can use certain features.
	
Ad Account Management > Terms and Agreements > Terms and Agreements

-
	
/term/confirm/
	
Use this endpoint to sign the agreement for the Lead Generation Ads feature.
	
Ad Account Management > Terms and Agreements > Terms and Agreements

-
	
/term/check/
	
This interface confirms the signing status of an agreement.
	
Ad Account Management > Terms and Agreements > Terms and Agreements

TikTok One
	
-
	
-
	
-

-
	
/tt_user/oauth2/token/
	
Get, renew or revoke a Creator access token.
	
No permission needed.

-
	
/tt_user/token_info/get/
	
Obtain the authorized Creator permissions.
	
No permission needed.

-
	
/tto/oauth2/tcm/
	
Get authorized TTO Creator Marketplace accounts.
	
TikTok One > Read TTO Account

-
	
/tto/tcm/creator/status/get/
	
Check TTO Creator status.
	
TikTok One > Get Creators Onboarding Status and Invite Creators to TTO

-
	
/tto/oauth2/info/
	
Get the details of a TTO Creator Marketplace account.
	
TikTok One > Read TTO Account

-
	
/tto/creator/authorized/
	
Get Authorized Account Insights.
	
TikTok Creator > Creator User > Get Creator Insights

-
	
/tto/creator/authorized/video/list/
	
Get Authorized Media Insights.
	
TikTok Creator > Creator Media > Get Creator Media

-
	
/tto/tcm/creator/public/
	
Get TTO Public Account Insights.
	
TikTok Creator > Creator User > Get Creator Insights

-
	
/tto/tcm/creator/public/video/list/
	
Get TTO Public Media Insights.
	
TikTok Creator > Creator Media > Get Creator Media

-
	
/tto/tcm/category/label/
	
Get TTO creator ranking or search labels.
	
TikTok One > Read TTO Account

-
	
/tto/tcm/rank/
	
Get top TTO creator rankings.
	
TikTok One > Read TTO Account

-
	
/tto/tcm/creator/discover/
	
Discover TTO creators.
	
TikTok One > Read TTO Account

-
	
/tto/tcm/brand/profile/create/
	
Create a Brand Profile for your TTO account.
	
TikTok One > Create and Update TTO Account

-
	
/tto/tcm/brand/profile/get/
	
Get the Brand Profiles for your TTO account.
	
TikTok One > Read TTO Account

-
	
/tto/tcm/campaign/create/
	
Create or update a TTO Creator Marketplace campaign.
	
TikTok One > Create and Update TTO Account

-
	
/tto/tcm/campaign/update/
	
Update a TTO Creator Marketplace campaign.
	
TikTok One > Create and Update TTO Account

-
	
/tto/tcm/campaign/
	
Get TTO Creator Marketplace campaigns.
	
TikTok One > Read TTO Account

-
	
/tto/tcm/campaign/link/
	
Send or revoke a TTO video linking request.
	
TikTok One > Create and Update TTO Account

-
	
/tto/tcm/campaign/link/status/
	
Get TTO video linking requests.
	
TikTok One > Read TTO Account

-
	
/tto/tcm/report/
	
Report on TTO Creator Marketplace videos.
	
TikTok One > Read TTO Account

-
	
/tcm/tt_video/apply/
	
Apply for Spark Ads authorization for a given order.
	
TikTok One > Send Spark Ads Invitation to Creators and Get the Status

-
	
/tcm/tt_video/status/
	
Get the authorization status of a given order.
	
TikTok One > Send Spark Ads Invitation to Creators and Get the Status

-
	
/tto/tcm/anchor/create/
	
Create a webpage anchor.
	
TikTok One > Create and Update TTO Account

-
	
/tto/tcm/anchor/get/
	
Get webpage anchors.
	
TikTok One > Read TTO Account

-
	
/tto/tcm/anchor/delete/
	
Delete a draft anchor.
	
TikTok One > Create and Update TTO Account

-
	
/tto/creator/campaign/join/
	
Join a TTO Creator Marketplace campaign as a creator.
	
TikTok Creator > Creator Campaign > Update Creator TTO Campaign

-
	
/tto/creator/campaign/video/link/
	
Link a video to a TTO Creator Marketplace campaign as a creator.
	
TikTok Creator > Creator Campaign > Update Creator TTO Campaign

-
	
/tto/creator/link/request/get/
	
Get TTO video linking requests as a creator.
	
TikTok Creator > Creator Campaign > Update Creator TTO Campaign

-
	
/tto/creator/link/request/confirm/
	
Approve or reject a TTO video linking request as a creator.
	
TikTok Creator > Creator Campaign > Update Creator TTO Campaign

TikTok Store
	
-
	
-

-
	
/store/list/
	
Get available stores under an ad account.
	
Onsite Commerce Store

-
	
/store/product/get/
	
Get products within a store.
	
Onsite Commerce Store

Tools
	
-
	
-
	
-

-
	
/tool/targeting/search/
	
Search for location targeting tags.
	
No permission needed.

-
	
/tool/targeting/info/
	
Obtain details about location targeting tags by ID.
	
No permission needed.

-
	
/tool/region/
	
Get available locations based on different settings.
	
No permission needed.

-
	
/search/region/
	
Get available locations based on advertiser ID.
	
No permission needed.

-
	
/tool/language/
	
Get languages.
	
No permission needed.

-
	
/targeting/search/
	
Search for or list targeting categories and hashtags for interests and behaviors.
	
No permission needed.

-
	
/tool/interest_category/
	
Get general interest categories.
	
No permission needed.

-
	
/tool/interest_keyword/recommend/
	
Search for additional interest categories.
	
No permission needed.

-
	
/tool/interest_keyword/get/
	
Get additional interest categories by ID.
	
No permission needed.

-
	
/tool/action_category/
	
Get action categories.
	
No permission needed.

-
	
/tool/hashtag/recommend/
	
Search for targeting hashtags.
	
No permission needed.

-
	
/tool/hashtag/get/
	
Get targeting hashtags by ID.
	
No permission needed.

-
	
/tool/targeting_category/recommend/
	
Get recommended interest and action categories based on historical performance data in the same industries.
	
No permission needed.

-
	
/tool/search_keyword/recommend/
	
Get recommended search keywords.
	
No permission needed.

-
	
/tool/diagnosis/search/health/
	
Get Search Ads Campaign Health diagnoses.
	
No permission needed.

-
	
/tool/search_keyword/keyword_idea/
	
Discover new keywords.
	
No permission needed.

-
	
/tool/os_version/
	
Get OS versions.
	
No permission needed.

-
	
/tool/device_model/
	
Get device models.
	
No permission needed.

-
	
/tool/carrier/
	
Get carriers.
	
No permission needed.

-
	
/tool/targeting/list/
	
Get internet service providers.
	
No permission needed.

-
	
/tool/contextual_tag/get/
	
Get available contextual tags.
	
No permission needed.

-
	
/tool/contextual_tag/info/
	
Get info of contextual tags.
	
No permission needed.

-
	
/tool/content_exclusion/get/
	
Get available content exclusion categories.
	
No permission needed.

-
	
/tool/content_exclusion/info/
	
Get info of content exclusion categories.
	
No permission needed.

-
	
/tool/bid/recommend/
	
Get a suggested bid value for your ad group based on basic campaign and ad group settings like objectives, conversion events, and locations.
	
No permission needed.

-
	
/tool/vbo_status/
	
Check Value-Based Optimization eligibility.
	
No permission needed.

-
	
/tool/brand_safety/partner/authorize/status/
	
Get Brand Safety partner authorization status.
	
No permission needed.

-
	
/tool/url_validate/
	
Get the verification results of a URL.
	
No permission needed.

-
	
/tool/phone_region_code/
	
Get region calling codes and region codes for phone numbers.
	
No permission needed.

-
	
/tool/timezone/
	
Get time zones.
	
No permission needed.

-
	
/tool/open_url/
	
Get TikTok in-app links.
	
No permission needed.

-
	
/campaign_label/get/
	
Get the campaign labels of an ad account.
	
Ads Management > Campaign Label (Management) > Read Campaign Labels

-
	
/minis/get/
	
Get the TikTok Minis within an ad account.
	
Minis Management > Read > Get Minis

-
	
/identity/native_series/get/
	
Get the available TikTok Series within an ad account.
	
Creative management > TikTok Posts Management > Query identity

-
	
/tool/available/attribution_source/
	
Get available attribution sources and data sources for an app.
	
No permission needed.

-
	
/report/bid_protection/status/get/
	
Get bid protection statuses.
	
Ad Account Management > bid protection report

-
	
/report/bid_protection/detail/get/
	
Get bid protection history.
	
Ad Account Management > bid protection report

User
	
-
	
-
	
No permission needed.

-
	
/user/info/
	
Get authorized user by access token.
	
-

Verification
	
-
	
-
	
-

-
	
/account/verification/filetype/
	
Get available verification document types for a region.
	
Business Verification > Read

-
	
/account/verification/upload/
	
Upload verification documents.
	
Business Verification > Write

-
	
/account/verification/submit/
	
Submit a verification request for your account.
	
Business Verification > Write

-
	
/account/verification/status/
	
Check the verification status of your account.
	
Business Verification > Read

Videos
	
-
	
-
	
-

-
	
/file/video/ad/upload/
	
Upload a video.
	
Creative Management > Video Management > Create and Update Videos

-
	
/file/video/ad/update/
	
Update video name.
	
Creative Management > Video Management > Create and Update Videos

-
	
/file/video/ad/info/
	
Get video information.
	
Creative Management > Video Management > Read Video Library

-
	
/file/video/ad/search/
	
Search for a video.
	
Creative Management > Video Management > Read Video Library

-
	
/file/video/suggestcover/
	
Get suggested thumbnails.
	
Creative Management > Video Management > Generate Thumbnails for Videos

Welcome Messages
	
-
	
-
	
-

-
	
/creative/auto_message/create/
	
Create a welcome message within an ad account.
	
Creative Management > TikTok Message Management

-
	
/creative/auto_message/get/
	
Get welcome messages within an ad account.
	
Creative Management > TikTok Message Management
Was the information helpful?
Yes
No