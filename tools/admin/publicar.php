<?php
// Publica o rascunho da curadoria no site sem passar pelo navegador
// (primeira publicação, recuperação, deploy).  php tools/admin/publicar.php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit(1);
require __DIR__ . '/../../v2/admin/lib.php';
$r = publicar('cli');
if (!$r['ok']) { fwrite(STDERR, "Pendências:\n- " . implode("\n- ", $r['pendencias']) . "\n"); exit(1); }
echo "Publicado em v2/data/colecoes.json" . ($r['backup'] ? " (anterior: storage/historico/{$r['backup']})" : '') . "\n";
