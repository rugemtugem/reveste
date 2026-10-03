# Traça o ícone 2x2 em vetor: camada azul (#1A3A5C) sobre fundo creme.
import time, numpy as np, potrace
from PIL import Image
from scipy import ndimage as ndi
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]   # raiz do repositório
HERE = Path(__file__).resolve().parent

UP = 6
src = Image.open(str(ROOT / 'v2/assets/img/icon.png')).convert('L')
big = np.asarray(src.resize((src.width*UP, src.height*UP), Image.LANCZOS)).astype(float)
big = ndi.gaussian_filter(big, sigma=UP*0.35)        # tira o ruído do JPEG/IA antes do limiar
navy = big < 128
navy = ndi.binary_opening(navy, iterations=1); navy = ndi.binary_closing(navy, iterations=1)
t = time.time()
bm = potrace.Bitmap(~navy)  # o potracer traça o valor False como figura
plist = bm.trace(turdsize=int(4*UP*UP/4), alphamax=1.0, opticurve=True, opttolerance=0.2)
print('curvas:', len(plist), 'tempo %.1fs' % (time.time()-t))
W, H = src.width, src.height
def f(p): return f'{p.x/UP:.2f} {p.y/UP:.2f}'
d = []
for curve in plist:
    d.append('M' + f(curve.start_point))
    for seg in curve.segments:
        if seg.is_corner: d.append('L' + f(seg.c) + 'L' + f(seg.end_point))
        else: d.append('C' + f(seg.c1) + ' ' + f(seg.c2) + ' ' + f(seg.end_point))
    d.append('Z')
path = ''.join(d)
open(str(HERE / 'build/icone-path.txt'),'w').write(path)
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
  <rect width="{W}" height="{H}" fill="#F0EAE0"/>
  <path fill="#1A3A5C" fill-rule="evenodd" d="{path}"/>
</svg>'''
open(str(HERE / 'build/icone-traco.svg'),'w').write(svg)
print('svg bytes', len(svg))
