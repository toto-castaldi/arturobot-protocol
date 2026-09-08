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

## Come lo consumano i due lati

**Nello stesso modo: un tag git.** Nessun registry, nessun token, nessun workflow
di pubblicazione.

**Portale** — dipendenza git in `package.json`. Il riferimento _è_ il verbale di
«questo portale parla il protocollo N».

```jsonc
"dependencies": { "@arturobot/protocol": "github:toto-castaldi/arturobot-protocol#v2.0.0" }
```

**Firmware** — libreria pinnata a tag in `platformio.ini`. Stesso verbale,
visibile nella configurazione di build.

```ini
lib_deps = https://github.com/toto-castaldi/arturobot-protocol.git#v2.0.0
```

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
lo segue (`v2.0.0` implementa il protocollo 2); la patch serve a correggere la
descrizione senza toccare il contratto.

Il robot dichiara la propria versione in `GET /api/status`; il portale dichiara
la propria nella risposta a `POST /api/device/session`. La negoziazione è
reciproca, e un robot che non dichiara nulla sta parlando il protocollo 1.

## Che cosa **non** sta qui

Visione di prodotto, decisioni di dominio, backlog, stato dei lavori. Questo
repository contiene soltanto ciò su cui i due lati devono mettersi d'accordo.
Il resto sta in `arturobot-portal/docs/`.

## Licenza

Proprietaria: tutti i diritti riservati a Fremsoft. Vedi [LICENSE](LICENSE).

Il repository è pubblico perché la pagina di compatibilità abbia un pubblico e
perché chi deve integrarsi possa leggere il contratto. **Pubblico non vuol dire
libero**: la lettura è consentita, l'uso no.
