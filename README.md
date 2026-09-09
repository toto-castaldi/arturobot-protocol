# arturobot-protocol

Il **contratto** tra il portale di ARTURO.BOT (`arturobot-portal`) e il firmware
del robot (`arturobot-firmware`).

Non è un documento che descrive il protocollo: è il protocollo **in forma di
dato**, e da quel dato genera tre cose che i due lati usano davvero.

**Pagina di compatibilità: <https://toto-castaldi.github.io/arturobot-protocol/>**

## Perché esiste

Portale e firmware sono accoppiati — la superficie Lua, l'API locale del robot,
il dialogo con il cloud — ma **non si rilasciano mai insieme**. Il portale va in
produzione a ogni merge; il firmware sta su una scheda, in un'aula, e viene
aggiornato quando qualcuno lo aggiorna. In ogni momento esistono robot con
firmware di età diverse.

Un contratto scritto a mano in uno dei due repository diverge in silenzio: il
documento dice 3, il firmware implementa 2.5, e ce se ne accorge in aula. Qui
invece **entrambi i lati compilano contro codice generato**, e la CI rifiuta un
artefatto che non corrisponda alla sorgente. La deriva smette di essere una
questione di disciplina e diventa un errore di build.

## Struttura

```
protocol/meta.json        le versioni del protocollo e che cosa introducono
protocol/lua-api.json     C1 — le funzioni Lua che il robot espone (padrone: firmware)
protocol/lan-api.json     C2 — l'API HTTP del robot in locale (padrone: firmware)
protocol/cloud-api.json   C3 — il dialogo robot → cloud (padrone: portale)
compatibility.json        quale portale e quale firmware parlano quale protocollo
tools/                    i generatori
generated/npm/            index.js + index.d.ts, importati dal portale
generated/cpp/            header incluso dal firmware
generated/site/           la pagina di compatibilità pubblicata su Pages
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

Il campo `since` di ogni voce dice da quale versione di protocollo esiste;
`until`, quando c'è, da quale non esiste più. È l'unica regola di versionamento,
e vive in un posto solo (`tools/lib.mjs`).

`optional` su un campo non è versionamento e non va confuso con `since`: dice che
quel campo può mancare **per una ragione sua** — `deviceId` manca in un robot che
non ha ancora un'identità — e non perché a rispondere sia un robot più vecchio.

Nel protocollo 2 `localAddress` era l'eccezione a questa regola, perché era
entrato con il tag `v2.2.0` senza far salire il numero: un robot poteva parlare
il 2 e non averlo. L'eccezione è finita con il protocollo 3, dove il campo è
obbligatorio e non c'è nessuna forma del 3 che ne faccia a meno. Resta la
lezione: un campo che entra senza alzare il protocollo confonde le due cose che
`since` e `optional` tengono separate, e il modo di non pagarlo è `protocolRelease`.

**Ciò che esce dal contratto alza il numero di protocollo.** Non è una
formalità. Il riassunto di una versione in `meta.json` racconta che cosa quella
versione introduce, e una rotta ritirata restando dentro la stessa versione
costringerebbe a riscrivere quel riassunto: il contratto smetterebbe di dire il
vero su una versione passata. Con `until` invece la rotta esce da tutti gli
artefatti generati e resta leggibile nella sorgente e sulla pagina. È ciò che è
successo a `GET /api/device/program` con il protocollo 3.

## Che cosa il contratto dichiara, oltre alle rotte

Fino al protocollo 2 diverse cose su cui i due lati erano d'accordo non stavano
scritte da nessuna parte: uno dei due sceglieva e l'altro avrebbe dovuto
indovinare. Dal 3 stanno qui, e i generatori le portano di là.

- **I corpi delle richieste.** Ogni rotta che ne ha uno nomina il proprio
  schema. Prima le rotte del cloud dichiaravano soltanto le risposte, e che
  `POST /api/device/session` volesse `deviceId` e `deviceSecret` era scritto
  solo nel portale.
- **La busta dell'errore, una sola.** Sta in `meta.json` e vale per tutti e tre
  i contratti: un oggetto JSON con il solo campo `code`. Era descritta in una
  nota della sola `lan-api`, ed è il motivo per cui il portale aveva finito per
  rispondere `error` dove il firmware rispondeva `code`.
- **I codici d'errore, generati.** Sono raccolti dalle risposte delle rotte,
  dove sono sempre stati, ed emessi in entrambi gli artefatti. Prima nessuno dei
  due li emetteva, e le stesse stringhe erano ricopiate a mano nello sketch del
  firmware e in due file del portale.
- **La busta dell'autenticazione.** `Authorization: Bearer <deviceToken>`.
  Il contratto nominava il token e non diceva come viaggiasse.
- **Le intestazioni CORS.** Erano una frase in una descrizione. Dal protocollo 3
  il cliente della API locale è una pagina HTTPS su origine pubblica, e quali
  intestazioni il robot manda ha smesso di essere un dettaglio di
  implementazione.
- **Chi chiama che cosa.** Ogni rotta dichiara il proprio `client`, e ogni
  costante il proprio `audience`. È ciò che ha tolto dall'header C++ una rotta
  che soltanto un browser chiama e due costanti che riguardano solo chi ascolta.

## Come lo consumano i due lati

**Nello stesso modo: un tag git.** Nessun registry, nessun token, nessun workflow
di pubblicazione.

**Portale** — dipendenza git in `package.json`. Il riferimento _è_ il verbale di
«questo portale parla il protocollo N».

```jsonc
"dependencies": { "@arturobot/protocol": "github:toto-castaldi/arturobot-protocol#v3.0.0" }
```

**Firmware** — libreria pinnata a tag in `platformio.ini`. Stesso verbale,
visibile nella configurazione di build.

```ini
lib_deps = https://github.com/toto-castaldi/arturobot-protocol.git#v3.0.0
```

**I due lati stanno sullo stesso tag, e questa è la regola.** Fu scritto qui il
contrario — ciascuno ripinna quando cambia l'artefatto che consuma — e smise di
essere vero nel momento in cui il portale prese a pretendere da `protocolRelease`
il rilascio esatto: un firmware fermo a un tag precedente non è più un firmware
che consuma un header identico, è un firmware che il portale non ascolta. Dal
protocollo 3 la stessa cosa vale nell'altro verso, con `serverRelease`. La
regola cadrà il giorno in cui esisterà un robot che non possiamo riflashare, e
`compatibility.json` è il posto dove si legge se quel giorno è arrivato.

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

## Versionamento

Il numero di protocollo è un **intero che cresce di uno per volta**, indipendente
sia dalla versione del portale sia da quella del firmware. Il tag del repository
lo segue (`v3.x.y` implementa il protocollo 3); il minor si muove quando cambia
ciò che i due lati compilano senza che il numero di protocollo si muova — è ciò
che è successo con `v2.1.0`, quando il minimo supportato è salito a 2 — e la
patch serve a correggere una descrizione senza toccare il contratto.

**Il major si muove quando qualcosa esce.** Un campo che entra può stare in un
minor, perché non c'è nessuno da rompere e `protocolRelease` dice comunque quale
forma si sta parlando. Una rotta che esce no: il riassunto della versione in
`meta.json` la nomina, e lasciarla uscire senza cambiare versione vorrebbe dire
riscrivere quel riassunto. Il numero di protocollo esiste per non dover
riscrivere il passato.

Il robot dichiara la propria versione e il proprio rilascio in `GET /api/status`;
il portale dichiara i propri nella risposta a `POST /api/device/session`. Dal
protocollo 3 la negoziazione è reciproca davvero: fino al 2 il portale mandava un
intero e ne pretendeva indietro una stringa esatta, e il robot non aveva modo di
accorgersi di parlare con una forma diversa della propria stessa versione.

`meta.json` dice due numeri e non uno: `current`, il protocollo che questo
contratto descrive, e `min_supported`, il più vecchio con cui il portale parla.
Sotto il minimo non c'è degradazione ma **rifiuto**, perché sotto il minimo non
ci sono robot: uno stato senza il campo `protocol` non è un robot vecchio, è un
robot che non esiste. Il minimo sale soltanto quando di quei robot non ne resta
nessuno, e `compatibility.json` è il posto dove si legge se ne restano.

**Il numero non basta a dire chi sei.** Due firmware che dichiarano lo stesso
`protocol` possono essere stati compilati contro forme diverse, perché un
campo può entrare con un tag senza alzare il protocollo. Per questo `meta.json`
dice anche `release` — la stessa stringa del tag git, senza la `v` — che gli
emettitori portano in `PROTOCOL_RELEASE` e che il robot **ripete** in
`protocolRelease`. Il numero dice quale contratto si parla, il rilascio dice
quale forma di quel contratto.

`release` e la versione di `package.json` sono due file che nominano la stessa
cosa, quindi il generatore li confronta invece di fidarsene: un tag tagliato su
un disallineamento spedirebbe un contratto che mente su chi è.

## Che cosa **non** sta qui

Visione di prodotto, decisioni di dominio, backlog, stato dei lavori. Questo
repository contiene soltanto ciò su cui i due lati devono mettersi d'accordo.
Il resto sta in `arturobot-portal/docs/`.

## Licenza

Proprietaria: tutti i diritti riservati a Fremsoft. Vedi [LICENSE](LICENSE).

Il repository è pubblico perché la pagina di compatibilità abbia un pubblico e
perché chi deve integrarsi possa leggere il contratto. **Pubblico non vuol dire
libero**: la lettura è consentita, l'uso no.
