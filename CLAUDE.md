# Navida — Prototipo · istruzioni per Claude

Prototipo navigabile delle Fasi 1-3 dell'app Navida, ramo *Lavoro (Job)*.
Serve come proof of concept per gli investitori e come base editabile per il team.

**Leggi `LEGGIMI.md` prima di toccare il codice.** Contiene la mappa dei file, le
50 schermate in ordine, le specifiche esatte dell'UI kit e le cose ancora da fare.
`AGGIORNARE.md` spiega come si carica online senza perdere le modifiche del team.

---

## Regole tecniche non negoziabili

- **Nessun framework, nessun build.** Solo HTML, CSS e JavaScript puro. Non
  aggiungere React, Vue, bundler, npm o passaggi di compilazione.
- **Niente dipendenze nuove da rete.** Le icone Lucide sono già incorporate in
  `js/icons.js`. Il prototipo deve funzionare anche offline.
- **I colori e le spaziature stanno in `css/tokens.css`.** Usa le variabili CSS
  esistenti. Non scrivere valori esadecimali sparsi nei componenti.
- **La barra di modifica ha due forme.** Su desktop è il pannello laterale a
  destra. Su telefono è un pulsante hamburger fisso in alto a destra che apre
  le stesse schede a tutto schermo (`#edburger` e `#editor.is-mobile-open` in
  `js/editor.js` e `css/editor.css`). Se aggiungi una scheda, funziona da sola
  in entrambe le forme: non duplicare il codice.
- **L'interfaccia è solo mobile.** Su desktop vive dentro una cornice iPhone che
  si rimpicciolisce. Non progettare layout desktop.
- **Rispetta le specifiche dell'UI kit** riportate in `LEGGIMI.md` (tabella
  "Fedeltà all'UI kit"): sono valori presi dal Figma, non stime.

## Dove si mettono le mani

| Cosa vuoi cambiare | File |
|---|---|
| Testi, domande, risposte, ordine delle schermate | `js/content.js` |
| Contenuti della Fase 3 | `js/fase3-content.js` |
| Colori, font, raggi, spaziature | `css/tokens.css` |
| Layout e componenti | `css/app.css` |
| Varianti di stile disponibili | `js/variants.js` |
| Come si disegnano le schermate | `js/render.js`, `js/fase3-render.js` |

L'ordine dell'array `screens` in `js/content.js` **è** l'ordine delle schermate.

## File da non toccare mai

- `api/impostazioni.php` — password del database e parola d'ordine. Vive solo sul
  server, è escluso da git. Non ricrearlo, non scriverci credenziali.
- `api/dati/`, `api/config.json`, `../navida-dati/` — dati salvati dal team.

Non mettere mai password, chiavi o stringhe di connessione nei file versionati.

## Lingua

Codice, commenti, nomi di file e messaggi di commit **in italiano**.
Anche i testi dell'interfaccia sono in italiano.

---

## Come si prova

Il progetto si apre anche con un doppio clic su `index.html`.
Per il server locale c'è `.claude/launch.json` (porta 5177).

Le pagine PHP in `api/` funzionano solo su un hosting con PHP (Hostinger).
Se il PHP non c'è, `js/sync.js` ripiega sul salvataggio nel browser: è normale.

## Come arriva online

- Push su `main` → **Cloudflare Pages** aggiorna il sito da solo. Lì il PHP non
  gira, quindi le modifiche fatte dalla barra laterale restano nel browser di chi
  le fa. Va bene per guardare e mostrare.
- **Hostinger** è l'hosting completo con PHP e database. Si aggiorna a mano,
  seguendo `AGGIORNARE.md`.

## Come lavorare quando Bac è al telefono

Fai le modifiche su un ramo e apri una pull request. Nella descrizione scrivi in
italiano semplice: cosa hai cambiato, in quali file, e cosa deve guardare sul
sito per verificare. Niente gergo.
