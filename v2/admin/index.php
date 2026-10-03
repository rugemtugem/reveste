<?php
// Admin de curadoria da Reveste: o revisor valida notas, afirmações e status
// das peças; "Publicar no site" grava v2/data/colecoes.json, lido pelo site.
declare(strict_types=1);
require __DIR__ . '/lib.php';

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header("Content-Security-Policy: default-src 'self'; img-src 'self'; style-src 'self'; form-action 'self'; frame-ancestors 'none'");
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

iniciar_sessao();
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$usuario = $_SESSION['usuario'] ?? null;
$pagina = $_GET['p'] ?? 'painel';

function ir(string $url, string $msg = '', string $tipo = 'ok'): never {
    if ($msg) $_SESSION['flash'] = [$tipo, $msg];
    header('Location: ' . $url, true, 303);
    exit;
}

// ── ações (POST) ──────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    exigir_csrf();
    $acao = $_POST['acao'] ?? '';

    if ($acao === 'entrar') {
        if ($espera = bloqueado($ip)) {
            http_response_code(429);
            header('Retry-After: ' . $espera);
            exit('Muitas tentativas de login. Tente de novo em ' . (int)ceil($espera / 60) . ' min.');
        }
        $u = strtolower(trim((string)($_POST['usuario'] ?? '')));
        $lista = usuarios();
        if (isset($lista[$u]) && password_verify((string)($_POST['senha'] ?? ''), $lista[$u]['hash'])) {
            session_regenerate_id(true);
            $_SESSION['usuario'] = $u;
            $_SESSION['nome'] = $lista[$u]['nome'] ?? $u;
            limpar_falhas($ip);
            registrar($u, 'entrar');
            ir('./');
        }
        anotar_falha($ip);
        registrar($u ?: '?', 'falha-login');
        ir('?p=entrar', 'Usuário ou senha incorretos.', 'erro');
    }

    if (!$usuario) ir('?p=entrar', 'Entre para continuar.', 'erro');

    if ($acao === 'sair') {
        registrar($usuario, 'sair');
        $_SESSION = [];
        session_destroy();
        header('Location: ?p=entrar&saiu=1', true, 303);
        exit;
    }

    $num = preg_replace('/\D/', '', (string)($_POST['num'] ?? ''));
    // destino em caso de erro: calculado aqui, nunca a partir do Referer
    $voltar = ['salvar_colecao' => "?p=colecao&num=$num", 'restaurar' => '?p=historico'][$acao] ?? './';
    try {
        if ($acao === 'salvar_colecao') {
            com_trava(function () use ($num, $usuario) {
                $e = estado();
                $i = achar_colecao($e, $num);
                if ($i === null) throw new InvalidArgumentException('Coleção inexistente.');
                $e['colecoes'][$i] = aplicar_formulario($e['colecoes'][$i], $_POST);
                $e['versao']++;
                $e['atualizado'] = date('c');
                guardar_historico('rascunho', ARQ_ESTADO);
                gravar_json(ARQ_ESTADO, $e);
                registrar($usuario, 'salvar', "coleção $num");
            });
            ir("?p=colecao&num=$num", 'Rascunho salvo. O site muda quando você publicar.');
        }
        if ($acao === 'salvar_curadoria') {
            com_trava(function () use ($usuario) {
                $e = estado();
                $data = (string)($_POST['data'] ?? '');
                if ($data !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) throw new InvalidArgumentException('Data inválida.');
                $e['curadoria'] = [
                    'revisor' => texto((string)($_POST['revisor'] ?? ''), LIMITE['pessoa']),
                    'orgao' => texto((string)($_POST['orgao'] ?? ''), LIMITE['pessoa']),
                    'data' => $data,
                    'concluida' => !empty($_POST['concluida']),
                ];
                if ($e['curadoria']['concluida'] && $data === '') throw new InvalidArgumentException('Informe a data para marcar a revisão como concluída.');
                $e['versao']++;
                $e['atualizado'] = date('c');
                guardar_historico('rascunho', ARQ_ESTADO);
                gravar_json(ARQ_ESTADO, $e);
                registrar($usuario, 'salvar', 'dados da revisão');
            });
            ir('./', 'Dados da revisão salvos.');
        }
        if ($acao === 'publicar') {
            $r = publicar($usuario);
            if (!$r['ok']) { $_SESSION['pendencias'] = $r['pendencias']; ir('./', 'Ainda não dá para publicar. Veja as pendências.', 'erro'); }
            ir('./', 'Publicado. O site já mostra a nova versão.');
        }
        if ($acao === 'restaurar') {
            $arq = basename((string)($_POST['arquivo'] ?? ''));
            if (!preg_match('/^\d{8}-\d{6}-(rascunho|publicado)-[0-9a-f]{4}\.json$/', $arq, $m) || !is_file(DIR_HISTORICO . "/$arq"))
                throw new InvalidArgumentException('Versão não encontrada.');
            com_trava(function () use ($arq, $m, $usuario) {
                $destino = $m[1] === 'publicado' ? ARQ_PUBLICO : ARQ_ESTADO;
                $dados = ler_json(DIR_HISTORICO . "/$arq");
                guardar_historico($m[1], $destino);
                gravar_json($destino, $dados);
                registrar($usuario, 'restaurar', $arq);
            });
            ir('?p=historico', $m[1] === 'publicado' ? 'Versão publicada restaurada no site.' : 'Rascunho restaurado.');
        }
        ir('./', 'Ação desconhecida.', 'erro');
    } catch (InvalidArgumentException $ex) {
        ir($voltar, $ex->getMessage(), 'erro');
    } catch (Throwable $ex) {
        registrar($usuario, 'erro', $ex->getMessage());
        ir($voltar, 'Não foi possível salvar. O erro foi registrado no log.', 'erro');
    }
}

if (!$usuario && $pagina !== 'entrar') ir('?p=entrar');

// ── páginas (GET) ─────────────────────────────────
$flash = $_SESSION['flash'] ?? null; unset($_SESSION['flash']);
$aviso = $_SESSION['aviso'] ?? null; unset($_SESSION['aviso']);
$csrf = '<input type="hidden" name="csrf" value="' . h($_SESSION['csrf']) . '">';

function select(string $nome, array $opcoes, string $atual, string $rotulo): string {
    $o = '';
    foreach ($opcoes as $k => $v) $o .= '<option value="' . h($k) . '"' . ($k === $atual ? ' selected' : '') . '>' . h($v) . '</option>';
    return '<select name="' . h($nome) . '" aria-label="' . h($rotulo) . '" class="sel-' . h($atual) . '">' . $o . '</select>';
}

function thumb(array $c, array $grupo, int $i): string {
    $n = $c['num'];
    if ($grupo === ['items']) return "../assets/img/thumbs/shirts/coll-$n-piece-" . ($i + 1) . '.jpeg';
    $t = $c['tees'][$grupo[1]];
    $estilo = isset($t['style']) ? $t['style'] . '-' : '';
    $pos = $grupo[2] === 'extra' ? count($t['names'] ?? $c['items']) + $i : $i;
    return "../assets/img/thumbs/camisetas/coll-$n-{$estilo}piece-" . ($pos + 1) . '.jpeg';
}

function progresso(array $c): array {
    $feitas = count(array_filter($c['claims'], fn($x) => $x['decisao'] !== 'pendente'));
    $trocar = 0;
    foreach (pecas_editaveis($c) as [$g, $i]) if (peca_em($c, $g, $i)['status'] === 'trocar') $trocar++;
    return [$feitas, count($c['claims']), $trocar];
}

$titulo = ['entrar' => 'Entrar', 'colecao' => 'Coleção', 'historico' => 'Histórico'][$pagina] ?? 'Painel';
?><!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title><?= h($titulo) ?> · Curadoria Reveste</title>
  <link rel="icon" type="image/png" href="../assets/img/favicon-64.png">
  <link rel="stylesheet" href="admin.css?v=2">
</head>
<body>
<header class="bar">
  <a class="brand" href="./"><img src="../assets/marca/reveste-icone.svg" alt="" width="30" height="30"> Curadoria Reveste</a>
  <?php if ($usuario): ?>
  <nav aria-label="Admin">
    <a href="./"<?= $pagina === 'painel' ? ' aria-current="page"' : '' ?>>Painel</a>
    <a href="?p=historico"<?= $pagina === 'historico' ? ' aria-current="page"' : '' ?>>Histórico</a>
    <a href="../#colecoes" target="_blank" rel="noopener">Ver o site</a>
    <form method="post" class="inline"><?= $csrf ?><input type="hidden" name="acao" value="sair"><button class="link">Sair (<?= h($_SESSION['nome']) ?>)</button></form>
  </nav>
  <?php endif; ?>
</header>
<main>
<?php if (isset($_GET['saiu']) && !$usuario): ?><p class="msg" role="status">Você saiu do admin.</p><?php endif; ?>
<?php if ($aviso): ?><p class="msg erro" role="alert"><?= h($aviso) ?></p><?php endif; ?>
<?php if ($flash): ?><p class="msg <?= h($flash[0]) ?>" role="<?= $flash[0] === 'erro' ? 'alert' : 'status' ?>"><?= h($flash[1]) ?></p><?php endif; ?>

<?php if ($pagina === 'entrar'): ?>
  <form method="post" class="card login">
    <h1>Entrar</h1>
    <?= $csrf ?><input type="hidden" name="acao" value="entrar">
    <label>Usuário <input name="usuario" autocomplete="username" required autofocus></label>
    <label>Senha <input name="senha" type="password" autocomplete="current-password" required></label>
    <button class="btn">Entrar</button>
    <?php if (!usuarios()): ?><p class="hint">Nenhum usuário cadastrado. Rode <code>php tools/admin/senha.php &lt;usuario&gt;</code> no servidor.</p><?php endif; ?>
  </form>

<?php elseif ($pagina === 'colecao'):
  $e = estado();
  $i = achar_colecao($e, (string)($_GET['num'] ?? ''));
  if ($i === null) { echo '<p class="msg erro">Coleção não encontrada.</p>'; }
  else { $c = $e['colecoes'][$i]; ?>
  <p class="crumbs"><a href="./">← Todas as coleções</a></p>
  <h1><?= h($c['num']) ?> · <?= h($c['name']) ?></h1>
  <p class="hint">Salvar guarda um rascunho. O site só muda depois de <strong>Publicar no site</strong>, no painel.</p>
  <form method="post" class="stack">
    <?= $csrf ?><input type="hidden" name="acao" value="salvar_colecao"><input type="hidden" name="num" value="<?= h($c['num']) ?>">

    <section class="card">
      <h2>Apresentação</h2>
      <label>Nome da coleção <input name="name" value="<?= h($c['name']) ?>" maxlength="<?= LIMITE['nome'] ?>" required></label>
      <label>Subtítulo <input name="sub" value="<?= h($c['sub']) ?>" maxlength="<?= LIMITE['sub'] ?>"></label>
      <label>Texto “Sobre a coleção” <textarea name="desc" rows="4" maxlength="<?= LIMITE['texto'] ?>"><?= h($c['desc']) ?></textarea></label>
    </section>

    <section class="card">
      <h2>Nota curatorial</h2>
      <label>Texto da nota <textarea name="note_texto" rows="4" maxlength="<?= LIMITE['texto'] ?>"><?= h($c['note']['texto']) ?></textarea></label>
      <label class="row">Aprovação <?= select('note_aprovacao', APROVACAO, $c['note']['aprovacao'], 'Aprovação da nota') ?></label>
      <p class="hint">A nota só aparece no site com “Aprovo” ou “Aprovo com ajustes”.</p>
    </section>

    <?php if ($c['claims']): ?>
    <section class="card">
      <h2>Afirmações</h2>
      <p class="hint">Internas: não aparecem no site. Servem de registro do que foi conferido.</p>
      <table>
        <thead><tr><th>#</th><th>Afirmação</th><th>Certeza</th><th>Decisão</th><th>Fonte ou correção</th></tr></thead>
        <tbody>
        <?php foreach ($c['claims'] as $k => $cl): ?>
          <tr>
            <td><?= $k + 1 ?></td>
            <td><?= h($cl['texto']) ?></td>
            <td><?= h($cl['certeza']) ?></td>
            <td><?= select("claim_decisao[$k]", DECISAO, $cl['decisao'], 'Decisão da afirmação ' . ($k + 1)) ?></td>
            <td><input name="claim_fonte[<?= $k ?>]" value="<?= h($cl['fonte']) ?>" maxlength="<?= LIMITE['fonte'] ?>" aria-label="Fonte ou correção da afirmação <?= $k + 1 ?>"></td>
          </tr>
        <?php endforeach; ?>
        </tbody>
      </table>
    </section>
    <?php endif; ?>

    <section class="card">
      <h2>Peças</h2>
      <p class="hint">Para trocar uma peça: escreva o novo nome no formato “Nome – Cidade/UF” e escolha o status. “Trocar a peça” impede a publicação até o nome novo ser definido.</p>
      <ul class="pecas">
      <?php foreach (pecas_editaveis($c) as $k => [$g, $j]):
        $p = peca_em($c, $g, $j);
        $tipo = $g === ['items'] ? 'Camisa' : 'Camiseta' . (isset($c['tees'][$g[1]]['label']) ? ' · ' . $c['tees'][$g[1]]['label'] : ''); ?>
        <li>
          <img src="<?= h(thumb($c, $g, $j)) ?>" alt="" width="72" height="72" loading="lazy">
          <div>
            <span class="tipo"><?= h($tipo) ?></span>
            <input name="peca_nome[<?= $k ?>]" value="<?= h($p['name']) ?>" maxlength="<?= LIMITE['nome'] ?>" aria-label="Nome da peça <?= $k + 1 ?>" required>
          </div>
          <?= select("peca_status[$k]", STATUS, $p['status'], 'Status da peça ' . ($k + 1)) ?>
        </li>
      <?php endforeach; ?>
      </ul>
      <?php if (array_filter($c['tees'], fn($t) => !isset($t['names']))): ?>
        <p class="hint">As camisetas desta coleção usam os mesmos nomes das camisas.</p>
      <?php endif; ?>
    </section>

    <div class="actions"><button class="btn">Salvar rascunho</button> <a href="../#colecoes-<?= h($c['num']) ?>" target="_blank" rel="noopener">Ver a versão publicada</a></div>
  </form>
  <?php } ?>

<?php elseif ($pagina === 'historico'):
  $arqs = is_dir(DIR_HISTORICO) ? array_reverse(glob(DIR_HISTORICO . '/*.json') ?: []) : []; ?>
  <h1>Histórico</h1>
  <p class="hint">Cada salvamento e cada publicação guardam a versão anterior. Restaurar também guarda a atual antes.</p>
  <?php if (!$arqs): ?><p>Nenhuma versão anterior ainda.</p><?php else: ?>
  <table>
    <thead><tr><th>Quando</th><th>Tipo</th><th></th></tr></thead>
    <tbody>
    <?php foreach (array_slice($arqs, 0, 100) as $a): $n = basename($a); preg_match('/^(\d{4})(\d\d)(\d\d)-(\d\d)(\d\d)(\d\d)-(\w+)-/', $n, $m); ?>
      <tr>
        <td><?= h("$m[3]/$m[2]/$m[1] $m[4]:$m[5]:$m[6]") ?></td>
        <td><?= $m[7] === 'publicado' ? 'Versão publicada no site' : 'Rascunho' ?></td>
        <td><form method="post" class="inline"><?= $csrf ?><input type="hidden" name="acao" value="restaurar"><input type="hidden" name="arquivo" value="<?= h($n) ?>"><button class="link">Restaurar</button></form></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <?php endif; ?>

<?php else:
  $e = estado();
  $pend = $_SESSION['pendencias'] ?? pendencias($e); unset($_SESSION['pendencias']);
  $pub = is_file(ARQ_PUBLICO) ? ler_json(ARQ_PUBLICO) : null;
  $k = $e['curadoria']; ?>
  <h1>Curadoria das coleções</h1>
  <p class="hint">Rascunho versão <?= (int)$e['versao'] ?><?= $pub ? ' · no site: versão ' . (int)$pub['versao'] . ', publicada em ' . h(date('d/m/Y H:i', strtotime($pub['publicado']))) : ' · ainda não publicado' ?>.</p>

  <section class="card">
    <h2>Publicar no site</h2>
    <?php if ($pend): ?>
      <p>Antes de publicar, resolva:</p>
      <ul class="pend"><?php foreach ($pend as $p): ?><li><?= h($p) ?></li><?php endforeach; ?></ul>
    <?php elseif ($pub && $pub['versao'] === $e['versao']): ?>
      <p>O site já mostra a versão atual do rascunho.</p>
    <?php else: ?>
      <p>Há mudanças salvas que ainda não estão no site.</p>
    <?php endif; ?>
    <form method="post"><?= $csrf ?><input type="hidden" name="acao" value="publicar"><button class="btn" <?= $pend ? 'disabled' : '' ?>>Publicar no site</button></form>
  </section>

  <section class="card">
    <h2>Coleções</h2>
    <table>
      <thead><tr><th>Coleção</th><th>Nota</th><th>Afirmações conferidas</th><th>Peças a trocar</th></tr></thead>
      <tbody>
      <?php foreach ($e['colecoes'] as $c): [$f, $t, $tr] = progresso($c); ?>
        <tr>
          <td><a href="?p=colecao&amp;num=<?= h($c['num']) ?>"><?= h($c['num']) ?> · <?= h($c['name']) ?></a></td>
          <td><span class="tag sel-<?= h($c['note']['aprovacao']) ?>"><?= h(APROVACAO[$c['note']['aprovacao']]) ?></span></td>
          <td><?= $t ? "$f de $t" : '—' ?></td>
          <td><?= $tr ?: '—' ?></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </section>

  <form method="post" class="card stack">
    <h2>Dados da revisão</h2>
    <?= $csrf ?><input type="hidden" name="acao" value="salvar_curadoria">
    <label>Revisor <input name="revisor" value="<?= h($k['revisor']) ?>" maxlength="<?= LIMITE['pessoa'] ?>"></label>
    <label>Órgão ou vínculo <input name="orgao" value="<?= h($k['orgao']) ?>" maxlength="<?= LIMITE['pessoa'] ?>"></label>
    <label>Data da revisão <input type="date" name="data" value="<?= h($k['data']) ?>"></label>
    <label class="row"><input type="checkbox" name="concluida" value="1" <?= $k['concluida'] ? 'checked' : '' ?>> Revisão concluída (sem isso, o site mostra “em andamento”)</label>
    <div class="actions"><button class="btn">Salvar dados da revisão</button></div>
  </form>
<?php endif; ?>
</main>
</body>
</html>
