# Gera as versões da logo Reveste em SVG (tudo em contorno, sem fonte externa).
import textpath as tp
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]   # raiz do repositório
HERE = Path(__file__).resolve().parent

NAVY, CREAM = '#1A3A5C', '#F0EAE0'
OUT = str(ROOT / 'v2/assets/marca') + '/'
PF = tp.font(str(HERE / 'fonts/PlayfairDisplay[wght].ttf'), 700)
LA = tp.font(str(HERE / 'fonts/Lato-Regular.ttf'))
CAP_PF, CAP_LA = 0.708, 1433 / 2000
WORD, TAG = 'REVESTE', 'BRASIL QUE SE USA · ARTE QUE SE VIVE'
ICON_D = open(str(HERE / 'build/icone-path.txt')).read()
IW, IH = 456, 453                          # viewBox do traço do ícone
NX0, NY0, NSIDE = 5, 5, 445                # caixa azul dentro do traço
MARGIN = 10                                # moldura creme (unidades do traço)

def icon(x, y, side, base=True):
    """Ícone com lado `side` (medido na caixa azul). base=False: só o azul (1 cor)."""
    k = side / NSIDE
    g = f'<g transform="translate({x - NX0*k:.2f} {y - NY0*k:.2f}) scale({k:.5f})">'
    if base:
        m = MARGIN  # moldura creme em volta das células, como no ícone original
        g += f'<rect x="{NX0 - m}" y="{NY0 - m}" width="{NSIDE + 2*m}" height="{NSIDE + 2*m}" fill="{CREAM}"/>'
    return g + f'<path fill="{NAVY}" fill-rule="evenodd" d="{ICON_D}"/></g>'

def svg(w, h, body, title, bg=None):
    rect = f'<rect width="{w:.2f}" height="{h:.2f}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" '
            f'width="{w:.0f}" height="{h:.0f}"><title>{title}</title>{rect}{body}</svg>\n')

def vertical(color, pad=24, tagline=True):
    ic, wm_size, tg_size = 110, 34, 9
    wm_w = tp.width(PF, WORD, wm_size, 9 / 34)
    tg_w = tp.width(LA, TAG, tg_size, 2.5 / 9)
    W = max(ic, wm_w, tg_w if tagline else 0) + 2 * pad
    y = pad
    body = icon((W - ic) / 2, y, ic)
    y += ic + 18 + wm_size * CAP_PF
    d, _ = tp.line(PF, WORD, wm_size, 9 / 34, (W - wm_w) / 2, y)
    body += f'<path fill="{color}" d="{d}"/>'
    if tagline:
        y += 12 + tg_size * CAP_LA
        d, _ = tp.line(LA, TAG, tg_size, 2.5 / 9, (W - tg_w) / 2, y)
        body += f'<path fill="{color}" d="{d}"/>'
    return W, y + pad, body

def horizontal(color, pad=20, tagline=True):
    ic, wm_size, tg_size, gap = 76, 38, 8.5, 18
    wm_w = tp.width(PF, WORD, wm_size, 8 / 38)
    tg_w = tp.width(LA, TAG, tg_size, 2 / 8.5)
    block_h = wm_size * CAP_PF + (9 + tg_size * CAP_LA if tagline else 0)
    H = ic + 2 * pad
    x_txt = pad + ic + gap
    top = pad + (ic - block_h) / 2
    body = icon(pad, pad, ic)
    d, _ = tp.line(PF, WORD, wm_size, 8 / 38, x_txt, top + wm_size * CAP_PF)
    body += f'<path fill="{color}" d="{d}"/>'
    if tagline:
        d, _ = tp.line(LA, TAG, tg_size, 2 / 8.5, x_txt, top + block_h)
        body += f'<path fill="{color}" d="{d}"/>'
    return x_txt + max(wm_w, tg_w if tagline else 0) + pad, H, body

files = {}
W, H, b = vertical(NAVY);  files['reveste-logo-vertical.svg'] = svg(W, H, b, 'Reveste · logo vertical')
W, H, b = vertical(CREAM); files['reveste-logo-vertical-negativa.svg'] = svg(W, H, b, 'Reveste · logo vertical negativa (para fundos escuros)')
W, H, b = horizontal(NAVY);  files['reveste-logo-horizontal.svg'] = svg(W, H, b, 'Reveste · logo horizontal')
W, H, b = horizontal(CREAM); files['reveste-logo-horizontal-negativa.svg'] = svg(W, H, b, 'Reveste · logo horizontal negativa (para fundos escuros)')
W, H, b = vertical(NAVY, tagline=False);  files['reveste-logo-vertical-sem-tagline.svg'] = svg(W, H, b, 'Reveste · logo vertical sem tagline (tamanhos pequenos)')
W, H, b = horizontal(NAVY, tagline=False); files['reveste-logo-horizontal-sem-tagline.svg'] = svg(W, H, b, 'Reveste · logo horizontal sem tagline (tamanhos pequenos)')
files['reveste-icone.svg'] = svg(NSIDE + 2*MARGIN, NSIDE + 2*MARGIN, icon(MARGIN, MARGIN, NSIDE), 'Reveste · ícone')
files['reveste-icone-1cor.svg'] = svg(NSIDE, NSIDE, icon(0, 0, NSIDE, base=False), 'Reveste · ícone em 1 cor (bordado, carimbo, gravação)')
for n, s in files.items():
    open(OUT + n, 'w').write(s); print(n, len(s))
