# Banner de cada coleção: faixa de imagens da 1ª linha do painel, sem texto.
# Caixas (x0, y0, x1, y1) no preview 900px de largura.
import os, sys
from PIL import Image
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]   # raiz do repositório
HERE = Path(__file__).resolve().parent

ORIG = str(ROOT / 'originais')
SITE = str(ROOT / 'v2/assets/img/collections')
B = {
 '01': ('painel-01-ceramica.png', 'collection-01-ceramica', (188, 52, 897, 216)),
 '02': ('painel-02-caquinhos-suburbio.png', 'collection-02-caquinhos-suburbio', (204, 48, 898, 240)),
 '03': ('painel-03-flores.jpg', 'collection-03-flores', (238, 35, 900, 250)),
 '04': ('painel-04-devocionais.jpg', 'collection-04-devocionais', (238, 35, 900, 248)),
 '05': ('painel-05-portugueses.png', 'collection-05-portugueses', (238, 35, 900, 252)),
 '06': ('painel-06-bauhaus.png', 'collection-06-bauhaus', (238, 35, 900, 238)),
 '07': ('painel-07-athos.png', 'collection-07-athos', (203, 44, 898, 226)),
 '08': ('painel-08-caquinhos-pop.png', 'collection-08-caquinhos-pop', (202, 40, 898, 227)),
}
write = len(sys.argv) > 1 and sys.argv[1] == 'write'
sheet = []
for num, (f, out, box) in B.items():
    im = Image.open(os.path.join(ORIG, f)).convert('RGB')
    k = im.width / 900
    c = im.crop(tuple(round(v * k) for v in box))
    print(num, c.size, round(c.width / c.height, 2))
    if write:
        c.save(f'{SITE}/{out}.jpeg', quality=82, optimize=True, progressive=True)
        t = c.copy(); t.thumbnail((480, 480), Image.LANCZOS)
        t.save(f'{SITE}/{out}-thumb.jpeg', quality=78, optimize=True, progressive=True)
    s = c.copy(); s.thumbnail((900, 200)); sheet.append(s)
H = sum(s.height + 8 for s in sheet)
S = Image.new('RGB', (900, H), 'red'); y = 0
for s in sheet: S.paste(s, (0, y)); y += s.height + 8
S.save(os.path.join(os.path.dirname(__file__), 'banners.png'))
