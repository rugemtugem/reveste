<?php
// Núcleo do admin de curadoria da Reveste.
//
// Estrutura de pastas. <publica> é v2/ localmente e public_html na hospedagem;
// <raiz> é a pasta acima dela (reveste/ localmente, a home da conta no servidor):
//   <publica>/admin/               -> este admin
//   <publica>/data/colecoes.json   -> dados publicados, lidos pelo site
//   <raiz>/storage/                -> rascunho, histórico e log (FORA da pasta pública)
//   <raiz>/.secrets/               -> usuários e senhas do admin (fora do Git)
declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');

// acessado direto pela URL: não é uma página
if (PHP_SAPI !== 'cli' && realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) { http_response_code(404); exit; }

const PUBLICA = __DIR__ . '/..';
const RAIZ = PUBLICA . '/..';
const ARQ_ESTADO = RAIZ . '/storage/curadoria.json';
const ARQ_PUBLICO = PUBLICA . '/data/colecoes.json';
const DIR_HISTORICO = RAIZ . '/storage/historico';
const ARQ_LOG = RAIZ . '/storage/auditoria.log';
const ARQ_TENTATIVAS = RAIZ . '/storage/tentativas-login.json';
const ARQ_USUARIOS = RAIZ . '/.secrets/admin-usuarios.php';
const ARQ_CONFIG = RAIZ . '/.secrets/admin-config.php';   // opcional: ['proxies' => ['1.2.3.4']]
const ARQ_TRAVA = RAIZ . '/storage/.trava';

const STATUS = ['homenagem' => 'Homenagem', 'reinterpretacao' => 'Reinterpretação', 'trocar' => 'Trocar a peça'];
const DECISAO = ['pendente' => 'Pendente', 'confirmo' => 'Confirmo', 'corrijo' => 'Corrijo', 'retiro' => 'Retiro'];
const APROVACAO = ['pendente' => 'Pendente', 'aprovo' => 'Aprovo', 'ajustes' => 'Aprovo com ajustes', 'nao' => 'Não aprovo'];
const LIMITE = ['nome' => 120, 'sub' => 120, 'texto' => 1500, 'fonte' => 300, 'pessoa' => 120];

const SESSAO_MINUTOS = 30;
const LOGIN_MAX_FALHAS = 5;
const LOGIN_JANELA_SEG = 15 * 60;
const LOGIN_MAX_FALHAS_USUARIO = 10;   // por usuário, independente do IP

// ── arquivos ──────────────────────────────────────

function ler_json(string $arq): array {
    $txt = @file_get_contents($arq);
    if ($txt === false) throw new RuntimeException('Arquivo não encontrado: ' . basename($arq));
    $dados = json_decode($txt, true, 64, JSON_THROW_ON_ERROR);
    if (!is_array($dados)) throw new RuntimeException('Arquivo inválido: ' . basename($arq));
    return $dados;
}

// Grava inteiro ou nada: arquivo temporário + rename atômico.
function gravar_json(string $arq, array $dados): void {
    $dir = dirname($arq);
    if (!is_dir($dir) && !mkdir($dir, 0775, true)) throw new RuntimeException('Sem permissão para criar ' . $dir);
    $tmp = $arq . '.tmp-' . bin2hex(random_bytes(4));
    $json = json_encode($dados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . "\n";
    if (file_put_contents($tmp, $json, LOCK_EX) === false) throw new RuntimeException('Falha ao gravar ' . basename($arq));
    if (!rename($tmp, $arq)) { @unlink($tmp); throw new RuntimeException('Falha ao substituir ' . basename($arq)); }
}

// Uma escrita por vez (dois revisores salvando ao mesmo tempo).
function com_trava(callable $fn) {
    $h = fopen(ARQ_TRAVA, 'c');
    if (!$h || !flock($h, LOCK_EX)) throw new RuntimeException('Não foi possível travar o armazenamento.');
    try { return $fn(); } finally { flock($h, LOCK_UN); fclose($h); }
}

function guardar_historico(string $tipo, string $arq): ?string {
    if (!is_file($arq)) return null;
    if (!is_dir(DIR_HISTORICO)) mkdir(DIR_HISTORICO, 0775, true);
    $nome = date('Ymd-His') . '-' . $tipo . '-' . bin2hex(random_bytes(2)) . '.json';
    copy($arq, DIR_HISTORICO . '/' . $nome);
    return $nome;
}

function registrar(string $usuario, string $acao, string $detalhe = ''): void {
    $linha = json_encode(['quando' => date('c'), 'usuario' => $usuario, 'acao' => $acao, 'detalhe' => $detalhe,
        'ip' => ip_cliente()], JSON_UNESCAPED_UNICODE) . "\n";
    @file_put_contents(ARQ_LOG, $linha, FILE_APPEND | LOCK_EX);
}

// ── estado de trabalho ────────────────────────────

function estado(): array { return ler_json(ARQ_ESTADO); }

function achar_colecao(array $estado, string $num): ?int {
    foreach ($estado['colecoes'] as $i => $c) if ($c['num'] === $num) return $i;
    return null;
}

function texto(string $v, int $max): string {
    $v = trim(preg_replace('/\s+/u', ' ', $v) ?? '');
    if (mb_strlen($v) > $max) throw new InvalidArgumentException("Texto acima de $max caracteres.");
    return $v;
}

function opcao(string $v, array $permitidas): string {
    if (!array_key_exists($v, $permitidas)) throw new InvalidArgumentException('Opção inválida: ' . $v);
    return $v;
}

// Aplica o formulário de uma coleção ao estado. Só os campos conhecidos;
// a estrutura (quantidade de peças e afirmações) não muda pelo formulário.
function aplicar_formulario(array $c, array $f): array {
    $c['name'] = texto($f['name'] ?? $c['name'], LIMITE['nome']);
    $c['sub'] = texto($f['sub'] ?? $c['sub'], LIMITE['sub']);
    $c['desc'] = texto($f['desc'] ?? $c['desc'], LIMITE['texto']);
    if ($c['name'] === '') throw new InvalidArgumentException('O nome da coleção não pode ficar vazio.');
    $c['note']['texto'] = texto($f['note_texto'] ?? $c['note']['texto'], LIMITE['texto']);
    $c['note']['aprovacao'] = opcao($f['note_aprovacao'] ?? $c['note']['aprovacao'], APROVACAO);
    foreach ($c['claims'] as $i => $cl) {
        $c['claims'][$i]['decisao'] = opcao($f['claim_decisao'][$i] ?? $cl['decisao'], DECISAO);
        $c['claims'][$i]['fonte'] = texto($f['claim_fonte'][$i] ?? $cl['fonte'], LIMITE['fonte']);
    }
    foreach (pecas_editaveis($c) as $k => [$grupo, $i]) {
        $nome = texto($f['peca_nome'][$k] ?? '', LIMITE['nome']);
        $status = opcao($f['peca_status'][$k] ?? '', STATUS);
        $ref = &$c;
        foreach ($grupo as $parte) $ref = &$ref[$parte];
        $ref[$i] = ['name' => $nome, 'status' => $status];
        unset($ref);
    }
    return $c;
}

// Lista das peças que têm nome próprio: camisas e as camisetas com lista
// própria ou peça extra. Camisetas sem lista herdam os nomes das camisas.
function pecas_editaveis(array $c): array {
    $out = [];
    foreach ($c['items'] as $i => $_) $out[] = [['items'], $i];
    foreach ($c['tees'] as $g => $t) {
        foreach ($t['names'] ?? [] as $i => $_) $out[] = [['tees', $g, 'names'], $i];
        foreach ($t['extra'] ?? [] as $i => $_) $out[] = [['tees', $g, 'extra'], $i];
    }
    return $out;
}

function peca_em(array $c, array $caminho, int $i): array {
    $ref = $c;
    foreach ($caminho as $p) $ref = $ref[$p];
    return $ref[$i];
}

// ── publicação ────────────────────────────────────

// Problemas que impedem publicar (o rascunho pode ficar incompleto).
function pendencias(array $estado): array {
    $p = [];
    foreach ($estado['colecoes'] as $c) {
        $nomes = [];
        foreach (pecas_editaveis($c) as [$g, $i]) {
            $peca = peca_em($c, $g, $i);
            if ($peca['name'] === '') $p[] = "{$c['num']}: há uma peça sem nome.";
            if ($peca['status'] === 'trocar') $p[] = "{$c['num']}: “{$peca['name']}” está marcada para troca; dê um novo nome e escolha o status.";
            if ($g === ['items'] && in_array($peca['name'], $nomes, true)) $p[] = "{$c['num']}: nome repetido, “{$peca['name']}”.";
            $nomes[] = $peca['name'];
        }
        if (in_array($c['note']['aprovacao'], ['aprovo', 'ajustes'], true) && $c['note']['texto'] === '')
            $p[] = "{$c['num']}: a nota está aprovada mas sem texto.";
    }
    return $p;
}

// O que o site recebe: só nota aprovada, sem as afirmações internas.
function versao_publica(array $estado): array {
    $limpa = fn(array $l) => array_map(fn($x) => ['name' => $x['name'], 'status' => $x['status']], $l);
    $colecoes = array_map(function (array $c) use ($limpa) {
        $nota = in_array($c['note']['aprovacao'], ['aprovo', 'ajustes'], true) ? $c['note']['texto'] : null;
        $tees = array_map(function (array $t) use ($limpa) {
            $o = [];
            foreach (['style', 'label'] as $k) if (isset($t[$k])) $o[$k] = $t[$k];
            if (isset($t['names'])) $o['names'] = $limpa($t['names']);
            if (isset($t['extra'])) $o['extra'] = $limpa($t['extra']);
            return $o;
        }, $c['tees']);
        return ['num' => $c['num'], 'name' => $c['name'], 'sub' => $c['sub'], 'desc' => $c['desc'],
            'note' => $nota ?: null, 'img' => $c['img'], 'items' => $limpa($c['items']), 'tees' => $tees];
    }, $estado['colecoes']);
    return ['versao' => $estado['versao'], 'publicado' => date('c'), 'curadoria' => $estado['curadoria'], 'colecoes' => $colecoes];
}

function publicar(string $usuario): array {
    return com_trava(function () use ($usuario) {
        $estado = estado();
        $pend = pendencias($estado);
        if ($pend) return ['ok' => false, 'pendencias' => $pend];
        $backup = guardar_historico('publicado', ARQ_PUBLICO);
        gravar_json(ARQ_PUBLICO, versao_publica($estado));
        registrar($usuario, 'publicar', 'versão ' . $estado['versao'] . ($backup ? "; anterior em $backup" : ''));
        return ['ok' => true, 'backup' => $backup];
    });
}

// ── autenticação ──────────────────────────────────

function config(): array {
    static $c = null;
    if ($c === null) { $c = is_file(ARQ_CONFIG) ? (require ARQ_CONFIG) : []; if (!is_array($c)) $c = []; }
    return $c;
}

// IP de quem acessa. Atrás de proxy ou CDN, todos chegam com o REMOTE_ADDR do
// proxy; só quando esse IP está em config()['proxies'] o X-Forwarded-For é
// usado (o último salto, que o proxy confiável acrescentou).
function ip_cliente(): string {
    $remoto = $_SERVER['REMOTE_ADDR'] ?? 'cli';
    $proxies = config()['proxies'] ?? [];
    if ($proxies && in_array($remoto, $proxies, true) && !empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $saltos = array_map('trim', explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']));
        $ip = end($saltos);
        if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
    }
    return $remoto;
}

function usuarios(): array {
    if (!is_file(ARQ_USUARIOS)) return [];
    $u = require ARQ_USUARIOS;
    return is_array($u) ? $u : [];
}

function iniciar_sessao(): void {
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    session_name('reveste_admin');
    session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Strict']);
    session_start();
    if (isset($_SESSION['usuario'], $_SESSION['visto']) && time() - $_SESSION['visto'] > SESSAO_MINUTOS * 60) {
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['aviso'] = 'Sessão encerrada por inatividade. Entre de novo.';
    }
    $_SESSION['visto'] = time();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function exigir_csrf(): void {
    $t = $_POST['csrf'] ?? '';
    if (!is_string($t) || !hash_equals($_SESSION['csrf'] ?? '', $t)) {
        http_response_code(400);
        exit('Formulário expirado. Volte e tente de novo.');
    }
}

// Limite de tentativas em LOGIN_JANELA_SEG: LOGIN_MAX_FALHAS por IP e
// LOGIN_MAX_FALHAS_USUARIO por usuário (protege a conta mesmo quando vários
// acessos chegam pelo mesmo IP). Retorna os segundos que faltam, ou 0.
function bloqueado(string $ip, string $usuario = ''): int {
    $t = is_file(ARQ_TENTATIVAS) ? (json_decode((string)file_get_contents(ARQ_TENTATIVAS), true) ?: []) : [];
    $limite = time() - LOGIN_JANELA_SEG;
    foreach ([["ip:$ip", LOGIN_MAX_FALHAS], ["u:$usuario", LOGIN_MAX_FALHAS_USUARIO]] as [$chave, $max]) {
        if ($chave === 'u:') continue;
        $recentes = array_filter($t[$chave] ?? [], fn($ts) => $ts > $limite);
        if (count($recentes) >= $max) return (int)(min($recentes) + LOGIN_JANELA_SEG - time());
    }
    return 0;
}

function anotar_falha(string $ip, string $usuario = ''): void {
    $t = is_file(ARQ_TENTATIVAS) ? (json_decode((string)file_get_contents(ARQ_TENTATIVAS), true) ?: []) : [];
    $limite = time() - LOGIN_JANELA_SEG;
    foreach (array_filter(["ip:$ip", $usuario !== '' ? "u:$usuario" : null]) as $chave) {
        $t[$chave] = array_values(array_filter($t[$chave] ?? [], fn($ts) => $ts > $limite));
        $t[$chave][] = time();
    }
    @file_put_contents(ARQ_TENTATIVAS, json_encode($t), LOCK_EX);
}

function limpar_falhas(string $ip, string $usuario = ''): void {
    $t = is_file(ARQ_TENTATIVAS) ? (json_decode((string)file_get_contents(ARQ_TENTATIVAS), true) ?: []) : [];
    unset($t["ip:$ip"], $t["u:$usuario"]);
    @file_put_contents(ARQ_TENTATIVAS, json_encode($t), LOCK_EX);
}

function h(?string $v): string { return htmlspecialchars((string)$v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
