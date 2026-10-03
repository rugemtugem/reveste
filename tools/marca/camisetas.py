# Recorta as camisetas dos painéis em originais/camisetas (fora do Git):
# só a peça (e o azulejo ao lado, quando houver), sem título nem legenda.
# Caixas (x0, y0, x1, y1) no preview de 900px de largura.
#   python camisetas.py          -> folhas de contato em build/
#   python camisetas.py write    -> grava v2/assets/img/camisetas/ e banners 09/10
import sys
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SRC = ROOT / 'originais/camisetas'
OUT = ROOT / 'v2/assets/img/camisetas'
COLL = ROOT / 'v2/assets/img/collections'

def grid(cols, rows):
    return [(x0, y0, x1, y1) for (y0, y1) in rows for (x0, x1) in cols]

P = {
 '04':          ('04-devocionais.png', [(240,35,555,262),(560,35,900,262),(0,335,290,515),(295,335,575,515),(580,335,900,515)]),
 '05-lateral':  ('05-portugueses-lateral.png', [(222,38,470,272),(470,38,708,272),(708,38,900,272),(222,345,470,505),(480,345,770,505)]),
 '05-canto':    ('05-portugueses-canto.png', grid([(218,472),(474,705),(707,900)], [(35,272),(342,505)])),
 '05-quadro':   ('05-portugueses-quadro.png', grid([(228,460),(462,682),(684,900)], [(35,250)]) + [(95,330,325,505),(330,330,555,505),(595,330,840,505)]),
 '06':          ('06-modernistas.png', [(232,40,520,240),(522,40,900,240),(0,325,285,490),(287,325,568,490),(570,325,900,490)]),
 '07':          ('07-athos.png', grid([(215,435),(437,655),(657,900)], [(60,225),(340,505)])),
 '09':          ('09-ladrilhos-hidraulicos.png', grid([(225,455),(458,680),(682,900)], [(32,255),(335,510)])),
 '10':          ('10-caquinhos-suburbanos.png', grid([(228,440),(442,660),(662,900)], [(35,232),(330,505)])),
}
BANNER = {'09': ('09-ladrilhos-hidraulicos.png', 'collection-09-ladrilhos', (225, 32, 900, 255)),
          '10': ('10-caquinhos-suburbanos.png', 'collection-10-caquinhos-suburbanos', (228, 35, 900, 232))}

def crop(im, box):
    k = im.width / 900
    return im.crop(tuple(round(v * k) for v in box))

write = len(sys.argv) > 1 and sys.argv[1] == 'write'
(HERE / 'build').mkdir(exist_ok=True)
if write: OUT.mkdir(exist_ok=True)
for key, (f, boxes) in P.items():
    im = Image.open(SRC / f).convert('RGB')
    crops = [crop(im, b) for b in boxes]
    if write:
        num, _, estilo = key.partition('-')
        for i, c in enumerate(crops):
            name = f'coll-{num}-{estilo + "-" if estilo else ""}piece-{i+1}.jpeg'
            c.save(OUT / name, quality=86, optimize=True, progressive=True)
    W = sum(c.width for c in crops) + 10 * len(crops); H = max(c.height for c in crops)
    sheet = Image.new('RGB', (W, H), 'red'); x = 0
    for c in crops: sheet.paste(c, (x, 0)); x += c.width + 10
    sheet.thumbnail((1800, 420)); sheet.save(HERE / f'build/cam-{key}.png')
    print(key, [c.size for c in crops])
if write:
    for num, (f, out, box) in BANNER.items():
        c = crop(Image.open(SRC / f).convert('RGB'), box)
        c.save(COLL / f'{out}.jpeg', quality=82, optimize=True, progressive=True)
        t = c.copy(); t.thumbnail((480, 480), Image.LANCZOS)
        t.save(COLL / f'{out}-thumb.jpeg', quality=78, optimize=True, progressive=True)
    print('gravado')
