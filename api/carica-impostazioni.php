<?php
/* ==========================================================================
   NAVIDA — Caricamento delle impostazioni
   ==========================================================================
   Cerca, in quest'ordine:

     1. api/impostazioni.php          ← le credenziali vere, SOLO sul server.
                                        Non è su git: nessun `git pull` può
                                        sovrascriverla.
     2. api/impostazioni.esempio.php  ← il modello, quello versionato.

   Se trova solo il modello, l'app funziona lo stesso (salva su file) e la
   diagnostica avvisa che manca la configurazione.
   ========================================================================== */

declare(strict_types=1);

$fileVero    = __DIR__ . '/impostazioni.php';
$fileModello = __DIR__ . '/impostazioni.esempio.php';

if (file_exists($fileVero)) {
    $cfg = require $fileVero;
    $cfg['__origine'] = 'impostazioni.php';
} elseif (file_exists($fileModello)) {
    $cfg = require $fileModello;
    $cfg['__origine'] = 'impostazioni.esempio.php';
    $cfg['__avviso']  = 'Manca api/impostazioni.php: sto usando il modello. '
                      . 'Copia il modello in impostazioni.php e scrivici la password del database.';
} else {
    $cfg = [
        'password'      => 'navida2026',
        'db'            => ['host' => '', 'nome' => '', 'utente' => '', 'password' => '', 'tabella' => 'navida_config'],
        'cartella_dati' => __DIR__ . '/../../navida-dati',
        'storico_max'   => 30,
        '__origine'     => 'valori di riserva',
        '__avviso'      => 'Non trovo né impostazioni.php né il modello: uso valori di riserva.',
    ];
}

/* garantisce che le chiavi ci siano sempre, anche con un file vecchio */
$cfg['db']            = ($cfg['db'] ?? []) + ['host' => '', 'nome' => '', 'utente' => '', 'password' => '', 'tabella' => 'navida_config'];
$cfg['password']      = $cfg['password'] ?? 'navida2026';
$cfg['cartella_dati'] = $cfg['cartella_dati'] ?? (__DIR__ . '/../../navida-dati');
$cfg['storico_max']   = $cfg['storico_max'] ?? 30;

return $cfg;
