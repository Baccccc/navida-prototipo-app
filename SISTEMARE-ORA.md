# Perché sono spariti i commenti, e come chiudere la faccenda

## Cosa è successo

Una catena di tre anelli:

1. `api/impostazioni.php` era **tracciato da git**. Il `git pull` su Hostinger
   ha rimesso la versione del repository, **cancellando la password del
   database** che avevi scritto lì sopra.
2. Senza password il database non risponde, quindi il codice è passato al
   ripiego: salvataggio su file.
3. La cartella dei file, non riuscendo a scrivere fuori da `public_html`, è
   finita in `api/dati/` — **dentro il sito**. Il deploy successivo l'ha
   portata via.

Ho sistemato tutti e tre gli anelli. Restano tre minuti di lavoro da parte tua.

---

## Cosa devi fare (una volta sola)

### 1 · Togli `impostazioni.php` da git

Sul tuo computer, nella cartella del progetto:

```bash
git rm --cached api/impostazioni.php
git add .gitignore api/impostazioni.esempio.php api/carica-impostazioni.php api/magazzino.php api/diagnostica.php
git commit -m "impostazioni.php non piu tracciato: le credenziali restano sul server"
git push
```

`git rm --cached` **non cancella** il file dal tuo computer: smette solo di
seguirlo. Da adesso nessun pull potrà più sovrascriverlo.

### 2 · Ricrea il file sul server

Dopo il pull su Hostinger, in `public_html/api/`:

1. Duplica `impostazioni.esempio.php`
2. Rinomina la copia in `impostazioni.php`
3. Aprila e scrivi la password del database nel campo `'password' => ''`

### 3 · Controlla

Apri **`tuosito.it/api/diagnostica.php`**.

Deve comparire un riquadro **verde**: *"I dati sono nel database: sono al
sicuro"*. Se è rosso o giallo, la pagina stessa ti dice cosa manca.

---

## Cosa ho cambiato perché non succeda più

**Le impostazioni non si perdono.** Su git c'è solo il modello
(`impostazioni.esempio.php`). Il file vero (`impostazioni.php`) vive solo sul
server ed è in `.gitignore`. Se manca, l'app non si rompe: usa il modello e la
diagnostica lo segnala.

**I dati non finiscono più dentro al sito.** La cartella di ripiego viene
cercata in tre posti fuori da `public_html` prima di arrendersi. Se proprio
l'unico posto scrivibile fosse dentro il progetto, l'app **lo dichiara**: nel
pannello Commenti compare un avviso arancione *"I commenti non sono al sicuro"*.

**Quello che è finito nel file viene recuperato.** Appena il database torna a
rispondere, i commenti salvati nel file vengono **travasati dentro in
automatico** alla prima apertura, e il file viene messo da parte con estensione
`.importato`. Non devi fare niente.

**C'è una pagina che te lo dice.** `api/diagnostica.php`: database, cartella in
uso, se è fuori dal sito, quante righe ci sono, e cosa fare se qualcosa non va.

---

## Nota amara

I commenti già scritti e persi non sono recuperabili: erano in una cartella che
il deploy ha cancellato. Da adesso in poi il problema non si ripresenta, ma
quelli andati sono andati. Mi dispiace: la cartella di ripiego dentro al
progetto era una mia scelta sbagliata.
