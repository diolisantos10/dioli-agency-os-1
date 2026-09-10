---
titulo: "Webhooks — referência de campos do objeto Page"
url: https://developers.facebook.com/docs/graph-api/webhooks/reference/page/
capturado_em: 2026-09-10
hash: c1187ffcc9f491bc
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

Entrada da pesquisa
​
Webhooks da Meta
Primeiros passos
Exemplos de aplicativos
Borda de assinaturas
Reference
Ad Account
Application
Catalog
Instagram
Managed Meta Account
Page
Permissions
User
Whatsapp Business Account
Versão Graph API
v26.0
Page (page)
Page profile webhook fields you can subscribe to. In order for these webhooks to be sent to an app's webhook callback URL, a page admin with MODERATE privileges must grant the app the pages_manage_metadata permission.
messaging_account_linking

MessengerAccountLinkField

Field	Description

field

string
	

Name of the updated field

business_integrity

MessengerBusinessIntegrityField

Field	Description

field

string
	

Name of the updated field

value

object
	

value

call_permission_reply

MessengerCallPermissionReplyField

Field	Description

field

string
	

Name of the updated field

value

object
	

value

call_settings_update

MessengerCallSettingsUpdateField

Field	Description

field

string
	

Name of the updated field

value

object
	

value

calls

MessengerCallsField

Field	Description

field

string
	

Name of the updated field

messaging_customer_information

MessengerCustomerInformationField

Field	Description

field

string
	

Name of the updated field

value

object
	

value

group_feed

Describes comments made to Page's post in a Facebook Group.

Field	Description

field

string
	

Name of the updated field

value

object
	

value

messaging_handovers

MessengerHandoverField

Field	Description

field

string
	

Name of the updated field

messaging_in_thread_lead_form_submit

MessengerLeadGenInThreadFormSubmitAckField

Field	Description

field

string
	

Name of the updated field

message_context

MessengerMessageContextField

Field	Description

field

string
	

Name of the updated field

value

object
	

value

message_deliveries

MessengerMessageDeliveryReceiptField

Field	Description

field

string
	

Name of the updated field

message_echoes

MessengerMessageEchoField

Field	Description

field

string
	

Name of the updated field

message_edits

MessengerMessageEditField

Field	Description

field

string
	

Name of the updated field

value

object
	

value

message_reads

MessengerMessageReadReceiptField

Field	Description

field

string
	

Name of the updated field

message_template_status_update

MessengerMessageTemplateStatusUpdateField

Field	Description

field

string
	

Name of the updated field

messages

MessengerMessagesField

Field	Description

field

string
	

Name of the updated field

messaging_integrity

MessengerMessagingIntegrityField

Field	Description

field

string
	

Name of the updated field

messaging_optins

MessengerNotificationMessagesOptinField

Field	Description

field

string
	

Name of the updated field

messaging_optins

MessengerOneTimeOptinField

Field	Description

field

string
	

Name of the updated field

messaging_policy_enforcement

MessengerPolicyField

Field	Description

field

string
	

Name of the updated field

value

object
	

value

messaging_postbacks

MessengerPostbackField

Field	Description

field

string
	

Name of the updated field

message_reactions

MessengerReactionsField

Field	Description

field

string
	

Name of the updated field

value

object
	

value

messaging_referrals

MessengerReferralField

Field	Description

field

string
	

Name of the updated field

response_feedback

MessengerResponseFeedbackField

Field	Description

field

string
	

Name of the updated field

send_cart

MessengerSendCartField

Field	Description

field

string
	

Name of the updated field

affiliation

Describes changes to a page's Affliation profile field.

Field	Description

field

string
	

Name of the updated field

attire

Describes changes to a page's Attire profile field.

Field	Description

field

string
	

Name of the updated field

awards

Describes changes to a page's Awards profile field.

Field	Description

field

string
	

Name of the updated field

birthday

Describes changes to a page's Birthday profile field.

Field	Description

field

string
	

Name of the updated field

category

Describes changes to a page's Category field. There can be up to three categories describing a page's topic, business, or person.

Field	Description

field

string
	

Name of the updated field

value

enum
	

The result value.

page_change_proposal

Data for page change proposal.

Field	Description

action

enum
	

The action of the proposal, can be created, accepted_manually, rejected_manually and accepted_automatically

field

string
	

Name of the updated field

value

PageChangeProposal
	

The contents of the proposal

company_overview

Describes changes to a page's Company Overview profile field.

Field	Description

field

string
	

Name of the updated field

value

string
	

The result value.

culinary_team

Describes changes to a page's Culinary Team profile field.

Field	Description

field

string
	

Name of the updated field

current_location

Describes changes to a page's Current Location profile field.

Field	Description

field

string
	

Name of the updated field

description

Describes changes to a page's Story Description profile field.

Field	Description

field

string
	

Name of the updated field

email

Describes changes to a page's Email profile field.

Field	Description

field

string
	

Name of the updated field

feed

Describes nearly all changes to a Page's feed, such as Posts, shares, likes, etc. The values received depend on the types of changes made to the Page's feed. Webhooks are not sent for Ad Posts, but are sent for Comments on Ad Posts. Notifications for Page likes will only be sent for Pages that have fewer than 10K likes.

Field	Description

field

string
	

Name of the updated field

value

object
	

The contents of the update

founded

Describes changes to a page's Founded profile field. This is different from the Start Date field.

Field	Description

field

string
	

Name of the updated field

value

string
	

The result value.

general_info

Describes changes to a page's General Information profile field.

Field	Description

field

string
	

Name of the updated field

value

string
	

The result value.

general_manager

Describes changes to a page's General Manager profile field.

Field	Description

field

string
	

Name of the updated field

hometown

Describes changes to a page's Homewtown profile field.

Field	Description

field

string
	

Name of the updated field

hours

Describes changes to a page's Hours profile field.

Field	Description

field

string
	

Name of the updated field

inbox_labels

PageInboxLabelsField

Field	Description

field

string
	

Name of the updated field

value

object
	

value

invoice_access_invoice_draft_change

PageInvoiceAccessInvoiceDraftChangeField

Field	Description

field

string
	

Name of the updated field

value

object
	

value

leadgen

Describes changes to a page's leadgen settings.

Field	Description

field

string
	

Name of the updated field

value

object
	

Result values.

live_videos

Describes changes to a page's live video status.

Field	Description

field

string
	

Name of the updated field

value

object
	

Content of the update

location

Describes changes to a page's Location profile field, including the street address, city/state, or zip code fields.

Field	Description

field

string
	

Name of the updated field

members

Describes changes to a page's Members profile field.

Field	Description

field

string
	

Name of the updated field

mention

Describes new mentions of a page, including mentions in comments, posts, etc. Some comment_id and post_id fields returned in mention webhooks may not be queried due to missing permissions including privacy issues.

Field	Description

field

string
	

Name of the updated field

value

object
	

The contents of the update

mission

Describes changes to a page's Mission profile field.

Field	Description

field

string
	

Name of the updated field

value

string
	

The result value.

name

Describes changes to a page's Name profile field.

Field	Description

field

string
	

Name of the updated field

value

string
	

The page's name

parking

Describes changes to a page's Parking profile field.

Field	Description

field

string
	

Name of the updated field

payment_options

Describes change to a page's Payment profile field.

Field	Description

field

string
	

Name of the updated field

personal_info

Describes changes to a page's Personal Information profile field.

Field	Description

field

string
	

Name of the updated field

personal_interests

Describes changes to a page's Personal Interests profile field.

Field	Description

field

string
	

Name of the updated field

phone

Describes changes to a page's Phone profile field.

Field	Description

field

string
	

Name of the updated field

picture

Describes changes to a page's profile picture.

Field	Description

field

string
	

Name of the updated field

price_range

Describes changes to a page's Price Range profile field.

Field	Description

field

string
	

Name of the updated field

product_review

Describes changes to a page's product review settings.

Field	Description

field

string
	

Name of the updated field

value

object
	

The result values.

products

Describes changes to a page's Products profile field.

Field	Description

field

string
	

Name of the updated field

value

string
	

The result value.

public_transit

Describes changes to a page's Public Transit profile field.

Field	Description

field

string
	

Name of the updated field

ratings

Describes changes to a page's ratings, including new ratings or a user's comments or reactions on a rating.

Field	Description

field

string
	

Name of the updated field

value

object
	

The result values.

page_upcoming_change

Webhooks data for page upcoming changes.

Field	Description

action

enum
	

The action happened for this upcoming change

field

string
	

Name of the updated field

value

PageUpcomingChange
	

The contents of the upcoming change

videos

Describes changes to the encoding status of a video on a page.

Field	Description

field

string
	

Name of the updated field

value

object
	

Content of the update

website

Describes changes to a page's Website profile field.

Field	Description

field

string
	

Name of the updated field

Nesta Página
Page (page)
messaging_account_linking
business_integrity
call_permission_reply
call_settings_update
calls
messaging_customer_information
group_feed
messaging_handovers
messaging_in_thread_lead_form_submit
message_context
message_deliveries
message_echoes
message_edits
message_reads
message_template_status_update
messages
messaging_integrity
messaging_optins
messaging_optins
messaging_policy_enforcement
messaging_postbacks
message_reactions
messaging_referrals
response_feedback
send_cart
affiliation
attire
awards
birthday
category
page_change_proposal
company_overview
culinary_team
current_location
description
email
feed
founded
general_info
general_manager
hometown
hours
inbox_labels
invoice_access_invoice_draft_change
leadgen
live_videos
location
members
mention
mission
name
parking
payment_options
personal_info
personal_interests
phone
picture
price_range
product_review
products
public_transit
ratings
page_upcoming_change
videos
website