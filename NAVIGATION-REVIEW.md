# Navigation journey review

Reviewed against Alex’s EN/GR recommendations (GA4 Jan 1–Nov 11 2026 and prior Ubersuggest estimates). These data guide page coverage; they do not establish usability or conversions.

| Need | Route |
| --- | --- |
| Know a model | Explore vehicles → model search → model → global test-drive request, selected model retained |
| Prefer a brand | Explore vehicles → brand, or Explore all brands → brand → models |
| Browse without a model | Explore vehicles → All new models / SUVs / electric / hybrid / commercial |
| Want available inventory | Available vehicles in main navigation |
| Check affordability | Price lists & brochures in utility and vehicle dropdown; offers and finance grouped beside it |
| Need a test drive | One global header CTA; one mobile drawer CTA when compact header hides it |
| Need maintenance | Support → Book a service, or servicing → brand-specific service |
| Need repair or parts | Support → Body & paint / Genuine parts |
| Need ownership information | Support → Warranty / recalls / batteries / engine information; end-of-life below |
| Own or consider an EV | For EVs → ownership / home charging / charging FAQ; one Find a charger CTA |
| Need a local facility | Visit Us → city or showroom/service-centre route |
| Unsure whom to ask | Contact; contextual help link in vehicle and EV menus |

## Corrections
- Sales renamed Explore vehicles to match discovery, brands, models and pricing content.
- Explore all brands added as an explicit overview route.
- Removed test-drive repeats from vehicle and location dropdowns.
- Removed repeated charger and electric-car links inside the EV dropdown.
- Removed repeated service shortcuts from utility/mobile quick links; preserved Support booking action.
- Removed duplicate available-inventory CTA inside the vehicle dropdown; retained main-nav entry.
- Added labelled model search with results and an empty-state route back to browsing/contact.
- Added model selection to global test-drive and quote requests, including help choosing.

## Prototype limits and launch requirements
- Four sample models from Alex’s document demonstrate search, not the complete current catalogue.
- Stock, prices, downloads, facility addresses, bookings and forms remain illustrative/unconnected.
- Model/category and stock journeys must retain selected brand/model filters in production.
- EN/GR language switching should retain equivalent page and selected context.
- Verify facility-level services; do not infer every service exists in every city.
- Conduct short task tests with buyers and owners: first choice, completion, wrong turns, mobile and Greek labels. Measure enquiries/bookings and search no-results. Analytics totals alone cannot prove the nav optimal.

## Verification
Desktop keyboard navigation, all-brands route, model search → Audi Q3 → test-drive context, EV link/action duplication, Support booking count, location menu routes, mobile T-Roc search, no horizontal overflow at mobile viewport. JavaScript syntax checked.

## Follow-up refinement
Removed model search from desktop and mobile Explore vehicles menus. Search remains on the all-models destination. Group headings use 20px semibold dark text on desktop (18px on narrower desktop), and 18px on mobile. Reduced vehicle menu minimum image height to maintain a compact composition. Desktop and mobile checked for heading clipping and horizontal overflow.
