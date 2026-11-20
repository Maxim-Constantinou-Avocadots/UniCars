"""Rebuild source snapshot exports after editing the audited catalogue data."""
from pathlib import Path
import csv, hashlib, io, json, zipfile
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist'
read=lambda name:json.loads((DIST/name).read_text())
cat=read('data/vehicles.json');lib=read('data/vehicle-library.json');cov=read('data/catalogue-coverage.json')
rows=cat['vehicles'];keys=list(dict.fromkeys(k for r in rows for k in r))
with (DIST/'data/vehicles.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.DictWriter(f,fieldnames=keys);w.writeheader()
 for r in rows:w.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(dict,list)) else v for k,v in r.items()})
buffer=io.BytesIO()
with zipfile.ZipFile(buffer,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
 def add(name,data):
  info=zipfile.ZipInfo(name,date_time=(2026,11,20,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;archive.writestr(info,data)
 for p in sorted((DIST/'documents/price-lists').glob('*.pdf')):add(p.name,p.read_bytes())
 add('README.txt',b'UniCars published source documents. Checked 20 November 2026.\n68 original PDFs: 64 model-range documents plus 4 additional eHub equipment documents.\n65 model listings, 303 published version/price rows and 54 separate eHub cars.\nThe Kodiaq RS PDF states July 2027; confirm that date and price.\nThis is a dated public-source snapshot, not live inventory. Final prices and availability require confirmation.\n')
 add('model-document-index.json',json.dumps({'checked':lib['checked'],'models':lib['models']},ensure_ascii=False,indent=2).encode())
 add('catalogue-coverage.json',json.dumps(cov,ensure_ascii=False,indent=2).encode())
blob=buffer.getvalue();digest=hashlib.sha256(blob).hexdigest();parts=[]
for p in (DIST/'documents').glob('price-lists-bundle-*.bin'):p.unlink()
for i,start in enumerate(range(0,len(blob),20*1024*1024),1):
 name=f'documents/price-lists-bundle-{digest[:10]}-{i}.bin';(DIST/name).write_bytes(blob[start:start+20*1024*1024]);parts.append(name)
lib['download']={'filename':'unicars-complete-price-lists-2026-11-20.zip','parts':parts,'bytes':len(blob),'megabytes':round(len(blob)/1024/1024,1),'sha256':digest}
(DIST/'data/vehicle-library.json').write_text(json.dumps(lib,ensure_ascii=False,indent=2)+'\n')
print(f'Exported {len(rows)} CSV rows and 68 PDFs in {len(parts)} checked bundle parts.')
