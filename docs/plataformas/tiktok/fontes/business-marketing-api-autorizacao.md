---
titulo: "Marketing API — Authorization (fluxo de autorização da conta de anunciante do cliente)"
url: https://business-api.tiktok.com/portal/docs/authorization/v1.3
capturado_em: 2026-09-07
hash: 178c3d19692e8cb8
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
Overview
Guides
Get started
Access to Business Messaging API
Authorization
Authentication
Manage direct messages for a Business Account
Manage automatic messages for a Business Account
Unlock conversations
Return codes
API Reference
API Reference
API Playground
API Service Status Page
Appendix
SDK
Prerequisites
Workflow
Step 1: Share authorization URL with the business
Step 2: Business grants authorization
Next step
Authorization

Before you use the Business Messaging API, you (the developer) need to obtain authorization from the business to manage their TikTok Business Accounts.

Prerequisites
You've created a TikTok For Business account. For details, see Create a TikTok For Business account.
You've registered as a developer. For details, see Register as developer.
You've created a developer app. For details, see Create developer app.
You've uploaded an App logo that users will see during authorization to ensure a smooth authorization process.
If you haven't uploaded an App logo image, you'll need to upload a JPG, JPEG, or PNG image that's no larger than 512 * 512 pixels in size.
If you forget to upload the logo image, users will see an error page when they try to authorize the app. Here's an example of what the error page might look like:
Your developer app’s TikTok account holder redirect URL is properly configured to receive the authorization code during the authorization process. For details, see TikTok account holder redirect URL configuration.
You have obtained access to Business Messaging API.
Workflow
Step 1: Share authorization URL with the business

Share the TikTok account holder authorization URL with the business (the TikTok Business Account user). Ensure that you have selected the Business Messaging permission for your developer app.

To find the URL, navigate to My Apps > App Detail > Basic Information > TikTok account holder authorization URL.

Note
For enhanced security, you can include a unique state query parameter in the authorization URL to mitigate CSRF attacks. This parameter will be echoed back to your application as a query parameter upon user redirect.

If you cannot find the TikTok account holder authorization URL under My Apps > App Detail > Basic Information, navigate to Authorization > Scope of permission. Make sure that you have selected the "TikTok Accounts" permission for your developer App.

Step 2: Business grants authorization

When the business opens the authorization URL, they will be prompted to authorize your developer app. Make sure that the business authorizes the following permissions before you can make Business Messaging API calls on behalf of them:

Send messages or interactions to other accounts on your behalf
Read messages in your inbox (including direct messages)
Read your TikTok account type
Read and manage messages in your inbox (including direct messages)
After clicking Authorize, the business will be redirected to the TikTok account holder redirect URL of your developer app. The redirect URL is specified under My Apps > App Detail > Basic Information > TikTok account holder redirect URLs.
The redirect URL will include a code=<param>, which is the auth_code required to subsequently generate an access token for API access through /tt_user/oauth2/token/.

Note

If the TikTok account user has previously authorized the developer app for the same permissions, the permission scope review and approval page will be skipped. Instead, the TikTok account user will be directly redirected to the redirect URL without auth_code appended.
To disable the automatic redirection mechanism for TikTok account users who have authorized, manually append &disable_auto_auth=1 to the TikTok account holder authorization URL before sharing the URL with the TikTok account user.
For instance, if the original authorization URL is https://www.tiktok.com/v2/auth/authorize?{parameters}, the developer needs to share https://www.tiktok.com/v2/auth/authorize?{parameters}&disable_auto_auth=1.
Next step

Subscribe to Business Messaging Webhook events via Webhooks API

Was the information helpful?
Yes
No