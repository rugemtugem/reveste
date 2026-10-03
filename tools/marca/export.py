# Exporta cada SVG de v2/assets/marca em PNG (2000px, transparente) e PDF
# vetorial, e monta o reveste-marca.zip com o LEIA-ME.
import zipfile
from pathlib import Path
import cairosvg
DIR = Path(__file__).resolve().parents[2] / 'v2/assets/marca'
for svg in sorted(DIR.glob('*.svg')):
    s = svg.read_text()
    assert '<text' not in s and 'font' not in s.lower(), f'{svg.name}: texto não convertido'
    cairosvg.svg2png(url=str(svg), write_to=str(svg.with_suffix('.png')), output_width=2000)
    cairosvg.svg2pdf(url=str(svg), write_to=str(svg.with_suffix('.pdf')))
    print('ok', svg.name)
files = sorted(p for p in DIR.iterdir() if p.suffix in ('.svg', '.pdf', '.png')) + [DIR / 'LEIA-ME.txt']
with zipfile.ZipFile(DIR / 'reveste-marca.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for p in files:
        z.write(p, p.name)
print('zip', (DIR / 'reveste-marca.zip').stat().st_size // 1024, 'KB')
