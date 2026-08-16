<?php
/* ==========================================================================
   NAVIDA — Commenti del team sulle schermate
   ==========================================================================
   Ogni persona può lasciare un commento su una schermata: appare nel
   pannello a sinistra del prototipo e lo vedono tutti.

   Usa lo stesso magazzino delle modifiche (api/impostazioni.php):
     · database MySQL   → tabella navida_commenti, creata da sola
     · file JSON        → cartella dei dati, fuori da public_html

   ROTTE
   -----
   GET  api/commenti.php                 tutti i commenti
   GET  api/commenti.php?schermata=id    solo quelli di una schermata
   POST {azione:'nuovo', schermata, autore, testo}
   POST {azione:'risolvi', id}           segna come risolto (o lo riapre)
   POST {azione:'cancella', id}
   ========================================================================== */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$cfg = require __DIR__ . '/impostazioni.php';

const TABELLA = 'navida_commenti';

/**
 * Il database si usa solo se configurato E se risponde davvero.
 * Se non risponde si ripiega sul file: i commenti si salvano comunque.
 */
function conDatabase(array $cfg): bool
{
    static $esito = null;
    if ($esito !== null) {
        return $esito;
    }
    if (empty($cfg['db']['host']) || empty($cfg['db']['nome'])) {
        return $esito = false;
    }
    try {
        pdo($cfg);
        return $esito = true;
    } catch (Throwable $e) {
        return $esito = false;
    }
}

function pdo(array $cfg): PDO
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
    $t = TABELLA;
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS `$t` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            schermata VARCHAR(64) NOT NULL,
            autore VARCHAR(80) NOT NULL,
            testo TEXT NOT NULL,
            risolto TINYINT(1) NOT NULL DEFAULT 0,
            creato_il DATETIME NOT NULL,
            INDEX (schermata)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    );
    return $pdo;
}

/* --- ripiego su file ---------------------------------------------------- */

function fileCommenti(array $cfg): string
{
    $dir = $cfg['cartella_dati'];
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    if (!is_dir($dir) || !is_writable($dir)) {
        $dir = __DIR__ . '/dati';
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
    }
    return $dir . '/commenti.json';
}

function leggiFile(array $cfg): array
{
    $f = fileCommenti($cfg);
    if (!file_exists($f)) {
        return [];
    }
    return json_decode((string) file_get_contents($f), true) ?: [];
}

function scriviFile(array $cfg, array $lista): bool
{
    return file_put_contents(
        fileCommenti($cfg),
        json_encode($lista, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        LOCK_EX
    ) !== false;
}

/* ==========================================================================
   OPERAZIONI
   ========================================================================== */

function elenco(array $cfg, ?string $schermata): array
{
    if (conDatabase($cfg)) {
        try {
            $t = TABELLA;
            if ($schermata) {
                $q = pdo($cfg)->prepare("SELECT * FROM `$t` WHERE schermata = ? ORDER BY id DESC");
                $q->execute([$schermata]);
            } else {
                $q = pdo($cfg)->query("SELECT * FROM `$t` ORDER BY id DESC");
            }
            return array_map(static fn($r) => [
                'id'        => (int) $r['id'],
                'schermata' => $r['schermata'],
                'autore'    => $r['autore'],
                'testo'     => $r['testo'],
                'risolto'   => (bool) $r['risolto'],
                'quando'    => $r['creato_il'],
            ], $q->fetchAll(PDO::FETCH_ASSOC));
        } catch (Throwable $e) {
            return [];
        }
    }

    $lista = leggiFile($cfg);
    if ($schermata) {
        $lista = array_values(array_filter($lista, static fn($c) => ($c['schermata'] ?? '') === $schermata));
    }
    usort($lista, static fn($a, $b) => ($b['id'] ?? 0) <=> ($a['id'] ?? 0));
    return $lista;
}

function aggiungi(array $cfg, string $schermata, string $autore, string $testo): array
{
    $schermata = substr($schermata, 0, 64);
    $autore    = substr(trim($autore), 0, 80);
    $testo     = substr(trim($testo), 0, 2000);

    if ($testo === '') {
        return ['ok' => false, 'errore' => 'Il commento è vuoto'];
    }
    if ($autore === '') {
        $autore = 'Anonimo';
    }

    if (conDatabase($cfg)) {
        $t = TABELLA;
        $q = pdo($cfg)->prepare("INSERT INTO `$t` (schermata, autore, testo, creato_il) VALUES (?, ?, ?, NOW())");
        $q->execute([$schermata, $autore, $testo]);
        return ['ok' => true, 'id' => (int) pdo($cfg)->lastInsertId()];
    }

    $lista = leggiFile($cfg);
    $id    = 1;
    foreach ($lista as $c) {
        $id = max($id, ((int) ($c['id'] ?? 0)) + 1);
    }
    $lista[] = [
        'id'        => $id,
        'schermata' => $schermata,
        'autore'    => $autore,
        'testo'     => $testo,
        'risolto'   => false,
        'quando'    => gmdate('c'),
    ];
    return scriviFile($cfg, $lista)
        ? ['ok' => true, 'id' => $id]
        : ['ok' => false, 'errore' => 'Non riesco a scrivere il file dei commenti'];
}

function risolvi(array $cfg, int $id): array
{
    if (conDatabase($cfg)) {
        $t = TABELLA;
        $q = pdo($cfg)->prepare("UPDATE `$t` SET risolto = 1 - risolto WHERE id = ?");
        $q->execute([$id]);
        return ['ok' => true];
    }

    $lista = leggiFile($cfg);
    foreach ($lista as &$c) {
        if ((int) ($c['id'] ?? 0) === $id) {
            $c['risolto'] = empty($c['risolto']);
        }
    }
    unset($c);
    return scriviFile($cfg, $lista) ? ['ok' => true] : ['ok' => false, 'errore' => 'Scrittura fallita'];
}

function cancella(array $cfg, int $id): array
{
    if (conDatabase($cfg)) {
        $t = TABELLA;
        $q = pdo($cfg)->prepare("DELETE FROM `$t` WHERE id = ?");
        $q->execute([$id]);
        return ['ok' => true];
    }

    $lista = array_values(array_filter(leggiFile($cfg), static fn($c) => (int) ($c['id'] ?? 0) !== $id));
    return scriviFile($cfg, $lista) ? ['ok' => true] : ['ok' => false, 'errore' => 'Scrittura fallita'];
}

/* ==========================================================================
   ROTTE
   ========================================================================== */

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'GET') {
    $schermata = isset($_GET['schermata']) ? (string) $_GET['schermata'] : null;
    echo json_encode(['commenti' => elenco($cfg, $schermata)]);
    exit;
}

if ($metodo === 'POST') {
    $data = json_decode((string) file_get_contents('php://input'), true);
    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(['errore' => 'JSON non valido']);
        exit;
    }

    $azione = $data['azione'] ?? '';

    try {
        if ($azione === 'nuovo') {
            echo json_encode(aggiungi(
                $cfg,
                (string) ($data['schermata'] ?? ''),
                (string) ($data['autore'] ?? ''),
                (string) ($data['testo'] ?? '')
            ));
            exit;
        }

        if ($azione === 'risolvi') {
            echo json_encode(risolvi($cfg, (int) ($data['id'] ?? 0)));
            exit;
        }

        if ($azione === 'cancella') {
            echo json_encode(cancella($cfg, (int) ($data['id'] ?? 0)));
            exit;
        }
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['errore' => $e->getMessage()]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['errore' => 'Azione sconosciuta']);
    exit;
}

http_response_code(405);
echo json_encode(['errore' => 'Metodo non consentito']);
