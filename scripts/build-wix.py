#!/usr/bin/env python3
"""Build the supplied static frontend with original assets hosted in Wix Media."""
import hashlib
import html
import json
import re
import shutil
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'dist'
OUTPUT = ROOT / 'wix-output'
MEDIA_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.mp4', '.webm', '.pdf', '.zip', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.mp3'}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build():
    config = json.loads((ROOT / 'wix/site.json').read_text())
    media = json.loads((ROOT / 'wix/media-map.json').read_text())
    replacements = {}
    for path, item in media.items():
        if item['status'] not in ('READY', 'PENDING'):
            raise ValueError(f'Media is unavailable: {path}')
        if not item['url'].startswith('https://'):
            raise ValueError(f'Media must use HTTPS: {path}')
        local = SOURCE / path
        if not path.startswith('https://'):
            if not local.is_file() or digest(local) != item.get('sha256'):
                raise ValueError(f'Media changed or disappeared: {path}. Upload the original to Wix and refresh its mapping.')
        replacements[path] = item['url']
        replacements[html.unescape(path)] = item['url']
    missing = [p.relative_to(SOURCE).as_posix() for p in SOURCE.rglob('*')
               if p.is_file() and p.suffix.lower() in MEDIA_EXTENSIONS
               and p.relative_to(SOURCE).as_posix() not in media]
    if missing:
        raise ValueError('Upload unmapped media to Wix first: ' + ', '.join(missing))
    pattern = re.compile('|'.join(re.escape(p) for p in sorted(replacements, key=len, reverse=True)))

    def remap(value):
        if isinstance(value, dict):
            return {key: remap(item) for key, item in value.items()}
        if isinstance(value, list):
            return [remap(item) for item in value]
        if isinstance(value, str):
            # Source citations are preserved; only exact local file values change.
            path, separator, fragment = value.partition('#')
            return replacements.get(path, path) + (separator + fragment if separator else '')
        return value

    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    for original in sorted(SOURCE.rglob('*')):
        if not original.is_file():
            continue
        relative = original.relative_to(SOURCE)
        if original.suffix.lower() in MEDIA_EXTENSIONS or original.suffix == '.bin':
            continue
        target = OUTPUT / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if original.suffix == '.json':
            value = remap(json.loads(original.read_text()))
            if relative.as_posix() == 'data/vehicle-library.json':
                if value['download']['sha256'] != config['archiveSha256']:
                    raise ValueError('The PDF archive changed. Upload its replacement to Wix Media first.')
                value['download']['url'] = config['archiveUrl']
                value['download']['parts'] = []
            target.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n')
        else:
            text = original.read_text()
            target.write_text(pattern.sub(lambda match: replacements[match.group()], text))
    lookup = {path: item['url'] for path, item in media.items()}
    (OUTPUT / 'asset-resolver.js').write_text('window.uniAsset = (function () { const media = ' + json.dumps(lookup, ensure_ascii=False) + '; return function (path) { return media[path] || path; }; })();\n')
    revision = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    checksums = {p.relative_to(OUTPUT).as_posix(): digest(p) for p in sorted(OUTPUT.rglob('*')) if p.is_file()}
    manifest = {'repository': config['repository'], 'commit': revision, 'siteId': config['siteId'], 'mediaCount': len(media), 'files': checksums}
    (OUTPUT / 'deployment-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    files = [p for p in OUTPUT.rglob('*') if p.is_file()]
    total = sum(p.stat().st_size for p in files)
    if total >= 20 * 1024 * 1024:
        raise ValueError(f'Static output exceeds Wix limit: {total} bytes')
    if not (OUTPUT / 'index.html').is_file():
        raise ValueError('index.html is required at the output root')
    with zipfile.ZipFile(ROOT / 'wix-site.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(files):
            archive.write(path, path.relative_to(OUTPUT))
    if (ROOT / 'wix-site.zip').stat().st_size >= 10 * 1000 * 1000:
        raise ValueError('Upload ZIP exceeds the 10 MB Wix upload limit')
    print(json.dumps({'commit': revision, 'files': len(files), 'media': len(media), 'bytes': total, 'zipBytes': (ROOT / 'wix-site.zip').stat().st_size}))


if __name__ == '__main__':
    build()
