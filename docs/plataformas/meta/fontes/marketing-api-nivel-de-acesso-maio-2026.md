---
titulo: "Anúncio oficial (maio/2026) — AMSA vira 'Marketing API Access Tier': Standard→Limited, Advanced→Full"
url: https://developers.meta.com/blog/updates-to-ads-management-standard-access-feature/
capturado_em: 2026-09-09
hash: 842a4867939928b2
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

May 4, 2026
Update to Ads Management Standard Access: New Name, Revised Requirements, and More Transparency
By Jiaqi Sun
Today, we're announcing updates to Ads Management Standard Access (AMSA) — the App Review feature that unlocks higher Marketing API rate limits, system user quotas, and other enhanced capabilities for your app.
Based on developer feedback, we're making three key improvements: (1) renaming the feature for clarity; (2) revising the qualification threshold; and (3) making eligibility criteria fully transparent in the product UI.
These changes take effect on May 4, 2026. This is not a breaking change — no code updates are required, and existing access levels are preserved automatically.
“Ads Management Standard Access” is now "Marketing API Access Tier"
The AMSA feature is being renamed to “Marketing API Access Tier” feature.
The old name caused persistent confusion: developers frequently mixed AMSA up with the separate ads_management permission. The new name clearly communicates what this feature controls — your app's tier of access to Marketing API functionality.
As part of this rename, we're also updating the tier labels and UI language to be more clear:
Before
	
After

Feature: "Ads Management Standard Access"
	
Feature: "Marketing API Access Tier"

Lower tier: "Standard Access"
	
Lower tier: "Limited Access"

Upper tier: "Advanced Access"
	
Upper tier: "Full Access"
Here's what this looks like in the App Dashboard:
Before:
After:
Revised Marketing API Call Requirements to Access Upper Tier
The minimum API call requirement to qualify has been lowered from 1,500 to 500 Marketing API calls in the past 15 days. The error rate threshold remains at < 15%, but is now calculated over a rolling window of your last 500 calls rather than a fixed time period — which is more reasonable for apps with variable or batch-style traffic.
This change allows legitimate developers who previously were unable to meet the higher threshold to now satisfy eligibility requirements to use the Marketing API Access Tier feature.
Transparent Requirements and Simplified Submission
The requirements are now displayed directly in your App Dashboard under Permissions & Features:
500+ Marketing API calls in the past 15 days
Error rate < 15% in the last 500 calls
You no longer need to guess what's required or search through documentation — the exact thresholds are visible before you submit.
We've also simplified the submission process: the screen recording upload is no longer required. The requirements and your progress are shown in the allowed usage page in request edit.
What This Means for You
No code changes are required. The underlying permission identifier remains the same, your API integrations continue to work, and this change applies regardless of which Marketing API version you use.
Already have Advanced Access? Your access is preserved. The UI will now display it as "Full Access" — no action needed.
Previously couldn't qualify based on the prior Marketing API call requirement? Try submitting again with the revised 500-call threshold. Please note that these 500 Marketing API calls must occur within the past 15 days.
Reference the "Ads Management Standard Access" feature in your docs? Update the name to "Marketing API Access Tier" feature.
Resources
Marketing API Access Tier — Features Reference⁠
Developer Centers
AI
Meta Horizon OS
Social technologies
Wearables
Documentation
Llama
Unity
Unreal Engine
Android apps
Worlds in Meta Horizon
Meta Spatial SDK
Wearables
Facebook Login
Instagram Platform
WhatsApp Business Platform
Threads API
Resources
Blog
Success stories
Videos
Programs
Support
AI
Meta Horizon
Wearables
Social technologies
English (US)
© 2026 Meta