# Brand discovery and collections

`#brands` shows the five monochrome manufacturer logos and labelled collection buttons. Both the logo and button navigate to the same brand collection:

| Brand | Route | Published model listings |
| --- | --- | --- |
| Volkswagen | `#brand-vw` | 22 |
| Audi | `#brand-audi` | 18 |
| Škoda | `#brand-skoda` | 15 |
| CUPRA | `#brand-cupra` | 6 |
| SEAT | `#brand-seat` | 4 |

All collections reuse the sourced 65-model library and existing vehicle cards, original PDF links, media galleries and detail pages. Counts are calculated from the dataset rather than used as live-stock claims.

Brand collection routes lock the result scope to their own brand. Engine and body choices show only types represented in that collection. Starting-price budgets, model search and numeric price/name sorting remain available. Reset clears optional filters without changing the brand; the active-filter badge excludes the fixed brand. Switching between brands and returning from vehicle details restores the saved collection filters and result limit.

`#cars` now opens the full model catalogue instead of the sample-model placeholder. `#prices` retains its existing document-library presentation and full-set PDF download. eHub remains a separate specific-offer journey.

Implementation: `dist/brands.js` / `brands.css`, shared collection scope in `vehicle-library-core.mjs`, presentation/state handling in `vehicle-library.js`, routes in `app.js`. Existing navigation and homepage brand links already use these routes.

Validation: seven new functional checks cover logo destinations, all five brand scopes, resets, filter counts and sorting, independent state restoration, direct collection links, all-model defaults, and return navigation from vehicle details. Existing 36 domain/regression checks also passed. JavaScript syntax, stylesheet delimiters, logo assets and script order were checked. Browser visual QA remains unavailable following the earlier automatic approval review rejection under the workspace credit limit; no alternate browser path was attempted.
