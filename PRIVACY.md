# Privacy and data flow

The default build includes no cloud AI provider, analytics, or project telemetry.
Visiting a website still sends normal browsing requests to that site and its
resources. Browser cookies and caches can persist in Electron user data.

The opt-in Facebook workspace extracts rendered post text, displayed source
labels, and media metadata locally. Its reading set retains at most 30 posts;
it is not a persistent content database or a complete view of the account.
Images may reuse decoded pixels or request their current HTTPS Facebook CDN
resource, with credentials omitted and redirects refused. Previews stay local.
This is not an anonymity guarantee; the CDN still receives network requests.

Rules and graph summaries use literal text matches, not inferred identity,
beliefs, or fact-checking judgments. Keep and Set aside are local choices, not
social reactions. Clear session disables capture and drops extracted workspace
state. It does not delete Facebook data, browser cookies, caches, or history.
An explicit Facebook search sends the entered query to Facebook.

If a separately installed local ChatGPT integration is enabled, explicit layout
submission sends the current validated AIML and your request to OpenAI. On a
captured feed this includes ALL retained post text, including set-aside posts;
images are not sent. Capture must be paused first. Provider processing and
retention follow that provider's terms; this project does not control them.
Credentials remain in the trusted main process and OS-encrypted user data, not
page JavaScript. No automatic background model requests are intended.

Do not submit other people's sensitive information without appropriate authority.
Do not publish private feed content in issues, fixtures, screenshots, or logs.
