# Price lists & brochures model library

Entry point: `#prices`. All 65 listings from the active Greek price-list page are represented; 64 unique original PDFs are hosted locally. Enyaq RS and Enyaq Coupe RS share a document. Source checked 19 November 2026.

## Experience

- Compact, bordered cards with full model imagery, entry-model powertrain/gearbox/body labels and starting price.
- Model galleries reuse additional sourced photographs where available. Single-image models have no redundant controls. Galleries support touch, keyboard and arrow buttons.
- Brand tabs, accent-insensitive search, available-engine/body filters, entry-price budgets, numeric price sorting, active filter removal and clear/reset states.
- Mobile filters expand inline; brand tabs scroll horizontally. Results are progressively revealed in batches of 24.
- Each `#range-<id>` detail page includes the model gallery, baseline price, available engine categories, source-document preview, individual PDF download and contact link.
- A one-click 27 MB ZIP download contains all original PDFs, an indexed manifest and a source/readme note. The browser assembles two static archive parts and checks their combined size and SHA-256 because the host limits individual files to 25 MB.

## Data and boundaries

`dist/data/vehicle-library.json` records source URL, original PDF checksum, extracted baseline evidence, source-issued date, check date, local document and photo paths for every listing. Prices include VAT, registration and road tax according to each source. They are list prices, not campaign discounts or confirmed stock.

Filter budgets apply to the entry model's price. Selecting an available engine does not replace the baseline price with that version's price; cards explicitly flag a matching alternative engine and refer to the PDF for its price. Full, mild and plug-in hybrids remain distinct. Caddy Cargo/Maxi Cargo entry-gearbox labels are omitted because the price rows do not state them.

Kodiaq RS: the public source PDF says July 2027. This future date is retained and clearly flagged for confirmation in the card and detail page.

The Smart Search pilot remains a separate, limited demonstration catalogue; this page does not connect live inventory or expand AI search coverage automatically.

## Updating

Refresh documents from the active listings (ignore commented-out HTML), validate the entry-model prices and engine classifications against the PDFs, update the source manifest/check date, replace PDF previews and regenerate the ZIP. Preserve originals. Additional model photos must show the correct model, with equipment/variant captions.

Verification: `node --test tests/vehicle-library.test.mjs tests/smart-search.test.mjs`. Source checks include PDF signatures/checksums, local media and document paths, all model IDs/prices, combined filters, accurate hybrid categories, stable sorting and source-date exceptions. Interaction checks also exercised pagination, reset, search, escaping and gallery keyboard/arrow controls. Visual browser QA was unavailable because automatic approval review blocked browser access under the workspace credit limit.
