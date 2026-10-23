# First signed-in Facebook review

The original page loaded feed posts as the source pane was scrolled, but the initial adapter captured none. The observed page exposes per-post action menus and heading structure without matching the initial article/feed-unit selectors. The correction moves extraction into a shared semantic DOM function with an optional post-menu selector hint. Facebook currently supplies that hint; additional site mappings remain future work.

Many observed posts contain substantial image/video information. The text companion now adds an explicit media-not-transcribed notice rather than presenting captured text as complete. Embedded media decoding/OCR is not implemented. Sponsored detection remains best-effort and unverified on this feed.

The split view consumes considerable width and the controls require too much vertical space. A future design should allow a compact browser sidebar and a user-controlled source/reading-pane ratio. A full reading view will need a deliberate way to return to live scrolling; automatically scrolling the source is not part of this experiment.

## Signed-in follow-up

The shared extractor was subsequently verified on the live feed: scrolling increased the captured set from two posts to three; local search reduced the view to one matching post; Locate original returned to that post; pausing held the captured set stable. No model request was submitted. No private feed content or screenshots are stored in this repository.

The test also exposed clipped repeated site labels in `innerText`, an explicitly labeled Ad missed by the Sponsored-only filter, unstructured author/body/engagement text, and incomplete meaning for image-heavy and truncated posts.

The next implementation reads rendered text-node geometry, excludes clipped labels and interactive controls, separates author headers and page-provided media descriptions, marks partial posts, and recognizes exact visible Ad or Sponsored labels. Descriptions remain unverified page data; no image OCR, video transcription, semantic ranking, or fact checking is implemented. Captured items remain bounded and local unless the user submits an AI request.

## Refinements verified after approved restart

Facebook retained its authenticated session. The first live pass caught missing display:contents headings and CSS-clipped labels not modeled by the initial fixtures. Additional checks preserve layoutless heading containers while excluding clipped and aria-hidden labels. Obfuscated link text containing repeated grapheme joiners is omitted rather than displayed as scrambled metadata; dates remain available in the original pane. This heuristic is not a universal solution for formatted metadata.

The current live pass verified clean source headings/body text without repeated site labels or scrambled timestamps; disclosed media descriptions; recognition of an ad using Facebook's explicit ad-link accessibility metadata; and a filter change from two shown posts to one, with the original source unmodified. Local search produced zero results for a nonmatching query and restored the visible post when cleared. Locate original returned to the matching source post. Updates were left paused and the ad filter enabled. No feed content was submitted to a model.

Nineteen unit tests pass, including the new clipping, display:contents, opaque-link, and declarative-ad-hint regressions. Partial-post warning logic has fixture coverage but was not reverified against a truncated post in this final live pass. Media are still not transcribed; the reading pane is not a complete substitute for the original. No private feed content or screenshots are stored in this repository.

## Complete inline images

The owner requested inline images, then clarified that images should never be cropped to the source viewport. The interim viewport-screenshot fallback was removed. Image elements now scale to the column width with natural height and no maximum-height crop. Already-decoded image pixels are reused where canvas access permits; otherwise the trusted process requests the current image's full HTTPS Facebook-CDN URL through Chromium's cache-aware fetch, omitting credentials and refusing redirects. Unsupported or unavailable images keep their source navigation rather than substituting a partial screenshot.

Requests and decoded previews are size-bounded. Only PNG data URLs cross into the trusted renderer, not remote URLs; preview data is not included in model submissions. Video playback and OCR remain unsupported. The final live pass verified a complete image, including text missing from the earlier crop. Twenty-five tests pass, covering CDN URL restrictions, cache/credential/redirect settings, canvas denial, safe display payloads, and media identity preservation. No private feed images or screenshots are committed to the repository.

## User-directed session workspace

Local rules now prioritize explicit topics and displayed sources, defer selected terms, set explicitly identified ads aside, collapse exact repeated text, and optionally include only topic matches. Keep and Set aside are browser-only controls with inspectable reasons and reversible exclusions. A frozen edition pauses capture and includes at most ten retained posts; it does not automatically fetch ten posts. Session connections represent observed source labels and literal topic matches, not inferred beliefs or verified authorship. Facebook search is an explicit navigation, not a background collection job.

Live testing verified topic-based reordering and explanations, a frozen edition, setting a post aside and inspecting it again, and clearing captured cards, rules, and the connection summary. A second pass after restarting verified clear-session cleanup and rebuilt a topic-directed edition on a group page. The authenticated session survived. All 34 unit tests pass. No social action, Facebook search submission, or model request was performed in these tests. No private feed content or screenshots are stored in the repository.

Limits: ranking is deterministic text matching, not semantic understanding; source labels can be group headings; ad identification misses some formats; video remains unsupported. Capture is bounded to 30 posts in session memory, not a persistent history database. AI submission explicitly discloses that all captured post text, including set-aside posts, is sent when requested; images are not sent. These product boundaries are not a legal clearance.

## Public-source preparation

The restricted DevKit was moved out of the current source tree into an ignored
local directory; its notices and existing OS-encrypted credentials were preserved.
The default provider-free build was launched and verified: AIML discovery, native
rendering, Reader mode, and the disabled-provider explanation work. An opt-in
build also compiled successfully from the preserved local integration. No model
request or account mutation was performed. Public checks exclude the local SDK
and generated bundles; historical commits retain their original licenses.
