# Geração dos arquivos da marca

A marca nasceu de imagens geradas por IA (só PNG). Estes scripts produzem os
vetores e as imagens do site a partir desse material, de forma reproduzível.

## Preparar

```bash
cd tools/marca
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
./baixar-fontes.sh              # Playfair Display e Lato (OFL)
mkdir -p build
```

## Vetores da logo (`v2/assets/marca/`)

```bash
.venv/bin/python trace_icon.py                       # icon.png -> build/icone-path.txt
.venv/bin/python build_logo.py                       # versões vertical/horizontal/ícone
.venv/bin/python build_selo.py ../../v2/assets/marca/reveste-selo.svg
.venv/bin/python export.py                           # PNG 2000px, PDF e reveste-marca.zip
```

- `textpath.py`: converte texto em contorno com as fontes da marca (linha e arco).
- `build_logo.py`: proporções iguais às do site (CSS de `.lockup-v` e `.lockup-h`).
- `build_selo.py`: selo reconstruído com as medidas do `selo.png` original.
- O `LEIA-ME.txt` do zip (cores, área de proteção, tamanho mínimo) é editado à mão.

## Correções e recortes (rodados uma vez; ficam como registro)

- `fix_r.py <saída.png>` e `fix_icon.py <saída.png>`: refazem o R sem as manchas.
- `hero.py write`: recortes só da camisa para o hero da home (`v2/assets/img/home/`).
- `thumbs.py write`: miniaturas quadradas só com a peça para a galeria (`v2/assets/img/thumbs/`).
- `lugar.py`: separa o tríptico da coleção 01 nas três imagens do "Do lugar à peça".
- `camisetas.py write`: recortes das camisetas (`originais/camisetas/`) para a galeria
  e banners das coleções 09 e 10.
- `crop.py write` e `banner.py write`: peças e banners das coleções a partir de
  `originais/` (fora do Git; os painéis em alta ficam só na máquina do dono).

## Cores de impressão

CMYK calculado com os perfis FOGRA39 e FOGRA52 do color.org; Pantone pelo menor
ΔE2000 contra a tabela pública TCX e uma tabela gráfica de terceiros. Valores e
ressalvas em `v2/assets/marca/LEIA-ME.txt` e na aba Cores do manual.
