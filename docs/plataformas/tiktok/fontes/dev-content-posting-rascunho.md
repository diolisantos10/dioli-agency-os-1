---
titulo: "Content Posting API — Upload Content (enviar para a caixa de entrada/rascunho, sem publicar)"
url: https://developers.tiktok.com/doc/content-posting-api-get-started-upload-content
capturado_em: 2026-09-12
hash: 6692ccfbd36749d2
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Last updated August 4, 2026
Get Started - Upload

Tip: You can enable email notifications to get our latest product updates.

New: Content Posting API now supports sending photos!

This guide shows you how to use the Content Posting API to upload content to TikTok.

Prerequisites

To successfully complete this tutorial, you will need the following:

A valid video if you want to upload videos:
Ensure you have a video file in one of the supported formats, such as MP4 + H.264, stored on your local machine.
Alternatively, you can provide a URL of a video from your verified domain or URL prefix. Learn how to verify your domain or URL prefix.
Learn more about video restrictions.
A valid photo if you want to upload photos:
You need to provide a URL of a photo from your verified domain or URL prefix. Learn how to verify your domain or URL prefix.
Learn more about photo restrictions.
A registered app on the TikTok for Developers website.
Add the content posting API product to your app as shown below.
Get approval and authorization of the video.upload scope. Learn more about scopes.
Your app must be approved for the video.upload scope.
The target TikTok user must have authorized your app for the video.upload scope.
The access token and open ID of the TikTok user who authorized your app. Learn how to obtain the access token and open ID.

Upload draft to TikTok

This section demonstrates how to successfully upload videos or photos to TikTok for the user to review and post.

You should inform users that they must click on inbox notifications to continue the editing flow in TikTok and complete the post.

User notified of video upload

	

User reviews and posts video

Upload a video

To initiate video upload on TikTok's servers, you must invoke the Content Posting API - Video Upload endpoint. You have the following two options:

If you have the video file locally, set the source parameter to FILE_UPLOAD in your request.
if the video is hosted on a URL, set the source parameter to PULL_FROM_URL.
Example

Example using source=FILE_UPLOAD:

Request:

curl --location 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/' \
--header 'Authorization: Bearer act.example12345Example12345Example' \
--header 'Content-Type: application/json' \
--data '{
    "source_info": {
        "source": "FILE_UPLOAD",
        "video_size": exampleVideoSize,
        "chunk_size" : exampleVideoSize,
        "total_chunk_count": 1
    }
}'

Response:

200 OK

{
    "data": {
        "publish_id": "v_inbox_file~v2.123456789",
        "upload_url": "https://open-upload.tiktokapis.com/video/?upload_id=67890&upload_token=Xza123"    
    },
    "error": {
         "code": "ok",
         "message": "",
         "log_id": "202210112248442CB9319E1FB30C1073F3"
     }
}

Example using source=PULL_FROM_URL:

Request:

curl --location 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/' \
--header 'Authorization: Bearer act.example12345Example12345Example' \
--header 'Content-Type: application/json' \
--data '{
    "source_info": {
        "source": "PULL_FROM_URL",
        "video_url": "https://example.verified.domain.com/example_video.mp4",
    }
}'

Response:

200 OK

{
    "data": {
        "publish_id": "v_inbox_url~v2.123456789"
    },
    "error": {
         "code": "ok",
         "message": "",
         "log_id": "202210112248442CB9319E1FB30C1073F4"
     }
}

If you are using source=FILE_UPLOAD:

Extract the upload_url and publish_id from the response data.
Send the video from your local filesystem to the extracted upload_url using a PUT request. The video processing will occur asynchronously once the upload is complete.
curl --location --request PUT 'https://open-upload.tiktokapis.com/video/?upload_id=67890&upload_token=Xza123' \
--header 'Content-Range: bytes 0-30567099/30567100' \
--header 'Content-Type: video/mp4' \
--data '@/path/to/file/example.mp4'

With the publish_id returned earlier, check for status updates using the Get Post Status endpoint.

curl --location 'https://open.tiktokapis.com/v2/post/publish/status/fetch/' \
--header 'Authorization: Bearer act.example12345Example12345Example' \
--header 'Content-Type: application/json; charset=UTF-8' \
--data '{
    "publish_id": "v_inbox_file~v2.123456789"
}'
Upload photos

To initiate photo upload on TikTok's server, you must invoke the Content Posting API endpoint.

Note:

There are differences between the photo post endpoint and the existing video post endpoint.

Use /v2/post/publish/content/init/ to upload photos instead of /v2/post/publish/inbox/video/init/
The post_mode and media_type are required parameters in request.body
There are additional parameters supported, such as title and description.
Example

Request:

curl --location 'https://open.tiktokapis.com/v2/post/publish/content/init/' \
--header 'Authorization: Bearer act.example12345Example12345Example' \
--header 'Content-Type: application/json' \
--data-raw '{
    "post_info": {
        "title": "funny cat",
        "description": "this will be a #funny photo on your @tiktok #fyp"
    },
    "source_info": {
        "source": "PULL_FROM_URL",
        "photo_cover_index": 1,
        "photo_images": [
            "https://tiktokcdn.com/obj/example-image-01.webp",
            "https://tiktokcdn.com/obj/example-image-02.webp"
        ]
    },
    "post_mode": "MEDIA_UPLOAD",
    "media_type": "PHOTO"
}'

Response:

200 OK

{
    "data": {
        "publish_id": "p_pub_url~v2.123456789"
    },
    "error": {
         "code": "ok",
         "message": "",
         "log_id": "202210112248442CB9319E1FB30C1073F3"
     }
}

On this page
Prerequisites
Upload draft to TikTok
Upload a video
Example
Upload photos
Example