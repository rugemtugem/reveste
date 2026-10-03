# Separa o tríptico da coleção 01 (lugar | estampa | peça) em três imagens
# para o bloco "Do lugar à peça" da home.  python lugar.py
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'v2/assets/img/shirts/coll-01-piece-1.jpeg'
OUT = ROOT / 'v2/assets/img/home'
BOXES = {'lugar': (0, 134), 'estampa': (142, 242), 'peca': (246, 396)}   # colunas em px
im = Image.open(SRC).convert('RGB')
OUT.mkdir(exist_ok=True)
for name, (x0, x1) in BOXES.items():
    c = im.crop((x0, 0, x1, im.height))
    c.save(OUT / f'processo-{name}.jpeg', quality=90, optimize=True, progressive=True)
    print(name, c.size)
