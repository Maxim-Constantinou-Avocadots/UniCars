# UniCars website prototype

Source for the UniCars website concept, including both homepage variants, responsive navigation, vehicle collections, eHub, contact and test-drive pages.

## Wix hosting

Target: https://unicars-avocadots-0709.wix-site-host.com/

The original Sites preview is retained at https://unicars-navigation-concept.avocadots-9013.chatgpt.site/. Future changes use this repository and the Wix target.

| Page | Route |
| --- | --- |
| Homepage A — Smart Search | `/#home` |
| Homepage B — vehicle discovery | `/#home-cro` |
| All brands | `/#brands` |
| Full model range | `/#cars` |
| Price lists and brochures | `/#prices` |
| eHub cars and offers | `/#available` |
| Book a test drive | `/#test-drive` |
| Contact | `/#contact` |

## Run locally

No build step or package installation is required. From the repository root, serve the static files:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000/. Use `python` instead of `python3` if that is how Python is installed on your computer.

Run the regression checks with a current Node.js release:

```sh
node --test tests/*.test.mjs
```

The imported source passed 77 checks before export; the current suite has 80 checks, including dashboard-backed form rules and submission/error behaviour. Browser visual verification of the latest changes was unavailable; older screenshots in `qa/` are historical references.

## Project structure

- `dist/`: complete static website and locally hosted assets.
- `dist/data/`: model, price, equipment, source and eHub snapshots.
- `dist/documents/`: original PDFs and checked bulk-download ZIP parts.
- `server/smart-search.mjs`: optional AI-search server handler; not connected to the static prototype.
- `tests/`: data, search, navigation and form regression checks.
- `scripts/finalize-catalogue.py`: rebuild the catalogue CSV and PDF download parts after data changes.
- `wix/`: target site configuration and original-file-to-Wix-Media mapping; no credentials.
- `scripts/build-wix.py`: creates the Wix deployment without modifying canonical source data.
- `scripts/publish-wix.py`: publishes and verifies a complete build using an authenticated Wix CLI session.
- `.github/workflows/wix-deploy.yml`: tests, builds and optionally deploys main to Wix.
- `qa/`: historical review screenshots.
- Root Markdown documents: design rationale, source audit and implementation notes.

## Catalogue and form status

The snapshot was checked on **20 November 2026** and contains 65 main-site model listings, 303 priced model versions, 54 individual eHub cars, 68 original PDFs and 16 vehicle campaigns. These are published source records, not live inventory. Prices and availability need confirmation with Unicars; missing source fields and unusual document dates remain flagged.

Smart Search currently uses local matching rules. A live LLM is not connected. Contact, test-drive, offer, sales/support, newsletter and feedback forms use Wix Forms. Their live schemas, validation and submissions come from Wix through anonymous visitor authentication. Test-drive and service requests require team confirmation; they do not reserve appointments. Newsletter forms record signup requests; no mailing campaign or notification automation has been configured.

## Hosting and source provenance

Imported from Sites version **61**, source commit `6b3dabca2f7cc61f324bb767c1364f1fb2fc4fc9`.

This GitHub repository is the canonical source. The Wix build moves original images, videos, PDFs and the complete PDF archive to Wix Media; HTML, CSS, JavaScript, JSON and SVGs stay in the static deployment. It preserves both homepage variants and existing hash routes.

Prompted edits can be implemented here, tested, committed to GitHub and published through the connected Wix plugin. This does not require sharing an API key in chat. The deployed `deployment-manifest.json` records the exact GitHub commit and file checksums.

For unattended GitHub-to-Wix deployments, an owner must add a Wix account API key as the repository Actions secret `WIX_API_KEY`. Until that secret is added, GitHub Actions validates and builds, explicitly reports the missing credential, and skips publication. Connected-plugin credentials are not copied to GitHub. Never paste a key in chat or commit it. CLI authentication is documented at https://dev.wix.com/docs/wix-cli/cli/command-reference/global-commands/login.

Build a Wix deployment with:

```sh
node --test tests/*.test.mjs
python3 scripts/build-wix.py
```

The generated `wix-site.zip` has `index.html` at its root. Publish that ZIP to site `7f793d65-03fd-425a-a784-58a0d3f114f0` using the connected Wix plugin, or run `python3 scripts/publish-wix.py` after authenticating the Wix CLI. Publish only after committing and rebuilding so the manifest matches GitHub.

When an asset changes, upload the original replacement to Wix Media and update its URL and source SHA-256 in `wix/media-map.json`. The build rejects missing/stale mappings and enforces Wix static hosting limits. If the all-PDF archive changes, upload the reconstructed archive and update `archiveUrl` and `archiveSha256` in `wix/site.json`.

Wix Forms is connected. The catalogue remains a static snapshot; a live inventory feed, CMS and LLM are not connected. Visual browser QA was unavailable during migration; automated source, build and published-file verification are separate from visual review.

The retained `.openai/hosting.json` identifies the existing Site. It contains no credentials. Do not add API keys or tokens to Git; use runtime environment variables for a future production integration.

The original early-navigation README is retained in `docs/legacy-navigation-readme.md`. Its descriptions and screenshots reflect that earlier stage of the project.

## Forms in the Wix dashboard

Open https://manage.wix.com/dashboard/7f793d65-03fd-425a-a784-58a0d3f114f0/wix-forms and select a form, then Submissions. Public form IDs and presentation hints are in `dist/data/wix-forms.json`. Original Wix browser modules are checked into `dist/js/wix/`, so a complete GitHub deployment preserves the backend connection. `dist/wix-forms-ui.mjs` renders the live schema; owner-added or renamed fields, validation, rules, steps and submit settings are read at runtime. Optional presentation hints preserve vehicle cards, brand logos and the calendar; unknown/new fields use the standard renderer.

No account API key is used in browser code. The public OAuth client ID mints visitor tokens; only the signed-in Wix dashboard can read submissions. Six forms were created on 20 November 2026. Synthetic QA entries are clearly marked and may appear in spam review.
