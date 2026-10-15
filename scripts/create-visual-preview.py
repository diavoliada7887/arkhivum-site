"""Package the actual static export as a self-contained visual review file.

React scripts are excluded. Native details/picture and responsive CSS are retained.
This file is a review aid, not evidence of browser or interaction testing.
"""
from pathlib import Path
import argparse
import base64
import html
import json
import mimetypes
import re

parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1] / 'out'
prefix = '/arkhivum-site/'
cache = {}

def asset(url):
    if not url.startswith(prefix):
        return url
    relative = url[len(prefix):].split('?')[0]
    if relative not in cache:
        path = root / relative
        if not path.is_file():
            raise FileNotFoundError(relative)
        mime = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
        cache[relative] = 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()
    return cache[relative]

def css_urls(text):
    return re.sub(r'url\([\"\']?([^\)\"\']+)[\"\']?\)', lambda m: 'url("' + asset(m[1]) + '")', text)

def inline_link(match):
    tag = match[0]
    if 'rel="stylesheet"' not in tag:
        return ''
    href = html.unescape(re.search(r'href="([^"]+)"', tag)[1])
    return '<style>' + css_urls((root / href.removeprefix(prefix)).read_text()) + '</style>'

def inline_attr(match):
    name, value = match[1], html.unescape(match[2])
    if name.lower() == 'srcset':
        parts = []
        for entry in value.split(','):
            tokens = entry.strip().split()
            parts.append(' '.join([asset(tokens[0])] + tokens[1:]))
        value = ', '.join(parts)
    else:
        value = asset(value)
    return name + '="' + value + '"'

routes = [('Главная', ''), ('Оцифровка', 'digitization/'), ('Услуги оцифровки', 'services/'), ('Данные и ПО', 'software/'), ('Базы данных', 'software/databases-integrations/'), ('Серверные решения', 'software/server-solutions/'), ('Инженерия данных', 'software/data-processing/'), ('Автоматизация документов', 'software/document-automation/'), ('Автоматизация процессов', 'software/workflow-automation/'), ('Инженерное портфолио', 'software/products/')]
for slug, title in [('sboeboy', 'Сбоебой'), ('pdfa-pipeline', 'PDF/A-конвейер'), ('document-extraction', 'Экстрактор и Изя'), ('pdf-bookmarks', 'Закладки PDF'), ('image-processing', 'Обработка изображений'), ('source-monitoring', 'Мониторинг'), ('hvati', 'Хвать'), ('profit', 'Профицит'), ('rpg-life', 'RPG Life')]:
    routes.append((title, 'software/products/' + slug + '/'))
routes.extend([('Оборудование', 'equipment/'), ('Контакты', 'contact/'), ('Проект: Шаля', 'experience/shalya/'), ('Проект: наполнение базы', 'experience/database-flow/'), ('О компании', 'about/'), ('Цены', 'prices/')])
pages = []
for title, route in routes:
    text = (root / route / 'index.html').read_text()
    text = re.sub(r'<script\b[^>]*>.*?</script>', '', text, flags=re.S)
    text = re.sub(r'<link\b[^>]*>', inline_link, text)
    text = re.sub(r'\b(src|poster|srcset)="([^"]+)"', inline_attr, text, flags=re.I)
    assert '<script' not in text
    assert not re.search(r'(?:src|srcset)="/arkhivum-site/', text, flags=re.I)
    pages.append({'title': title, 'route': prefix + route, 'html': text})

shell = r'''<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Архивум — PR №14 · предпросмотр v3</title><style>*{box-sizing:border-box}body{margin:0;background:#d9d6d0;font:14px Arial;color:#101d31}header{background:#faf8f2;padding:12px 18px;display:flex;flex-wrap:wrap;gap:9px;align-items:center;border-bottom:1px solid #a7814c}header strong{margin-right:12px}button,select{font:inherit;padding:9px 12px;border:1px solid #b6a68e;background:#fffdf8;color:#101d31;cursor:pointer;min-height:42px}select{max-width:min(100%,330px)}button.active{background:#101d31;color:#fffdf8}.notice{padding:10px 18px;background:#f2ede3;font-size:12px;line-height:1.5}#stage{height:calc(100dvh - 150px);min-height:500px;overflow:auto;padding:15px;display:flex;justify-content:center;align-items:flex-start}iframe{border:0;display:block;flex-shrink:0;background:#f2ede3;box-shadow:0 2px 20px #101d3120;width:100%;height:100%;min-height:600px}#message{font-size:12px}#size{font-size:12px}@media(max-width:640px){header{padding:10px;gap:6px}button{font-size:12px;padding:7px}#stage{padding:8px;justify-content:flex-start}}</style></head><body><header><strong>Архивум · PR №14 · v3</strong><select id="page" aria-label="Страница"></select><button class="active" data-size="desktop">Компьютер</button><button data-size="tablet">Планшет · 768</button><button data-size="mobile">Телефон · 390</button><span id="size"></span><span id="message"></span></header><div class="notice">Собранные страницы PR №14. Изображения, широкие и мобильные SVG и стили включены в файл. Меню «Компетенции» и раскрывающиеся блоки используют HTML. React-меню оцифровки и интерактивная архивная полка не запускаются. Это статический визуальный просмотр, не результат браузерного тестирования. Программные изображения — схемы или концепты, не реальные скриншоты.</div><div id="stage"><iframe id="frame" title="Страница сайта" sandbox="allow-same-origin"></iframe></div><script>
const pages=__PAGES__;
const frame=document.getElementById('frame'),select=document.getElementById('page'),message=document.getElementById('message');let selected=0,pendingFragment='';
pages.forEach((p,i)=>select.add(new Option(p.title,i)));
function show(i){selected=i;select.value=String(i);frame.srcdoc=pages[i].html;message.textContent='';}
select.onchange=()=>{pendingFragment='';show(Number(select.value));};
function device(mode){frame.style.width=mode==='mobile'?'390px':mode==='tablet'?'768px':'100%';document.querySelectorAll('[data-size]').forEach(button=>button.classList.toggle('active',button.dataset.size===mode));requestAnimationFrame(measure);}
function measure(){document.getElementById('size').textContent=Math.round(frame.getBoundingClientRect().width)+' px';}
document.querySelectorAll('[data-size]').forEach(button=>button.onclick=()=>device(button.dataset.size));
frame.onload=()=>{if(pendingFragment){frame.contentDocument.getElementById(pendingFragment)?.scrollIntoView();pendingFragment='';}frame.contentDocument.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;e.preventDefault();const href=a.getAttribute('href');if(!href)return;if(href.startsWith('#')){frame.contentDocument.getElementById(href.slice(1))?.scrollIntoView();return;}const [path,fragment]=href.split('#');const i=pages.findIndex(p=>p.route.replace(/\/$/,'')===path.replace(/\/$/,''));if(i>=0){pendingFragment=fragment||'';show(i);}else message.textContent='Эта ссылка не входит в статический просмотр.';});};
window.onresize=measure;show(0);device('desktop');
</script></body></html>'''
result = shell.replace('__PAGES__', json.dumps(pages, ensure_ascii=False).replace('<', '\\u003c'))
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(result)
print(f'{args.output.name}: {len(pages)} pages, {len(cache)} embedded assets, {args.output.stat().st_size:,} bytes. Browser rendering unverified.')
