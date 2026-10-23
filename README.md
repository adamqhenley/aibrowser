# AI Browser prototype

An Electron (Chromium) shell that tests a simple proposition: a browser can make a page more enjoyable without replacing its information or hiding its provenance.

The product direction, protocol proposal, and guardrails are captured in [the project charter](./CHARTER.md).

## Run

```sh
npm install
npm start
```

## What is real in this first test

- Chromium renders ordinary sites in an isolated browser view.
- Focus, reader, and calm transformations run against the live page DOM and can be restored in one click.
- The sidebar keeps the source domain visible and transforms only after a direct user action.
- Optional ChatGPT plan integration keeps OS-encrypted credentials in the trusted main process. No website receives credentials.

## Deliberately not claimed yet

- Local presets require no provider request. Explicit ChatGPT layout submissions use the connected account's plan.
- It is an Electron-based Chromium browser, not a maintained fork of Chromium.
- The supported OAuth/PKCE flow checks granted plan-usage permission separately from identity. Live inference verification requires completing account consent.

## Live React publisher demo

The browser starts at https://aimlwebsite.pages.dev/. The page's React workspace publishes a bounded JSON document in `script[type="application/aiml+json"]`. The browser checks it every 750ms, validates its display fields and same-origin provenance, and offers **Open AIML view**. This native view renders plain text and source links without executing publisher capabilities or making model calls.

Choose **Show original website**, toggle a record in **Live React → AIML**, then reopen AIML view to see the revision and count update from the same application state. Returning to the original website preserves the running React app. Full navigation reloads the illustrative session data.

Run with `npm start`; run consumer checks with `node --test`. Website source lives only in its separate private repository. Current discovery supports embedded live documents; linked artifacts are future work.

## ChatGPT layouts

Run `npm install` and `npm start` (prestart builds the vendored local authentication runtime). Choose **Continue with ChatGPT** and complete account and ChatGPT plan-usage consent in your system browser. Available models come from that connection. Enter a request such as “show compact dark cards with the records first,” then choose **Render with ChatGPT**.

Only the current validated AIML document and your request are submitted. Credentials remain in the Electron main process, encrypted at rest using OS-backed safeStorage under Electron's userData/chatgpt directory. Sign out and Manage usage are available in the sidebar. Cancel controls stop sign-in or generation.

The model returns a validated plan choosing cards/reader/list, light/warm/dark, density, and ordering. Every block must appear exactly once; source text is never replaced. Stale page revisions are rejected. This is a constrained layout assistant, not arbitrary generated HTML or autonomous actions. The browser reports errors rather than claiming a preset is an AI result.

Authentication uses unmodified OpenAI DevKit sources in vendor/siwc-local. Those files have a separate noncommercial license included there; this integration is intended for personal local experimentation. See vendor/siwc-local/PROVENANCE.md before distributing or using commercially. Account eligibility and granted permissions govern actual inference access.

