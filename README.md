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
generated/ts/             pacchetto npm consumato dal portale
generated/cpp/            header incluso dal firmware
generated/site/           la pagina di compatibilità pubblicata su Pages
```

`generated/` **è versionato**. È l'unico modo perché il firmware possa pinnare
una libreria da git senza avere Node a bordo del proprio ambiente di build.

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

**Portale** — pacchetto npm su GitHub Packages. Il numero in `package.json` *è*
il verbale di «questo portale parla il protocollo N».

```jsonc
// apps/web/package.json
"dependencies": { "@arturobot/protocol": "2.0.0" }
```

**Firmware** — libreria pinnata a tag in `platformio.ini`. Stesso verbale,
visibile nella configurazione di build.

```ini
lib_deps = https://github.com/toto-castaldi/arturobot-protocol.git#v2.0.0
```

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
