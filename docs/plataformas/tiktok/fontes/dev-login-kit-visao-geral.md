---
titulo: "Login Kit Overview — o OAuth 2.0 do TikTok"
url: https://developers.tiktok.com/doc/login-kit-overview
capturado_em: 2026-09-12
hash: 962a14d5f1821566
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Last updated August 19, 2026
Overview

Integrating with our Login Kit enables users to quickly and securely sign into your app with their TikTok account. LoginKit is available on iOS, Android, Desktop and Web. Login Kit is based on OAuth 2.0 for user authorization and API authentication.

After successfully completing authentication with TikTok, your application will be able to request access to basic user data such as display name and avatar. For requesting access to additional data from users, pre-approval will be required in your TikTok app on developers.tiktok.com.

Once users have approved your access, you can view basic user data with our Display APIs. Learn more here.

How TikTok Login Kit works

Login Kit is TikTok's OAuth 2.0 implementation. Regardless of platform, the goal is the same: get the user to authorize your app on TikTok, receive an authorization code, then exchange that code server-side for an access token (plus a refresh token). The access token is what lets you call Display API and other endpoints on the user's behalf.

The differences between web, desktop, iOS, and Android are mostly in how you kick off the authorization request and how the code comes back to you. The token exchange at the end is shared.

General workflow

Each platform (web, desktop, iOS, and Android) shares the same skeletal workflow. The authorization flow is where each platform mainly diverges.

Register your app on developers.tiktok.com and obtain a client key and client secret from your app page.
Add the Login Kit product: Configure at least one redirect URI in the Login Kit product settings.
Request scopes: user.info.basic (avatar + display name) is the baseline. Anything beyond that requires pre-approval in your app configuration. Users can grant a subset of what you request.
Send the user through TikTok's authorization flow: TikTok prompts them to log in / sign up, then asks for consent to your requested scopes. (This is the step that varies most by platform.)
Receive the authorization response: This contains a code (and state/error fields). Validate anti-forgery state where applicable.
Exchange the code for tokens server-side: Send the code (plus code_verifier where PKCE applies) to your backend, which calls TikTok's token endpoint to get the access_token and refresh_token. Store both on the server, and handle refresh before expiry. All current platforms point to the same User Access Token Management API.

Two shared security principles run through everything: client secret and refresh token must live server-side only, and you must protect against request forgery.

Platform differences

The authorization workflow varies by platform:

Web: The user clicks a "Continue with TikTok" link that hits your server endpoint. Your server builds a redirect to https://www.tiktok.com/v2/auth/authorize/ with client_key, scope, redirect_uri, state, and response_type=code. You generate a random state token and store it (e.g. in a cookie) to defend against CSRF. TikTok handles login/consent, then redirects back to your redirect_uri with code and state appended. You verify state matches, then exchange the code. Redirect URIs here must be https, absolute, static (no query params or fragments), max 10 URIs.
Desktop: Same as web but with two additions. First, redirect URI rules are different: they must use localhost or the loopback IP 127.0.0.1, must include a port (wildcard * port allowed), and http is permitted. Second, desktop requires PKCE. Before redirecting you generate a code_verifier (43–128 char random string) and derive a code_challenge from it using hex-encoded SHA256. You add code_challenge and code_challenge_method=S256 to the authorize URL. A new verifier is generated per authorization request. The code_verifier gets sent along with the code at exchange time to prove you're the same client.
iOS: You use the TikTok OpenSDK rather than a raw redirect. Prerequisites: complete the iOS Quickstart, add Login Kit under Products, and register a redirect URI that is an Apple universal link (https scheme, with associated domains configured on your app). In code you import TikTokOpenAuthSDK, build a TikTokAuthRequest with your scopes and redirectURI, then call .send { response in ... }. The response callback gives you a TikTokAuthResponse with .code on success or error fields on failure. You then upload TikTokAuthResponse.code plus the request's pkce.codeVerifier (the SDK handles PKCE for you) to your server for the token exchange.
Android: Also OpenSDK-based, shown in Kotlin. Prerequisites: complete the Android Quickstart and add Login Kit. You create an AuthApi, build an AuthRequest with clientKey, scope, redirectUri (must be https), and a codeVerifier you generate via PKCEUtils, then call authApi.authorize(request, authMethod). authMethod lets you choose the flow: AuthMethod.TikTokApp (authorize through the installed TikTok app) or AuthMethod.ChromeTab (browser fallback). The response comes back to an activity via an intent filter (VIEW action, DEFAULT + BROWSABLE categories, matching your redirect scheme/host). You parse it with authApi.getAuthResponseFromIntent(...) to get authCode and grantedPermissions, then send code + code_verifier to your server.
Integration notes
The token endpoint is the same regardless of platform as long as you're on the current stack. If you registered a redirect URI and use the v2/auth/authorize/ URL (all four platforms above do), you use the new-generation User Access Token Management API. Only legacy clients still on the old auth/authorize/ endpoint or old mobile SDK use the legacy token guide.
PKCE applies to desktop, iOS, and Android but not web. Web relies on the state token for request-forgery protection and keeps the client secret server-side; the confidential-client model makes PKCE unnecessary there. The three PKCE platforms are "public" clients where a secret can't be safely embedded, so the code_verifier/challenge pair does that job instead.
There's also a QR code authorization flow (the seventh doc you listed) — it's a variant mainly for desktop/TV-style contexts where the user scans a code with their phone to authorize, rather than a redirect.
The token exchange and refresh logic is identical enough across platforms that it's worth building that server-side piece once as a shared service, then treating the four client flows as thin front-ends that all funnel a code (+ code_verifier where applicable) into it.
On this page
How TikTok Login Kit works
General workflow
Platform differences
Integration notes