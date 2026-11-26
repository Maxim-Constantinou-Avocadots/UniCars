# UniCars charging map

Imported from the existing UniCars Charging Network prototype, source revision
40c191b8a5c11b3733a0bd8d598bfaf57da8bf03. Original vendor scripts and media bytes
are preserved. The main website renders this experience at `#chargers` under
its shared navigation. Station share links use `#chargers?station=<id>`.

The 21 mapped station locations are a snapshot, without live availability.
The map includes search, filters, directions, geolocation, 2D/3D rendering,
and a raster fallback. Language and charging-help controls remain in the map.

The browser token is supplied by `scripts/build-wix.py` during deployment;
it is never committed. Fresh builds preserve the existing token from the live
Wix configuration. An explicit `UNICARS_MAPBOX_PUBLIC_TOKEN` environment
variable or ignored `wix/runtime-map-config.json` can override that source.
Mapbox GL JS and Leaflet retain their upstream copyright/license notices.
