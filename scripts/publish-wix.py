#!/usr/bin/env python3
"""Publish a complete build using an authenticated Wix CLI account session.

For CI, run `wix login --api-key` with a GitHub Actions secret first.
Tokens are kept in memory and are never logged or stored by this script.
"""
import json
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def publish():
    config = json.loads((ROOT / 'wix/site.json').read_text())
    manifest = json.loads((ROOT / 'wix-output/deployment-manifest.json').read_text())
    head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    if manifest['commit'] != head or manifest['siteId'] != config['siteId']:
        raise ValueError('Rebuild the pushed revision before publishing.')
    token = subprocess.check_output(['npx', '-y', '@wix/cli@latest', 'token'], cwd=ROOT, text=True, stderr=subprocess.DEVNULL).strip()
    if not token or '\n' in token:
        raise ValueError('Wix CLI did not return an access token.')
    authorization = token if token.startswith('Bearer ') else 'Bearer ' + token
    boundary = 'unicars-' + uuid.uuid4().hex
    payload = (f'--{boundary}\r\nContent-Disposition: form-data; name="files"; filename="wix-site.zip"\r\nContent-Type: application/zip\r\n\r\n'.encode()
               + (ROOT / 'wix-site.zip').read_bytes() + f'\r\n--{boundary}--\r\n'.encode())
    endpoint = 'https://www.wixapis.com/headless-business-setup/v1/headless-business/' + config['siteId'] + '/drop?campaign=mcp&agent=chatgpt%2Fwork%2Fgpt-6.2'
    request = urllib.request.Request(endpoint, data=payload, method='POST', headers={
        'Authorization': authorization,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
    })
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        # Response bodies can contain internal details. Report only safe diagnostics.
        raise RuntimeError(f'Wix deployment failed: HTTP {error.code}; request ID {error.headers.get("x-wix-request-id", "unavailable")}') from None
    live = result.get('siteUrl')
    if not live:
        raise RuntimeError('Wix accepted the request without returning a site URL. Inspect the site before retrying.')
    with urllib.request.urlopen(live.rstrip('/') + '/deployment-manifest.json?commit=' + head, timeout=60) as response:
        saved = json.load(response)
    if saved != manifest:
        raise RuntimeError('Wix responded, but the published manifest does not match this build. Inspect before retrying.')
    print(json.dumps({'uploadId': result.get('uploadId'), 'siteUrl': live, 'verifiedCommit': head}))


if __name__ == '__main__':
    try:
        publish()
    except (ValueError, RuntimeError, urllib.error.URLError, subprocess.CalledProcessError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
