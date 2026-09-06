---
titulo: "Accounts API — Manage TikTok post ad authorization (autorizar post orgânico a virar Spark Ad)"
url: https://business-api.tiktok.com/portal/docs/manage-tiktok-post-ad-authorization/v1.3
capturado_em: 2026-09-06
hash: 3d4cab4373d22b51
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
Introduction
Prerequisites
Steps
Manage TikTok post ad authorization

This article walks you through how to manage the ad authorization settings for TikTok posts.

Introduction

The "Ad authorization" feature enables TikTok posts to be used as ad creatives for Spark Ads. With authorized posts, you can create Spark Ads by pulling organic posts from authorization codes.

You can use Accounts API to effectively generate, extend, and delete the authorization codes of TikTok posts, streamlining the management of authorization codes.

Prerequisites
You've gained access to TikTok API for Business. See Get Started - Step by step workflow for details.
To manage the authorization codes of TikTok posts, you need relevant permissions. See API Reference to find out permissions required for endpoints (including the endpoints listed in the "Steps" section) and see Update app permissions to find out how to configure permissions.
You have an owned post that has been published to your TikTok account. If you don't have one and want to publish a post to your TikTok account, use /business/video/publish/ or /business/photo/publish/.
You have obtained a TikTok account access token with biz.spark.auth permission and the Application specific unique ID for the TikTok account by following the steps in Authorization and Authentication.
To confirm whether a TikTok account access token has the biz.spark.auth permission, use /tt_user/token_info/get/ and check the returned scope. If the access token doesn't have the biz.spark.auth permission, request the TikTok account owner to approve Spark Ads authorization code management permission through the Authorization workflow.
Steps
Decide on the TikTok post for which you want to generate an authorization code.
To obtain the IDs of TikTok posts associated with a TikTok account, use /business/video/list/.
Enable the ad authorization setting for the TikTok post using /business/post/authorize/setting/.
Provide the item_id obtained from Step 1, set is_ad_promotable to true, and specify the desired validity period for the authorization code via authorization_days.
(Optional) Create Spark Ads by pulling the authorized posts from authorization codes.
(Optional) Manage the existing authorization code of a TikTok post.
To extend the validity period of an expiring authorization code, use /business/post/authorize/.
To delete the authorization code of a TikTok post, use /business/post/authorize/delete/.
Was the information helpful?
Yes
No