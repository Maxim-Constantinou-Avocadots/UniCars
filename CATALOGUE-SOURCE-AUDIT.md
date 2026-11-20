# UniCars catalogue import — 20 November 2026

## Scope and reconciled totals

| Source | Copied records | Evidence |
| --- | ---: | --- |
| Main Unicars model range | 65 model listings | Every card in the active Greek price-list page |
| Model versions and prices | 303 priced entries | Original model price-table rows, with page evidence |
| eHub | 54 individual cars | Public product API, all product pages and product sitemap agree |
| Original PDFs | 68 documents / 505 pages | 64 main model documents plus 4 additional eHub-linked equipment documents |
| eHub photographs | 97 image entries | All source product images copied locally |
| Model-range images | 65 refreshed assets | Every active main-site model image re-fetched |
| Homepage vehicle campaigns | 16 | Original posters and source-page text retained |

The searchable dataset contains 357 records: 303 priced model versions and 54 specific eHub listings. These are not 357 physical cars. Named performance derivatives are searchable under their own names; source model-family grouping is retained. Search groups qualifying model versions for readability and preserves every qualifying version on the corresponding detail page. Individual eHub cars are never merged.

## Sources and files

- Main entry: https://www.unicars.com/gr/index.php
- Active model/price documents: https://www.unicars.com/gr/pricelists.php
- eHub: https://www.ehub.unicars.com.cy/
- `dist/data/vehicles.json` and `vehicles.csv`: complete normalized search records, original source URLs, exact prices and evidence.
- `dist/data/vehicle-library.json`: all 65 model cards, all 303 version rows, local documents, campaigns and media.
- `dist/data/ehub.json`: all 54 specific cars, current source price, comparison price, source availability flag, reference, colour, condition, technical details, equipment, all original product fields and full published body sections.
- `dist/data/source/`: public API snapshot, sitemap reconciliation, complete page text, source image audit, campaign and crawl manifests.
- `dist/data/documents/`: all 505 extracted PDF pages with original PDF SHA-256 checksums. Diagrams remain in the complete PDFs; text extraction is not OCR of diagrams.
- `dist/documents/price-lists/`: 68 unmodified original PDFs. Bulk download reconstructs one ZIP with byte-count and SHA-256 verification.

## Accuracy rules

Model baseline/list prices and exact eHub offer prices are displayed separately. Engine/body/budget filtering uses the price of a qualifying version, not an unrelated entry model. Matching-version prices appear alongside range baselines. Gearbox facts come from the imported row rather than a hard-coded automatic label. Brand-qualified media prevent the SEAT Leon and CUPRA Leon baselines from being mixed. Performance derivative images are labelled as model-family illustrations where an exact variant photograph is unavailable.

Missing mileage, capacity, or other unstated fields are not invented. Nine performance-version rows do not explicitly identify their engine category; they retain their original row text and are excluded from guaranteed engine-type matches. All underlying specifications remain accessible in the original document.

Campaign discounts are preserved as campaign material; they are not automatically applied to standard price-table rows. Vehicle status and source availability are separate from a promise of real-time stock.

## Source exceptions

- The Kodiaq RS document states **July 2027**, after the audit date. Its date and price are flagged for confirmation.
- The homepage's `/gr/automotion/index.php` link returned HTTP 404.
- `/gr/unicars4all.php` redirected to the main homepage and did not expose a separate vehicle catalogue.
- This is a snapshot checked on **20 November 2026**, not a live inventory feed. Source sites may change after import.

## Search and validation

The prototype uses local natural-language rules, not a connected LLM. Applied search filters cover budget, brand/model, engine, body, gearbox and source/vehicle status. Range, mileage, colour, charging, household suitability and other requirements are not guaranteed semantic filters. The interface states that those requirements need confirmation.

Regression checks cover complete source reconciliation, 68 PDF hashes, 505 extracted pages, model and stock prices, engine/budget intersections, performance derivatives, CSV/export integrity, source tabs, model detail tables, eHub full details, escaped specification snippets and PDF page links. Browser visual verification was unavailable because automatic approval review reported the workspace credit limit; no browser QA is claimed.

Run `node --test tests/*.test.mjs` for checks. After data edits, run `python scripts/finalize-catalogue.py` to rebuild the full CSV and document ZIP parts.
