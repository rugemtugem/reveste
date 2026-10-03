# Caixas em coordenadas do preview 900x600; escala para o original 1536x1024.
import sys, os
from PIL import Image
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]   # raiz do repositório
HERE = Path(__file__).resolve().parent

ORIG = str(ROOT / 'originais')
OUT = str(HERE / 'build')
K = 1536 / 900
three = lambda xs, r1, r2: [(x0, r1[0], x1, r1[1]) for x0, x1 in xs] + [(x0, r2[0], x1, r2[1]) for x0, x1 in xs]
P = {
 '01': ('painel-01-ceramica.png', three([(188,420),(430,647),(653,897)], (52,216), (322,481))),
 '02': ('painel-02-caquinhos-suburbio.png', three([(204,428),(428,648),(649,898)], (48,240), (341,496))),
 '03': ('painel-03-flores.jpg', [(238,553,35,250),(558,900,35,250),(2,288,328,492),(291,573,328,492),(578,900,328,492)]),
 '04': ('painel-04-devocionais.jpg', [(238,553,35,248),(558,900,35,248),(2,288,326,490),(291,573,326,490),(578,900,326,490)]),
 '05': ('painel-05-portugueses.png', [(238,553,35,252),(558,900,35,252),(2,288,326,486),(291,573,326,486),(578,900,326,486)]),
 '06': ('painel-06-bauhaus.png', [(238,553,35,238),(558,900,35,238),(2,288,330,502),(291,573,330,502),(578,900,330,502)]),
 '07': ('painel-07-athos.png', three([(203,428),(436,662),(670,898)], (44,226), (332,494))),
 '08': ('painel-08-caquinhos-pop.png', three([(202,433),(440,667),(672,898)], (40,227), (320,490))),
}
def norm(b):
    # aceita (x0,y0,x1,y1) do three() e (x0,x1,y0,y1) das listas manuais
    return b
for num, (f, boxes) in P.items():
    im = Image.open(os.path.join(ORIG, f)).convert('RGB')
    crops = []
    for i, b in enumerate(boxes):
        if num in ('03', '04', '05', '06'):
            x0, x1, y0, y1 = b
        else:
            x0, y0, x1, y1 = b
        c = im.crop(tuple(round(v * im.width / 900) for v in (x0, y0, x1, y1)))
        crops.append(c)
    W = sum(c.width for c in crops) + 10 * len(crops)
    H = max(c.height for c in crops)
    sheet = Image.new('RGB', (W, H), 'red')
    x = 0
    for c in crops:
        sheet.paste(c, (x, 0)); x += c.width + 10
    sheet.thumbnail((1800, 600))
    sheet.save(os.path.join(OUT, f'sheet-{num}.png'))
    print(num, [c.size for c in crops])

# ── saída final ──
if len(sys.argv) > 1 and sys.argv[1] == 'write':
    SITE = str(ROOT / 'v2/assets/img')
    HERO = {'01': 'collection-01-ceramica', '03': 'collection-03-flores', '04': 'collection-04-devocionais', '02': 'collection-02-caquinhos-suburbio', '05': 'collection-05-portugueses',
            '06': 'collection-06-bauhaus', '07': 'collection-07-athos', '08': 'collection-08-caquinhos-pop'}
    for num, (f, boxes) in P.items():
        im = Image.open(os.path.join(ORIG, f)).convert('RGB')
        for i, b in enumerate(boxes):
            x0, y0, x1, y1 = (b[0], b[2], b[1], b[3]) if num in ('03', '04', '05', '06') else b
            c = im.crop(tuple(round(v * im.width / 900) for v in (x0, y0, x1, y1)))
            c.save(f'{SITE}/shirts/coll-{num}-piece-{i+1}.jpeg', quality=86, optimize=True, progressive=True)
        h = im.copy(); h.thumbnail((1200, 1200), Image.LANCZOS)
        h.save(f'{SITE}/collections/{HERO[num]}.jpeg', quality=80, optimize=True, progressive=True)
        t = im.copy(); t.thumbnail((480, 480), Image.LANCZOS)
        t.save(f'{SITE}/collections/{HERO[num]}-thumb.jpeg', quality=78, optimize=True, progressive=True)
    print('gravado')
