# Security

This is a research prototype, not a hardened everyday browser. Only the current
development branch is maintained. There are no signed releases, automatic
security updates, independent audit, or production-support guarantees. Electron
and Chromium must be kept updated; do not use this build for high-risk browsing.

Report vulnerabilities privately through GitHub's **Report a vulnerability**
control if available. If it is unavailable, do not put sensitive details in a
public issue: request a private reporting channel from the maintainer first.
Private reporting must be enabled separately in repository settings. Never
include credentials, private page contents, or browsing profiles in a report.

Remote pages have no Node integration or application preload. The application
renderer is sandboxed and isolated; privileged IPC checks its sender. Publisher
AIML and model layouts are bounded and validated, not executed as code. These
controls reduce risk but are not a security guarantee. Page content is untrusted,
including instructions embedded in text supplied to a model.

Local caches and OS user data are separate from the workspace session. Clearing
the session does not erase browser history, cookies, or normal network caches.
Optional integrations have their own license, credential, and service boundaries.
