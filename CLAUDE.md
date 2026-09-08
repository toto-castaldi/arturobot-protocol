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
   rilascia.

## L'ordine dei cambiamenti quando si tocca il contratto

Conta, perché i due lati non si rilasciano insieme:

1. **Qui**: si alza il protocollo e si rilascia il tag.
2. **Firmware**: si pinna il tag nuovo e si implementa. Il firmware è il lato
   lento — sta su una scheda in un'aula.
3. **Portale**: si aggiorna la dipendenza e si implementa, **degradando** davanti
   ai robot che parlano ancora il protocollo vecchio.

Il portale non smette mai di supportare un protocollo finché esistono robot che
lo parlano. `compatibility.json` è il posto dove si legge se esistono ancora.
