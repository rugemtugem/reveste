# Selo Patrimonial em vetor, reconstruído com as medidas do selo.png (412px).
import math, re, sys
import textpath as tp
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]   # raiz do repositório
HERE = Path(__file__).resolve().parent

NAVY, CREAM = '#1A3A5C', '#F0EAE0'
S, C = 412, 206.0
pf = tp.font(str(HERE / 'fonts/PlayfairDisplay[wght].ttf'), 500)
SIZE = 33.0
def fit_tracking(text, arc_len):
    lo, hi = -0.1, 1.0
    for _ in range(50):
        mid = (lo + hi) / 2
        if tp.width(pf, text, SIZE, mid) < arc_len: lo = mid
        else: hi = mid
    return lo
TOP, BOT = 'BRASIL QUE SE USA.', 'ARTE QUE SE VIVE.'
R_TOP, R_BOT = 140.0, 166.0
tr_top = fit_tracking(TOP, math.radians(152) * R_TOP)
tr_bot = fit_tracking(BOT, math.radians(128.5) * R_BOT)
d_top, a1 = tp.arc(pf, TOP, SIZE, tr_top, C, C, R_TOP, -87, outward=True)
d_bot, a2 = tp.arc(pf, BOT, SIZE, tr_bot, C, C, R_BOT, 88, outward=False)
print('tracking topo %.3f em (%.0f°), base %.3f em (%.0f°)' % (tr_top, a1, tr_bot, a2), file=sys.stderr)

# ícone vetorizado: caixa azul de 445px no traço (5..450) -> 184px em 116..300
icon_d = open(str(HERE / 'build/icone-path.txt')).read()
k = 184 / 445
icon = f'<g transform="translate({116 - 5*k + 1:.2f} {115 - 5*k + 1:.2f}) scale({k:.5f})"><path fill="{NAVY}" fill-rule="evenodd" d="{icon_d}"/></g>'
def diamond(x, y, h=10.5):
    return f'<path fill="{NAVY}" d="M{x} {y-h}L{x+h} {y}L{x} {y+h}L{x-h} {y}Z"/>'
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}">
  <title>Reveste · Selo Patrimonial</title>
  <circle cx="{C}" cy="{C}" r="200" fill="{CREAM}"/>
  <circle cx="{C}" cy="{C}" r="194.6" fill="none" stroke="{NAVY}" stroke-width="2.2"/>
  <circle cx="{C}" cy="{C}" r="183.7" fill="none" stroke="{NAVY}" stroke-width="2.6"/>
  <path fill="{NAVY}" d="{d_top}"/>
  <path fill="{NAVY}" d="{d_bot}"/>
  {diamond(C - 154, C + 4)}
  {diamond(C + 156.5, C + 4)}
  {icon}
</svg>'''
open(sys.argv[1], 'w').write(svg)
