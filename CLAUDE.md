# arturobot-protocol

Il contratto tra `arturobot-portal` e `arturobot-firmware`.

## La regola che conta

**`generated/` non si modifica mai a mano.** Si modifica `protocol/*.json` e si
esegue `node tools/generate.mjs`. La CI lo verifica con `--check` e una
modifica a mano non arriva su `main`.

Se un artefatto generato non è come dovrebbe, il difetto sta nell'emettitore
(`tools/emit-*.mjs`) o nella sorgente, mai nell'output.

**Gli emettitori emettono a ciascuno ciò che lo riguarda, non tutto.** Una rotta
dichiara il proprio `client` e una costante il proprio `audience`, e l'header C++
tiene soltanto ciò che il robot chiama e usa. Un artefatto che consegna a un lato
qualcosa che non è suo — la rotta che soltanto un browser chiama, la soglia che
riguarda solo chi ascolta — lo invita a usarla.

`generated/npm/` contiene JavaScript e dichiarazioni, non TypeScript: il portale
installa questo repository come dipendenza git e nessuno compila la dipendenza.
Chi tocca `tools/emit-npm.mjs` deve tenere allineati i due file — quello che
esiste in `index.js` deve essere dichiarato in `index.d.ts` e viceversa.

## Che cosa entra e che cosa no

Entra **solo ciò su cui portale e firmware devono accordarsi**: forma dei
messaggi, rotte, codici, superficie Lua.

## Una versione sola

Il contratto ha **una versione sola, quella corrente**. Non c'è un numero di
protocollo, non ci sono campi `since` e `until`, non c'è una tabella di
compatibilità: di robot in mano a qualcuno non ne esiste nessuno, portale e
firmware implementano soltanto l'ultimo rilascio, e ciò che esce dal contratto
si cancella. La storia sta nel changelog dei tag.

Il rilascio è la `version` di `package.json`, e il tag git è la stessa stringa
con una `v` davanti. I generatori la portano in `PROTOCOL_RELEASE`; il robot la
ripete in `protocolRelease` e il portale in `serverRelease`, e ciascuno dei due
rifiuta l'altro se non porta il proprio stesso rilascio.

## Flusso di lavoro

1. Si lavora su un ramo (`feature/…`, `docs/…`, `chore/…`) e si apre una Pull
   Request verso `main`. Mai commit diretti su `main`.
2. Una modifica al contratto tocca `protocol/*.json`, alza la `version` in
   `package.json`, poi `node tools/generate.mjs`, e i cambiamenti stanno **nello
   stesso commit**: sorgente e artefatti non si separano mai.
3. Al merge si tagga `v<version>`. **Il tag è l'unico atto di rilascio**:
   entrambi i lati si agganciano a quello, non a un pacchetto pubblicato.

## L'ordine dei cambiamenti quando si tocca il contratto

Conta, perché i due lati non si rilasciano insieme:

1. **Qui**: si cambia il contratto e si rilascia il tag.
2. **Firmware**: si pinna il tag nuovo e si implementa. Il firmware è il lato
   lento — sta su una scheda in un'aula.
3. **Portale**: si aggiorna la dipendenza e si implementa.

L'ordine discende dal fatto che i due lati devono accordarsi su una forma prima
di parlarla.

**Pagina del contratto: <https://toto-castaldi.github.io/arturobot-protocol/>**

## Struttura

```
protocol/errors.json      la busta dell'errore, comune alle due API HTTP
protocol/lua-api.json     C1 — le funzioni Lua che il robot espone (padrone: firmware)
protocol/lan-api.json     C2 — l'API HTTP del robot in locale (padrone: firmware)
protocol/cloud-api.json   C3 — il dialogo robot → cloud (padrone: portale)
tools/                    i generatori
generated/npm/            index.js + index.d.ts, importati dal portale
generated/cpp/            header incluso dal firmware
generated/site/           la pagina del contratto pubblicata su Pages
```

`generated/` **è versionato**, e non è un compromesso: è ciò che permette a
entrambi i lati di agganciarsi a un tag git senza che nessuno dei due debba
eseguire i generatori. Il firmware non ha Node nel proprio ambiente di build; il
portale non deve compilare una dipendenza.

### Perché JSON e non YAML

La sorgente deve servire due linguaggi senza privilegiarne nessuno, e deve
essere leggibile da `node` senza dipendenze: il repository si clona e i
generatori girano. I commenti mancanti non sono una perdita, perché quello che
in YAML sarebbe un commento qui è un campo `description` — e un campo finisce
nella pagina e nel codice generato, mentre un commento resta dov'è.

## Come si usa

```bash
node tools/generate.mjs           # rigenera generated/
node tools/generate.mjs --check   # fallisce se generated/ non è allineato
```

## Che cosa il contratto dichiara, oltre alle rotte

Diverse cose su cui i due lati devono essere d'accordo non sono rotte, e se non
stanno scritte qui uno dei due sceglie e l'altro deve indovinare. Stanno qui, e
i generatori le portano di là.

- **I corpi delle richieste.** Ogni rotta che ne ha uno nomina il proprio
  schema. Prima le rotte del cloud dichiaravano soltanto le risposte, e che
  `POST /api/device/session` volesse `deviceId` e `deviceSecret` era scritto
  solo nel portale.
- **La busta dell'errore, una sola.** Sta in `errors.json` e vale per le due
  API HTTP: un oggetto JSON con il solo campo `code`. Era descritta in una
  nota della sola `lan-api`, ed è il motivo per cui il portale aveva finito per
  rispondere `error` dove il firmware rispondeva `code`.
- **I codici d'errore, generati.** Sono raccolti dalle risposte delle rotte,
  dove sono sempre stati, ed emessi in entrambi gli artefatti. Prima nessuno dei
  due li emetteva, e le stesse stringhe erano ricopiate a mano nello sketch del
  firmware e in due file del portale.
- **La busta dell'autenticazione.** `Authorization: Bearer <deviceToken>`.
  Il contratto nominava il token e non diceva come viaggiasse.
- **Le intestazioni CORS.** Erano una frase in una descrizione. Il cliente della
  API locale è una pagina HTTPS su origine pubblica, e quali
  intestazioni il robot manda ha smesso di essere un dettaglio di
  implementazione.
- **Chi chiama che cosa.** Ogni rotta dichiara il proprio `client`, e ogni
  costante il proprio `audience`. È ciò che ha tolto dall'header C++ una rotta
  che soltanto un browser chiama e due costanti che riguardano solo chi ascolta.
- **Che cosa risponde una chiamata che riesce.** Le rotte dichiaravano il corpo
  che prendono e tacevano su quello che danno, e il silenzio è costato: il
  firmware rispondeva `avviato` a `POST /api/run`, il portale aveva scritto nel
  proprio codice che non arrivava niente, e un programma che partiva finiva
  sullo schermo come rifiutato. Nessuno dei due aveva torto sul contratto,
  perché il contratto non aveva detto. Adesso lo dice, `niente` compreso, e
  `tools/lib.mjs` rifiuta una rotta che lo ometta: `body: null` è una
  risposta, un `body` mancante no.

## Come lo consumano i due lati

**Nello stesso modo: un tag git.** Nessun registry, nessun token, nessun workflow
di pubblicazione.

**Portale** — dipendenza git in `package.json`. Il riferimento _è_ il verbale di
«questo portale parla questo rilascio».

```jsonc
"dependencies": { "@arturobot/protocol": "github:toto-castaldi/arturobot-protocol#v4.0.0" }
```

**Firmware** — libreria pinnata a tag in `platformio.ini`. Stesso verbale,
visibile nella configurazione di build.

```ini
lib_deps = https://github.com/toto-castaldi/arturobot-protocol.git#v4.0.0
```

**I due lati stanno sullo stesso tag, e questa è la regola.**

### Perché non un pacchetto su un registry

`npm.pkg.github.com` richiede autenticazione **anche per i pacchetti pubblici**:
il portale avrebbe avuto bisogno di un PAT e di un `.npmrc` per leggere un
pacchetto che chiunque può già leggere qui. Un tag git toglie il registry, il
token e il passo di pubblicazione, e fa aggrappare i due lati al contratto nello
stesso identico modo.

Per questo `generated/npm/` contiene `index.js` e `index.d.ts` invece del
sorgente TypeScript: una dipendenza git viene installata così com'è, e Vite non
pre-compila `.ts` dentro `node_modules`. Il file non ha una sola dipendenza a
runtime, quindi non serve `tsc`: lo emette direttamente il generatore.
