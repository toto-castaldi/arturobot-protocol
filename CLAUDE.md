# arturobot-protocol

Il contratto tra `arturobot-portal` e `arturobot-firmware`. Si lavora dal
workspace: il flusso — voci, rami, Pull Request, stato — e la regola sulla
retrocompatibilità stanno nel suo [`CLAUDE.md`](../CLAUDE.md), il perché di ciò
che i due lati si dicono nella [visione](../VISION.md). Qui stanno soltanto le
regole di questo albero.

## La regola che conta

**`generated/` non si modifica mai a mano.** Si modifica `protocol/*.json` e si
esegue `node tools/generate.mjs`. La CI lo verifica con `--check`. Se un
artefatto generato non è come dovrebbe, il difetto sta nell'emettitore
(`tools/emit-*.mjs`) o nella sorgente, mai nell'output.

**Gli emettitori emettono a ciascuno ciò che lo riguarda, non tutto.** Una rotta
dichiara il proprio `client` e una costante il proprio `audience`, e l'header
C++ tiene soltanto ciò che il robot chiama e usa: un artefatto che consegna a un
lato qualcosa che non è suo lo invita a usarla.

`generated/npm/` contiene JavaScript e dichiarazioni, non TypeScript, perché il
portale installa questo repository come dipendenza git e nessuno la compila.
Chi tocca `tools/emit-npm.mjs` tiene allineati `index.js` e `index.d.ts`.

## Che cosa entra

**Solo ciò su cui portale e firmware devono accordarsi**: forma dei messaggi,
rotte, codici, superficie Lua. E con le rotte tutto ciò che altrimenti un lato
sceglierebbe e l'altro dovrebbe indovinare:

- il **corpo di ogni richiesta** che ne ha uno, con il suo schema;
- **che cosa risponde una chiamata che riesce**, `niente` compreso:
  `tools/lib.mjs` rifiuta una rotta senza `body`, e `body: null` è una risposta;
- la **busta dell'errore**, una sola per le due API HTTP (`errors.json`: un
  oggetto con il solo campo `code`), e i **codici d'errore**, raccolti dalle
  risposte delle rotte ed emessi in entrambi gli artefatti;
- la **busta dell'autenticazione**, `Authorization: Bearer <deviceToken>`;
- le **intestazioni CORS** della API locale, il cui cliente è una pagina HTTPS
  su origine pubblica;
- **chi chiama che cosa**: `client` per le rotte, `audience` per le costanti.

## La versione

Il contratto ha **una versione sola, quella corrente**: niente numero di
protocollo, niente `since` e `until`, niente tabella di compatibilità. Ciò che
esce dal contratto si cancella; la storia sta nei tag.

Il rilascio è la `version` di `package.json`, e il tag git è la stessa stringa
con una `v` davanti. I generatori la portano in `PROTOCOL_RELEASE`; il robot la
ripete in `protocolRelease` e il portale in `serverRelease`, e ciascuno dei due
rifiuta l'altro se non porta il proprio stesso rilascio.

**Il numero è quello della versione di prodotto.** Le prime due cifre sono la
versione che il workspace ha aperta, l'ultima conta i rilasci del contratto
dentro di essa: `0.6.0`, `0.6.1`…, e il primo cambiamento della 0.7 rilascia
`0.7.0`. Una versione di prodotto in cui il contratto non cambia non lo
rilascia. Fino alla 0.5 il contratto aveva una numerazione sua, chiusa con
`v5.4.1`: è l'unico passaggio in cui la `version` scende, ed è l'unico che
`tools/check-version.mjs` accetta senza che salga.

## Lavorare in questo albero

1. Un ramo e una Pull Request verso `main`, come dice il workspace:
   `feature/<codice>-protocol-<descrizione>` per una sotto-voce, `docs/…` o
   `chore/…` per il resto. Mai commit diretti su `main`.
2. Una modifica al contratto tocca `protocol/*.json`, alza la `version` in
   `package.json` e rigenera, e tutto sta **nello stesso commit**: sorgente e
   artefatti non si separano mai. Una PR che cambia `protocol/` o `generated/`
   senza alzare la `version` non passa la CI (`tools/check-version.mjs`).
3. Al merge si tagga `v<version>`. **Il tag è l'unico atto di rilascio**, e
   viene prima che firmware e portale lo pinnino.

```bash
node tools/generate.mjs           # rigenera generated/
node tools/generate.mjs --check   # fallisce se generated/ non è allineato
```

## Struttura

```
protocol/errors.json      la busta dell'errore, comune alle due API HTTP
protocol/lua-api.json     C1 — le funzioni Lua che il robot espone (padrone: firmware)
protocol/lan-api.json     C2 — l'API HTTP del robot in locale (padrone: firmware)
protocol/cloud-api.json   C3 — il dialogo robot → cloud (padrone: portale)
tools/                    i generatori
generated/npm/            index.js + index.d.ts, importati dal portale
generated/cpp/            header incluso dal firmware
```

La sorgente è JSON e non YAML perché `node` la legge senza dipendenze, e ciò
che in YAML sarebbe un commento qui è un campo `description`, che finisce nel
codice generato.

`generated/` **è versionato**: permette a entrambi i lati di agganciarsi a un
tag senza eseguire i generatori. Il firmware non ha Node nel proprio ambiente di
build; il portale non compila una dipendenza.

## Come lo consumano i due lati

**Nello stesso modo: un tag git**, e i due lati stanno sullo stesso tag.

```jsonc
// portale, package.json
"dependencies": { "@arturobot/protocol": "github:toto-castaldi/arturobot-protocol#v0.6.0" }
```

```ini
; firmware, platformio.ini
lib_deps = https://github.com/toto-castaldi/arturobot-protocol.git#v0.6.0
```

Nessun registry: `npm.pkg.github.com` chiede un token anche per i pacchetti
pubblici, e il tag toglie token, registry e passo di pubblicazione.
