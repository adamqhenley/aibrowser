# First signed-in Facebook review

The original page loaded feed posts as the source pane was scrolled, but the initial adapter captured none. The observed page exposes per-post action menus and heading structure without matching the initial article/feed-unit selectors. The correction moves extraction into a shared semantic DOM function with an optional post-menu selector hint. Facebook currently supplies that hint; additional site mappings remain future work.

Many observed posts contain substantial image/video information. The text companion now adds an explicit media-not-transcribed notice rather than presenting captured text as complete. Embedded media decoding/OCR is not implemented. Sponsored detection remains best-effort and unverified on this feed.

The split view consumes considerable width and the controls require too much vertical space. A future design should allow a compact browser sidebar and a user-controlled source/reading-pane ratio. A full reading view will need a deliberate way to return to live scrolling; automatically scrolling the source is not part of this experiment.

No posts were reacted to, commented on, shared, or sent to a model during this review. A relaunch required Facebook password re-entry; corrected live extraction is pending owner reauthentication. No private feed content or screenshots are stored in this repository.
