# UniCars Smart Search MVP

## Delivered

The existing homepage now includes a branded natural-language search composer, a smooth typing/deleting hint that stops on focus, three example journeys, and a responsive search-results route. Generic hybrid searches immediately show all eligible full, plug-in and mild hybrid options, labelled by type. Cards group matching trims within the same model and powertrain; distinct powertrains remain separate options. All matches are visible without an extra question or a more-results disclosure. Customers can start a new search, open a qualifying version and preview an enquiry with the selected version and price carried through.

The published experience is explicitly **demo mode**. It uses a limited local parser and deterministic catalogue filtering. It does not make a live LLM request, connect stock, submit enquiries, calculate finance or estimate commute costs. Search prompts remain in page memory; they are not put into public URLs or saved to browser storage.

## Catalogue

15 selected versions / 10 models / 5 brands, copied from the official UniCars price-list PDFs linked in `dist/data/vehicles.json`. The listing was checked on 13 November 2026. Issue dates range from October 2025 to November 2026. `dist/data/vehicles.csv` is available for review through the results page.

Published prices retain their source/version; campaign discounts are not silently applied. Catalogue prices include VAT, registration and road tax as stated in the PDFs. Final price and availability require confirmation. Model images come from the official UniCars price-list page; origins are recorded in `dist/assets/vehicles/SOURCES.json`. Images illustrate the model, not a guaranteed version/equipment configuration.

Passenger capacity, boot volume and child-seat compatibility are intentionally unknown. Family use is recorded, but it is not a verified suitability claim. Searches for more than five passengers return no verified match in this pilot. Do not present an empty result as proof that UniCars has no such vehicle in its wider range. Catalogue entries need client approval before production.

## Demo script

1. On the homepage choose **Family & hybrid**. The request includes a family of four, Larnaca–Nicosia commute and €33,000 maximum. The results immediately include the qualifying Golf full hybrid and the mild-hybrid Golf and Octavia. Each card names its hybrid type. The Golf full-hybrid version is €29,900; its model-range base price is shown separately. More trims are available on its dedicated vehicle page. Seating and child-seat suitability remain unverified and are explicitly flagged.
2. Use **New search** and enter **a plug-in hybrid under €33,000**. No vehicle qualifies; the budget is not increased automatically. Change budget to **€45,000** to see qualifying published plug-in options.
3. Start again with **Electric commute**. Charging context is recorded; matched electric versions show source prices. No route/range guarantee is calculated.
4. Try **automatic under €23,000**. The pilot can shortlist Ibiza and Kamiq. Open a version and preview an enquiry; nothing is sent.
5. Try **€500 per month**. The pilot asks for a purchase budget instead of inventing a finance repayment calculation.

## Live API implementation prepared, not deployed

`server/smart-search.mjs` implements a server-only POST handler using the OpenAI Responses API and strict Structured Outputs. The model only extracts criteria; the same deterministic catalogue rules run on the server. It validates method, origin, content type, body size, prompt length, and response completeness/refusals. It does not expose upstream error details or credentials. It requires both `OPENAI_API_KEY` and `SMART_SEARCH_ENABLED=true`. `OPENAI_MODEL` defaults to `gpt-5.4-mini` and should be benchmarked before client use. `store:false` is requested; this does not imply zero provider retention.

The current Site is static. The handler is source-prepared and tested with mocked API responses, **not yet deployed or tested against a live model**. `apiEnabled` remains false in `dist/smart-search.mjs` so the public demo never incurs model charges. Backend activation requires a Worker/server deployment with this handler wired to `/api/smart-search`, preserving the existing Site identity and frontend assets, followed by setting `apiEnabled=true`. Do not simply expose a key in browser JavaScript.

Before enabling live calls:

- Create a dedicated API project with billing, a project service account, and appropriate spend controls. Add credentials through server-side secret settings, not chat, source control or frontend forms.
- Deploy the server route and enforce platform-level rate limiting / bot controls and a persistent usage cap. Same-origin checking alone is not rate limiting or authentication. For a client-only pilot, restrict access at the application layer or use a private test deployment; do not change the current Site's public audience without the user's instruction.
- Confirm retention, disclosure and logging policy. Do not log raw prompts or precise addresses by default.
- Run real English / Greek / Greeklish extraction evaluations and adversarial/negation tests. The local parser only supports common phrases and can miss nuanced requests; the recorded criteria and source catalogue determine the demo results.
- Confirm price-list data with UniCars, complete seating/practicality fields, and agree a refresh owner/cadence. Stock remains separate until a feed exists.

## Validation

`node --test tests/smart-search.test.mjs` covers hard price limits, powertrain separation, follow-up preservation, monthly budgets, negation, basic Greek, unknown/service intent, unknown seating, malformed requests, missing credentials, valid structured extraction, refusal and incomplete-response handling. Live model accuracy and live API availability are not established by mocked tests.

## Compact results and model cards

The results introduction is now a compact heading and expandable request summary. Results precede charging questions, checks and filter controls. Cards remain compact even for a one-model result. Each of the ten models has a local photo gallery with native touch/trackpad scroll, arrow buttons, position dots, boundary states and keyboard support. Official manufacturer images and model-range baseline prices are recorded in `dist/data/model-media.json`, with source URLs and credits. Photo captions identify illustrative/optional equipment.

The card's **base model from** price is a model-range reference; a separate matching-version price appears whenever it differs. This lower starting price never changes search eligibility. The primary CTA leads to the dedicated vehicle/version page, which also has the gallery and the selected version's price. No live stock or live AI capability has been added by this presentation update.
