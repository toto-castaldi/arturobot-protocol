# arturobot-protocol

Il contratto tra `arturobot-portal` e `arturobot-firmware`. Vedi il `README.md`
per che cosa contiene e perché esiste.

## Regole di base

1. **Documentazione in italiano.** `README`, note, messaggi di commit e
   descrizioni delle Pull Request.

2. **Codice in inglese.** Nomi, identificatori e commenti nei generatori
   (`tools/`) sono in inglese, come negli altri due repository.

   **Deroga esplicita, e la sola:** i campi `description` dei file in
   `protocol/` sono **in italiano**. Non sono commenti di codice: sono il testo
   della pagina pubblica di compatibilità, che è documentazione destinata alle
   persone. Che lo stesso testo finisca anche nei commenti degli artefatti
   generati è una conseguenza del generare, non una scelta di scrivere commenti
   in italiano.

3. **Nomi dei file e delle cartelle in inglese.** Sempre.

## La regola che conta

**`generated/` non si modifica mai a mano.** Si modifica `protocol/*.json` e si
esegue `node tools/generate.mjs`. La CI lo verifica con `--check` e una
modifica a mano non arriva su `main`.

Se un artefatto generato non è come dovrebbe, il difetto sta nell'emettitore
(`tools/emit-*.mjs`) o nella sorgente, mai nell'output.

`generated/npm/` contiene JavaScript e dichiarazioni, non TypeScript: il portale
installa questo repository come dipendenza git e nessuno compila la dipendenza.
Chi tocca `tools/emit-npm.mjs` deve tenere allineati i due file — quello che
esiste in `index.js` deve essere dichiarato in `index.d.ts` e viceversa.

## Che cosa entra e che cosa no

Entra **solo ciò su cui portale e firmware devono accordarsi**: forma dei
messaggi, rotte, codici, superficie Lua, versioni e compatibilità.

Non entra: visione di prodotto, decisioni di dominio, backlog, stato dei lavori,
scelte tecnologiche dei due lati. Vivono in `arturobot-portal/docs/`. La
tentazione di usare questo repository come «il posto neutro dove mettere le cose
comuni» va rifiutata: diventerebbe un terzo posto dove cercare la verità.

## Flusso di lavoro

Non c'è backlog e non c'è documento di stato: **l'unità di lavoro è la versione
di protocollo**, e la storia è il changelog dei tag.

1. Si lavora su un ramo (`feature/…`, `docs/…`, `chore/…`) e si apre una Pull
   Request verso `main`. Mai commit diretti su `main`.
2. Una modifica al contratto tocca `protocol/*.json`, poi `node tools/generate.mjs`,
   e i due cambiamenti stanno **nello stesso commit**: sorgente e artefatti non
   si separano mai.
3. Un contratto nuovo o incompatibile alza il numero di protocollo in
   `protocol/meta.json` e aggiunge una voce a `versions`. Le voci esistenti non
   si riscrivono: si marcano con `until`.
4. Al merge si tagga (`v<major>.<minor>.<patch>`, dove il major segue il numero
   di protocollo) e si aggiorna `compatibility.json` quando uno dei due lati
   rilascia. **Il tag è l'unico atto di rilascio**: entrambi i lati si
   agganciano a quello, non a un pacchetto pubblicato.

## L'ordine dei cambiamenti quando si tocca il contratto

Conta, perché i due lati non si rilasciano insieme:

1. **Qui**: si alza il protocollo e si rilascia il tag.
2. **Firmware**: si pinna il tag nuovo e si implementa. Il firmware è il lato
   lento — sta su una scheda in un'aula.
3. **Portale**: si aggiorna la dipendenza e si implementa, **degradando** davanti
   ai robot che parlano ancora il protocollo vecchio.

Il portale non smette mai di supportare un protocollo finché esistono robot che
lo parlano. `compatibility.json` è il posto dove si legge se esistono ancora.

E smette quando non ne esistono più: allora sale `min_supported` in
`protocol/meta.json`, e sotto quel numero il portale non degrada, **rifiuta**.
È successo il 2026-09-08 con il protocollo 1, che nessun robot ha mai parlato
verso il portale e nessuno parlerà. Alzare il minimo è un cambiamento del
contratto come gli altri: passa da qui, da un tag, e poi dagli altri due
repository nell'ordine.

## Licenza

Il repository è pubblico ma la licenza è proprietaria: tutti i diritti riservati
a Fremsoft (vedi `LICENSE`). Ogni file aggiunto ricade sotto quella licenza; non
si importa qui codice di terzi con licenze incompatibili, e non si aggiungono
dipendenze — i generatori girano con `node` nudo, ed è una proprietà da
conservare.
