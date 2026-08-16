# Come aggiornare il prototipo senza perdere le modifiche del team

Il problema che vogliamo evitare: il team modifica testi e varianti online,
tu carichi una versione nuova dell'app, e le loro modifiche spariscono.

Non può succedere, per come è fatto adesso. Ma vale la pena capire perché,
così sai sempre cosa stai toccando.

---

## Dove stanno le modifiche del team

**Non nei file dell'app.** Stanno nel **database MySQL** (`u734237607_mod_navida`,
tabella `navida_config`), che vive fuori da `public_html`.

Puoi cancellare e ricaricare tutto `public_html` quante volte vuoi: il database
non lo tocchi. È il motivo per cui conviene usarlo invece del file.

Se un giorno lasci vuoto il database in `api/impostazioni.php`, il ripiego è un
file JSON in `../navida-dati/` — anche quella è una cartella **sorella** di
`public_html`, quindi fuori dalla linea di tiro.

---

## I due soli file da non sovrascrivere

Quando ricarichi il prototipo, salta questi:

```
api/impostazioni.php     ← password del database e parola d'ordine
api/dati/                ← esiste solo se NON usi il database
```

Tutto il resto (`index.html`, `css/`, `js/`, `assets/`, `api/config.php`)
si può sovrascrivere tranquillamente.

---

## La procedura, passo per passo

1. **Prima di caricare**, apri il prototipo online, vai nel pannello
   **Versione** → **Scarica una copia**. Ti salva un file
   `navida-modifiche-AAAAMMGG-hhmm.json`. Tienilo da parte: è la tua rete.
2. Carica i file nuovi in `public_html`, **senza toccare** `api/impostazioni.php`.
3. Riapri il prototipo e controlla che le modifiche ci siano ancora.
4. Se qualcosa è andato storto: **Versione → Ripristina da una copia**, scegli
   il file del punto 1.

---

## Se proprio cancelli tutto

Anche in quel caso hai tre reti di sicurezza, in ordine di comodità:

1. **Le versioni sul server.** Ogni volta che qualcuno preme *Applica*, la
   versione precedente resta salvata. Ne conserviamo le ultime **30**. Le trovi
   nel pannello **Versione** → *Versioni sul server*: clicchi una data e torni
   a quel momento.
2. **La copia scaricata** al punto 1 della procedura.
3. **Il browser di chi ha fatto le modifiche.** Ogni persona ha una copia locale
   in `localStorage`: basta che apra il prototipo e prema *Applica* per
   rimandarle sul server.

---

## Quando cambi i contenuti in `content.js`

Le modifiche del team sono agganciate all'**identificativo della schermata**
(`perche.title`, `b2_valori.opt.3`, e così via). Quindi:

- se cambi il testo predefinito di una schermata, **vince quello del team** —
  la loro modifica resta;
- se **rinomini l'id** di una schermata o **cancelli un'opzione**, la modifica
  collegata resta orfana e smette di applicarsi.

Perciò: quando riorganizzi il flusso, evita di rinominare gli `id` esistenti.
Aggiungerne di nuovi non crea problemi.

---

## Prima messa online, in pratica

1. Carica tutto il contenuto della cartella in `public_html`
2. Apri `api/impostazioni.php` con l'editor del File Manager
3. Scrivi la **password del database** nel campo `'password' => ''`
4. Cambia la **parola d'ordine** `'password' => 'navida2026'` (quella che il
   team digiterà per salvare)
5. Apri il prototipo: nel pannello **Versione**, in fondo, deve dire
   *"Le modifiche valgono per tutti, salvate nel database"*

Se dice *"Server non attivo"*, la password del database è sbagliata o PHP non
gira. Apri `tuosito.it/api/config.php?stato=1` nel browser: ti dice cosa non va.
