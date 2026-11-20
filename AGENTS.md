# UniCars development and deployment

- Canonical source: this GitHub repository. Edit `dist/`; preserve both homepages and existing routes unless asked to change them.
- Wix target: `7f793d65-03fd-425a-a784-58a0d3f114f0`. Configuration is in `wix/site.json`. Do not create a replacement site or publish this project to Sites.
- Run `node --test tests/*.test.mjs` and `python3 scripts/build-wix.py` after changes. The output is `wix-output/` and `wix-site.zip`; never commit either.
- Original image, video and document bytes belong in Wix Media. For changed/new assets, upload through the connected Wix plugin and update `wix/media-map.json`, including the source file SHA-256. Never resize, replace or omit media to fit static hosting limits.
- Commit and push approved task changes to GitHub, rebuild using the pushed commit, then publish the complete ZIP to the same Wix site using the connected Wix plugin. Verify `deployment-manifest.json` on Wix matches the pushed GitHub commit and refresh the Wix preview panel.
- GitHub Actions validates and builds every change. Its deploy step needs the repository Actions secret `WIX_API_KEY`. If missing, publish through the connected Wix plugin; never claim a GitHub push has automatically deployed.
- Preserve source dates, vehicle prices and availability qualifications. Catalogue data is a snapshot. Smart Search uses local matching; contact/test-drive forms are previews. Do not imply live inventory, LLM integration or submitted bookings without implementing and testing them.
- Never commit credentials, extract connector credentials, or print CLI access tokens. Owner-supplied CI credentials belong only in GitHub Actions secrets.
