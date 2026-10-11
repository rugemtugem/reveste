# Admin de curadoria

O revisor valida as coleções num painel com login. O site só muda quando ele
clica em **Publicar no site**, que grava `data/colecoes.json`, o arquivo que o site lê.

## O que ele edita

Por coleção: nome, subtítulo, texto "Sobre a coleção", nota curatorial e a
aprovação dela, a decisão e a fonte de cada afirmação, e o nome e o status de
cada peça (Homenagem, Reinterpretação ou Trocar a peça).

- A nota só aparece no site com "Aprovo" ou "Aprovo com ajustes".
- "Trocar a peça", peça sem nome ou nome repetido **impedem a publicação**.
- As afirmações são internas: ficam no rascunho e não vão para o site.
- Dados da revisão (revisor, órgão, data, concluída) geram o crédito do site.

## Onde fica cada coisa

| Arquivo | O que é | Público? |
|---|---|---|
| `v2/admin/` | o admin (PHP) | sim, protegido por login |
| `v2/data/colecoes.json` | versão publicada, lida pelo site | sim |
| `storage/curadoria.json` | rascunho de trabalho (estado vivo do admin) | **não**: um nível acima da pasta pública e fora do Git |
| `storage/historico/` | cada versão anterior (rascunho e publicada) | não; fora do Git |
| `storage/auditoria.log` | quem fez o quê e quando | não; fora do Git |
| `.secrets/admin-usuarios.php` | usuários e hash das senhas | não; fora do Git |

## Rodar localmente

```bash
node tools/admin/seed.mjs                         # cria o rascunho inicial, tudo pendente
php tools/admin/senha.php luan "Luan Crespo"     # cadastra; a senha é digitada no terminal
php -S 127.0.0.1:8765 -t v2                       # http://127.0.0.1:8765/admin/
```

## Publicar na hospedagem (quando houver)

Precisa de PHP 8.1 ou superior.

1. Suba o conteúdo de `v2/` para a pasta pública (`public_html`).
2. Suba `storage/` (só o `curadoria.json`) e `tools/admin/` para **um nível acima** da pasta pública.
3. Dê permissão de escrita ao PHP em `storage/` e em `public_html/data/`.
4. No servidor, rode `php tools/admin/senha.php luan "Luan Crespo"`.
5. Use HTTPS: o cookie de sessão só vai por conexão segura quando o site está em HTTPS.
6. Se houver proxy ou CDN na frente (Cloudflare, por exemplo), todos os acessos chegam com o IP do proxy, e o limite de login por IP bloquearia todo mundo junto. Crie `.secrets/admin-config.php` com os IPs do proxy: `<?php return ['proxies' => ['IP-DO-PROXY']];`. Só então o admin usa o cabeçalho X-Forwarded-For. Sem isso, o limite por usuário continua valendo.

Ao atualizar o site depois, **não sobrescreva** `public_html/data/colecoes.json`
nem `storage/`: eles mudam pelo admin.

## Segurança

- Senhas com `password_hash` (mín. 12 caracteres). Sessão expira em 30 min sem uso.
- 5 tentativas erradas por IP, ou 10 por usuário, em 15 min bloqueiam o login (HTTP 429).
- Todo formulário tem token CSRF. Opções e tamanhos são validados no servidor.
- Gravação atômica (arquivo temporário + rename) e uma escrita por vez (trava).
- Página sem indexação (`noindex`), sem iframe (`X-Frame-Options`) e com CSP.

## Recuperação

- **Histórico**, no próprio admin: restaura qualquer rascunho ou versão publicada anterior; a atual é guardada antes.
- Pelo terminal: `php tools/admin/publicar.php` regrava o arquivo público a partir do rascunho.
- `tools/admin/seed.mjs` cria o rascunho inicial a partir de `v2/data/colecoes.json`, com tudo pendente. Ele se recusa a sobrescrever um rascunho existente; `--force` apaga o trabalho feito no admin.
