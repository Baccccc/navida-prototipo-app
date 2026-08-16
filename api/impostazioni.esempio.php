<?php
/* ==========================================================================
   NAVIDA — Impostazioni del salvataggio · MODELLO
   ==========================================================================
   Questo è il MODELLO, ed è l'unico file che sta su git.

   Sul server va creata una copia chiamata  impostazioni.php  con dentro le
   credenziali vere. Quella copia NON è tracciata da git, quindi nessun
   `git pull` potrà mai sovrascriverla.

   Prima volta, sul server:
       cp api/impostazioni.esempio.php api/impostazioni.php
       poi apri impostazioni.php e scrivi la password del database.

   Ci sono due modi di conservare le modifiche del team.
   Scegli quello che preferisci: il codice si adatta da solo.

   ── MODO 1 · DATABASE (consigliato) ──────────────────────────────────
   È il più sicuro: il database vive fuori dai file del sito, quindi
   puoi ricaricare tutto il prototipo quante volte vuoi senza toccarlo.
   Compila i quattro campi qui sotto con i dati del database MySQL che
   hai creato su Hostinger (hPanel → Database → MySQL).
   La tabella viene creata da sola alla prima modifica.

   ── MODO 2 · FILE ────────────────────────────────────────────────────
   Se lasci il database vuoto, le modifiche finiscono in un file JSON
   dentro la cartella indicata da CARTELLA_DATI. Di default è FUORI da
   public_html, così anche svuotando il sito non si perde niente.
   ========================================================================== */

return [

    /* Parola d'ordine per poter salvare le modifiche.
       Cambiala prima di mettere il prototipo online. */
    'password' => 'navida2026',

    /* --- MODO 1 · database (lascia 'host' vuoto per usare il file) ---- */
    'db' => [
        'host'     => 'localhost',
        'nome'     => 'u734237607_mod_navida',
        'utente'   => 'u734237607_team_navida',
        'password' => '',            // <<< METTI QUI LA PASSWORD DEL DATABASE
        'tabella'  => 'navida_config',
    ],

    /* --- MODO 2 · file ------------------------------------------------
       Percorso della cartella dove tenere i dati.
       Il valore di default punta a una cartella SORELLA di public_html:
       ricaricando il sito non viene toccata.
       Se il tuo hosting non lo permette, metti __DIR__ . '/dati'. */
    'cartella_dati' => __DIR__ . '/../../navida-dati',

    /* Quante versioni precedenti conservare. */
    'storico_max' => 30,
];
