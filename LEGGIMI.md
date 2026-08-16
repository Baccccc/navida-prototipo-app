# Navida — Prototipo interattivo

Prototipo navigabile della **Fase 1 (ingresso e scoperta)** e della **Fase 2 (questionario)**
dell'app Navida, ramo *Lavoro (Job)*. Serve come proof of concept da mostrare
agli investitori e come base editabile per il team Navida.

Tutto è **deterministico**: non c'è algoritmo, non c'è backend, non ci sono account veri.

---

## Come si apre

Doppio clic su `index.html`. Non serve installare niente.

Su desktop l'interfaccia appare dentro una **cornice che simula un iPhone**, perché
tutta la UI è progettata solo per mobile. Su telefono occupa tutto lo schermo.

Scorciatoie: `→` avanti, `←` indietro.

---

## Come si mette online

**Hostinger — consigliato.** File Manager → carica tutto il contenuto della
cartella dentro `public_html`. Poi:

1. Apri `api/config.php` e cambia la riga `const PASSWORD = 'navida2026';`
2. Controlla che la cartella `api/` sia scrivibile (permessi **755**)

Fatto questo, le modifiche fatte dalla barra laterale e poi **applicate**
vengono salvate sul server in `api/config.json` e **le vedono tutti**.
Non serve nessun database.

**Cloudflare Pages** — funziona, ma è solo statico: niente PHP, quindi le
modifiche restano nel browser di chi le fa. Se serve la condivisione lì,
va rifatto l'endpoint come Cloudflare Worker + KV.

Il font **DM Sans** arriva da Google Fonts. Le icone Lucide sono incorporate in
`js/icons.js`, quindi il prototipo funziona anche senza rete.

---

## Le modifiche restano in bozza finché non le applichi

Qualsiasi cambiamento — testo, colore, ordine, variante di elemento, versione
di schermata — appare **subito a schermo** ma resta in bozza. Nella barra
laterale compare una striscia viola con il conteggio e due pulsanti:

- **Applica** — le rende definitive. Da quel momento sono quelle che si vedono
  riaprendo il prototipo, e se il server PHP è attivo valgono per tutti.
- **Annulla** — butta via la bozza e torna com'era.

Alla prima applicazione il browser chiede la parola d'ordine impostata in
`api/config.php`. Se la annulli, le modifiche restano solo sul tuo browser.

Il pannello **Versione** mostra sempre lo stato: se le modifiche valgono per
tutti o solo in locale.

---

## Salto rapido per le demo

Premi **Tab** (oppure **Alt**) e in alto a sinistra compare il pulsante
**Salta al questionario**. Cliccandolo, il prototipo compila da solo tutte le
risposte con un profilo di esempio e va dritto alla linea di carriera.

Serve quando presenti agli investitori e non vuoi rifare tutto il percorso ogni
volta. Il pulsante resta invisibile finché non lo chiami, quindi non sporca la
demo. `Esc` lo nasconde.

---

## La barra di modifica

Sta **a destra, fuori dallo schermo del telefono**, come pannello laterale sempre
aperto: così non copre l'interfaccia e non interferisce con la responsività.
Si chiude con la linguetta sul suo bordo sinistro.

**Su mobile non compare del tutto** — chi apre il prototipo dal telefono vede
solo l'app.

Ha sei pannelli. Tutto quello che cambi resta salvato **in questo browser** e si
può esportare in JSON.

| Pannello | Cosa fa |
|---|---|
| **Versione** | Alterna le versioni alternative della schermata corrente (es. i 3 login). Qui ci sono anche Esporta / Importa / Azzera. |
| **Testi** | Attiva la modalità, clicca su qualunque testo della schermata e riscrivilo. Esci dal campo per salvare. |
| **Colori** | Cambia i colori del tema. Si applicano subito a tutta l'app. |
| **Ordine** | Attiva il riordino e trascina le risposte per cambiarne l'ordine. |
| **Elemento** | Attiva la selezione, clicca un elemento (lista risposte, titolo, pulsante, barra, mascotte, card…) e scegli una variante di stile. Puoi applicarla solo a quella schermata o a tutte. |
| **Vai a** | Salta direttamente a una qualsiasi delle 49 schermate. |

| **Commenti** | Lascia un commento sulla schermata che stai guardando. |

Cliccando **Testi**, **Ordine** o **Elemento** la modalità si attiva subito.
In fondo al pannello ci sono due scorciatoie: **Inizio del questionario** e
**Fine del questionario** (che compila da sola tutte le risposte).

---

## I commenti del team

Si **scrivono dal pannello di destra**, scheda **Commenti**, e **compaiono a
sinistra** dello schermo del telefono come foglietti attaccati alla schermata
a cui si riferiscono.

- La prima volta il prototipo chiede il tuo nome, poi se lo ricorda.
- Ogni commento resta legato alla sua schermata: cambiando pagina compaiono
  quelli di quella pagina.
- **Risolto** lo barra e lo sbiadisce, senza cancellarlo. Si può riaprire.
- **Elimina** chiede la parola d'ordine, così non si buttano via per sbaglio
  i commenti degli altri.
- Sulla scheda c'è un pallino arancione con quanti commenti aperti ci sono in
  tutto il prototipo, e sotto l'elenco delle altre schermate che ne hanno.

I commenti stanno nella tabella `navida_commenti` del database: come le
modifiche, non si perdono ricaricando l'app. Sotto i 1240px di larghezza i
foglietti non compaiono, per non stringere lo schermo del telefono.

---

### Versioni alternative già pronte

| Schermata | Versioni |
|---|---|
| **Apertura** | Alone lavanda · Copertina + card · Notturna |
| **Accesso** | Centrata · Social first · Con copertina · Pagina semplice — più le tre vecchie a popup, tenute per confronto |
| **Prima proiezione** | Tre consigli · Messaggio unico |

Fra le varianti della lista risposte c'è **Card con icone**: griglia a due colonne
con icona colorata, sullo stile dei reference. È già attiva su *Cosa stai cercando*,
*Cosa vuoi ottenere*, *Al momento sei*, *Cosa cerchi in un'azienda* e
*Ti trasferiresti*.

### Passare le modifiche a qualcun altro

`Versione → Esporta modifiche` scarica `navida-modifiche.json`.
L'altra persona apre il prototipo e fa `Versione → Importa`.

Per rendere le modifiche **definitive** (visibili a tutti senza importare nulla),
riportale a mano dentro `js/content.js`.

---

## Struttura dei file

```
index.html
css/
  tokens.css          colori, font, spaziature, raggi — presi dalle variabili Figma
  app.css             layout mobile, cornice iPhone, tutti i componenti
  editor.css          barra di modifica
js/
  content.js          ← TUTTI I TESTI E LE DOMANDE. È il file da toccare.
  data-professioni.js   23 categorie professionali + 426 mansioni
  variants.js           elenco delle varianti di stile disponibili
  mascotte.js           astronauta, 5 pose (versione semplificata, vedi sotto)
  state.js              stato, risposte, modifiche, salvataggio
  render.js             disegna le schermate
  editor.js             barra di modifica
  app.js                navigazione e avvio
```

### Modificare i contenuti dal codice

Apri `js/content.js`. Ogni schermata è un oggetto nell'array `screens`:
l'ordine dell'array **è** l'ordine delle schermate.

Per aggiungere una domanda basta copiare un oggetto esistente, cambiare
`id`, `title` e `options`. I tipi disponibili sono elencati in cima al file.

---

## Cosa c'è dentro

**50 schermate**, in quest'ordine:

1. **Ingresso** (6) — splash, scelta tipo utente, 4 schede di onboarding
2. **Fase 1 · Scoperta** (16) — nome, genere, età, motivazione, obiettivo, titolo di
   studio, specializzazioni, situazione lavorativa, lavoro dei sogni, prima proiezione
3. **Accesso** (2) — registrazione (3 versioni) e codice via email
4. **Fase 2 · Questionario** (24) — introduzione + 3 blocchi:
   - Blocco 1 · anagrafica, categoria professionale, mansioni, livello di responsabilità
   - Blocco 2 · 3 ordinamenti, paure, valori, trasferimento, sogno aperto
   - Blocco 3 · 7 domande di personalità da 8 risposte
5. **Chiusura** (2) — anteprima della linea di carriera

Le barre di avanzamento sono **proporzionali** al numero di schermate del capitolo.

---

## Le mascotte

Sono le illustrazioni vere, prese dalla cartella `Mascotte` e ottimizzate per il
web (altezza 440px, sfondo trasparente). Stanno in `assets/`, dodici pose:

`salutare` · `indicare` · `saltare` · `tablet` · `computer` · `ok` ·
`leggere` · `matita` · `calcolare` · `volare` · `zaino` · `stretta-mano`

Si cambiano al volo dalla barra di modifica → **Elemento** → *Mascotte*.
Per sostituirne una basta sovrascrivere il file in `assets/` mantenendo il nome;
le proporzioni sono registrate in `js/mascotte.js`, così non si deformano.

---

## La sezione ludica

Ricostruita com'è oggi nel Figma (schermate *Animaz ludica 1-12*):

1. **`lavoroSogni`** — tre anelli concentrici con la scritta *"Qual è il lavoro
   che sogni?"* entrano in dissolvenza ingrandendosi e ruotando, poi si fermano.
   Al centro il campo di testo; la tastiera sale da sola.
2. Premuto **Continua**, la tastiera scende e gli anelli riprendono a girare.
3. **`elaborazione`** — tre cerchi giganti (lavanda, azzurro, viola) si aprono
   dal centro uno sopra l'altro, ciascuno con la sua etichetta:
   *Analizzando le risposte · Calcolando profilo utente · Creando suggerimenti*.
4. **`previsione`** — i tre consigli entrano a cascata, uno dopo l'altro.

Resta col badge *"da rifare"* perché il design va ripensato insieme: intanto si
comporta come il progetto attuale.

**La tastiera finta** sale ogni volta che un campo di testo prende il fuoco, su
tutte le schermate: il prototipo si comporta come un telefono vero. Si scrive
con la tastiera del computer, ma anche i tasti a schermo funzionano.

---

## Altre cose ancora da fare

1. **Sezione ludica** — funzionante ma da ridisegnare.
2. **Fase 3** — dashboard, mappa, consulenza e profilo non sono incluse.
3. **Testi placeholder** — le 4 schede di onboarding hanno copy provvisorio.

---

## Fedeltà all'UI kit

Valori presi uno per uno dal component set Figma, non stimati a occhio:

| Componente | Spec |
|---|---|
| **Risposta** | 345×40, raggio 12, padding 10/24, gap 8 · default `#ffffff` bordo `#ebe9f7` · scelta `#e3e3f9` bordo `#392eaa` · testo 14/20 Medium `#314158` |
| **Risposta +info** | 64 di altezza da selezionata |
| **Risposta +testo** | 85 di altezza, campo interno 297×37 raggio 12, bianco al 40% |
| **Checkbox** | 14×16 (non 18×18) |
| **Barra avanzamento** | 185×4 · track `#1e1a4d` al 12% · riempimento sfumato `#8c2895` → `#3118a0` |
| **Pulsante** | 6 stati: CTA `#4340b3` · Disattivata `#dddded` **con testo bianco** · Passivo `#f3f4f6`/`#314158` · Premuto `#314158` con bordo nero · Outline `#fafbfc` bordo `#314158` · Transparent |
| **Dimensioni pulsante** | Full page 345×48 · 345×52 · Half page 172×48 · 172×52 · Small 72×48 · 128×52 |
| **Titolo** | 24/32 SemiBold `#314158`, centrato, larghezza testo 297 |

## Responsività

- **Desktop**: la cornice iPhone si **rimpicciolisce** per stare sempre dentro la
  finestra (fino al 45%), invece di essere tagliata in basso.
- **Mobile**: schermo pieno con `dvh` e rispetto delle *safe area* (notch e barra
  gesti), niente cornice.
- **Schermi bassi** (sotto i 700px): si comprimono le spaziature verticali e la
  mascotte, invece di far sparire il pulsante.

---

## Nota tecnica

Nessun framework, nessun passaggio di build: HTML, CSS e JavaScript puro.
Chiunque sappia leggere l'HTML può metterci mano.
