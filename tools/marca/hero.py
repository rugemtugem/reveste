# Recortes só da camisa (quadrados) para o hero da home e para a capa das
# coleções no card "Coleções". Caixas em fração da imagem da peça.
#   python hero.py         -> folha de contato em build/
#   python hero.py write   -> grava v2/assets/img/home/
import sys
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SHIRTS = ROOT / 'v2/assets/img/shirts'
OUT = ROOT / 'v2/assets/img/home'
# peça -> (x0, y0, x1, y1) em fração
BOX = {
    'coll-04-piece-1': (0.515, 0.04, 1.0, 0.76),
    'coll-05-piece-1': (0.515, 0.04, 1.0, 0.75),
    'coll-06-piece-1': (0.515, 0.03, 1.0, 0.78),
    'coll-07-piece-1': (0.475, 0.03, 1.0, 0.676),
}
write = len(sys.argv) > 1 and sys.argv[1] == 'write'
if write: OUT.mkdir(exist_ok=True)
crops = []
for name, (a, b, c, d) in BOX.items():
    im = Image.open(SHIRTS / f'{name}.jpeg').convert('RGB')
    W, H = im.size
    box = (round(a * W), round(b * H), round(c * W), round(d * H))
    cr = im.crop(box)
    print(name, cr.size)
    crops.append(cr)
    if write:
        cr.save(OUT / f'{name.replace("coll-", "camisa-").replace("-piece-1", "")}.jpeg', quality=88, optimize=True, progressive=True)
(HERE / 'build').mkdir(exist_ok=True)
sheet = Image.new('RGB', (sum(c.width + 10 for c in crops), max(c.height for c in crops)), 'red'); x = 0
for c in crops: sheet.paste(c, (x, 0)); x += c.width + 10
sheet.save(HERE / 'build/hero-sheet.png')
