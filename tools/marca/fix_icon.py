# Corrige o R do ícone (célula superior esquerda do 2x2) com a mesma técnica
# do elemento: contorno da própria letra, manchas fechadas, serifas esquerdas
# espelhadas da inferior direita, cores chapadas. Só a célula do R muda.
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]   # raiz do repositório
HERE = Path(__file__).resolve().parent


IMG = str(ROOT / 'v2/assets/img') + '/'
NAVY = np.array((0x1A, 0x3A, 0x5C), float)
CREAM = np.array((0xF0, 0xEA, 0xE0), float)
UP = 8

icon = Image.open(IMG + 'icon.png').convert('RGB')
L = np.asarray(icon.convert('L')).astype(int)
dark = L < 110
lab, _ = ndi.label(dark)
r_lab = lab[100, 30]                       # um ponto azul da célula do R
ys, xs = np.where(ndi.binary_fill_holes(lab == r_lab))
x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
print('célula do R:', x0, y0, x1, y1)

cell = icon.convert('L').crop((x0, y0, x1, y1))
big = np.asarray(cell.resize((cell.width * UP, cell.height * UP), Image.LANCZOS)).astype(float)
m = 4 * UP                                 # ignora a borda da célula
letter = np.zeros(big.shape, bool)
letter[m:-m, m:-m] = big[m:-m, m:-m] > 150
holes = ~letter
hl, hn = ndi.label(holes)
hs = ndi.sum(holes, hl, range(1, hn + 1))
letter |= np.isin(hl, 1 + np.where(hs < 0.004 * holes.size)[0])
r = 3 * UP // 2
yy, xx = np.ogrid[-r:r + 1, -r:r + 1]
disk = xx**2 + yy**2 <= r * r
letter = ndi.binary_closing(letter, structure=disk)
letter = ndi.binary_opening(letter, structure=disk[::2, ::2])
mask = (ndi.gaussian_filter(letter.astype(float), sigma=1.2 * UP) > 0.5).astype(float)

def runs(row):
    xs = np.where(row > 0.5)[0]
    return np.split(xs, np.where(np.diff(xs) > 1)[0] + 1) if len(xs) else []
mid = mask.shape[0] // 2
sl, sr = runs(mask[mid])[0][[0, -1]]       # haste do R no meio da altura
axis2 = sl + sr
rows = np.where(mask[:, sl:sr].max(axis=1) > 0.5)[0]
top, base = rows.min(), rows.max()
H = round((base - top) * 0.078)            # concordância ~ a mesma proporção do elemento
def right_edge(row):
    for seg in runs(row):
        if seg[0] <= sr - UP * 2 <= seg[-1]:
            return seg[-1]
    return sr
for y in range(base - H, base + 1):
    right = right_edge(mask[y])
    mask[y, :sl + (sr - sl) // 2] = 0
    mask[y, axis2 - right:right + 1] = 1
for y in range(top, top + H + 1):
    right = right_edge(mask[base - (y - top)])
    mask[y, :sl] = 0
    mask[y, axis2 - right:sr + 1] = 1
for a, b in ((base - H - UP * 4, base + UP * 4), (top - UP * 4, top + H + UP * 4)):
    mask[a:b, :sr] = ndi.gaussian_filter((mask[a:b, :sr] > 0.5).astype(float), sigma=UP * 0.6)

rgb = NAVY * (1 - mask[..., None]) + CREAM * mask[..., None]
tile = Image.fromarray(rgb.round().astype(np.uint8)).resize((x1 - x0, y1 - y0), Image.LANCZOS)
out = icon.copy()
out.paste(tile, (x0, y0))
out.save(sys.argv[1], optimize=True)
print('ok', out.size)
