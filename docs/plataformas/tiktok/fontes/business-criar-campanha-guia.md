---
titulo: "Marketing API — Create a Manual Campaign (guia campanha → grupo → anúncio)"
url: https://business-api.tiktok.com/portal/docs/create-a-campaign-guide/v1.3
capturado_em: 2026-09-09
hash: 7f5aee1c75137639
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
Overview
Get started
Business Center
Creatives
Catalog Management
TikTok Store
Campaign Management
Overview
Guides
Mapping between campaign features in TikTok Ads Manager and API configurations
Campaign
Create a Manual Campaign
Copy a Manual Campaign
Copy an Upgraded Smart+ Campaign
Advertising objective
Reach & Frequency
TopView
(To be deprecated) Legacy Smart+ Campaign
Upgraded Smart+ Campaign
Dedicated Campaign
Super Split Test
Budget
Promote campaign
Realtime API
Ad group
Ad
FAQs
API reference
Audience Management
Reporting
Ad Measurement
Organic API
Business Messaging API
API Reference
API Playground
API Service Status Page
Appendix
SDK
Steps
Example
Next step
Create a Manual Campaign

This article introduces how to create a campaign.

Steps

Use /campaign/create/ to create a regular campaign. You can define the following settings at the campaign level.

To understand how campaign-level features in TikTok Ads Manager correspond to API parameters, see Mapping between campaign features in TikTok Ads Manager and API configurations.

advertiser_id: ID of your ad account. You can get the ID from your TikTok For Business account.
campaign_name: A descriptive name of your campaign.
objective_type: The advertising objective of your campaign. See Advertising objectives for details.
budget_mode: The budget mode can be total (BUDGET_MODE_TOTAL), daily (BUDGET_MODE_DAY), dynamic daily (BUDGET_MODE_DYNAMIC_DAILY_BUDGET), or infinite (BUDGET_MODE_INFINITE). The budget mode can be set at the campaign level or the ad group level. See Budget for details.
budget: If budget_mode is total, daily, or dynamic daily, you need to set a budget.
budget_optimize_on: Whether you want to enable Campaign Budget Optimization (CBO). Once CBO is enabled (budget_optimize_on = TRUE), you need to set the campaign-level budget_mode and budget. Other CBO-related fields such as bid_type, deep_bid_type, optimization_goal are set at the ad group level. See Campaign Budget Optimization for details.

To find out the details of other parameters, see the /campaign/create/ article.

Example
curl --location --request POST 'https://business-api.tiktok.com/open_api/v1.3/campaign/create/' \
--header 'Access-Token: {{Access-Token}}' \
--header 'Content-Type: application/json' \
--data '{
   "advertiser_id": "{{advertiser_id}}",
   "objective_type": "TRAFFIC",
   "campaign_name": "{{campaign_name}}",
   "budget_mode": "BUDGET_MODE_TOTAL",
   "budget": {{budget}}
}'

Next step

Create an ad group

Was the information helpful?
Yes
No