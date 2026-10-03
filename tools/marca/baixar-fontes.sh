#!/bin/sh
# Baixa as fontes da marca (OFL) do repositório oficial do Google Fonts.
set -e
cd "$(dirname "$0")" && mkdir -p fonts
B=https://cdn.jsdelivr.net/gh/google/fonts@main/ofl
curl -sfL "$B/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf" -o "fonts/PlayfairDisplay[wght].ttf"
curl -sfL "$B/lato/Lato-Regular.ttf" -o fonts/Lato-Regular.ttf
echo "fontes em $(pwd)/fonts"
