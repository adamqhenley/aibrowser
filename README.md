# AI Browser prototype

MIT-licensed experimental browser core. Not a hardened daily browser or a
maintained Chromium fork. Cloud AI is optional and is **not included in the
default build**. See [LICENSE](./LICENSE), [NOTICE](./NOTICE),
[privacy](./PRIVACY.md), [security](./SECURITY.md), and [contributing](./CONTRIBUTING.md).

An Electron (Chromium) shell that tests a simple proposition: a browser can make a page more enjoyable without replacing its information or hiding its provenance.

The product direction, protocol proposal, and guardrails are captured in [the project charter](./CHARTER.md).

## Run

```sh
# Node.js 24+
npm ci
npm test
npm run check:public
npm start
```

## What is real in this first test

- Chromium renders ordinary sites in an isolated browser view.
- Focus, reader, and calm transformations run against the live page DOM and can be restored in one click.
- The sidebar keeps the source domain visible and transforms only after a direct user action.
- A separately installed, explicitly enabled local ChatGPT integration can keep OS-encrypted credentials in the trusted main process. No website receives credentials. Its implementation is not part of the default build.

## Deliberately not claimed yet

- Local presets require no provider request. Optional explicit ChatGPT layout submissions use the connected account's plan, subject to eligibility and separate terms.
- It is an Electron-based Chromium browser, not a maintained fork of Chromium.
- The optional OAuth/PKCE flow checks granted plan-usage permission separately from identity. Live inference verification requires completing account consent. Future provider and API-key support is not implemented by the provider settings placeholder.

## Live React publisher demo

The browser starts at https://aimlwebsite.pages.dev/. The page's React workspace publishes a bounded JSON document in `script[type="application/aiml+json"]`. The browser checks it every 750ms, validates its display fields and same-origin provenance, and offers **Open AIML view**. This native view renders plain text and source links without executing publisher capabilities or making model calls.

Choose **Show original website**, toggle a record in **Live React → AIML**, then reopen AIML view to see the revision and count update from the same application state. Returning to the original website preserves the running React app. Full navigation reloads the illustrative session data.

Run with `npm start`; run consumer checks with `node --test`. Website source lives only in its separate private repository. Current discovery supports embedded live documents; linked artifacts are future work.

## ChatGPT layouts

The public build runs without authentication dependencies and disables cloud AI
controls. Read [Optional local ChatGPT integration](./docs/optional-chatgpt.md)
before enabling a separately obtained DevKit. The independent browser code is
MIT licensed; the DevKit is not. Existing local credentials are not deleted.

In an authorized opt-in local build, choose **Continue with ChatGPT** and complete account and ChatGPT plan-usage consent in your system browser. Available models come from that connection. Enter a request such as “show compact dark cards with the records first,” then choose **Render with ChatGPT**.

Only the current validated AIML document and your request are submitted. Credentials remain in the Electron main process, encrypted at rest using OS-backed safeStorage under Electron's userData/chatgpt directory. Sign out and Manage usage are available in the sidebar. Cancel controls stop sign-in or generation.

The model returns a validated plan choosing cards/reader/list, light/warm/dark, density, and ordering. Every block must appear exactly once; source text is never replaced. Stale page revisions are rejected. This is a constrained layout assistant, not arbitrary generated HTML or autonomous actions. The browser reports errors rather than claiming a preset is an AI result.

No restricted DevKit source or generated bundle is included in the current public source tree. Older commits containing it retain their original license; the MIT license does not retroactively relicense third-party code. Account eligibility and granted permissions govern actual inference access. No affiliation with or endorsement by OpenAI or Meta is implied.

## User-directed Facebook workspace

Enable the local view while browsing Facebook. Session rules prioritize comma-separated topics and displayed source names using literal, word-boundary text matching. Optional rules set matching terms or identified ads aside, restrict the view to selected topics, and collapse exact repeated text. Keep and Set aside are browser-local choices, not Facebook reactions. Why here explains each rule; Inspect set-aside posts makes exclusions reversible and visible. Encountered order is available; My priorities sorts by explicit matches and Keep choices, never dwell time or inferred beliefs.

Make a 10-post edition pauses capture and includes at most ten qualifying encountered posts. It does not search for ten posts or claim exhaustive coverage. Return to live capture resumes updates. Session connections builds an ephemeral post/source/chosen-topic graph; edges describe displayed headers and literal matches, not factual endorsement or inferred relationships. The workspace retains at most thirty posts in memory, with no persistent content database or cross-user aggregation. Clear session disables capture and drops workspace extraction state; it does not delete Facebook content or Chromium's normal browsing cache.

Open Facebook search explicitly navigates to Facebook's post search with the query you enter; Facebook receives that query. Navigation clears the captured set. There is no background search, crawling, automatic social action, or automatic cloud analysis. If you submit a ChatGPT layout request, all captured text—including set-aside posts—is shared; images are not. This experimental architecture is not a representation of legal clearance or platform approval.

## Public prototype boundaries

There are no signed binaries, automatic browser security updates, fact-checking
engine, semantic feed ranking, persistent content graph, or unattended browsing
agent. The current adapter is tested on English Facebook labels and is best-effort;
the shared DOM extractor is generic, but additional site mappings are future work.
The hosted AIML demo is optional; ordinary pages and local presets still work
without it. Do not use this prototype as a hardened daily browser.

CI runs unit tests, public-source guardrails, and the provider-free build path.
The guardrails are not a full secret, license, dependency, or Git-history audit.
Before distributing binaries, review dependency notices, optional integrations,
the target Electron/Chromium version, and platform requirements separately.

