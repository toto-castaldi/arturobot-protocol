// The GitHub Pages compatibility page: a projection of the same data the two
// sides compile against, so it cannot drift from them.
import { at, errorsOf } from './lib.mjs'

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const speaks = (r) => (r.speaks ? (r.speaks[0] === r.speaks[1] ? `${r.speaks[0]}` : `${r.speaks[0]}–${r.speaks[1]}`) : '—')

const CALLER = { robot: 'il robot', browser: 'un browser' }

export function emitSite(model) {
  const { meta, lua, lan, cloud, compatibility } = model
  const v = meta.current

  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Protocollo ARTURO.BOT</title>
<style>
:root {
  --bg: #fbfaf7; --fg: #1a1a1a; --muted: #6b6b6b; --line: #e0ddd6;
  --accent: #b8442c; --card: #ffffff; --code: #f4f2ec;
}
@media (prefers-color-scheme: dark) {
  :root { --bg:#16151a; --fg:#eceae4; --muted:#9a968c; --line:#33313a;
          --accent:#e8825f; --card:#1e1d23; --code:#26252c; }
}
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--fg);
  font:16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; }
.wrap { max-width: 62rem; margin:0 auto; padding: 3rem 1.25rem 6rem; }
h1 { font-size:2rem; margin:0 0 .25rem; letter-spacing:-.02em; }
h2 { font-size:1.25rem; margin:3rem 0 .75rem; padding-bottom:.4rem;
  border-bottom:1px solid var(--line); letter-spacing:-.01em; }
h3 { font-size:1rem; margin:1.75rem 0 .5rem; }
p { margin:.6rem 0; }
.lede { color:var(--muted); max-width:44rem; }
.badge { display:inline-block; background:var(--accent); color:#fff;
  padding:.15rem .55rem; border-radius:999px; font-size:.8rem; font-weight:600; }
.scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
table { border-collapse:collapse; width:100%; min-width:34rem; font-size:.92rem; }
th, td { text-align:left; padding:.6rem .7rem; border-bottom:1px solid var(--line);
  vertical-align:top; }
th { font-weight:600; color:var(--muted); font-size:.78rem;
  text-transform:uppercase; letter-spacing:.06em; }
code, .mono { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size:.88em; background:var(--code); padding:.1rem .35rem; border-radius:4px; }
td .desc { color:var(--muted); display:block; margin-top:.2rem; font-size:.88rem; }
.card { background:var(--card); border:1px solid var(--line); border-radius:10px;
  padding:1rem 1.15rem; margin:.75rem 0; }
.card h3 { margin-top:0; }
ul { padding-left:1.15rem; } li { margin:.3rem 0; }
footer { margin-top:4rem; padding-top:1.25rem; border-top:1px solid var(--line);
  color:var(--muted); font-size:.85rem; }
.owner { font-size:.75rem; color:var(--muted); text-transform:uppercase;
  letter-spacing:.06em; font-weight:600; }
</style>
</head>
<body>
<div class="wrap">

<h1>Protocollo ARTURO.BOT</h1>
<p class="lede">Il contratto tra il portale e il firmware del robot. Questa pagina non &egrave;
scritta a mano: &egrave; generata dagli stessi file che il portale importa come pacchetto npm e
che il firmware include come header C++. Se qui c&rsquo;&egrave; scritto qualcosa, i due lati la stanno
compilando davvero.</p>
<p><span class="badge">Protocollo corrente: ${v}</span> <span class="badge">Minimo supportato: ${meta.min_supported}</span> <span class="badge">Rilascio: ${esc(meta.release)}</span></p>

<h2>Versioni del protocollo</h2>
<div class="scroll"><table>
<tr><th>Versione</th><th>Stato</th><th>Che cosa introduce</th></tr>
${meta.versions.map((x) => `<tr><td class="mono">${x.version}</td><td>${esc(x.status)}</td><td>${esc(x.summary)}</td></tr>`).join('\n')}
</table></div>

<h2>Compatibilit&agrave;</h2>
<p>${esc(compatibility.description)}</p>

<h3>Portale</h3>
<div class="scroll"><table>
<tr><th>Versione</th><th>Protocollo</th><th>Rilascio</th><th>Note</th></tr>
${compatibility.portal.map((r) => `<tr><td class="mono">${esc(r.version)}</td><td class="mono">${speaks(r)}</td><td>${esc(r.released ?? '—')}</td><td>${esc(r.note)}</td></tr>`).join('\n')}
</table></div>

<h3>Firmware</h3>
<div class="scroll"><table>
<tr><th>Versione</th><th>Protocollo</th><th>Rilascio</th><th>Note</th></tr>
${compatibility.firmware.map((r) => `<tr><td class="mono">${esc(r.version)}</td><td class="mono">${r.implements ?? '—'}</td><td>${r.withdrawn ? `ritirato il ${esc(r.withdrawn)}` : esc(r.released ?? '—')}</td><td>${esc(r.note)}</td></tr>`).join('\n')}
</table></div>

<h3>Regole</h3>
<ul>${compatibility.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>

<h2>Come si dice che qualcosa e&rsquo; andato storto</h2>
<div class="card"><h3>Una busta sola, per tutti i contratti</h3><p>${esc(meta.error_envelope.description)}</p>
<p>Corpo: <code>${esc(meta.error_envelope.content_type)}</code>, un oggetto con il solo campo <code>${esc(meta.error_envelope.field)}</code>.</p></div>
${errorTable('Codici della API locale', errorsOf(lan, v))}
${errorTable('Codici della API verso cloud', errorsOf(cloud, v))}

<h2>${esc(lan.title)}</h2>
<p class="owner">Padrone: ${esc(lan.owner)}</p>
<p>${esc(lan.description)}</p>
${routeTable(lan, v)}
${limitTable(at(lan.limits, v))}
<div class="card"><h3>CORS</h3><p>${esc(lan.cors.description)}</p>
<p><code>Access-Control-Allow-Origin: ${esc(lan.cors.allow_origin)}</code> &middot;
<code>Access-Control-Allow-Methods: ${esc(lan.cors.allow_methods.join(', '))}</code> &middot;
<code>Access-Control-Allow-Headers: ${esc(lan.cors.allow_headers.join(', '))}</code></p></div>
${schemaTables(lan, v)}
${noteCards(lan, v)}

<h2>${esc(cloud.title)}</h2>
<p class="owner">Padrone: ${esc(cloud.owner)}${cloud.status === 'draft' ? ' &middot; bozza' : ''}</p>
<p>${esc(cloud.description)}</p>
<div class="card"><h3>Identit&agrave; del dispositivo</h3><p>${esc(cloud.identity.description)}</p>${cloud.identity.rationale ? `<p>${esc(cloud.identity.rationale)}</p>` : ''}</div>
<div class="card"><h3>Autenticazione</h3><p>${esc(cloud.auth.description)}</p>${cloud.auth.rationale ? `<p>${esc(cloud.auth.rationale)}</p>` : ''}
<p><code>${esc(cloud.auth.header)}: ${esc(cloud.auth.scheme)} &lt;deviceToken&gt;</code></p></div>
${routeTable(cloud, v)}
${limitTable(at(cloud.limits, v))}
${schemaTables(cloud, v)}
${noteCards(cloud, v)}

<h2>${esc(lua.title)}</h2>
<p class="owner">Padrone: ${esc(lua.owner)}</p>
<p>${esc(lua.description)}</p>
<div class="scroll"><table>
<tr><th>Funzione</th><th>Dal</th><th>Descrizione</th></tr>
${at(lua.functions, v).map((f) => `<tr><td class="mono">${esc(f.name)}(${f.args.map((a) => esc(a.name)).join(', ')})${f.returns !== 'void' ? ` &rarr; ${esc(f.returns)}` : ''}</td><td class="mono">${f.since}</td><td>${esc(f.description)}</td></tr>`).join('\n')}
</table></div>
<p>${esc(lua.stdlib.description)} Moduli ammessi: ${lua.stdlib.allowed.map((m) => `<code>${esc(m)}</code>`).join(' ')}. Rimossi: ${[...lua.stdlib.removed, ...lua.stdlib.denied].map((m) => `<code>${esc(m)}</code>`).join(' ')}.</p>

<h2>Che cosa e&rsquo; uscito dal contratto</h2>
${withdrawnSection(meta, [lan, cloud])}

<h2>Domande aperte</h2>
${
  (meta.open_questions ?? []).length
    ? `<p class="lede">Il protocollo ${v} non &egrave; stabile finch&eacute; queste non sono sciolte.</p>` +
      meta.open_questions.map((q2) => `<div class="card"><h3>${esc(q2.title)}</h3><p>${esc(q2.text)}</p></div>`).join('')
    : `<p class="lede">Nessuna: il protocollo ${v} &egrave; stabile. Le domande che restano appartengono ai due lati, non al contratto.</p>`
}

<footer>
Generato da <code>arturobot-protocol</code>. La sorgente di verit&agrave; sta in <code>protocol/*.json</code>.
</footer>

</div>
</body>
</html>
`
}

function routeTable(contract, v) {
  return `<div class="scroll"><table>
<tr><th>Rotta</th><th>Chi chiama</th><th>Richiesta</th><th>Descrizione</th></tr>
${at(contract.routes, v).map((r) => `<tr><td class="mono">${r.method} ${esc(r.path)}</td><td>${esc(CALLER[r.client] ?? '—')}${r.auth ? `<span class="desc">${esc(r.auth)}</span>` : ''}</td><td class="mono">${requestOf(r)}</td><td>${esc(r.description)}${responseList(r, v)}</td></tr>`).join('\n')}
</table></div>`
}

function requestOf(r) {
  const req = r.request
  if (!req || (req.body === null && req.schema === undefined)) return '—'
  if (req.schema) return `${esc(req.schema)}`
  return `${esc(req.content_type ?? '')}${req.max_bytes ? ` &le; ${esc(req.max_bytes)}` : ''}`
}

function schemaTables(contract, v) {
  return Object.entries(contract.schemas ?? {})
    .map(([name, schema]) => {
      const fields = at(schema.fields, v)
      if (!fields.length) return ''
      return `<h3>Campi di <code>${esc(name)}</code></h3>
${schema.description ? `<p>${esc(schema.description)}</p>` : ''}
<div class="scroll"><table>
<tr><th>Campo</th><th>Tipo</th><th>Dal</th><th>Descrizione</th></tr>
${fields.map((f) => `<tr><td class="mono">${esc(f.name)}${f.optional ? '?' : ''}</td><td class="mono">${esc(f.type)}</td><td class="mono">${f.since}</td><td>${esc(f.description)}</td></tr>`).join('\n')}
</table></div>`
    })
    .join('')
}

function noteCards(contract, v) {
  return at(contract.notes, v)
    .map((n) => `<div class="card"><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></div>`)
    .join('')
}

function errorTable(title, errors) {
  if (!errors.length) return ''
  return `<h3>${esc(title)}</h3>
<div class="scroll"><table>
<tr><th>Codice</th><th>Stato</th></tr>
${errors.map((e) => `<tr><td class="mono">${esc(e.code)}</td><td class="mono">${e.status}</td></tr>`).join('\n')}
</table></div>`
}

function limitTable(limits) {
  if (!limits.length) return ''
  return `<h3>Costanti</h3>
<div class="scroll"><table>
<tr><th>Nome</th><th>Valore</th><th>Chi la usa</th><th>Descrizione</th></tr>
${limits.map((l) => `<tr><td class="mono">${esc(l.name)}</td><td class="mono">${l.value}</td><td class="mono">${(l.audience ?? ['firmware', 'portal']).join(', ')}</td><td>${esc(l.description)}</td></tr>`).join('\n')}
</table></div>`
}

/**
 * What `until` withdrew, listed instead of simply disappearing.
 *
 * A route deleted from the source leaves nothing behind and the contract
 * stops remembering it existed. Marked with `until` it drops out of every
 * generated artifact and stays visible here, which is the whole reason the
 * field is a version and not a deletion.
 */
function withdrawnSection(meta, contracts) {
  const gone = []

  for (const contract of contracts) {
    for (const r of contract.routes ?? []) {
      if (r.until !== undefined) {
        gone.push({ what: `${r.method} ${r.path}`, since: r.since, until: r.until, why: r.description })
      }
    }
  }

  if (!gone.length) return `<p class="lede">Niente: tutto ci&ograve; che &egrave; entrato nel contratto &egrave; ancora dentro.</p>`

  return `<div class="scroll"><table>
<tr><th>Che cosa</th><th>Dal</th><th>Fino al</th><th>Perch&eacute;</th></tr>
${gone.map((g) => `<tr><td class="mono">${esc(g.what)}</td><td class="mono">${g.since}</td><td class="mono">${g.until - 1}</td><td>${esc(g.why)}</td></tr>`).join('\n')}
</table></div>`
}

function responseList(r, v) {
  const codes = at(r.responses, v).filter((x) => x.code)
  if (!codes.length) return ''
  return `<span class="desc">Errori: ${codes.map((c) => `<code>${c.status} ${esc(c.code)}</code>`).join(' ')}</span>`
}
