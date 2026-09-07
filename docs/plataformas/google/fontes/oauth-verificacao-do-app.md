---
titulo: "Google Cloud — verificação do app OAuth e status de publicação"
url: https://support.google.com/cloud/answer/13463073?hl=pt-BR
capturado_em: 2026-09-07
hash: a722811c2384eae8
---

> Documento oficial capturado da plataforma. A fonte é a URL acima;
> este arquivo é a cópia de trabalho da biblioteca. Não edite à mão.

OAuth App Verification Help Center
Learn the process, be compliant, get your app verified
OAuth App Verification

Google uses OAuth 2.0 for user permissions and consent, which enables developers to specify the type, and level of access required for their app to function via strings known as API scopes. If your app uses Google APIs to access Google users’ data, it may be subject to a verification process before you publish your app.

Apps that request access to scopes categorized as sensitive or restricted must complete Google's OAuth app verification before being granted access. A complete list of Google APIs and their corresponding scopes can be found in the OAuth 2.0 Scopes for Google APIs. When you add scopes to your project, scope categories (non-sensitive, sensitive, or restricted) are indicated automatically in the Google Cloud Console.

If your app utilizes only non-sensitive scopes, it is not mandatory for your app to complete the app verification process. However, if you want your app to display an app name and logo on the OAuth consent screen, you will need to complete a lighter-weight verification process known as "brand-verification".

For detailed information on the specific verification requirements for sensitive and restricted scopes, please refer to the verification requirements section.

For detailed information on app types that are not subjected to the verification requirements refer to the "When is verification not needed" section. 

Getting Started 

Select the OAuth verification journey that is right for you

Submitting your app for verification

Learn how to set up a project and submit for verification.

Annual re-verification

Apps requesting restricted scopes data need to complete “re-verification” annually. Learn more on what is needed to get your app re-verified if you require annual re-verification.

App configuration changes that require re-verification

If you have made certain changes to your verified app, your app may need re-verification before the changes are available to your users. Learn more about which changes need re-verification.

Explore 

Browse the requirements and learn more about specific cases

Verification Requirements

Know what you need to comply with.

When is verification not needed

If your app falls under one of the exempted categories, submitting your app for verification is optional

Security Assessment

Learn about the security assessment process.

FAQ

Check our FAQ section to find your answers.

Quick Reference Guides

Refer our helpful guides to know how to fix common issues flagged during app verification.

Give feedback about this article
Isso foi útil?
Como podemos melhorá-lo?
SimNão
Enviar