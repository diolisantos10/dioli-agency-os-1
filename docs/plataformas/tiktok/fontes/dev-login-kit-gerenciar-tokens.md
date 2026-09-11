---
titulo: "Manage User Access Tokens with OAuth v2 (troca de code, refresh, revogação)"
url: https://developers.tiktok.com/doc/login-kit-manage-user-access-tokens
capturado_em: 2026-09-11
hash: 1fbfc2ab9c8b87e2
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Last updated August 4, 2026
Manage User Access Tokens

TikTok Login Kit manages the token life cycle, allowing you to integrate login and authentication flows directly in your application. A successful authorization flow grants you refreshable access tokens. Those tokens enable you to perform endpoint access with user permissions.

Authorization scopes

Most endpoints provided by TikTok for Developers require direct consent from TikTok users before you can invoke them. The permissions are granted on a scope level. Users have the rights to only agree to a subset of scopes you requested from them.

The following are some example scopes:

user.info.basic gives read-only access to a user's avatar and display name.
video.list gives read-only access to a user's public TikTok videos.

Learn more about scopes.

Token security

Tokens must be handled with caution. It is recommended that you store and manage all tokens on the server side.

Access token is a user authorization token that can be used to directly access user information in the TikTok ecosystem.
Refresh token is used to renew the access token.
Endpoints for web

If you have already registered a redirect URI for your web app and use https://www.tiktok.com/v2/auth/authorize/ to authorize, please refer to the new generation user access token management API guide.

If you are an existing client, have not registered a redirect URI for your web app and use https://www.tiktok.com/auth/authorize/ to authorize, please refer to the legacy user access token management API guide. To register a redirect URI, go to the Manage apps page of the TikTok for Developers website and migrate to the new endpoints as soon as possible.

Endpoints for mobile

Preferred: If you are using the new Android or iOS TikTok OpenSDK, please refer to the new user access token management guide.

Legacy: If you are using the old Android or iOS TikTok OpenSDK, please refer to the legacy user access token management guide.

Endpoints for desktop

You must register a redirect URI for your desktop app and use https://www.tiktok.com/v2/auth/authorize/ to authorize. Please refer to the new generation user access token management API guide to manage the user access token.

Was this document helpful?
On this page
Authorization scopes
Token security
Endpoints for web
Endpoints for mobile
Endpoints for desktop