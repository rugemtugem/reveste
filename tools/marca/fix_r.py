# Redesenha o elemento "Letra R" a partir do contorno do próprio PNG:
# isola a letra, fecha as manchas azuis das serifas, suaviza a borda e
# renderiza em cores chapadas da marca, quadrado e em alta resolução.
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]   # raiz do repositório
HERE = Path(__file__).resolve().parent


SRC = str(ROOT / 'v2/assets/img/element-r.png')
OUT = sys.argv[1]
NAVY = (0x1A, 0x3A, 0x5C)
CREAM = (0xF0, 0xEA, 0xE0)
UP = 8          # trabalha em 8x para ter borda lisa
FINAL = 896     # lado final em px
BORDER = 0.022  # moldura creme, fração do lado

src = Image.open(SRC).convert('L')
big = np.asarray(src.resize((src.width * UP, src.height * UP), Image.LANCZOS)).astype(float)

# quadrado azul = maior região escura
dark = big < 110
lab, n = ndi.label(dark)
sizes = ndi.sum(dark, lab, range(1, n + 1))
navy_lab = 1 + int(np.argmax(sizes))
ys, xs = np.where(ndi.binary_fill_holes(lab == navy_lab))
y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
print('quadrado azul (8x):', x0, y0, x1, y1, 'lado', x1 - x0, y1 - y0)

# letra = claro dentro do quadrado (margem para não pegar a moldura)
m = 6 * UP
box = big[y0 + m:y1 - m, x0 + m:x1 - m]
letter = box > 150
# fecha as manchas: buracos pequenos dentro da letra + entalhes nas bordas
holes = ~letter
hl, hn = ndi.label(holes)
hs = ndi.sum(holes, hl, range(1, hn + 1))
small = np.isin(hl, 1 + np.where(hs < 0.004 * holes.size)[0])
letter = letter | small
yy, xx = np.ogrid[-3*UP//2:3*UP//2 + 1, -3*UP//2:3*UP//2 + 1]
disk = (xx**2 + yy**2) <= (3*UP//2)**2
letter = ndi.binary_closing(letter, structure=disk, iterations=1)
letter = ndi.binary_opening(letter, structure=disk[::2, ::2], iterations=1)
# suaviza o contorno (remove o serrilhado do JPEG ampliado)
soft = ndi.gaussian_filter(letter.astype(float), sigma=1.2 * UP)
letter = soft > 0.5
print('componentes da letra:', ndi.label(letter)[1])

# compõe em 8x: moldura creme, quadrado azul, letra creme, posição original
side = FINAL * UP
canvas = np.zeros((side, side, 3), np.uint8); canvas[:] = CREAM
b = round(side * BORDER)
canvas[b:side - b, b:side - b] = NAVY
inner = side - 2 * b
# escala uniforme pelo lado maior do quadrado original; centraliza
src_side = max(x1 - x0, y1 - y0)
k = inner / src_side
L = Image.fromarray((letter * 255).astype(np.uint8))
L = L.resize((round(L.width * k), round(L.height * k)), Image.LANCZOS)
offx = b + round((m + (src_side - (x1 - x0)) / 2) * k)
offy = b + round((m + (src_side - (y1 - y0)) / 2) * k)
mask = np.zeros((side, side), float)
mask[offy:offy + L.height, offx:offx + L.width] = np.asarray(L) / 255
# Refaz as serifas à esquerda da haste (onde ficavam as manchas) espelhando a
# serifa inferior direita, que veio íntegra; em cima, a mesma curva invertida.
def first_run(row):
    xs = np.where(row > 0.5)[0]
    seg = np.split(xs, np.where(np.diff(xs) > 1)[0] + 1)[0]
    return seg[0], seg[-1]
f = lambda v: round(v * UP)  # coordenada do PNG final -> 8x
sl, sr = first_run(mask[f(450)])              # haste no meio da altura
axis2 = sl + sr                                # espelho: x' = axis2 - x
rows = np.where(mask[:, sl:sr].max(axis=1) > 0.5)[0]
top, base = rows.min(), rows.max()             # linha de topo e de base da letra
H = f(48)                                      # altura da concordância
def right_edge(row):
    # borda direita do trecho que contém o interior direito da haste
    xs = np.where(row > 0.5)[0]
    for seg in np.split(xs, np.where(np.diff(xs) > 1)[0] + 1):
        if seg[0] <= sr - UP * 4 <= seg[-1]:
            return seg[-1]
    return sr
for y in range(base - H, base + 1):            # inferior: largura toda, simétrica
    right = right_edge(mask[y])
    mask[y, :sl + (sr - sl) // 2] = 0
    mask[y, axis2 - right:right + 1] = 1
for y in range(top, top + H + 1):              # superior esquerda (invertida)
    right = right_edge(mask[base - (y - top)])
    mask[y, :sl] = 0
    mask[y, axis2 - right:sr + 1] = 1
# antisserrilhado só na região editada
for y0_, y1_ in ((base - H - UP * 4, base + UP * 4), (top - UP * 4, top + H + UP * 4)):
    reg = mask[y0_:y1_, :sr]
    mask[y0_:y1_, :sr] = ndi.gaussian_filter((reg > 0.5).astype(float), sigma=UP * 0.6)
img = canvas.astype(float)
for c in range(3):
    img[..., c] = img[..., c] * (1 - mask) + CREAM[c] * mask
out = Image.fromarray(img.round().astype(np.uint8)).resize((FINAL, FINAL), Image.LANCZOS)
out.save(OUT, optimize=True)
print('ok', out.size)
