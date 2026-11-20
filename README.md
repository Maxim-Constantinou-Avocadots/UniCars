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

The imported source passed 77 checks before export. Browser visual verification of the latest changes was unavailable; older screenshots in `qa/` are historical references.

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

Smart Search currently uses local matching rules. A live LLM is not connected. Contact and test-drive forms are interactive previews: they do not send requests, reserve appointments or persist personal details.

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

Hosting migration does not connect Wix Forms, live inventory, a CMS or an LLM. Existing forms remain clearly labelled local previews. Visual browser QA was unavailable during migration; automated source, build and published-file verification are separate from visual review.

The retained `.openai/hosting.json` identifies the existing Site. It contains no credentials. Do not add API keys or tokens to Git; use runtime environment variables for a future production integration.

The original early-navigation README is retained in `docs/legacy-navigation-readme.md`. Its descriptions and screenshots reflect that earlier stage of the project.
