---
titulo: "Display API — Overview (/v2/user/info/, /v2/video/list/, /v2/video/query/)"
url: https://developers.tiktok.com/doc/display-api-overview
capturado_em: 2026-09-09
hash: c22758b93f4a42b4
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Last updated August 4, 2026
Overview

The Display API contains a set of HTTP-based APIs that your product can use to display a TikTok creator's videos and their profile information.

Your platform's influencers can display their TikTok profile identities and videos to enrich content, attract more audiences, and enable their followers to view their TikTok videos without leaving your platform.

Components

Display API has three major APIs: /v2/user/info/, /v2/video/list/, and /v2/video/query/.

/v2/user/info/: Get a TikTok user's basic profile information. This includes the user's open_id, avatar_url, display_name, profile_deep_link, and bio_description.

/v2/video/list/: Get the metadata of a TikTok user's recently uploaded videos.

/v2/video/query/: Get the metadata of TikTok a user's videos filtered by video Id.

Permissions
video.list: Read a user's public videos on TikTok.
user.info.basic: Read a user's profile info (open id, avatar, display name, ...).
Example Use Cases
Display User's TikTok Profile

Use the /v2/user/info/ API to get a TikTok user's profile data and then display their TikTok identity. In this example, when a visitor clicks the profile_deep_link, they will be redirected to the creator's profile page on the TikTok app or website.

Display User's Self-Selected TikTok Videos

Use the /v2/video/list/ and /v2/video/query/ APIs to get the metadata of a TikTok user's videos and integrate an embedded video player into your product. In addition, you can design features to allow users to select their TikTok videos to present on their profile and enable their followers to watch the video in webview.

Display User's Recent TikTok Videos

Use the /v2/video/list/ and /v2/video/query/ APIs to get the metadata of a TikTok user's videos and integrate an embedded video player into your product. In addition, you can design features to allow users to show their recent TikTok videos on your platform.

Next Steps

Get Started with Display API

On this page
Components
Permissions
Example Use Cases
Display User's TikTok Profile
Display User's Self-Selected TikTok Videos
Display User's Recent TikTok Videos
Next Steps