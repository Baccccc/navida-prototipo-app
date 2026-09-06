# Navida — Il linguaggio visivo dell'app

Questo file spiega **come si vestono** le schermate di Navida: quanto è grande
un testo, quanta aria c'è fra due cose, quanto sono arrotondati gli angoli,
quanto misura un'icona e quando si usa un colore invece di un altro.

Serve a una cosa sola: far sembrare tutte le schermate **la stessa app**.

Non è un elenco di regole da imparare a memoria. È una scatola di pezzi
già pronti: quando devi scrivere una misura o un colore, **quel pezzo esiste
già** e ha un nome. Usa quello.

---

## La regola che vale sopra tutte

> Nei componenti si usano **le variabili**, mai i valori scritti a mano.

Cioè: dentro `css/app.css`, `css/fase3.css` e gli altri fogli di stile **non
si scrive** `font-size: 13px` o `color: #16866b`. Si scrive
`font-size: var(--fs-sm)` e `color: var(--success)`.

Tutte le variabili vivono in **un solo posto**: `css/tokens.css`.

Perché è importante:

- **Si cambia una cosa e cambia ovunque.** Se il verde di Navida deve diventare
  un po' più scuro, si tocca una riga in `tokens.css` e si aggiornano tutte le
  schermate insieme. Con i colori scritti a mano bisognerebbe cercarli uno per
  uno, e uno lo si dimentica sempre.
- **La barra di modifica funziona.** Il pannello "Colori" cambia le variabili a
  schermo in tempo reale. Un colore scritto a mano nel componente non si muove:
  resta lì e stona.
- **Non nascono venti sfumature dello stesso colore.** Prima di questo file, in
  `css/fase3.css` c'erano otto trasparenze diverse dello stesso blu, tre verdi
  per lo stesso significato e due rossi per "attenzione". A occhio si vedeva:
  le schermate sembravano fatte da persone diverse.

**Ti serve un valore che non c'è?** Non scriverlo a mano nel componente:
aggiungi una variabile in fondo a `tokens.css`, con un commento in italiano che
dice a cosa serve, e poi usala. Mai *cambiare* il valore di una variabile che
c'è già: le stesse variabili le usa anche il questionario delle Fasi 1 e 2.

---

## I testi

Otto misure, e basta. Ogni misura ha già la sua interlinea (l'altezza della
riga): si usano sempre in coppia.

| Variabile | Misura | Dove si usa |
|---|---|---|
| `--fs-xs` / `--lh-xs` | 12 / 16 | didascalie, etichette, dati piccoli, badge, tempi |
| `--fs-sm` / `--lh-sm` | 14 / 20 | testo corrente, titoletti di sezione, righe di elenco |
| `--fs-base` / `--lh-base` | 16 / 24 | testo importante, nome utente, pulsanti |
| `--fs-lg` / `--lh-lg` | 18 / 28 | titoli di scheda, numeri in evidenza |
| `--fs-xl` / `--lh-xl` | 20 / 28 | titoli delle pagine di secondo livello e dei pop up |
| `--fs-2xl` / `--lh-2xl` | 24 / 32 | titolo grande di schermata |
| `--fs-3xl` / `--lh-3xl` | 30 / 36 | usato solo nelle schermate celebrative |
| `--fs-4xl` / `--lh-4xl` | 36 / 40 | numeri giganti, schermate di risultato |

**Non esiste il testo da 8, 9, 10 o 11 px.** Sotto i 12 px si legge male su un
telefono in mano, e più misure diverse fanno sembrare la pagina disordinata.
Se un dato "non ci sta" a 12 px, il problema non è il testo: è la scheda che è
troppo stretta o troppo piena. Si allarga la scheda o si toglie un dato.

Il peso del carattere ha quattro gradini: `--fw-normal` (400), `--fw-medium`
(500), `--fw-semibold` (600), `--fw-bold` (700). Il carattere è uno solo,
`--font` (Atkinson Hyperlegible Next).

---

## Le spaziature

Quanta aria lasciare fra le cose. Anche qui una scala sola, in `--sp-*`:

| Variabile | Misura | Tipicamente |
|---|---|---|
| `--sp-1` | 2 px | fra due righe di testo appiccicate |
| `--sp-2` | 4 px | fra un'icona e la parola che le sta accanto |
| `--sp-3` | 6 px | fra le pastiglie di una fila |
| `--sp-4` | 8 px | fra due schede di un elenco |
| `--sp-5` | 10 px | dentro le schede piccole |
| `--sp-6` | 12 px | fra un'icona grande e il suo testo |
| `--sp-7` | 16 px | dentro le schede, fra due blocchi |
| `--sp-8` | 24 px | fra due sezioni della pagina |
| `--sp-9` | 32 px | stacchi grandi |
| `--sp-10` | 40 px | spazio in fondo alla pagina |
| `--sp-11` | 44 px | altezza di un pulsante piccolo |
| `--sp-12` | 80 px | spazio sotto ai moduli, prima del pulsante appiccicato |

Il margine laterale della pagina è sempre lo stesso: `--gutter` (24 px). Non si
cambia da una schermata all'altra, altrimenti passando da una pagina all'altra
il contenuto "salta" a destra e a sinistra.

---

## Gli angoli arrotondati

| Variabile | Raggio | Su cosa |
|---|---|---|
| `--r-xs` | 4 px | etichettine minuscole |
| `--r-sm` | 6 px | menù a tendina |
| `--r-md` | 12 px | **il raggio normale**: schede, pulsanti, campi, quadratini delle icone |
| `--r-lg` | 16 px | schede grandi, pannelli che salgono dal basso |
| `--r-xl` | 24 px | pannelli molto grandi |
| `--r-2xl` | 32 px | eccezioni |
| `--r-full` | tondo | avatar, pastiglie, interruttori, pallini |

Nel dubbio: `--r-md`. Prima di questa passata giravano raggi da 8, 9, 10, 11,
13, 14 e 18 px, tutti insieme nella stessa schermata: la differenza fra 12 e 13
non la nota nessuno, ma **l'insieme** si vede eccome.

---

## Le icone

Le icone sono **Lucide**, disegnate con un tratto di 2 su una griglia 24×24, e
sono incorporate nel prototipo (`js/icons.js` per il questionario, l'elenco in
cima a `js/fase3-render.js` per dashboard e profilo). Prendono da sole il
colore di chi le contiene, quindi su fondo blu diventano bianche senza fare
niente.

**Tre misure, non una di più.**

| Variabile | Misura | Quando |
|---|---|---|
| `--ico-sm` | 16 px | dentro una riga di testo: durata, partecipanti, freccine "›" |
| `--ico-md` | 20 px | dentro il quadratino colorato, o all'inizio di una riga di elenco |
| `--ico-lg` | 24 px | pulsanti della barra in alto e della barra in basso |

Nel codice JavaScript le stesse tre misure hanno il nome `ICO_SM`, `ICO_MD`,
`ICO_LG`. Si scrive `icon('clock', ICO_SM)`, non `icon('clock', 13)`.

Unica eccezione: il **disegno grande degli stati vuoti** (il razzo di "Il tuo
percorso inizia ora", la campanella di "Nessuna notifica"), che usa 32 e 48 px.
Lì l'icona non è un comando, è un'illustrazione.

Due misure di contorno che vanno insieme alle icone:

- `--ico-chip` (40 px) — il quadratino colorato con dentro un'icona da 20.
  È lo stesso in tutta l'app: riquadri della home, notifiche, preferenze,
  impostazioni del contenuto.
- `--avatar-sm` (42 px) — l'avatar tondo nella barra in alto.

**Prima di usare un nome di icona, controlla che esista.** Se il nome non c'è,
sullo schermo resta un buco bianco (e senza rete non arriva neanche dal CDN).
I nomi disponibili si leggono in `js/icons.js` e nell'elenco `ICONE_FASE3` in
cima a `js/fase3-render.js`. Se ne serve una nuova, si aggiunge lì il disegno
Lucide: **non** si mettono simboli tipografici (⚏, ▣, ◷) al posto delle icone,
perché ogni telefono li disegna a modo suo e spesso non li disegna affatto.

---

## I colori

### Marca

| Variabile | Colore | Uso |
|---|---|---|
| `--main` | blu Navida | il colore dell'azione: pulsanti, voce attiva, link |
| `--main-2` | viola | secondo colore, coppia con il blu |
| `--grad-brand` | blu → viola | le due schede "eroe": obiettivo mensile e riepilogo del percorso |
| `--main-soft` | blu all'8% | fondi tenui: quadratini icona, riquadri informativi |
| `--main-ring` | blu al 20% | anelli e bordi appena accennati |

### Superfici e testo

| Variabile | Uso |
|---|---|
| `--bg` | il fondo della schermata (grigio chiarissimo) |
| `--surface` | il bianco delle schede: **si usa questo, non `#fff`** |
| `--light-outline` | il bordo delle schede e le righe divisorie |
| `--text` | il testo normale |
| `--text-toned` | testo un po' più tenue |
| `--text-muted` | testo di servizio: didascalie, descrizioni |
| `--text-dimmed` | il grigio più chiaro: orari, freccine |
| `--text-on-main` | il bianco del testo sopra il blu o la sfumatura |

### Stato

| Variabile | Colore | Quando |
|---|---|---|
| `--success` / `--success-bg` | verde | è andato a buon fine: step completato, punto chiave, spunta |
| `--danger` / `--danger-bg` | rosso | attenzione o azione che toglie: log out, elimina, segnala, pallino delle notifiche non lette |

Il rosso è **uno solo**. Prima ce n'erano due (uno per il pallino delle
notifiche, uno per "Log out") e si vedevano diversi affiancati. Lo stesso vale
per il verde, che era in tre versioni.

### Le coppie tematiche

`--tema-1-*` … `--tema-5-*` sono coppie colore-di-testo / colore-di-fondo già
abbinate, usate dai quadratini colorati delle icone (le classi `.f3-tone--*`).
Servono a distinguere fra loro elementi che hanno **la stessa importanza**, non
a dire "questo è più urgente": per quello ci sono `--success` e `--danger`.

### Sopra la sfumatura

`--on-main-dim` e `--on-main-veil` sono i due bianchi trasparenti che si usano
quando qualcosa sta **sopra** la sfumatura di marca o sopra una foto: la
traccia dell'anello di avanzamento e le pastiglie sopra l'immagine di
copertina.

### Il velo dei pop up

`--scrim` è il blu-notte trasparente che sta sotto ogni pop up. È sempre lo
stesso, così tutti i pop up dell'app "pesano" uguale.

---

## Come è fatta una schermata

Sempre allo stesso modo, in tre pezzi:

1. **Barra in alto** — avatar o freccia "indietro" a sinistra, eventuale
   campanella a destra. Scende di `--f3-top` dal bordo: su desktop passa sotto
   la finta barra di stato dell'iPhone, su telefono vero rispetta il notch.
2. **La pagina** — è l'unica parte che scorre. Non ha altezze fisse: se il
   contenuto è lungo, si scorre; se è corto, resta com'è.
3. **Barra in basso** — tre voci, come nel flusso su FigJam: **Dashboard ·
   Mappa · Consulenza**. Icona da 24 sopra, etichetta da 12 sotto, la voce in
   cui ti trovi in `--main`. Compare anche su percorso e catalogo, dove nessuna
   voce risulta attiva. Sulle pagine di secondo livello non c'è: lì si torna
   indietro con la freccia in alto a sinistra.
   Il **profilo** e le **notifiche** non stanno nella barra: si raggiungono
   dall'avatar e dalla campanella in alto, come dice il flusso.

I **pop up** (filtri, impostazioni del contenuto, foto profilo, log out) non
sono pagine a sé: coprono la schermata da cui li hai aperti, che resta visibile
sotto il velo. Quelli che salgono dal basso hanno la maniglietta grigia in
cima e gli angoli arrotondati solo sopra.

**Niente altezze in pixel per il contenuto.** Un `height: 852px` funziona solo
sull'iPhone su cui è stato disegnato il mockup: su tutti gli altri telefoni
taglia il contenuto o lascia un buco. Le pagine si lasciano libere di essere
alte quanto serve.

---

## In pratica: dove metto le mani

| Voglio cambiare… | File |
|---|---|
| un colore, una misura di testo, una spaziatura, un raggio | `css/tokens.css` |
| come è fatta una schermata della Fase 3 o del profilo | `css/fase3.css` |
| come è fatto il questionario | `css/app.css` |
| il disegno di un'icona, o aggiungerne una | `js/icons.js`, o `ICONE_FASE3` in `js/fase3-render.js` |

E ricorda la regola di `CLAUDE.md`: se tocchi un file dentro `css/` o `js/`,
cambia il numero di versione `?v=` in `index.html` e `fase3.html`, altrimenti
il telefono continua a mostrare la versione vecchia.
