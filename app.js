'use strict';

/* ================= Configurazione ================= */
const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
const ART = id => `${SPRITES}other/official-artwork/${id}.png`;

const GAMES = [
  { id: 'rse', gen: 'III generazione', title: 'Rubino · Zaffiro · Smeraldo', art: [383, 382, 384], big: 2,
    bg: 'linear-gradient(120deg,#b3202a 0%,#7a2a6e 45%,#1f4fae 75%,#178a5a 100%)' },
  { id: 'frlg', gen: 'III generazione', title: 'RossoFuoco · VerdeFoglia', art: [6, 3], big: 0,
    bg: 'linear-gradient(120deg,#e8521c 0%,#c9781c 45%,#4c9a2f 100%)' },
  { id: 'dppt', gen: 'IV generazione', title: 'Diamante · Perla · Platino', art: [483, 484, 487], big: 2,
    bg: 'linear-gradient(120deg,#3c66c4 0%,#a46aa6 50%,#3b3b4f 100%)' },
  { id: 'hgss', gen: 'IV generazione', title: 'HeartGold · SoulSilver', art: [250, 249], big: 0,
    bg: 'linear-gradient(120deg,#c98a12 0%,#d9b04a 40%,#8d9aad 75%,#5d6b80 100%)' },
  { id: 'bw', gen: 'V generazione', title: 'Nero · Bianco', art: [644, 643], big: 0,
    bg: 'linear-gradient(120deg,#16171b 0%,#3a3c44 50%,#9aa0ab 100%)' },
  { id: 'b2w2', gen: 'V generazione', title: 'Nero 2 · Bianco 2', art: [10022, 10023], big: 0,
    bg: 'linear-gradient(120deg,#0f1b33 0%,#24467a 45%,#d2652a 100%)' },
];

const TYPE_COLORS = {
  1: '#9fa19f', 2: '#ff8000', 3: '#81b9ef', 4: '#9141cb', 5: '#915121', 6: '#afa981', 7: '#91a119', 8: '#704170',
  9: '#60a1b8', 10: '#e62829', 11: '#2980ef', 12: '#3fa129', 13: '#fac000', 14: '#ef4179', 15: '#3dcef3',
  16: '#5060e1', 17: '#624d4e', 18: '#ef70ef',
};
const CATEGORIES = { F: ['Fisico', 'phys'], S: ['Speciale', 'spec'], St: ['Stato', 'status'] };
const STAT_LABELS =['PS', 'Attacco', 'Difesa', 'Att. Sp.', 'Dif. Sp.', 'Velocità'];
const EV_LABELS = ['PS', 'Attacco', 'Difesa', 'Att. Sp.', 'Dif. Sp.', 'Velocità'];
const METHOD_ICONS = { grass: '🌿', fish: '🎣', water: '🌊', rock: '🪨', tree: '🌳', gift: '🎁', static: '⭐', roam: '💨', trade: '🔄', special: '✨' };
const VERSION_COLORS = {
  'Rubino': '#c0262f', 'Zaffiro': '#2154b8', 'Smeraldo': '#139058', 'RossoFuoco': '#e0531c', 'VerdeFoglia': '#3f9a2a',
  'Diamante': '#3a6fd1', 'Perla': '#c66a9e', 'Platino': '#6c6c80', 'HeartGold': '#c98a12', 'SoulSilver': '#7d8ba0',
  'Nero': '#222', 'Bianco': '#8f949c', 'Nero 2': '#1d2b4a', 'Bianco 2': '#c45a20',
};

/* ================= Stato ================= */
const cache = {};          // dati dei giochi già scaricati
let state = { game: null, edition: null, data: null, mon: null, tab: 'enc' };
const $app = document.getElementById('app');

/* ================= Utilità ================= */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/♀/g, 'f').replace(/♂/g, 'm').replace(/[^a-z0-9]/g, '');
const pad = n => String(n).padStart(3, '0');
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignora */ } },
};

function spriteUrl(id, ed) { return `${SPRITES}versions/${ed.sprite}/${id}.png`; }
function spriteImg(id, ed, cls = '') {
  // se lo sprite del gioco manca, ripiego sullo sprite standard
  return `<img class="px ${cls}" loading="lazy" alt="" src="${spriteUrl(id, ed)}" onerror="this.onerror=null;this.src='${SPRITES}${id}.png'">`;
}
function typePill(t, mini = false) {
  return `<span class="type ${mini ? 'mini-type' : ''}" style="background:${TYPE_COLORS[t]}">${esc(state.data.types[t])}</span>`;
}

async function loadGame(id) {
  if (!cache[id]) {
    const res = await fetch(`data/${id}.json`);
    if (!res.ok) throw new Error(`data/${id}.json: ${res.status}`);
    cache[id] = await res.json();
  }
  return cache[id];
}

/* ================= Home ================= */
function renderHome() {
  closeSheet(true);
  if (!$rank.hidden) closeRank();
  document.title = 'Pokéguida';
  document.querySelector('meta[name=theme-color]').content = '#e3350d';
  $app.innerHTML = `
    <main class="home">
      <div class="brand">
        <svg class="brand-ball" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="#fff" stroke="#15171c" stroke-width="7"/>
          <path d="M4 50a46 46 0 0 1 92 0z" fill="#e3350d" stroke="#15171c" stroke-width="7"/>
          <circle cx="50" cy="50" r="13" fill="#fff" stroke="#15171c" stroke-width="7"/>
        </svg>
        <div><h1>Pokéguida</h1><p>Generazioni III · IV · V</p></div>
      </div>
      <div class="games">
        ${GAMES.map(g => `
          <button class="game-card" data-game="${g.id}" style="background:${g.bg}">
            <div><div class="gc-gen">${g.gen}</div><div class="gc-title">${g.title}</div></div>
            <div class="gc-art">${g.art.map((a, i) => `<img class="${i === g.big ? 'big' : ''}" src="${ART(a)}" alt="">`).join('')}</div>
          </button>`).join('')}
      </div>
    </main>`;
  $app.querySelectorAll('.game-card').forEach(b => b.onclick = () => { location.hash = `#/${b.dataset.game}`; });
  GAMES.forEach(g => loadGame(g.id).catch(() => {})); // precarico in background
}

/* ================= Schermata gioco ================= */
async function renderGame(gameId) {
  const g = GAMES.find(x => x.id === gameId);
  if (!g) { location.hash = ''; return; }
  if (state.game !== gameId || !state.data) {
    $app.innerHTML = `<div class="topbar" style="background:${g.bg}"><div class="topbar-row"><button class="back">‹</button><h2>${g.title}</h2></div></div><div class="loading">Caricamento Pokédex…</div>`;
    $app.querySelector('.back').onclick = () => { location.hash = ''; };
    try {
      state.data = await loadGame(gameId);
    } catch (err) {
      $app.querySelector('.loading').innerHTML =
        `⚠️ Non riesco a caricare i dati del gioco.<br><small>Manca il file <b>data/${gameId}.json</b> sul sito, oppure sei offline.</small>`;
      return;
    }
    state.game = gameId;
    const saved = store.get(`ed-${gameId}`);
    state.edition = state.data.editions.find(e => e.id === saved) || state.data.editions[state.data.editions.length - 1];
  }
  const d = state.data, ed = state.edition;
  document.title = `${g.title} · Pokéguida`;
  document.querySelector('meta[name=theme-color]').content = '#222';

  const regional = new Map(ed.dex.map(([n, s]) => [s, n]));
  $app.innerHTML = `
    <header class="topbar" style="background:${g.bg}">
      <div class="topbar-row"><button class="back" aria-label="Indietro">‹</button><h2>${g.title}</h2></div>
      ${d.editions.length > 1 ? `<div class="edition-switch">${d.editions.map(e =>
        `<button data-ed="${e.id}" class="${e.id === ed.id ? 'on' : ''}">${esc(e.label)}</button>`).join('')}</div>` : ''}
      <div class="search">
        <input id="q" type="search" placeholder="Cerca un Pokémon…" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="search">
        <div class="suggest" id="suggest" hidden></div>
      </div>
      <button class="rank-open" id="rank-open">🏆 Classifica per statistica <span>›</span></button>
    </header>
    <main class="dex" id="dex">
      ${ed.dex.map(([n, s]) => {
        const m = d.mons[s];
        return `<button class="mon" data-id="${s}">
          <span class="num">${pad(n)}</span>${spriteImg(s, ed)}
          <span class="nm">${esc(m.n)}</span>
          <span class="dots">${m.t.map(t => `<i style="background:${TYPE_COLORS[t]}"></i>`).join('')}</span>
        </button>`;
      }).join('')}
    </main>`;

  $app.querySelector('.back').onclick = () => { location.hash = ''; };
  $app.querySelectorAll('.edition-switch button').forEach(b => b.onclick = () => {
    state.edition = d.editions.find(e => e.id === b.dataset.ed);
    store.set(`ed-${gameId}`, state.edition.id);
    const y = window.scrollY;
    renderGame(gameId).then(() => window.scrollTo(0, y));
  });
  document.getElementById('dex').onclick = e => {
    const b = e.target.closest('.mon');
    if (b) openMon(+b.dataset.id);
  };
  setupSearch(regional);
  document.getElementById('rank-open').onclick = () => openRank();
}

/* ================= Classifica statistiche ================= */
const $rank = document.getElementById('rank-backdrop');
const SHORT_STATS = ['PS', 'Att', 'Dif', 'AtS', 'DiS', 'Vel'];
let rankStat = 0;

function openRank() {
  $rank.hidden = false;
  requestAnimationFrame(() => $rank.classList.add('open'));
  document.body.style.overflow = 'hidden';
  renderRank();
}
function closeRank() {
  $rank.classList.remove('open');
  setTimeout(() => { $rank.hidden = true; }, 200);
  if (!state.mon) document.body.style.overflow = '';
}
function renderRank() {
  const d = state.data, ed = state.edition;
  document.getElementById('rank-stats').innerHTML = STAT_LABELS.map((l, i) =>
    `<button data-s="${i}" class="${i === rankStat ? 'on' : ''}">${l}</button>`).join('');
  document.getElementById('rank-sub').textContent = `Pokédex regionale · ${ed.label}`;
  const regional = new Map(ed.dex.map(([n, s]) => [s, n]));
  const top = ed.dex.map(([, s]) => ({ id: s, m: d.mons[s] }))
    .sort((a, b) => b.m.s[rankStat] - a.m.s[rankStat]
      || b.m.s.reduce((x, y) => x + y) - a.m.s.reduce((x, y) => x + y) || a.id - b.id)
    .slice(0, 20);
  document.getElementById('rank-list').innerHTML = `
    <div class="rk-row rk-legend"><span></span><span></span><span></span>
      <span class="rk-stats">${SHORT_STATS.map((l, i) => `<span class="${i === rankStat ? 'on' : ''}">${l}</span>`).join('')}</span></div>
    ${top.map(({ id, m }, pos) => `
      <button class="rk-row" data-id="${id}">
        <span class="rk-pos">${pos + 1}</span>
        ${spriteImg(id, ed, 'rk-img')}
        <span class="rk-name">${esc(m.n)}<small>#${pad(regional.get(id))}</small></span>
        <span class="rk-stats">${m.s.map((v, i) => `<span class="${i === rankStat ? 'on' : ''}">${v}</span>`).join('')}</span>
      </button>`).join('')}`;
  document.getElementById('rank-list').scrollTop = 0;
}
document.getElementById('rank-stats').onclick = e => {
  const b = e.target.closest('button');
  if (b) { rankStat = +b.dataset.s; renderRank(); }
};
document.getElementById('rank-list').onclick = e => {
  const b = e.target.closest('.rk-row[data-id]');
  if (b) { closeRank(); openMon(+b.dataset.id); }
};
document.getElementById('rank-close').onclick = closeRank;
$rank.onclick = e => { if (e.target === $rank) closeRank(); };

function setupSearch(regional) {
  const d = state.data, ed = state.edition;
  const input = document.getElementById('q');
  const box = document.getElementById('suggest');
  const all = Object.entries(d.mons).map(([id, m]) => ({ id: +id, n: m.n, k: norm(m.n), r: regional.get(+id) }));
  let results = [], sel = 0;

  function run() {
    const q = norm(input.value.trim());
    if (!q) { box.hidden = true; return; }
    const num = /^\d+$/.test(q) ? +q : null;
    results = all.filter(p => num !== null ? (p.r === num || p.id === num) : p.k.includes(q))
      .sort((a, b) => {
        const ra = a.r != null ? 0 : 1, rb = b.r != null ? 0 : 1;
        const sa = a.k.startsWith(q) ? 0 : 1, sb = b.k.startsWith(q) ? 0 : 1;
        return sa - sb || ra - rb || (a.r ?? 9999) - (b.r ?? 9999) || a.id - b.id;
      }).slice(0, 8);
    sel = 0;
    box.innerHTML = results.length ? results.map((p, i) => `
      <button data-id="${p.id}" class="${i === sel ? 'sel' : ''}">${spriteImg(p.id, ed)}
        <span class="s-name">${esc(p.n)}${p.r == null ? '<small>Fuori dal Pokédex regionale</small>' : ''}</span>
        <span class="s-num">${p.r != null ? '#' + pad(p.r) : 'Naz. ' + pad(p.id)}</span></button>`).join('')
      : `<div class="empty">Nessun Pokémon trovato</div>`;
    box.hidden = false;
  }
  input.addEventListener('input', run);
  input.addEventListener('focus', run);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && results[sel]) { pick(results[sel].id); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
      box.querySelectorAll('button').forEach((b, i) => b.classList.toggle('sel', i === sel));
    }
  });
  box.addEventListener('pointerdown', e => e.preventDefault()); // non perdere il focus prima del click
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (b) pick(+b.dataset.id); });
  document.addEventListener('click', e => { if (!e.target.closest('.search')) box.hidden = true; });

  function pick(id) { input.value = ''; box.hidden = true; input.blur(); openMon(id); }
}

/* ================= Scheda Pokémon ================= */
const $sheet = document.getElementById('sheet');
const $backdrop = document.getElementById('sheet-backdrop');
const $body = document.getElementById('sheet-body');

function openMon(id) {
  const target = `#/${state.game}/${id}`;
  if (location.hash !== target) {
    // se la scheda è già aperta sostituisco, così "indietro" torna al Pokédex
    if (state.mon) history.replaceState(null, '', target); else history.pushState(null, '', target);
  }
  showMon(id);
}

function showMon(id) {
  const d = state.data, ed = state.edition, m = d.mons[id];
  if (!m) return;
  state.mon = id;
  const regional = ed.dex.find(([, s]) => s === id);
  const g = GAMES.find(x => x.id === state.game);
  const c1 = TYPE_COLORS[m.t[0]], c2 = TYPE_COLORS[m.t[1] ?? m.t[0]];
  const total = m.s.reduce((a, b) => a + b, 0);
  const evs = m.e.map((v, i) => v ? `<span class="ev"><em>+${v}</em> ${EV_LABELS[i]}</span>` : '').join('');

  $body.innerHTML = `
    <div class="hero" id="hero" style="background:linear-gradient(135deg, ${c1}, ${shade(c2, -18)})">
      ${spriteImg(id, ed)}
      <div>
        <div class="h-num">${regional ? `#${pad(regional[0])} regionale · ` : 'Fuori dal Pokédex regionale · '}Naz. ${pad(id)}</div>
        <h3>${esc(m.n)}</h3>
        <div class="types">${m.t.map(t => typePill(t)).join('')}</div>
      </div>
    </div>

    <div class="block">
      <h4><span>Statistiche base</span><span>Totale ${total}</span></h4>
      <div class="stats">${m.s.map((v, i) => `
        <div class="stat"><span class="lbl">${STAT_LABELS[i]}</span><b>${v}</b>
          <div class="bar"><i style="width:${Math.min(100, v / 1.8)}%;background:${statColor(v)}"></i></div></div>`).join('')}
      </div>
      <div class="evs"><span class="lbl" style="color:var(--muted);font-weight:700">EV:</span>${evs}</div>
    </div>

    <div class="block"><h4><span>Evoluzioni</span></h4>${evoHtml(m.c, id)}</div>

    <div class="tabs" id="tabs">
      <button data-tab="enc">📍 Dove</button>
      <button data-tab="lv">⬆️ Livello</button>
      <button data-tab="tm">💿 MT/MN</button>
    </div>
    <div class="block" id="tab-body"></div>
    <p class="note">Dati: PokéAPI. Probabilità per singolo incontro con quel metodo in quella zona.</p>`;

  $body.querySelectorAll('#tabs button').forEach(b => b.onclick = () => { state.tab = b.dataset.tab; renderTab(); });
  $body.querySelectorAll('[data-evo]').forEach(b => b.onclick = () => { const t = +b.dataset.evo; if (t !== id) openMon(t); });
  renderTab();
  $body.scrollTop = 0;

  $sheet.hidden = false; $backdrop.hidden = false;
  requestAnimationFrame(() => { $sheet.classList.add('open'); $backdrop.classList.add('open'); });
  document.body.style.overflow = 'hidden';
}

function renderTab() {
  const d = state.data, ed = state.edition, m = d.mons[state.mon];
  $body.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === state.tab));
  const el = document.getElementById('tab-body');
  if (state.tab === 'enc') el.innerHTML = encHtml(m.enc[ed.id], ed);
  else {
    const list = state.tab === 'lv' ? m.mv[ed.id].l : m.mv[ed.id].m;
    el.innerHTML = list.length ? `<table class="moves">${list.map(([lv, mid]) => {
      const [name, type, pow, cat, acc] = d.moves[mid];
      const label = state.tab === 'lv' ? (lv === 0 ? 'Evo' : `Lv ${lv}`) : lv;
      const [catName, catCls] = CATEGORIES[cat] || CATEGORIES.St;
      return `<tr><td class="lv">${label}</td>
        <td><div class="mname">${esc(name)}</div>
          <div class="mmeta"><span class="cat ${catCls}">${catName}</span>
            ${cat === 'St' ? '' : `<span>Pot. <b>${pow > 1 ? pow : 'var.'}</b></span>`}<span>Prec. <b>${acc ? acc : '—'}</b></span></div></td>
        <td class="ty">${typePill(type, true)}</td></tr>`;
    }).join('')}</table>` : `<div class="nothing">Nessuna mossa ${state.tab === 'lv' ? 'per livello' : 'MT/MN'} in questo gioco.</div>`;
  }
}

function encHtml(rows, ed) {
  if (!rows || !rows.length) {
    return `<div class="nothing">Non si trova in natura in ${esc(ed.label)}.<br>Prova a ottenerlo per evoluzione, allevamento o scambio.</div>`;
  }
  const d = state.data;
  const byLoc = new Map();
  rows.forEach(r => { if (!byLoc.has(r[0])) byLoc.set(r[0], []); byLoc.get(r[0]).push(r); });
  // prima i luoghi con incontri "normali" (erba, acqua, pesca), poi alberi/rocce; nomi in ordine naturale
  const PRIO = { grass: 0, water: 0, fish: 1, static: 1, gift: 1, trade: 1, roam: 1, special: 2, rock: 3, tree: 4 };
  const prio = list => Math.min(...list.map(r => PRIO[(d.methods[r[1]] || [, 'special'])[1]] ?? 2));
  const groups = [...byLoc].map(([li, list]) => {
    list.sort((a, b) => (PRIO[(d.methods[a[1]] || [, 'special'])[1]] ?? 2) - (PRIO[(d.methods[b[1]] || [, 'special'])[1]] ?? 2) || b[3] - a[3]);
    return [li, list, prio(list)];
  }).sort((a, b) => a[2] - b[2] || d.locs[a[0]].localeCompare(d.locs[b[0]], 'it', { numeric: true }));
  return groups.map(([li, list]) => `
    <div class="loc"><div class="loc-name">${esc(d.locs[li])}</div>
      ${list.map(([, meth, tags, pct, lo, hi, only]) => {
        const [label, kind] = d.methods[meth] || [meth, 'special'];
        const fixed = ['gift', 'static', 'trade', 'roam'].includes(kind) || pct >= 100;
        const lv = lo === hi ? `Lv. ${lo}` : `Lv. ${lo}–${hi}`;
        return `<div class="enc">
          <span class="ic">${METHOD_ICONS[kind] || '✨'}</span>
          <span class="meth">${esc(label)} <small>· ${lv}</small><br>
            ${only ? `<span class="tag ver" style="background:${VERSION_COLORS[only] || '#666'}">Solo ${esc(only)}</span>` : ''}
            ${tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</span>
          <span class="pct">${fixed ? '' : pct + '%'}</span>
          ${fixed ? '' : `<span class="pctbar"><i style="width:${Math.min(pct, 100)}%"></i></span>`}
        </div>`;
      }).join('')}
    </div>`).join('');
}

function evoHtml(chainId, current) {
  const d = state.data, ed = state.edition;
  const edges = (d.chains[chainId] || [])
    .map(([a, b, how]) => [a, b, typeof how === 'object' && how !== null ? how[ed.id] : how])
    .filter(e => e[2]);
  if (!edges.length) return `<div class="evo-none">Questo Pokémon non si evolve.</div>`;
  const kids = new Map(), parents = new Set(edges.map(e => e[1]));
  edges.forEach(([a, b, how]) => { if (!kids.has(a)) kids.set(a, []); kids.get(a).push([b, how]); });
  const root = edges.map(e => e[0]).find(a => !parents.has(a));
  const node = id => `<button class="evo-mon ${id === current ? 'cur' : ''}" data-evo="${id}">${spriteImg(id, ed)}<span>${esc(d.mons[id].n)}</span></button>`;
  const tree = id => {
    const ch = kids.get(id) || [];
    if (!ch.length) return node(id);
    const branch = ([b, how]) => `<div class="evo-branch"><span class="evo-arrow">${esc(how)}</span>${tree(b)}</div>`;
    return `${node(id)}${ch.length === 1 ? branch(ch[0]) : `<div class="evo-col">${ch.map(branch).join('')}</div>`}`;
  };
  return `<div class="evo">${tree(root)}</div>`;
}

function statColor(v) {
  if (v < 50) return '#f34444'; if (v < 70) return '#ff7f0f'; if (v < 90) return '#ffdd57';
  if (v < 110) return '#a0e515'; if (v < 130) return '#23cd5e'; return '#00c2b8';
}
function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16), f = 1 + pct / 100;
  const c = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

function closeSheet(silent) {
  if (!state.mon && $sheet.hidden) return;
  state.mon = null;
  $sheet.classList.remove('open'); $backdrop.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { if (!state.mon) { $sheet.hidden = true; $backdrop.hidden = true; } }, 300);
  if (!silent && /^#\/\w+\/\d+/.test(location.hash)) history.back();
}
document.getElementById('sheet-close').onclick = () => closeSheet();
$backdrop.onclick = () => closeSheet();

// trascina giù per chiudere (dalla maniglia o dall'intestazione colorata)
(() => {
  let startY = null, dy = 0;
  const start = e => { if (!e.target.closest('#sheet-grab, #hero')) return; startY = e.touches[0].clientY; dy = 0; $sheet.classList.add('dragging'); };
  const move = e => { if (startY === null) return; dy = Math.max(0, e.touches[0].clientY - startY); $sheet.style.transform = `translateY(${dy}px)`; };
  const end = () => {
    if (startY === null) return;
    $sheet.classList.remove('dragging'); $sheet.style.transform = '';
    if (dy > 110) closeSheet();
    startY = null;
  };
  $sheet.addEventListener('touchstart', start, { passive: true });
  $sheet.addEventListener('touchmove', move, { passive: true });
  $sheet.addEventListener('touchend', end);
})();
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$rank.hidden) closeRank(); else if (state.mon) closeSheet();
});

/* ================= Router ================= */
async function route() {
  const [, game, mon] = location.hash.match(/^#\/(\w+)(?:\/(\d+))?/) || [];
  if (!game) { state.game = null; state.data = null; renderHome(); return; }
  if (state.game !== game || !document.getElementById('dex')) await renderGame(game);
  if (mon) showMon(+mon);
  else if (state.mon) closeSheet(true);
}
window.addEventListener('hashchange', route);route();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
