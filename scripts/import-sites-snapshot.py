"""Import an immutable, checksum-verified snapshot of the published UniCars site."""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path, PurePosixPath
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import hashlib
import json
import os
import time

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "scripts/sites-snapshot.json"
HOST = "unicars-navigation-concept.avocadots-9013.chatgpt.site"

def blob_sha(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()

def destination(entry):
    path = PurePosixPath(entry["path"])
    if path.is_absolute() or ".." in path.parts:
        raise ValueError("Invalid import path")
    return ROOT.joinpath(*path.parts)

def matches(path, entry):
    return path.is_file() and path.stat().st_size == entry["size"] and blob_sha(path.read_bytes()) == entry["sha"]

def download(entry):
    target = destination(entry)
    if matches(target, entry):
        return "verified"
    if target.exists():
        raise RuntimeError("Existing file differs; refusing to overwrite: " + entry["path"])
    url = entry["source_url"]
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != HOST or not entry["path"].startswith("dist/"):
        raise ValueError("Unapproved snapshot source")
    for attempt in range(4):
        try:
            request = Request(url, headers={"User-Agent": "UniCars-Source-Import", "Accept-Encoding": "identity"})
            with urlopen(request, timeout=60) as response:
                data = response.read()
            if len(data) != entry["size"] or blob_sha(data) != entry["sha"]:
                raise RuntimeError("Source checksum mismatch: " + entry["path"])
            target.parent.mkdir(parents=True, exist_ok=True)
            temporary = target.with_name("." + target.name + ".import")
            temporary.write_bytes(data)
            temporary.replace(target)
            target.chmod(0o755 if entry["mode"] == "100755" else 0o644)
            return "downloaded"
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError("Import did not complete")

def main():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    entries = manifest["entries"]
    pending = [entry for entry in entries if entry.get("source_url")]
    completed = 0
    with ThreadPoolExecutor(max_workers=6) as pool:
        for task in as_completed([pool.submit(download, entry) for entry in pending]):
            task.result()
            completed += 1
            if completed % 50 == 0 or completed == len(pending):
                print(f"Verified {completed}/{len(pending)} hosted files", flush=True)
    for entry in entries:
        if not matches(destination(entry), entry):
            raise RuntimeError("Final source verification failed: " + entry["path"])
    report = {
        "source_commit": manifest["source_commit"],
        "sites_version": manifest["sites_version"],
        "verified_original_files": len(entries),
        "hosted_files": len(pending),
        "all_original_git_blob_checksums_match": True,
        "readme": "Original README retained at docs/legacy-navigation-readme.md; root README updated for this repository."
    }
    (ROOT / "IMPORT-REPORT.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
