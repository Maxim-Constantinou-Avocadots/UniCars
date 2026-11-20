# Book a test drive

Route: `#test-drive`. Supports `#test-drive?model=<range-model-id>`, `smart-vehicle-<version-id>` and `ehub-car-<listing-id>` as preselection values.

The page uses the existing UniCars typography, blue, button geometry, monochrome brand marks and locally hosted vehicle imagery. A photographic panel and frosted selection summary sit alongside a four-step form: car, visit, contact details and review. On narrow screens the content becomes a single column, brand names remain readable, vehicle options use two columns and the visit calendar fills the form width.

All 65 imported model listings are searchable. Brand selection narrows the range. Existing header, mobile-menu, footer and legacy test-drive actions open the page. Model-library, Smart Search and eHub detail links carry their vehicle context into the form; an eHub car retains its original reference even when it is outside the active model range.

Sales-location choices reuse the published contact directory already held by the contact page. Locations are filtered by their listed brands, without implying test-drive car availability. Dates use the Cyprus timezone, start tomorrow and allow preferences over the next 90 days. Morning, afternoon and flexible time preferences are requests, not live availability slots.

The review stage permits editing prior steps, revalidates all choices and provides a clearly labelled request preview. No details are submitted, persisted in browser storage or sent to an external service. The final screen links to the selected sales contact's telephone number. A production booking endpoint, delivery destination, availability rules and approved privacy content are needed before accepting live requests.

Validation: `node --test tests/*.test.mjs` (74 passing checks). New coverage includes date boundaries, calendar month transitions, all model preselection routes, brand-specific locations, contact validation, step progression/editing, exact eHub reference retention, escaped user content and route integration. Browser visual verification remains unavailable because the earlier automatic approval review reported the workspace credit limit; no browser QA is claimed.
