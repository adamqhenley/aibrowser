# Optional local ChatGPT integration

The MIT-licensed browser works without a cloud provider. Browsing, AIML views,
local presets, and session feed rules do not require sign-in or a model.

The OpenAI Sign in with ChatGPT DevKit is not distributed in the current source
tree. Its noncommercial code license is separate from service eligibility.
Official integration guidance permits eligible local open-source tools and
personal projects, but that does not waive the DevKit's code-license conditions:
https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt#usage-policy-and-terms

Before obtaining, using, or distributing that integration, review its license:
https://github.com/openai/sign-in-with-chatgpt-devkit
The originally tested revision was 0a36fefeb913055c8c7a1a29b63d82b96b2e841a.
We do not promise compatibility with other revisions. Noncommercial does not
merely mean free of charge; commercial use may require separate written permission.
Moving code into an optional plugin does not itself grant that permission.

If you have the necessary rights, place your independently obtained local copy
at `local/siwc-local/`, retaining its LICENSE and third-party notices, then run:

```sh
AI_BROWSER_ENABLE_CHATGPT_DEVKIT=1 npm start
```

`local/` and generated `build/` files are ignored by Git and excluded from the
package file list. Without the explicit environment flag, the browser does not
load the integration, even if an old generated build is present. Do not add
these local directories to public commits or distribute an opt-in build without
reviewing the separate terms and notices. A stale generated bundle can be
replaced by the opt-in prestart build; no credentials are bundled.

Existing local credentials remain in Electron's OS-encrypted user data, outside
this repository. This preparation does not erase or export them. The disabled
default build neither reads them nor signs out the remote account. To sign out,
use the opt-in build's Sign out control. Eligibility, consent, and OpenAI service
terms still govern actual access. No credentials should appear in issues or logs.
