# Miniaturas da galeria só com a peça (a imagem completa fica para o modal).
# A borda reta do painel de azulejo é detectada em cada imagem.
#   python thumbs.py         -> folhas de contato em build/
#   python thumbs.py write   -> grava v2/assets/img/thumbs/{shirts,camisetas}/
import sys
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
IMG = ROOT / 'v2/assets/img'
OUT = IMG / 'thumbs'
import numpy as np
SIZE = 420                                        # lado máximo da miniatura
MARGIN = 0.012                                    # folga depois da borda do painel

SHIRT_X = {'01': 0.56, '02': 0.38, '03': 0.40, '04': 0.47, '05': 0.39, '06': 0.38, '07': 0.38, '08': 0.40}
TEE = {'06': ('left', 0.0, 0.68), '07': ('right', 0.32, 1.0)}   # lado da camiseta; demais já são só a peça

def wall_start(c, from_left=True, max_frac=0.35, full_height=False):
    """Avança a partir da borda até a primeira faixa de parede: colunas com a
    cor da parede (tirada do canto oposto) e sem desenho. Em camisa olha só o
    alto da imagem (acima dos ombros); em camiseta, a altura toda."""
    g = np.asarray(c.convert('RGB')).astype(float)
    H, W, _ = g.shape
    rows = g if full_height else g[: max(8, H // 5)]
    corner = g[: max(4, H // 20), (W - W // 8) if from_left else 0:(W if from_left else W // 8)]
    wall = np.median(corner.reshape(-1, 3), axis=0)
    dev = np.abs(rows - wall).max(axis=2)            # distância à cor da parede
    ok = (np.percentile(dev, 97, axis=0) < 22) & (rows.mean(axis=2).std(axis=0) < 9)
    xs = range(int(W * max_frac)) if from_left else range(W - 1, int(W * (1 - max_frac)), -1)
    for x in xs:
        win = ok[x:x + 4] if from_left else ok[max(0, x - 3):x + 1]
        if len(win) == 4 and win.all():
            return x
    return 0 if from_left else W

# Sobras que a detecção não pega (azulejo encostado na peça, sem parede entre os dois):
# fração extra a cortar do lado do painel.
TRIM = {'shirts/coll-01-piece-2.jpeg': 0.14, 'shirts/coll-02-piece-1.jpeg': 0.03, 'shirts/coll-02-piece-5.jpeg': 0.07,
        'shirts/coll-07-piece-6.jpeg': 0.13, 'shirts/coll-08-piece-2.jpeg': 0.23,
        'camisetas/coll-07-piece-2.jpeg': 0.34, 'camisetas/coll-06-piece-1.jpeg': 0.14}

# fio do painel vizinho na borda direita
RTRIM = {'camisetas/coll-07-piece-2.jpeg': 0.025, 'camisetas/coll-07-piece-5.jpeg': 0.025}

def square(c):
    """Quadrado sem distorcer: camisa (retrato) corta embaixo; camiseta
    (paisagem) ganha fundo da cor da parede em cima e embaixo."""
    w, h = c.size
    if h >= w:
        return c.crop((0, 0, w, w))
    g = np.asarray(c)
    wall = tuple(int(v) for v in np.median(g[:4].reshape(-1, 3), axis=0))
    S = Image.new('RGB', (w, w), wall)
    S.paste(c, (0, (w - h) // 2))
    return S

def thumb(path, kind, num):
    im = Image.open(path).convert('RGB')
    W, H = im.size
    if kind == 'shirts':
        c = im.crop((round(SHIRT_X[num] * W), 0, W, H))
        c = c.crop((wall_start(c, True), 0, c.width, c.height))
    elif num in TEE:
        side, x0, x1 = TEE[num]
        c = im.crop((round(x0 * W), 0, round(x1 * W), H))
        if side == 'right': c = c.crop((wall_start(c, True, full_height=True), 0, c.width, c.height))
        else: c = c.crop((0, 0, wall_start(c, False, full_height=True), c.height))
    else:
        c = im
    t = TRIM.get(f'{kind}/{path.name}', 0)
    if t:
        k = round(c.width * t)
        c = c.crop((0, 0, c.width - k, c.height)) if (kind == 'camisetas' and num == '06') else c.crop((k, 0, c.width, c.height))
    r = RTRIM.get(f'{kind}/{path.name}', 0)
    if r:
        c = c.crop((0, 0, c.width - round(c.width * r), c.height))
    c = square(c)
    c.thumbnail((SIZE, SIZE), Image.LANCZOS)
    return c

write = len(sys.argv) > 1 and sys.argv[1] == 'write'
jobs = []
for kind in ('shirts', 'camisetas'):
    for p in sorted((IMG / kind).glob('coll-*.jpeg')):
        jobs.append((kind, p))
sheets = {}
for kind, p in jobs:
    t = thumb(p, kind, p.name[5:7])
    if write:
        (OUT / kind).mkdir(parents=True, exist_ok=True)
        t.save(OUT / kind / p.name, quality=84, optimize=True, progressive=True)
    sheets.setdefault(f'{kind}-{p.name[5:7]}', []).append(t)
(HERE / 'build').mkdir(exist_ok=True)
for key, ts in sheets.items():
    ts = [t.copy() for t in ts]
    for t in ts: t.thumbnail((180, 220))
    S = Image.new('RGB', (sum(t.width + 6 for t in ts), max(t.height for t in ts)), 'red'); x = 0
    for t in ts: S.paste(t, (x, 0)); x += t.width + 6
    S.save(HERE / f'build/thumb-{key}.png')
print(len(jobs), 'miniaturas', 'gravadas' if write else '(prévia)')
