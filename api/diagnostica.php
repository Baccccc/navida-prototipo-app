<?php
/* ==========================================================================
   NAVIDA — Diagnostica
   ==========================================================================
   Apri  tuosito.it/api/diagnostica.php  per sapere in trenta secondi
   se i dati del team sono al sicuro o se rischiano di sparire al prossimo
   caricamento del sito.
   ========================================================================== */

declare(strict_types=1);

$cfg = require __DIR__ . '/carica-impostazioni.php';
require_once __DIR__ . '/magazzino.php';

/* --- database ----------------------------------------------------------- */
$dbConfigurato = !empty($cfg['db']['host']) && !empty($cfg['db']['nome']);
$dbOk = false;
$dbErrore = '';
$conteggi = [];

if ($dbConfigurato) {
    try {
        $pdo = new PDO(
            "mysql:host={$cfg['db']['host']};dbname={$cfg['db']['nome']};charset=utf8mb4",
            $cfg['db']['utente'],
            $cfg['db']['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $dbOk = true;
        foreach (['navida_config' => 'modifiche', 'navida_commenti' => 'commenti'] as $t => $nome) {
            try {
                $conteggi[$nome] = (int) $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
            } catch (Throwable $e) {
                $conteggi[$nome] = 'tabella non ancora creata';
            }
        }
    } catch (Throwable $e) {
        $dbErrore = $e->getMessage();
    }
}

/* --- cartella dei file -------------------------------------------------- */
$mag = magazzinoCartella($cfg);
$radice = $_SERVER['DOCUMENT_ROOT'] ?? '';
$dentroIlSito = $radice && str_starts_with(realpath($mag['dir']) ?: $mag['dir'], realpath($radice) ?: $radice);

/* --- verdetto ----------------------------------------------------------- */
if ($dbOk) {
    $verdetto = ['ok', 'I dati sono nel database: sono al sicuro.',
        'Puoi ricaricare il sito quante volte vuoi senza perdere niente.'];
} elseif (!$dentroIlSito) {
    $verdetto = ['forse', 'I dati sono in un file FUORI dalla cartella del sito.',
        'Sopravvivono ai caricamenti, ma il database resta la soluzione migliore.'];
} else {
    $verdetto = ['no', 'ATTENZIONE: i dati sono DENTRO la cartella del sito.',
        'Al prossimo git pull o caricamento vengono cancellati. Va sistemato subito.'];
}

$colori = ['ok' => '#1f7a4d', 'forse' => '#b8860b', 'no' => '#b32c3f'];

function riga(string $etichetta, $valore, bool $mono = false): string
{
    $v = is_bool($valore) ? ($valore ? 'sì' : 'no') : (string) $valore;
    $stile = $mono ? ' style="font-family:monospace;font-size:13px;word-break:break-all"' : '';
    return '<tr><th>' . htmlspecialchars($etichetta) . '</th><td' . $stile . '>'
         . htmlspecialchars($v) . '</td></tr>';
}
?>
<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Navida — Diagnostica</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px;
         color: #223; line-height: 1.55; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { color: #667; margin: 0 0 28px; }
  .verdetto { border-radius: 12px; padding: 16px 18px; color: #fff; margin-bottom: 28px; }
  .verdetto strong { display: block; font-size: 16px; margin-bottom: 4px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .06em; color: #778;
       margin: 28px 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e6e8ee; vertical-align: top; }
  th { width: 40%; font-weight: 600; color: #445; }
  .fix { background: #fff8e6; border: 1px solid #f0dca8; border-radius: 10px; padding: 14px 18px; }
  .fix li { margin-bottom: 6px; }
  code { background: #eef0f5; padding: 1px 5px; border-radius: 4px; font-size: 13px; }
</style>
</head>
<body>

<h1>Navida — dove stanno i dati</h1>
<p class="sub">Modifiche e commenti del team.</p>

<div class="verdetto" style="background: <?= $colori[$verdetto[0]] ?>">
  <strong><?= htmlspecialchars($verdetto[1]) ?></strong>
  <?= htmlspecialchars($verdetto[2]) ?>
</div>

<h2>Database</h2>
<table>
  <?= riga('Configurato in impostazioni.php', $dbConfigurato) ?>
  <?= riga('Risponde', $dbOk) ?>
  <?= $dbErrore ? riga('Errore', $dbErrore, true) : '' ?>
  <?php foreach ($conteggi as $nome => $n): ?>
    <?= riga('Righe salvate · ' . $nome, $n) ?>
  <?php endforeach; ?>
</table>

<h2>File (usati solo se il database non risponde)</h2>
<table>
  <?= riga('Cartella in uso', $mag['dir'], true) ?>
  <?= riga('Fuori dalla cartella del sito', !$dentroIlSito) ?>
  <?= riga('Scrivibile', is_writable($mag['dir'])) ?>
  <?= riga('Radice del sito', $radice, true) ?>
</table>

<?php if (!$dbOk): ?>
<h2>Come sistemarlo</h2>
<div class="fix">
  <ol>
    <li>Apri <code>api/impostazioni.php</code> con il File Manager di Hostinger.</li>
    <li>Compila il campo <code>'password' =&gt; ''</code> con la password del database
        <code><?= htmlspecialchars($cfg['db']['nome'] ?: 'del progetto') ?></code>.</li>
    <li>Ricarica questa pagina: il riquadro in alto deve diventare verde.</li>
  </ol>
  <p>Appena il database risponde, i commenti e le modifiche finiti nel file
     vengono <strong>travasati dentro in automatico</strong> alla prima apertura
     del prototipo. Non serve fare altro.</p>
</div>
<?php endif; ?>

<h2>Configurazione</h2>
<table>
  <?= riga('Impostazioni lette da', $cfg['__origine'] ?? '?', true) ?>
  <?= riga('api/impostazioni.php esiste', file_exists(__DIR__ . '/impostazioni.php')) ?>
  <?= isset($cfg['__avviso']) ? riga('Avviso', $cfg['__avviso']) : '' ?>
</table>

<?php if (!file_exists(__DIR__ . '/impostazioni.php')): ?>
<div class="fix" style="margin-top:14px">
  <strong>Manca il file delle impostazioni.</strong>
  <p>Nel File Manager di Hostinger, dentro <code>public_html/api/</code>:
  duplica <code>impostazioni.esempio.php</code>, rinomina la copia in
  <code>impostazioni.php</code> e scrivici la password del database.</p>
  <p>Quel file non è su git, quindi non verrà più sovrascritto dai pull.</p>
</div>
<?php endif; ?>

</body>
</html>
