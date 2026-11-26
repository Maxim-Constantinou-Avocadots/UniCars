# Volkswagen ID.3 Neo product experience

Imported from the approved UniCars refined product prototype:
https://unicars-id3-refined.avocadots-9013.chatgpt.site/

Source revision: `5202ff467d3644711b4f3d5ef0307d8d3dd47158`.

The original gallery, battery and Life/Style selection, price matrix, charging
calculator, comparison, equipment, range/charging guidance, FAQs and caveats
are retained. Photographs remain © Volkswagen and retain their original bytes
in Wix Media. Six version prices match the existing model-library snapshot.

Integration uses the main site's shared header, footer, routes and live Wix
forms. The standalone header, footer, preview toolbar and simulated enquiry
dialog are not mounted. Selection is carried into quote and test-drive
requests. eHub's older ID.3 listings retain their own listing pages.

Styles are scoped beneath `#id3ProductRoot` and the gallery lightbox portals
inside that root. The original React interface uses a small compatibility
runtime built with React and React DOM 19.2.8 (MIT); upstream notices remain
in the browser bundle. Source and optional rebuild instructions are in
`scripts/id3-runtime-entry.mjs` and `scripts/build-id3-runtime.mjs`.
The normal build remains static and needs no npm installation.
