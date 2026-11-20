# UniCars website prototype

Source for the UniCars website concept, including both homepage variants, responsive navigation, vehicle collections, eHub, contact and test-drive pages.

## Live prototype

https://unicars-avocadots-0709.wix-site-host.com/ (Wix, released from this repository; see [Hosting on Wix](#hosting-on-wix)). The earlier Sites copy: https://unicars-navigation-concept.avocadots-9013.chatgpt.site/

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
- `qa/`: historical review screenshots.
- Root Markdown documents: design rationale, source audit and implementation notes.

## Catalogue and form status

The snapshot was checked on **20 November 2026** and contains 65 main-site model listings, 303 priced model versions, 54 individual eHub cars, 68 original PDFs and 16 vehicle campaigns. These are published source records, not live inventory. Prices and availability need confirmation with Unicars; missing source fields and unusual document dates remain flagged.

Smart Search currently uses local matching rules. A live LLM is not connected. Contact and test-drive forms are interactive previews: they do not send requests, reserve appointments or persist personal details.

## Hosting on Wix

The site is hosted on Wix Headless and released from this repository. **GitHub is the source of truth**: every push to `main` that changes `dist/` (or the hosting files) runs `.github/workflows/deploy-wix.yml`, which runs the checks and then `wix release`, uploading `dist/` to Wix.

- Live site: https://unicars-avocadots-0709.wix-site-host.com/
- Dashboard: https://manage.wix.com/dashboard/7f793d65-03fd-425a-a784-58a0d3f114f0
- `wix.config.json` links this repository to the Wix site (site ID and its headless app ID) and names `dist/` as the folder to release.
- `package.json` pins the Wix CLI. It needs Node 24.22.1 or later; the workflow uses Node 24.

Make every change here and push it; don't upload files to the site through the Wix dashboard or another tool, or the next release from GitHub will overwrite them. To re-release without a change (for example to clear Wix's cache), run **Deploy to Wix** from the Actions tab.

### One-time setup

1. In the Wix [API Keys Manager](https://manage.wix.com/account/api-keys), generate an API key with access to the **Unicars** site only.
2. In this repository, go to **Settings → Secrets and variables → Actions** and add it as a repository secret named `WIX_API_KEY`.
3. Run **Deploy to Wix** from the Actions tab, or push to `main`.

### Releasing from your own computer

```sh
npm ci
npx wix login      # browser login, once
npx wix release
```

### Limits

A Wix release can include at most 5,000 files; the workflow checks this before releasing. `dist/` is large (about 120 MB, mostly price-list PDFs and the bulk-download parts in `dist/documents/`). If Wix refuses the release for its size, move those files to Wix Media and link them from there.

## Source provenance

Imported from Sites version **61**, source commit `6b3dabca2f7cc61f324bb767c1364f1fb2fc4fc9`. The retained `.openai/hosting.json` identifies the earlier Sites prototype; it contains no credentials. Do not add API keys or tokens to Git: the Wix key lives only in the `WIX_API_KEY` repository secret.

The original early-navigation README is retained in `docs/legacy-navigation-readme.md`. Its descriptions and screenshots reflect that earlier stage of the project.
