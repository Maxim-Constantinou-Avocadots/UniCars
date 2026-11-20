# eHub redesign

Published route: `#available`; specific vehicle route: `#ehub-car-<source handle>`.

The original eHub is a Shopify catalogue for expressions of interest, not a binding online vehicle purchase. The redesign integrates that journey into the existing UniCars navigation and visual system.

## Included

- 54 distinct public listings imported on 19 November 2026: 27 tagged new, 23 test-drive and 4 Audi Approved. No vehicles are merged merely because their models are identical.
- 97 locally hosted listing image entries, with keyboard/touch galleries where multiple source images exist. Shared images retain their original listing association. Approved imagery is contained in full to preserve the supplied image/logo.
- Featured genuine offers with exact offer, reference and saving amounts. No inferred historical selling price.
- Brand, engine, condition and offer-budget filters; model/colour/reference search; numeric price/saving sorting; removable filters, empty/reset state, progressive results.
- Up to three specific listings compared by offer price, saving, status, engine, gearbox, colour, reference, power, stated electric range and selected extra equipment.
- Detail pages retain all supplied technical lines and extra-equipment items. Stock reference is displayed only when supplied. Legacy slugs never override the source product title (e.g. an old Ateca slug currently describes a Born).
- Enquiry actions open the original vehicle listing on eHub. Call actions use the existing Unicars head-office number. No payment/reservation flow or unconnected enquiry form is presented as working.
- FAQs explain the actual nonbinding process, fixed vehicle equipment and mixed fuel types.

## Hero

A cinematic video frame: brand chips with the live listing count and top published saving, a centred headline, "Explore the cars" and "How eHub works", and the three featured offers (exact price and saving, linking to each listing) along the base. The background film (`assets/ehub-hero-film*.mp4`, provenance in `assets/ehub-hero-film.source.json`) loads only when the hero is on screen, uses a 720p file at 800px and below, has a visible pause/play control, and stays on its poster for reduced-motion and data-saver users. Text contrast was measured over the brightest film frame (≥4.5:1).

## Integration boundary

`dist/data/ehub.json` is a dated public-source snapshot; it is not automatically refreshed. Shopify's public available flag is retained as source data but never promoted to a live stock guarantee. Before production, connect an authorised catalogue/inventory refresh and the agreed lead destination. Preserve original listing and variant identity, vehicle status, prices and equipment.

Source: https://www.ehub.unicars.com.cy/; public `/products.json?limit=250`, with page 2 checked empty. Product details and FAQ were also reviewed. Preserve source attribution and the meaningful indicative-photo/availability notes.

## Validation

36 domain/regression tests passed across eHub, the price-list library and Smart Search. Separate interaction checks exercised filters, pagination, hero selection, compare modal/clear behavior, deep links, original enquiry URLs and image keyboard controls. Source markup checks found no duplicate IDs/nested links or buttons; JS syntax and CSS delimiter checks passed.

Design lint: 0 failures; the outline warning is intentional because this reuses the user's existing bordered controls/cards and boxed-icon button system. Browser/visual inspection remains unavailable: automatic approval review previously blocked browser access due to the workspace credit limit. No alternate browser path was attempted.
