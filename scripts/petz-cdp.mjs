// Coletor de dados da Petz via Chrome DevTools Protocol (CDP).
//
// Por que: a Petz usa anti-bot (Akamai) que bloqueia (403) qualquer requisição
// que não venha de um navegador real. Este script NÃO faz request HTTP próprio —
// ele controla o SEU Chrome (sessão real, que passa pelo Akamai) e lê o DOM.
//
// USO (uma vez): feche o Chrome e reabra com a porta de debug:
//   & "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
// Depois:
//   node scripts/petz-cdp.mjs "https://www.petz.com.br/produto/..." "https://www.petz.com.br/produto/..."
//
// Saída: JSON por URL com { url, name, brand, ogImage, rating, reviews, prices[] }.
// (Node 24+ tem fetch e WebSocket nativos — sem dependências.)

const PORT = process.env.CDP_PORT || 9222;
const urls = process.argv.slice(2);

if (!urls.length) {
  console.error('Passe ao menos uma URL. Ex.: node scripts/petz-cdp.mjs "https://www.petz.com.br/produto/..."');
  process.exit(1);
}

// Expressão executada DENTRO da página (lê só o que já está renderizado).
const EXTRACT = `(() => {
  const meta = (sel, attr = 'content') => { const el = document.querySelector(sel); return el ? el.getAttribute(attr) : null; };
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map(s => { try { return JSON.parse(s.textContent); } catch (e) { return null; } })
    .filter(Boolean).flat();
  const p = ld.find(o => o && o['@type'] === 'Product') || {};
  const agg = p.aggregateRating || {};
  const h1 = document.querySelector('h1');

  // Variantes de tamanho: cada bloco de preço normal, com o rótulo (kg/g) do card pai.
  const variants = [];
  [...document.querySelectorAll('[class*="card-prices-wrapper" i]')].forEach(w => {
    let node = w, label = '';
    for (let i = 0; i < 5 && node; i++) {
      node = node.parentElement;
      const t = node ? (node.innerText || '').replace(/\\s+/g, ' ').trim() : '';
      const m = t.match(/(\\d+[.,]?\\d*\\s?(?:kg|g)\\b)/i);
      if (m) { label = m[1]; break; }
    }
    const txt = (w.innerText || '').replace(/\\s+/g, ' ').trim();
    const normal = (txt.match(/R\\$\\s?[\\d.]+,\\d{2}/) || [])[0] || null;
    const assin = (txt.match(/R\\$\\s?[\\d.]+,\\d{2}\\s*para assinantes/) || [])[0] || null;
    if (normal) variants.push({ label, normal, assinante: assin ? assin.replace(/\\s*para assinantes/, '') : null });
  });
  const seen = new Set();
  const uniqVariants = variants.filter(v => { const k = v.label + v.normal; if (seen.has(k)) return false; seen.add(k); return true; });

  // Nota média + nº de avaliações (procura padrões "4,8" e "(123)" / "123 avaliações").
  const bodyTxt = document.body.innerText.replace(/\\s+/g, ' ');
  const avalMatch = bodyTxt.match(/([0-5][.,]\\d)\\s*(?:de 5)?[^.]{0,30}?(\\d+)\\s*avalia/i)
    || bodyTxt.match(/(\\d+)\\s*avalia\\w+/i);

  // Níveis de garantia / composição (proteína, gordura, fibra, umidade...).
  const specKeys = ['Proteína Bruta', 'Extrato Etéreo', 'Gordura', 'Fibra Bruta', 'Matéria Fibrosa', 'Matéria Mineral', 'Umidade', 'Cálcio', 'Energia Metabolizável', 'Ômega'];
  const specs = {};
  specKeys.forEach(k => {
    const re = new RegExp(k + "[^0-9]{0,25}?([0-9][0-9.,]*\\\\s*(?:%|kcal/kg|kcal))", 'i');
    const m = bodyTxt.match(re);
    if (m) specs[k] = m[1].replace(/\\s+/g, '');
  });

  return {
    url: location.href,
    name: (h1 && h1.innerText.trim()) || meta('meta[property="og:title"]') || p.name || document.title,
    ogTitle: meta('meta[property="og:title"]'),
    brand: (p.brand && (p.brand.name || p.brand)) || null,
    ogImage: meta('meta[property="og:image"]'),
    ldRating: agg.ratingValue || null,
    variants: uniqVariants.slice(0, 10),
    avalRaw: avalMatch ? avalMatch[0] : null,
    specs,
  };
})()`;

async function getPageTarget() {
  const list = await (await fetch(`http://localhost:${PORT}/json`)).json();
  let page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
  if (!page) {
    // cria uma aba nova (Chrome novo exige PUT em /json/new)
    page = await (await fetch(`http://localhost:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  }
  return page.webSocketDebuggerUrl;
}

function cdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const waiters = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      for (let i = waiters.length - 1; i >= 0; i--) {
        if (waiters[i].method === msg.method) {
          waiters[i].resolve(msg.params);
          waiters.splice(i, 1);
        }
      }
    }
  });
  const ready = new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  const waitFor = (method, timeout = 15000) =>
    new Promise((resolve) => {
      const w = { method, resolve };
      waiters.push(w);
      setTimeout(() => {
        const i = waiters.indexOf(w);
        if (i >= 0) waiters.splice(i, 1);
        resolve(null);
      }, timeout);
    });
  return { ready, send, waitFor, close: () => ws.close() };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let wsUrl;
  try {
    wsUrl = await getPageTarget();
  } catch (e) {
    console.error(`\nNão consegui falar com o Chrome em localhost:${PORT}.`);
    console.error('Feche o Chrome e reabra com:');
    console.error('  & "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222\n');
    console.error('Detalhe:', e.message);
    process.exit(1);
  }

  const client = cdp(wsUrl);
  await client.ready;
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  const results = [];
  for (const url of urls) {
    const loaded = client.waitFor('Page.loadEventFired', 20000);
    await client.send('Page.navigate', { url });
    await loaded;
    await sleep(3000); // respiro pro JS/preço renderizar
    // rola a página pra disparar lazy-load das avaliações, depois volta ao topo
    await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' });
    await sleep(2500);
    await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
    await sleep(800);
    const { result } = await client.send('Runtime.evaluate', {
      expression: EXTRACT,
      returnByValue: true,
      awaitPromise: true,
    });
    results.push(result.value);
    console.error(`  ok: ${result.value?.name?.slice(0, 60)}`);
  }

  client.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error('Erro:', e.message);
  process.exit(1);
});
