---
titulo: "TikTok API for Business — Rate limits (limites por app, por anunciante e por endpoint)"
url: https://business-api.tiktok.com/portal/docs/rate-limits/v1.3
capturado_em: 2026-09-09
hash: a5cb6347e25b757b
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

About the Guide
Overview
What's New
Get Started
Concepts
Step-by-step workflow
Rate limits
App permissions
Sandbox accounts
Postman collection
Estimated integration time
Need support
TikTok for Business MCP Server
Skill management
FAQs
Use Cases
Marketing API
Organic API
Business Messaging API
API Reference
API Playground
API Service Status Page
Appendix
SDK
Global rate limits
Rate limit levels
Endpoint-specific rate limits
Best practices
1. Make bulk requests
2. Limit the number of concurrent requests
Rate limits

To ensure service availability and performance, we have global and endpoint-specific rate limits.

Global rate limits apply to API requests to all endpoints by a developer application.

Endpoint-specifc rate limits apply to API requests to a certain endpoint or endpoint group. Rate limits for different endpoints are independent. For example, if the rate limits for /campaign/get endpoint are reached for a developer app, the developer app can still make requests to /ad/get/ endpoint.

Global rate limits

We set four different call limit levels for each developer application, and each level includes three different types, QPS Limit (Queries-Per-Second Rate Limiting), QPM Limit (Queries-Per-Minute Rate Limiting) and QPD Limit (Queries-Per-Day Rate Limiting).

Once the rate limit is met, the server returns "code": 40100, which means your request was throttled. You will need to suspend calls to that interface for a period of time and resume calls after the suspension has been lifted. The suspension time depends on the type of rate limit set. For QPM limit, you need to wait 5 minutes before you can make API requests again. For QPD limit, you need to wait until the next day (UTC+0 time) to make API requests again. Note that the QPD limit resets at 00:00:00 UTC+0 time every day.

Rate limit levels
Level	QPS	QPM	QPD
Basic	10	600	864,000
Advanced	20	1,200	1,728,000
Premium	30	1,800	2,592,000
Ultimate	50	3,000	4,320,000

Note

All apps are set to Basic level by default. To change your QPS limit, please apply through My Apps > App Detail > Authorization.

We can only increase API rate limiting one level at a time (from Basic to Advanced / from Advanced to Premium / from Premium to Ultimate). When applying, provide the reason for API rate limit increase. Here is an example for your reference:
The current API Rate Limit is not sufficient in the reporting use case, where we encounter errors occasionally. Therefore, we are applying for rate limit increase.
You don't need to apply for rate limit level change for Events API, because the rate limit is the same for all levels.
Endpoint-specific rate limits

Note
Unique rate limits apply to the TTO API endpoints, including /tto/creator/authorized/, /tto/creator/authorized/video/list/, /tto/tcm/creator/public/, /tto/tcm/creator/public/video/list/, /tto/tcm/rank/, and /tto/tcm/creator/discover/. Refer to Rate limits for TTO API documentation for more details.

Endpoint	Basic	Advanced	Premium	Ultimate

Limit type	QPS	QPM	QPD	QPS	QPM	QPD	QPS	QPM	QPD	QPS	QPM	QPD
/creative/quick_optimization/create/	1	30	5,000	2	60	10,000	3	180	15,000	3	180	15,000
/creative/smart_video/create/	1	30	5,000	2	60	10,000	3	180	15,000	3	180	15,000
/ad/create/	5	150	86,400	10	200	86,400	10	300	86,400	15	300	86,400
/video_template/task/create/	1	30	5,000	2	60	10,000	3	180	15,000	3	180	15,000
/catalog/product/file/	5
	300	432,000	5	300	432,000	10	600	864,000	10	600	864,000
/catalog/product/upload/	5
	300	432,000	5	300	432,000	10	600	864,000	10	600	864,000
/catalog/product/update/	2	120	172,800	2	120	172,800	5	300	432,000	5	300	432,000
/catalog/product/delete/	2	120	172,800	2	120	172,800	5	300	432,000	5	300	432,000
Asynchronous reports
(/report/task/create/ with POST method)	2	60	4,500	2	60	4,500	2	60	4,500	2	60	4,500
/event/track/	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000
App Events (/app/track/ with POST method)	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000
/app/batch/ with POST method	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000
Web Events (/pixel/track/ with POST method)	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000
/pixel/batch/ with POST method	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000
Offline Events(/offline/track/ with POST method)	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000
/offline/batch/ with POST method	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000	1,000	600,000	86,400,000
Streaming API	10,000	600,000	864,000,000	20,000	1,200,000	1,728,000,000	30,000	1,800,000	2,592,000,000	50,000	3,000,000	4,320,000,000
/campaign/copy/task/create/	1	30	432,000	1	30	432,000	1	30	432,000	1	30	432,000
/campaign/copy/task/check/	2	60	864,000	2	60	864,000	2	60	864,000	2	60	864,000
/gmv_max/report/get/	8	240	80,000	12	360	120,000	20	600	200,000	20	600	200,000
Best practices

To avoid your request being throttled and better utilize the resources, you can send requests in bulk and limit the number of concurrent requests.

1. Make bulk requests

The read (get) type of endpoints allows bulk requests. With one request, you can operate on multiple data at the same time rather than operating on one data per request. This reduces the number of calls you make.

For example, you can Get multiple ad groups by passing in multiple adgroup_ids instead of making multiple requests and passing in only one adgroup_ids per request.

Recommended:

curl --get -H "Access-Token:xxx" \
--data-urlencode "advertiser_id={{ADVERTISER_ID}}" \
--data-urlencode "filtering={\"adgroup_ids\": [ADGROUP_ID1,ADGROUP_ID2,ADGROUP_ID3,...]" \
--data-urlencode "page=1" \
--data-urlencode "page_size=100" \
https://ads.tiktok.com/open_api/2/adgroup/get/

Not recommended:

for ADGROUP_ID in {ADGROUP_ID1,ADGROUP_ID2,ADGROUP_ID3,...} do
  curl --get -H "Access-Token:xxx" \
  --data-urlencode "advertiser_id={{ADVERTISER_ID}}" \
  --data-urlencode "filtering={\"adgroup_ids\": [$ADGROUP_ID1]" \
  --data-urlencode "page=1" \
  --data-urlencode "page_size=1" \
  https://ads.tiktok.com/open_api/2/adgroup/get/ \

2. Limit the number of concurrent requests

For time-synchronized data, if a large number of API interfaces are called at the same time, the request may be throttled.

In this case, you can implement Rate Limiting on the client side, to control the number of concurrent requests. An example is the Token Bucket Algorithm. Tokens are issued according to the rate limit rules (for example, 10 tokens are issued per second). Before making a request, try to obtain the token, if there are no token currently available, wait for a period of time, then try again.

A more robust implementation is to use Message Queuing. The timing script is not directly responsible for requesting the API, but uses a producer-consumer Model. Push the requested task to the message queue, and a dedicated consumer takes the task from the queue for consumption (through an API request). You can limit the number of concurrent users by limiting the number of concurrent consumers for a certain type of task or using a rate limit. Tasks that fail to execute, can be pushed back into the queue (and set a certain delay) to retry.

Was the information helpful?
Yes
No