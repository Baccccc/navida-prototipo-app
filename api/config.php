<?php
/* ==========================================================================
   NAVIDA — Salvataggio condiviso delle modifiche
   ==========================================================================
   Conserva le modifiche fatte dal team (testi, colori, ordine, varianti)
   in modo che valgano per tutti e, soprattutto, che NON si perdano quando
   il prototipo viene ricaricato con una versione più recente.

   Dove finiscono i dati lo decide  api/impostazioni.php:
     · database MySQL   → il più sicuro, vive fuori dai file del sito
     · file JSON        → in una cartella fuori da public_html

   In entrambi i casi ogni salvataggio conserva anche la versione
   precedente, così si può sempre tornare indietro.

   ROTTE
   -----
   GET  api/config.php              modifiche correnti
   GET  api/config.php?storico=1    elenco delle versioni salvate
   GET  api/config.php?versione=N   una versione specifica
   GET  api/config.php?stato=1      come sta messo il salvataggio
   POST api/config.php              salva (serve la parola d'ordine)
   ========================================================================== */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$cfg = require __DIR__ . '/impostazioni.php';

/* ==========================================================================
   MAGAZZINO — database se configurato, altrimenti file
   ========================================================================== */

/**
 * Il database si usa solo se è configurato E se risponde davvero.
 * Se non risponde si passa al file, senza che il prototipo si rompa:
 * meglio salvare da qualche parte che non salvare affatto.
 */
function usaDatabase(array $cfg): bool
{
    static $esito = null;
    if ($esito !== null) {
        return $esito;
    }
    if (empty($cfg['db']['host']) || empty($cfg['db']['nome'])) {
        return $esito = false;
    }
    try {
        db($cfg);
        return $esito = true;
    } catch (Throwable $e) {
        problemaDb($e->getMessage());
        return $esito = false;
    }
}

/** Tiene da parte il motivo per cui il database non va, per la diagnostica. */
function problemaDb(?string $msg = null): ?string
{
    static $ultimo = null;
    if ($msg !== null) {
        $ultimo = $msg;
    }
    return $ultimo;
}

/** Traduce gli errori più comuni in qualcosa di leggibile. */
function spiegaErroreDb(?string $msg): string
{
    if (!$msg) {
        return '';
    }
    if (str_contains($msg, 'using password: NO')) {
        return 'Manca la password del database: aprire api/impostazioni.php e compilare il campo password.';
    }
    if (str_contains($msg, 'Access denied')) {
        return 'Utente o password del database sbagliati (api/impostazioni.php).';
    }
    if (str_contains($msg, 'Unknown database')) {
        return 'Il nome del database non esiste: controllare api/impostazioni.php.';
    }
    if (str_contains($msg, 'Connection refused') || str_contains($msg, 'getaddrinfo')) {
        return 'Il server del database non risponde: controllare il campo host.';
    }
    return $msg;
}

/* --- database ----------------------------------------------------------- */

function db(array $cfg): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $d = $cfg['db'];
    $pdo = new PDO(
        "mysql:host={$d['host']};dbname={$d['nome']};charset=utf8mb4",
        $d['utente'],
        $d['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $t = preg_replace('/[^a-zA-Z0-9_]/', '', $d['tabella']);
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `$t` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            dati LONGTEXT NOT NULL,
            autore VARCHAR(80) NULL,
            creato_il DATETIME NOT NULL,
            INDEX (creato_il)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
    return $pdo;
}

function tabella(array $cfg): string
{
    return preg_replace('/[^a-zA-Z0-9_]/', '', $cfg['db']['tabella']);
}

/* --- file --------------------------------------------------------------- */

function cartella(array $cfg): string
{
    $dir = $cfg['cartella_dati'];
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    // se non si riesce a creare la cartella esterna, si ripiega su api/dati
    if (!is_dir($dir) || !is_writable($dir)) {
        $dir = __DIR__ . '/dati';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }
    return $dir;
}

/* ==========================================================================
   LETTURA / SCRITTURA
   ========================================================================== */

function leggiCorrente(array $cfg): array
{
    if (usaDatabase($cfg)) {
        try {
            $t = tabella($cfg);
            $r = db($cfg)->query("SELECT dati, creato_il, autore FROM `$t` ORDER BY id DESC LIMIT 1")
                         ->fetch(PDO::FETCH_ASSOC);
            if (!$r) {
                return ['overrides' => new stdClass()];
            }
            $out = json_decode($r['dati'], true) ?: ['overrides' => new stdClass()];
            $out['savedAt'] = $r['creato_il'];
            $out['autore']  = $r['autore'];
            return $out;
        } catch (Throwable $e) {
            return ['overrides' => new stdClass(), 'errore' => 'database non raggiungibile'];
        }
    }

    $f = cartella($cfg) . '/config.json';
    if (!file_exists($f)) {
        return ['overrides' => new stdClass()];
    }
    return json_decode((string) file_get_contents($f), true) ?: ['overrides' => new stdClass()];
}

function salva(array $cfg, array $overrides, ?string $autore): array
{
    $payload = [
        'version'   => 1,
        'savedAt'   => gmdate('c'),
        'autore'    => $autore,
        'overrides' => $overrides,
    ];
    $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if (usaDatabase($cfg)) {
        $t   = tabella($cfg);
        $pdo = db($cfg);
        $ins = $pdo->prepare("INSERT INTO `$t` (dati, autore, creato_il) VALUES (?, ?, NOW())");
        $ins->execute([$json, $autore]);

        // tiene solo le ultime N versioni
        $max = (int) $cfg['storico_max'];
        $pdo->exec(
            "DELETE FROM `$t` WHERE id NOT IN (
                SELECT id FROM (SELECT id FROM `$t` ORDER BY id DESC LIMIT $max) x
            )"
        );
        return ['ok' => true, 'dove' => 'database'];
    }

    $dir = cartella($cfg);
    $f   = $dir . '/config.json';

    // la versione precedente finisce nello storico, con la data nel nome
    if (file_exists($f)) {
        $storico = $dir . '/storico';
        if (!is_dir($storico)) {
            @mkdir($storico, 0755, true);
        }
        @copy($f, $storico . '/config-' . gmdate('Ymd-His') . '.json');

        // pulizia: si tengono solo le ultime N
        $vecchie = glob($storico . '/config-*.json') ?: [];
        if (count($vecchie) > (int) $cfg['storico_max']) {
            sort($vecchie);
            foreach (array_slice($vecchie, 0, count($vecchie) - (int) $cfg['storico_max']) as $v) {
                @unlink($v);
            }
        }
    }

    if (file_put_contents($f, $json, LOCK_EX) === false) {
        return ['ok' => false, 'errore' => 'Non riesco a scrivere in ' . $dir . ': controlla i permessi (755).'];
    }
    return ['ok' => true, 'dove' => 'file: ' . $dir];
}

function elencoStorico(array $cfg): array
{
    if (usaDatabase($cfg)) {
        try {
            $t = tabella($cfg);
            $r = db($cfg)->query("SELECT id, autore, creato_il FROM `$t` ORDER BY id DESC")
                         ->fetchAll(PDO::FETCH_ASSOC);
            return array_map(static fn($x) => [
                'id'     => (int) $x['id'],
                'quando' => $x['creato_il'],
                'autore' => $x['autore'],
            ], $r);
        } catch (Throwable $e) {
            return [];
        }
    }

    $storico = cartella($cfg) . '/storico';
    $file    = glob($storico . '/config-*.json') ?: [];
    rsort($file);
    return array_map(static fn($f) => [
        'id'     => basename($f, '.json'),
        'quando' => date('c', (int) filemtime($f)),
        'autore' => null,
    ], $file);
}

function leggiVersione(array $cfg, string $id): ?array
{
    if (usaDatabase($cfg)) {
        try {
            $t = tabella($cfg);
            $q = db($cfg)->prepare("SELECT dati FROM `$t` WHERE id = ?");
            $q->execute([(int) $id]);
            $r = $q->fetchColumn();
            return $r ? (json_decode((string) $r, true) ?: null) : null;
        } catch (Throwable $e) {
            return null;
        }
    }

    $id = preg_replace('/[^a-zA-Z0-9\-]/', '', $id);
    $f  = cartella($cfg) . '/storico/' . $id . '.json';
    if (!file_exists($f)) {
        return null;
    }
    return json_decode((string) file_get_contents($f), true) ?: null;
}

/* ==========================================================================
   ROTTE
   ========================================================================== */

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'GET') {

    if (isset($_GET['stato'])) {
        $conDb = usaDatabase($cfg);          // prova davvero la connessione
        $dove  = $conDb ? 'database' : cartella($cfg);
        $ok    = true;
        $nota  = '';

        if (!$conDb) {
            $problema = spiegaErroreDb(problemaDb());
            if ($problema) {
                // il database era configurato ma non risponde: si salva su file
                $nota = 'Database non disponibile, uso il file. ' . $problema;
            }
            if (!is_writable(cartella($cfg))) {
                $ok   = false;
                $nota = trim($nota . ' Anche la cartella ' . cartella($cfg) . ' non è scrivibile (permessi 755).');
            }
        }

        echo json_encode([
            'ok'       => $ok,
            'modo'     => $conDb ? 'database' : 'file',
            'dove'     => $dove,
            'nota'     => $nota,
            'versioni' => count(elencoStorico($cfg)),
        ]);
        exit;
    }

    if (isset($_GET['storico'])) {
        echo json_encode(['versioni' => elencoStorico($cfg)]);
        exit;
    }

    if (isset($_GET['versione'])) {
        $v = leggiVersione($cfg, (string) $_GET['versione']);
        if (!$v) {
            http_response_code(404);
            echo json_encode(['errore' => 'versione non trovata']);
            exit;
        }
        echo json_encode($v);
        exit;
    }

    echo json_encode(leggiCorrente($cfg));
    exit;
}

if ($metodo === 'POST') {
    $data = json_decode((string) file_get_contents('php://input'), true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['errore' => 'JSON non valido']);
        exit;
    }
    if (!isset($data['password']) || !hash_equals((string) $cfg['password'], (string) $data['password'])) {
        http_response_code(403);
        echo json_encode(['errore' => 'Parola d’ordine sbagliata']);
        exit;
    }
    if (!isset($data['overrides']) || !is_array($data['overrides'])) {
        http_response_code(400);
        echo json_encode(['errore' => 'Manca il campo overrides']);
        exit;
    }

    $autore = isset($data['autore']) ? substr((string) $data['autore'], 0, 80) : null;

    try {
        $res = salva($cfg, $data['overrides'], $autore);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['errore' => $e->getMessage()]);
        exit;
    }

    if (empty($res['ok'])) {
        http_response_code(500);
    }
    echo json_encode($res);
    exit;
}

http_response_code(405);
echo json_encode(['errore' => 'Metodo non consentito']);
