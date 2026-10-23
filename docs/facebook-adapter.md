# Facebook visible-feed adapter

Experimental local adapter. Enable it explicitly on facebook.com, www.facebook.com, or m.facebook.com. Facebook stays interactive on the left; extracted text appears on the right. Sign in using Facebook's original page. The adapter does not access input values, credentials, cookies, or storage.

The adapter polls visible article/feed-unit DOM surfaces in an isolated JavaScript world. It captures up to eight visible text items per poll, retains up to 30 items in memory, bounds each item to 6000 characters, and uses stable identities while a DOM node remains mounted. It makes no network requests, auto-scrolls, or automated reactions/messages. Search and Sponsored filtering affect only the reading view. Sponsored detection is a best-effort English visible-label heuristic and is not a complete ad blocker.

Scroll the source feed on the left to discover new posts. Pause updates to read a stable snapshot. Locate original post scrolls an already captured DOM node into view, if Facebook has not unloaded it. Extracted content is browser-generated and is not represented as publisher-supplied AIML or verified evidence. Media, hidden/expanded text, authorship metadata, and localized labels need further adapter refinement.

AI requests remain explicit. Pause capture before submitting; the current captured document and request are then shared with OpenAI using the connected ChatGPT plan. Live private-feed testing awaits the owner's Facebook sign-in. Unit fixtures cover host boundaries, visible/article filtering, form exclusion, identity retention, bounded capture, and merge behavior.
