# Homepage concept

English, offers and enquiries first, as selected by Max. Retains the agreed click-open navigation and footer. The reference informed large automotive imagery, brand discovery and substantial offer sections; no rental claims or unsupported testimonials are used.

## Implementation
- Full-width Volkswagen Tiguan campaign banner; portrait original artwork on mobile.
- Filterable four-poster homepage gallery; five-campaign offers destination connected to the menu CTA.
- Campaign dialog retains selected offer and lets the user choose an offer enquiry or test drive. Native required/email validation, demonstrative confirmation, close/Escape and focus return.
- Campaign finder filters by brand and published starting price. Offers without a published numeric starting price are excluded when a numeric budget is selected. No-match state routes to model browsing.
- Interactive EV topics and purchasing/electric/ownership FAQ accordions.
- Service action and published Care Plan poster.

## Sources and production limits
Artwork downloaded from https://www.unicars.com/gr/offers-sales.php and its linked Tiguan campaign page on 13 November 2026. Brand-owned campaign materials used for the client redesign prototype; no third-party stock imagery or generated campaign claims.

- /gr/images/campaigns/tiguan-campaign-slider.webp — hero
- /gr/images/campaigns/tiguan-offers.webp — portrait campaign and dialog
- /gr/images/vw-suv-taigo-t-cross-offers.webp — Volkswagen offer
- /gr/images/kodiaq-campaign-offers.webp — Škoda offer
- /gr/images/campaigns/offers-audi-q3.webp — Audi offer
- /gr/images/raval-offers.webp — CUPRA offer and EV feature
- /gr/images/after-sales-offers.webp — Care Plan feature

Published prices and bonus amounts are represented from the supplied/linked campaign artwork. No claim is made that a specific vehicle is in stock or that these offers apply without eligibility/terms confirmation. Greek wording embedded in original posters remains unchanged. Forms send and persist nothing; live stock, bookings, CRM, privacy consent and full model/Greek destinations are production work.

## Verification
JavaScript syntax checks passed for app.js and home.js. Managed browser reviewed at 1363px desktop, 768px tablet frame and 390px mobile frame. No horizontal overflow. Tested Audi/CUPRA gallery filtering; Audi Q3 enquiry with preview@example.com; selected campaign retained, native form flow and local success; finder Volkswagen under €35k and SEAT no-match; EV road topic; ownership FAQ expansion; menu → offers destination. Confirmed Care Plan image loads with reserved dimensions.

Screenshots: qa/homepage-hero.jpg and qa/homepage-full.jpg. Browser QA used supported CUA controls, not the standalone design inspector. Remaining existing destination pages are illustrative. Images are on-page credited via Unicars offers link.

## Brand logo refinement
Five black SVG brand logos replace the text ribbon. Staggered entrance, restrained lift/scale on hover/focus, revealed model-browsing label, reduced-motion fallback and persistent touch labels. Mobile uses a three-column grid. Logos link to brand-specific model listings; SEAT lists Ibiza and Arona, VW lists Tiguan/Taigo/T-Cross/T-Roc, with other brands filtered to matching sample models. The listings are clearly labelled illustrative, not complete stock feeds. Checked SVG loads, black styling, desktop VW/SEAT routing and mobile logo grid overflow. Sources in dist/assets/brands/SOURCES.md.
