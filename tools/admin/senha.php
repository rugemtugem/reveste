<?php
// Cadastra ou troca a senha de um usuário do admin de curadoria.
//   php tools/admin/senha.php luan "Luan Crespo"
// A senha é digitada no terminal (não aparece) e só o hash é gravado em
// .secrets/admin-usuarios.php, fora do Git e fora da pasta pública.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit(1);
$u = strtolower(trim($argv[1] ?? ''));
if (!preg_match('/^[a-z0-9._-]{2,40}$/', $u)) { fwrite(STDERR, "Uso: php tools/admin/senha.php <usuario> [\"Nome visível\"]\n"); exit(1); }
$nome = $argv[2] ?? $u;
$senha = getenv('REVESTE_ADMIN_SENHA') ?: null;          // para automação; o normal é digitar
if ($senha === null) {
    fwrite(STDOUT, "Senha para $u (mín. 12 caracteres): ");
    system('stty -echo'); $senha = rtrim((string)fgets(STDIN), "\n"); system('stty echo'); fwrite(STDOUT, "\n");
}
if (mb_strlen($senha) < 12) { fwrite(STDERR, "Senha curta: use pelo menos 12 caracteres.\n"); exit(1); }
$arq = __DIR__ . '/../../.secrets/admin-usuarios.php';
@mkdir(dirname($arq), 0700, true);
$lista = is_file($arq) ? (require $arq) : [];
$lista[$u] = ['nome' => $nome, 'hash' => password_hash($senha, PASSWORD_DEFAULT)];
file_put_contents($arq, "<?php\n// Usuários do admin de curadoria (gerado por tools/admin/senha.php). Não versionar.\nreturn " . var_export($lista, true) . ";\n", LOCK_EX);
chmod($arq, 0600);
echo "Usuário $u salvo.\n";
