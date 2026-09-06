---
titulo: "Accounts API — Authorization (autorização da conta TikTok do cliente e escopos)"
url: https://business-api.tiktok.com/portal/docs/accounts-api-authorization/v1.3
capturado_em: 2026-09-06
hash: d455c1f7852da66c
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
Overview
Accounts API
Overview
Guides
Get started
Authorization
FAQs
Authentication
Rate limits
Manage URL properties
Manage comments on owned TikTok videos
Manage TikTok post ad authorization
Accounts Insights data latency
Webhooks
FAQs
API reference
Mentions API
TikTok One API
Discovery API
Spark Ads Recommendation API
Business Messaging API
API Reference
API Playground
API Service Status Page
Appendix
SDK
Prerequisites
Steps
Authorization

Before you use the Accounts API, you (the developer) need to first get authorization from the business to manage their accounts.

Prerequisites
You've created a TikTok For Business account. For details, see Create a TikTok For Business account.
You've registered as a developer. For details, see Register as developer.
You've created a developer app with the required scope of permissions which includes “TikTok Accounts” for Accounts API endpoints access. For details, see Create developer app.
Steps
The developer shares the authorization URL with the TikTok account user. The URL can be found by navigating to My Apps > App Detail > Basic Information > TikTok account holder authorization URL.

Note
By default, if the TikTok account user has previously authorized the developer app for the same permissions, the permission scope review and approval page in Step 2 will be skipped. Instead, the TikTok account user will be directly redirected to the redirect URL. To disable the automatic redirection mechanism for TikTok account users who have authorized, the developer needs to manually append &disable_auto_auth=1 to the TikTok account holder authorization URL before sharing the URL with the TikTok account user.

For instance, if the original authorization URL is https://www.tiktok.com/v2/auth/authorize?{parameters}, the developer needs to share https://www.tiktok.com/v2/auth/authorize?{parameters}&disable_auto_auth=1.

To ensure that users can authorize the app without any errors, it's important to upload an App logo image that users will see during the authorization process. If you haven't uploaded an App logo image, you'll need to upload a JPG, JPEG, or PNG image that's no larger than 512 * 512px in size.

If you forget to upload the logo image, users will see an error page when they try to authorize the app. Here's an example of what the error page might look like:

Note that if you cannot find the TikTok account holder authorization URL under My Apps > App Detail > Basic Information , navigate to Authorization > Scope of permission. Make sure that you have selected the "TikTok Accounts" permission for your developer App.

Note
For security reasons, you can add a unique state query parameter to the authorization URL as a mechanism to mitigate CSRF attacks. It will be echoed back to your application as a query parameter upon user redirect.

Formatting rules for redirect URL

Note
You can configure up to 10 TikTok account holder redirect URLs per developer app. Each activated TikTok account holder redirect URL automatically generates a new TikTok account holder authorization URL. The system maintains one active URL at a time, marked in red. When only one TikTok account holder redirect URL exists, it becomes active by default. For multiple redirect URLs, activate a different one by clicking your desired URL.

When defining a TikTok account holder redirect URL for your application, follow these formatting rules to ensure proper functionality:

No.	Rules	Correct example	Bad example

1
	
URLs must be absolute and end with /.
	
https://dev.example.com/auth/callback/
	
https://dev.example.com/auth/callback
missing trailing /
/auth/callback/
missing scheme and domain

2
	
URLs should be static, while parameters are denied and should be ignored.
	
https://dev.example.com/auth/callback/
	
https://dev.example.com/auth/callback/?id=1
contains query parameter ?id=1

3
	
URLs cannot include anchors #.
	
https://dev.example.com/auth/callback/
	
https://dev.example.com/auth/callback/#1
contains anchor #1

4
	
URLs must start with https://.
	
https://dev.example.com/auth/callback/
	
http://dev.example.com/auth/callback/
uses http instead of https

5
	
URLs cannot include ports.
	
https://dev.example.com/auth/callback/
	
https://dev.example.com:3000/auth/callback/
contains port number :3000

6
	
The length of the registered URI should fall within the range of 10 to 512 characters.
	
N/A
	
N/A

Otherwise, you will receive the error message as follows. You can edit your redirect URL accordingly.

Migration instructions for redirect URL

To migrate your TikTok account holder redirect URL, follow these steps:

(1) Modify your redirect URL by removing any query parameters (indicated by the ? symbol) or fragments (indicated by the # symbol) that may be present at the end of the path. Your URL should end with a forward slash (/).

(2) If you remove query parameters from the redirect URL but want to achieve the same effect, use a state parameter in the TikTok account holder authorization URL. This involves encoding the query parameters as a JSON object and including them as the value of the state parameter in the authorization URL. Here are some examples of how to encode query parameters as a state parameter:

Example 1:

Original TikTok account holder redirect URL: https://www.tiktok.com/photo?source=tiktok
Query parameters: ?source=tiktok
Encoded state parameter to be added into the TikTok account holder authorization URL: &state={"source":"tiktok"}

Example 2:

Original URL TikTok account holder redirect URL: https://www.tiktok.com/photo?source=tiktok&platform=web
Query parameters: ?source=tiktok&platform=web
Encoded state parameter to be added into the TikTok account holder authorization URL: &state={"source":"tiktok","platform":"web"}

(3) Once you have received an authorization code in the redirect URL, extract the query parameter values from the state parameter in the TikTok account holder authorization URL. This involves decoding the JSON-encoded string from the state parameter into a dictionary or object, and then accessing the values of specific keys within that dictionary.

Here's an example of how to decode the state parameter in Python:

import json
from urllib.parse import unquote

state_value = '%7B%22source%22%3A%22tiktok%22%7D'
state = unquote(state_value)
state_dict = json.loads(state)
source = state_dict.get('source')
print(state_dict)

# Output: {'source': 'tiktok'}

The TikTok account user reviews and approves the authorization request. The TikTok account user can revoke the authorization at any time from within the TikTok app.

Note that if the TikTok account user is unable to see the permission scope review and approval page and is directed to a different page, it might be due to the automatic redirection mechanism for authorized TikTok account users. To learn about how to disable the automatic redirection mechanism, see the instructions provided in the preceding Step 1.

Once the user authorizes the application for the requested permission scope, they are redirected to the application's specified redirect URL, with an authorization code included as an added query parameter in the URL (along with the state query parameter if initially included). The application's redirect URL is specified under My Apps > App Detail > Basic Information > TikTok account holder redirect URLs.

This authorization code (auth_code) is necessary to subsequently generate an access_token for API access.

Important
auth_code is only valid for 10 minutes and can be used only once. After the auth_code expires, you need to start over and perform the authorization steps again.

Using the authorization code (which was added as a query parameter upon user redirect), the developer can make a request to the /tt_user/oauth2/token/ endpoint to get an Access Token.
Was the information helpful?
Yes
No