<?php
/* ==========================================================================
   NAVIDA — Dove finiscono i dati
   ==========================================================================
   Usato sia da config.php (modifiche) sia da commenti.php.

   La regola è una sola: i dati NON devono mai stare dentro la cartella del
   sito, altrimenti un `git pull` o un ricaricamento li porta via.

   Ordine di preferenza:
     1. database MySQL                      ← il posto giusto
     2. cartella indicata in impostazioni   ← fuori da public_html
     3. una cartella sorella di public_html ← calcolata da sola
     4. dentro api/dati                     ← ULTIMA SPIAGGIA, non sicura:
                                              viene segnalato come pericolo
   ========================================================================== */

declare(strict_types=1);

/**
 * Restituisce la cartella dei dati e dice se è al sicuro dai deploy.
 * @return array{dir:string, sicura:bool, motivo:string}
 */
function magazzinoCartella(array $cfg): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }

    $candidati = [];

    // 1 · quella scelta nelle impostazioni
    if (!empty($cfg['cartella_dati'])) {
        $candidati[] = ['dir' => $cfg['cartella_dati'], 'sicura' => true];
    }

    // 2 · una cartella sorella della radice del sito, calcolata da sola
    $radice = $_SERVER['DOCUMENT_ROOT'] ?? '';
    if ($radice && is_dir($radice)) {
        $candidati[] = ['dir' => rtrim(dirname($radice), '/') . '/navida-dati', 'sicura' => true];
    }

    // 3 · la home dell'utente, se diversa
    $home = getenv('HOME');
    if ($home && is_dir($home)) {
        $candidati[] = ['dir' => rtrim($home, '/') . '/navida-dati', 'sicura' => true];
    }

    foreach ($candidati as $c) {
        $dir = $c['dir'];
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        if (is_dir($dir) && is_writable($dir)) {
            return $cache = ['dir' => $dir, 'sicura' => true, 'motivo' => ''];
        }
    }

    // 4 · ultima spiaggia: dentro il progetto. Da segnalare.
    $dir = __DIR__ . '/dati';
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
    return $cache = [
        'dir'    => $dir,
        'sicura' => false,
        'motivo' => 'I dati stanno dentro la cartella del sito: un git pull o un nuovo caricamento li cancella. '
                  . 'Collega il database in api/impostazioni.php, oppure crea una cartella scrivibile fuori da public_html.',
    ];
}
