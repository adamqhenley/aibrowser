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
- The app has a memory-only provider-configuration boundary. No site receives the provider credential.

## Deliberately not claimed yet

- No provider request is made. The first experiment has deterministic DOM transforms so we can evaluate the interaction before introducing privacy, latency, cost, and model-quality variables.
- It is an Electron-based Chromium browser, not a maintained fork of Chromium.
- Login and ChatGPT plan sharing are not yet wired. OpenAI's current Sign in with ChatGPT flow uses an explicit OAuth/PKCE consent flow; identity alone does not grant inference-plan use.

## Next experiment

Create a user-reviewed page representation: semantic blocks, preserved source anchors, optional AI-generated transform plan, and a visible diff/restore affordance. Only then should the browser submit minimized page context to a selected provider.
