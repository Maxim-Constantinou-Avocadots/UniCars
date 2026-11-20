# UniCars website prototype

Source for the UniCars website concept, including both homepage variants, responsive navigation, vehicle collections, eHub, contact and test-drive pages.

## Live prototype

https://unicars-navigation-concept.avocadots-9013.chatgpt.site/

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

## Hosting and source provenance

Imported from Sites version **61**, source commit `6b3dabca2f7cc61f324bb767c1364f1fb2fc4fc9`.

This GitHub repository is a complete source snapshot. The existing prototype remains hosted on Sites. GitHub pushes do not automatically deploy to Sites unless a deployment workflow is configured.

The retained `.openai/hosting.json` identifies the existing Site. It contains no credentials. Do not add API keys or tokens to Git; use runtime environment variables for a future production integration.

The original early-navigation README is retained in `docs/legacy-navigation-readme.md`. Its descriptions and screenshots reflect that earlier stage of the project.
