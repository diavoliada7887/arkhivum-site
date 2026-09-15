"""Fail publication when exported HTML escapes the Pages prefix or misses local files."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import hashlib
import re

root = Path('out')
prefix = '/arkhivum-site'
errors = []
references = set()

class Check(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ('href', 'src', 'poster'):
            value = attrs.get(key)
            if value:
                check_url(value)
        if attrs.get('http-equiv', '').lower() == 'refresh':
            value = attrs.get('content', '')
            if 'url=' in value:
                check_url(value.split('url=', 1)[1])

def check_url(value):
    url = urlsplit(value)
    if url.scheme or url.netloc or not url.path:
        return
    if not url.path.startswith(prefix + '/'):
        errors.append(f'URL without Pages base path: {value}')
        return
    rel = unquote(url.path[len(prefix) + 1:])
    references.add(rel)
    dest = root / rel
    if not dest.is_file() and not (dest / 'index.html').is_file():
        errors.append(f'Missing exported target: {value}')

pages = list(root.rglob('*.html'))
assert pages, 'No exported pages'
for page in pages:
    Check().feed(page.read_text())
for css in root.rglob('*.css'):
    for value in re.findall(r'url\([\"\']?([^\)\"\']+)', css.read_text()):
        if value.startswith('/'):
            check_url(value)
for asset in Path('public').rglob('*'):
    if asset.is_file():
        dest = root / asset.relative_to('public')
        if not dest.is_file() or hashlib.sha256(asset.read_bytes()).digest() != hashlib.sha256(dest.read_bytes()).digest():
            errors.append(f'Missing or changed public asset: {asset}')
if errors:
    raise SystemExit('\n'.join(sorted(set(errors))))
print(f'OK: {len(pages)} HTML pages, {len(references)} unique local targets, all public assets preserved.')
