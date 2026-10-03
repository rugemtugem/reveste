# Reveste: manual de identidade visual

Site estático do manual de marca da Reveste.

- `v2/`: versão atual (HTML + CSS + JS, Bootstrap 5.3.3 via CDN com SRI)
- raiz (`index.html`, `reveste-brand-identity.html`): versão 1, mantida como referência
- `docs/v2-auditoria-producao.md`: auditoria de prontidão e pendências
- `v2/assets/marca/`: arquivos da marca (SVG, PDF, PNG e zip)
- `v2/vendor/bootstrap/`: Bootstrap 5.3.3 servido localmente (mesmos hashes SRI do CDN)
- `v2/admin/`: admin de curadoria (PHP); instruções em `tools/admin/README.md`
- `v2/data/colecoes.json`: coleções publicadas pelo admin, lidas pelo site
- `v2/404.html`: página de erro, para configurar no servidor quando houver hospedagem
- `tools/marca/`: scripts que geram os vetores e as imagens (ver o README de lá)

## Rodar localmente

```bash
php -S 127.0.0.1:8765 -t v2   # o admin precisa de PHP; só o site roda com python3 -m http.server
# http://localhost:8765/
```

Cada aba tem link direto: `/#cores`, `/#colecoes` etc.

## Onde mexer

| O quê | Onde |
|---|---|
| Textos das abas | `v2/index.html` |
| Coleções e peças (nome, local, descrição, notas, status) | o admin de curadoria (`/admin/`), que publica `v2/data/colecoes.json` |
| Imagem de cada peça | `v2/assets/img/shirts/coll-NN-piece-N.jpeg` |
| Cores e fontes | `v2/css/styles.css`, bloco `:root` |

Ao alterar `styles.css` ou `main.js`, suba o `?v=` no `index.html` para o navegador não servir a versão em cache.

## Publicar

Ainda não há destino definido. O conteúdo de `v2/` é o que vai para o servidor.
Ficam fora do repositório (`.gitignore`): `.pptx`, `.pdf` e a prancha `reveste_brand_identity_refined.png`.
