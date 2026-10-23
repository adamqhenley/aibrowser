# AI Browser Charter

## The premise

The web contains extraordinary information but commonly presents it through a page design optimized for advertising, engagement capture, implementation convenience, or a particular screen—not for the person trying to understand it.

AI Browser is an open-source, Chromium-based browser and companion Cloudflare application that gives people an intelligible, controllable interface to that information. It begins by improving ordinary pages locally. Over time, it lets publishers provide a structured, source-grounded representation that a user’s chosen assistant can render, explain, compare, or discuss.

The goal is not to replace websites, rewrite their meaning, or create a proprietary web. It is to make the web feel like a place built for attention, understanding, and agency.

## Product thesis

Every navigation can begin a **page round**: an optional, contextual conversation grounded in the current source. The browser knows what the person opened, what it contains, what they selected, and the task they state. It should be able to offer useful transformations—focus, reader view, comparison, explanation, extraction, accessibility adaptations—without losing the original page, its provenance, or the user’s control.

The strongest version is a two-sided network:

1. **Reader side:** a Chromium browser applies reversible local transformations to conventional HTML and makes an assistant available on demand.
2. **Publisher side:** a Cloudflare-hosted web application creates, validates, hosts, and measures structured page representations that compliant browsers can consume.
3. **Protocol side:** an open, progressively adoptable document format provides information blocks, source anchors, semantic roles, permissions, and optional interaction affordances.

HTML and JavaScript remain valid inputs. A structured representation is an enhancement, never a requirement for a page to work.

## The protocol: AIML, working name

**AIML** currently means **Adaptive Information Markup Language**. The name is provisional; the protocol matters more than branding.

AIML should be a compact, signed JSON document with an optional human-authored Markdown body. JSON is the transport and validation format; Markdown is a convenient authoring surface. XML-like syntax may be offered later for people who prefer it, but it should not be the wire-format starting point.

An AIML document describes:

- canonical source URL, title, publisher identity, publication/update dates, license, and revision;
- semantic blocks: heading, claim, paragraph, table, image, quote, citation, product, event, and action;
- stable source anchors back to the HTML or original document;
- relationships: hierarchy, citations, definitions, alternatives, and evidence;
- declared capabilities such as `summarize`, `compare`, `ask`, `extract`, and `purchase`;
- privacy and model-use policy for each capability;
- a signature or integrity record binding a representation to its publisher.

A browser must be able to render AIML as a normal readable document without asking a model. A model may propose a view or answer a question, but must cite the AIML blocks and retain a clear path to the original source.

### Illustrative shape

```json
{
  "version": "aiml/0.1",
  "source": { "canonicalUrl": "https://publisher.example/story", "title": "A story" },
  "blocks": [
    { "id": "claim-1", "type": "claim", "text": "…", "sourceAnchor": "#finding" },
    { "id": "evidence-1", "type": "citation", "text": "…", "supports": ["claim-1"] }
  ],
  "capabilities": ["summarize", "ask"],
  "integrity": { "algorithm": "ed25519", "signature": "…" }
}
```

## What we will build first

The initial Electron prototype establishes the reader-side interaction: Chromium displays any page; a visible sidebar offers reversible, user-triggered transformations; and the original page remains one click away.

The Cloudflare app follows as an AIML Studio and registry:

- host `.aiml.json` artifacts under publisher-controlled domains or a neutral registry;
- provide schema validation, preview, version history, and signature tooling;
- make it straightforward for a CMS, static site, React application, or API to publish an AIML link using a `<link rel="alternate">` declaration or an HTTP `Link` header;
- offer an opt-in developer API for generating a draft representation, requiring human review before publication;
- publish a conformance suite and reference renderer instead of creating a closed platform.

## Trust and agency are product requirements

AI Browser must be more trustworthy than the experience it improves.

- **No silent page mutation:** every transformation is user-initiated, attributable, and reversible.
- **No invented provenance:** model-generated material is labeled as such. Source-derived statements link to their precise source blocks.
- **Private by default:** ordinary DOM cleanup occurs locally. No page content is sent to a provider until the user enables a provider and initiates a model action.
- **Credential isolation:** provider credentials live outside websites, never in page JavaScript, and never in logs. Initial integrations are bring-your-own-provider.
- **Consent before action:** the browser may explain, prepare, or recommend; it must receive distinct permission before consequential actions such as purchasing, posting, sending, or sharing.
- **Publisher respect:** compliant representations carry publisher identity, links, licensing, and attribution. The browser does not use AIML to impersonate or obscure a publisher.
- **Interoperability:** the format, schemas, renderer, and conformance tests are open source under a permissive license.

## Shared benefit: amplify every participant

The project should amplify the value each participant brings to the web. Users bring attention and intent; publishers bring information, services, and creative work; advertisers bring discoverable products and offers; browser and adapter developers make those connections easier to use. Improvements should help these contributions reach the right person in a useful, understandable form.

This is a design objective, not a promise that interests never conflict. When tradeoffs arise, make them explicit, preserve the user's agency, respect publisher attribution and access rights, and test whether the proposed exchange creates value for all affected parties. Reduced advertising exposure must not be assumed to pay for itself through better engagement.

### The exchange

| Participant | Value amplified | Commitment owed to them |
| --- | --- | --- |
| User | Focus, understanding, accessibility, easier comparisons, and relevant discovery | Control over presentation and commercial content; clear sponsorship; privacy; inspectable sources |
| Publisher | Clearer communication, accurate representation, attribution, useful interactions, and qualified visitors | Preserve meaning, source links, licensing, and access controls; investigate sustainable compensation |
| Advertiser | Relevant opportunities to present products that fit a person's stated task | Disclosed placement rules, fair eligibility criteria, and meaningful measurement that respects privacy |
| Browser and adapter ecosystem | Adoption, interoperability, trusted contributions, and sustainable development | Transparent incentives, accountable adapter behavior, and business arrangements that preserve user trust |

### Commercial discovery as a useful service

Advertising can be useful information when it is relevant, clearly labeled, and welcome in the user's task. A person comparing hiking tents could choose to see sponsored offers that meet their budget and requirements. A person reading an unrelated article should retain control over whether and how commercial material appears.

The browser should distinguish three layers in both its data contracts and interface:

- **Publisher content:** the source information, its provenance, and available services or actions.
- **Sponsored offers:** identifiable paid placements, naming the sponsor and disclosing the commercial relationship, with product facts, eligibility constraints, and a destination.
- **Browser analysis:** attributed explanations, comparisons, or recommendations whose factual conclusions and task constraints remain independent of payment.

**Payment can buy a disclosed opportunity to be considered; it cannot buy a factual conclusion or override the user's constraints.** Sponsored candidates must meet the same stated requirements as other candidates, and sponsorship must remain visible after adaptation. The browser must not imply that a paid placement is an independent recommendation or erase sponsorship while preserving the promotional message.

Users should be able to invoke commercial discovery explicitly, set presentation preferences, and inspect why an offer appeared. Relevance should begin with the current task and consented context; participation must not depend on undisclosed cross-site tracking or selling private browsing content. Advertiser measurement should use the minimum necessary data and clearly defined outcomes, without promising personal information or attribution the browser cannot legitimately provide.

### Publisher sustainability and incentives

Making a publisher's message easier to understand is valuable, but does not by itself replace revenue. Evaluate options such as attributed referrals, subscriptions, direct support, user-permitted sponsored sections, and transparent revenue sharing with participating publishers. These are hypotheses to test, not implemented funding mechanisms or guaranteed outcomes.

Publisher-provided AIML and community adapters should describe content faithfully while leaving presentation choices with the user. Participation should improve accuracy and interoperability rather than grant a party hidden control over ranking, user preferences, or model conclusions. Commercial agreements that influence eligibility, placement, or compensation must be disclosed where they matter to a decision.

### Evidence of shared benefit

Evaluate more than exposure or clicks: user task completion and perceived control; publisher fidelity, qualified engagement, and sustainable compensation; advertiser relevance and useful conversions; and ecosystem trust and maintainability. Include complaints, unwanted interruptions, source misrepresentation, and privacy costs when assessing an experiment. A gain for one participant should not conceal a loss imposed on another.

## Identity and model access

The browser should support multiple providers. Where available, **Sign in with ChatGPT** is a user-authorized option—not a mechanism for the browser to assume or scrape a person’s account usage. OpenAI’s documented flow requires OAuth/PKCE consent; identity sign-in does not by itself grant access to ChatGPT-plan inference. The browser must check the granted scope, keep credentials in protected local storage, and make the active provider and expected data sharing clear.

## Measures of success

We will judge the first releases by evidence, not by novelty:

- readers choose transformed views repeatedly and restore the source rarely when the task is comprehension;
- transformations preserve essential information and source links;
- people can identify what came from the publisher versus the assistant;
- representative publishers can publish a valid AIML page without changing their core stack;
- model requests are demonstrably optional, minimized, and worth their latency/cost.

## Deliberate non-goals

- Forking and maintaining Chromium before the interaction has earned that cost.
- Blocking all ads or bypassing paywalls, access controls, licensing, or publisher terms.
- Replacing HTML, React, or the open web with a captive protocol.
- Autonomous browsing or transactions without distinct, contextual user authorization.
- Treating a chat answer as a source of truth when source material is available.

## Near-term milestones

1. Validate the local focus/reader/calm experience against real sites, including restore and source visibility.
2. Define `aiml/0.1` schema, source-anchor rules, signing model, and browser safety policy as an RFC.
3. Build the Cloudflare AIML Studio: validation, preview, hostable artifacts, and a minimal publisher integration.
4. Add a user-selected model provider for reviewed transform plans, with source-block citations and an explicit data-sharing preview.
5. Publish the protocol and reference renderer; invite independent implementers before expanding to agents or transactions.
