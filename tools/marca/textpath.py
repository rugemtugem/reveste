# Texto -> contornos SVG com as fontes da marca (Playfair Display, Lato).
# Sem dependência de fonte instalada: o SVG final só tem <path>.
import math
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

_cache = {}
def font(name, wght=None):
    key = (name, wght)
    if key not in _cache:
        f = TTFont(name)
        if wght is not None and 'fvar' in f:
            f = instancer.instantiateVariableFont(f, {'wght': wght})
        _cache[key] = f
    return _cache[key]

def metrics(f):
    os2 = f['OS/2']
    return {'upm': f['head'].unitsPerEm, 'cap': os2.sCapHeight}

def _glyph_d(f, ch, transform):
    gs = f.getGlyphSet(); name = f.getBestCmap()[ord(ch)]
    pen = SVGPathPen(gs, ntos=lambda v: f'{v:.2f}')
    gs[name].draw(TransformPen(pen, transform))
    return pen.getCommands(), gs[name].width

def advance(f, ch):
    return f.getGlyphSet()[f.getBestCmap()[ord(ch)]].width

def line(f, text, size, tracking_em=0.0, x=0.0, y=0.0):
    """Linha reta, baseline em y. Retorna (d, largura_visual sem o tracking final)."""
    s = size / metrics(f)['upm']; tr = tracking_em * size
    ds, cx = [], x
    for i, ch in enumerate(text):
        d, adv = _glyph_d(f, ch, (s, 0, 0, -s, cx, y))
        ds.append(d); cx += adv * s + (tr if i < len(text) - 1 else 0)
    return ''.join(ds), cx - x

def width(f, text, size, tracking_em=0.0):
    s = size / metrics(f)['upm']
    return sum(advance(f, c) * s for c in text) + tracking_em * size * (len(text) - 1)

def arc(f, text, size, tracking_em, cx, cy, r, center_deg, outward=True):
    """Texto em arco legível. outward=True: em cima (topo das letras para fora,
    lido no sentido horário); False: embaixo (topo para o centro, anti-horário)."""
    s = size / metrics(f)['upm']; tr = tracking_em * size
    advs = [advance(f, c) * s for c in text]
    total = sum(advs) + tr * (len(text) - 1)
    sign = 1 if outward else -1
    start = math.radians(center_deg) - sign * (total / 2) / r
    ds, pos = [], 0.0
    for ch, adv in zip(text, advs):
        th = start + sign * (pos + adv / 2) / r
        px, py = cx + r * math.cos(th), cy + r * math.sin(th)
        rot = th + (math.pi / 2 if outward else -math.pi / 2)
        c, sn = math.cos(rot), math.sin(rot)
        # glifo: origem no centro do avanço, y para cima -> girado e posto no arco
        a, b, cc, d_ = s * c, s * sn, s * sn, -s * c
        e = px - (adv / 2) * c
        g = py - (adv / 2) * sn
        dd, _ = _glyph_d(f, ch, (a, b, cc, d_, e, g))
        ds.append(dd); pos += adv + tr
    return ''.join(ds), math.degrees(total / r)
