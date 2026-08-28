const CATS = ["Dining","Shopping","Experience","Transportation","Social Support"];
const CATCOLOR = {Dining:"#FDE403",Shopping:"#F64A01",Experience:"#007DB7",
                  Transportation:"#6DA691","Social Support":"#7A4B9C"};
const CATSOFT  = {Dining:"rgba(253,228,3,.28)",Shopping:"rgba(246,74,1,.11)",
                  Experience:"rgba(0,125,183,.11)",Transportation:"rgba(109,166,145,.20)",
                  "Social Support":"rgba(122,75,156,.12)"};
const ELIGS = ["Anderson","All UCLA","Grad student","Any student ID","LA resident","CA resident"];
const LOCS = ["On campus","Off campus","Virtual"];
const DURS = ["Ongoing","Limited"];

/* Which record field each filter group reads. */
const FIELD = {elig:"e", dur:"d", loc:"loc"};

/* Category marks. Drawn in navy on the tile's own tint, so they stay legible
   whichever colour sits behind them. */
const ICON = {
  all: '<rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/>',
  Dining: '<path d="M6 3v6a2.2 2.2 0 0 0 4.4 0V3M8.2 11v10"/><path d="M17.4 3c-1.5 1.2-2.2 2.9-2.2 4.8s.8 3.2 2.2 3.2 2.2-1.3 2.2-3.2S18.9 4.2 17.4 3zM17.4 11v10"/>',
  Shopping: '<path d="M4.5 8h15l-1.2 12.2a1 1 0 0 1-1 .8H6.7a1 1 0 0 1-1-.8L4.5 8z"/><path d="M9 8V6.2a3 3 0 0 1 6 0V8"/>',
  Experience: '<path d="M3.5 8.6V7.4a1.4 1.4 0 0 1 1.4-1.4h14.2a1.4 1.4 0 0 1 1.4 1.4v1.2a2.4 2.4 0 0 0 0 4.8v1.2a1.4 1.4 0 0 1-1.4 1.4H4.9a1.4 1.4 0 0 1-1.4-1.4v-1.2a2.4 2.4 0 0 0 0-4.8z"/><path d="M14.2 6v10" stroke-dasharray="2.4 2.4"/>',
  Transportation: '<rect x="3.8" y="3.6" width="16.4" height="12.6" rx="2.4"/><path d="M3.8 10.4h16.4M7.6 20.4v-2.4M16.4 20.4v-2.4"/><circle cx="7.9" cy="13.4" r=".9"/><circle cx="16.1" cy="13.4" r=".9"/>',
  "Social Support": '<path d="M12 20.4c-4.7-4.1-7.4-6.6-7.4-9.7A4.3 4.3 0 0 1 8.9 6.4c1.3 0 2.4.6 3.1 1.6a3.8 3.8 0 0 1 3.1-1.6 4.3 4.3 0 0 1 4.3 4.3c0 3.1-2.7 5.6-7.4 9.7z"/>'
};

let DATA = [];
const state = {cat:"all", q:"", elig:new Set(), dur:new Set(), loc:new Set(), benefit:null};
let syncing = false;   // guards the dialog<->history round trip

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ---------- URL sync ---------- */
function readURL(){
  const p = new URLSearchParams(location.search);
  if(p.get("cat")) state.cat = p.get("cat");
  if(p.get("q")) state.q = p.get("q");
  ["elig","dur","loc"].forEach(k=>{
    state[k].clear();
    const v = p.get(k);
    if(v) v.split("|").filter(Boolean).forEach(x=>state[k].add(x));
  });
  state.benefit = p.get("benefit") || null;
}

/* The address bar always describes what's on screen: which filters are set,
   and which benefit is open. That second half is what makes a link shareable. */
function urlFor(){
  const p = new URLSearchParams();
  if(state.cat!=="all") p.set("cat",state.cat);
  if(state.q) p.set("q",state.q);
  ["elig","dur","loc"].forEach(k=>{ if(state[k].size) p.set(k,[...state[k]].join("|")); });
  if(state.benefit) p.set("benefit",state.benefit);
  const qs = p.toString();
  return qs ? "?"+qs : location.pathname;
}
function writeURL(){ history.replaceState(history.state,"",urlFor()); }

/* ---------- filtering ---------- */
const haystack = d => (d.t+" "+d.p+" "+d.v+" "+d.c+" "+d.e+" "+(d.n||"")).toLowerCase();

function matches(d){
  if(state.cat!=="all" && d.c!==state.cat) return false;
  if(state.q && !haystack(d).includes(state.q.toLowerCase())) return false;
  for(const k of Object.keys(FIELD)){
    if(state[k].size && !state[k].has(d[FIELD[k]])) return false;
  }
  return true;
}

/* How many benefits this option would show, given everything else already
   chosen. Its own group is ignored, so the numbers don't collapse to zero the
   moment you pick something in that group. */
function facetCount(key,value){
  return DATA.filter(d=>{
    if(d[FIELD[key]]!==value) return false;
    if(state.cat!=="all" && d.c!==state.cat) return false;
    if(state.q && !haystack(d).includes(state.q.toLowerCase())) return false;
    for(const k of Object.keys(FIELD)){
      if(k===key) continue;
      if(state[k].size && !state[k].has(d[FIELD[k]])) return false;
    }
    return true;
  }).length;
}

/* Entries that must never reach the page, whatever the filters say:
   an expired Limited offer, or one with no verified date to stand behind. */
function publishable(d){
  const today = new Date().toISOString().slice(0,10);
  if(!d.vd) return false;
  if(d.exp && d.exp < today) return false;
  return true;
}

/* ---------- rendering ---------- */
function fmtDate(s){
  const [y,m,dd] = s.split("-");
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `Verified ${months[+m-1]} ${+dd}, ${y}`;
}

function notice(title, body){
  const el = $("notice");
  if(title === null){ el.hidden = true; return; }
  el.innerHTML = `<h3>${title}</h3><p>${body}</p>`;
  el.hidden = false;
}

function renderTiles(){
  const counts = {all:DATA.length}; CATS.forEach(c=>counts[c]=0);
  DATA.forEach(d=>{ counts[d.c] = (counts[d.c]||0)+1; });
  const items = [{k:"all",label:"Everything"}, ...CATS.map(c=>({k:c,label:c}))];
  const el = $("tiles");
  el.innerHTML = items.map(i=>`
    <button class="tile" data-key="${esc(i.k)}" aria-pressed="${state.cat===i.k}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[i.k]}</svg>
      <span class="t-text">
        <span class="t-name">${esc(i.label)}</span>
        <span class="t-count">${counts[i.k]||0} benefit${(counts[i.k]||0)===1?"":"s"}</span>
      </span>
    </button>`).join("");
  el.querySelectorAll(".tile").forEach(b=>b.addEventListener("click",()=>{
    state.cat = (state.cat===b.dataset.key && b.dataset.key!=="all") ? "all" : b.dataset.key;
    render();
  }));
}

/* Facets are drawn twice — in the sidebar for wide screens, and inside the
   filter sheet for phones. Both read the same state, so they can't drift. */
function renderFacets(ids,values,key,cls){
  const markup = values.map(v=>{
    const n = facetCount(key,v);
    return `<button class="facet ${cls||""}" data-val="${esc(v)}" data-count="${n}" aria-pressed="${state[key].has(v)}">
      <span class="facet-label">${esc(v)}</span><span class="facet-count">${n}</span>
    </button>`;
  }).join("");
  ids.forEach(id=>{
    const el = $(id);
    if(!el) return;
    el.innerHTML = markup;
    el.querySelectorAll(".facet").forEach(b=>b.addEventListener("click",()=>{
      const v=b.dataset.val;
      state[key].has(v) ? state[key].delete(v) : state[key].add(v);
      render();
    }));
  });
}

function activeFilterCount(){
  return state.elig.size + state.dur.size + state.loc.size;
}

function renderFilterButton(){
  const n = activeFilterCount();
  const badge = $("filterCount");
  badge.textContent = n;
  badge.hidden = n === 0;
  $("filterBtn").setAttribute("aria-label", n ? `Filters, ${n} active` : "Filters");
}

function renderGrid(){
  const rows = DATA.filter(matches);
  const grid = $("grid");
  $("count").innerHTML = `<b>${rows.length}</b> benefit${rows.length===1?"":"s"} you can use`;
  // Mirrored inside the filter sheet, so the tally updates as you tap.
  $("filterResult").textContent = `${rows.length} benefit${rows.length===1?"":"s"} match`;

  if(!rows.length){
    grid.innerHTML = "";
    notice("Nothing matches those filters yet.","Try clearing one — or tell the team what's missing so we can add it.");
    return;
  }
  notice(null);

  grid.innerHTML = rows.map(d=>`
    <button class="card" data-id="${esc(d.id)}" style="--cat:${CATCOLOR[d.c]};--cat-soft:${CATSOFT[d.c]}">
      <span class="provider">${esc(d.p)}</span>
      <h3 class="title">${esc(d.t)}</h3>
      <span class="value">${esc(d.v)}</span>
      <span class="tagrow">
        <span class="tag elig">${esc(d.e)}</span>
        <span class="tag dur-${esc(d.d)}">${esc(d.d)}</span>
        <span class="tag">${esc(d.loc)}</span>
      </span>
      <span class="verified">${fmtDate(d.vd)}</span>
    </button>`).join("");
  grid.querySelectorAll(".card").forEach(b=>b.addEventListener("click",()=>openSheet(b.dataset.id)));
}

function openSheet(id, push=true){
  const d = DATA.find(x=>x.id===id);
  if(!d) return false;   // unknown or unpublishable id — caller drops it from the URL
  const body = $("sheetBody");
  body.style.setProperty("--cat", CATCOLOR[d.c]);
  body.style.setProperty("--cat-soft", CATSOFT[d.c]);
  body.innerHTML = `
    <p class="provider">${esc(d.p)}</p>
    <h2>${esc(d.t)}</h2>
    <p class="value">${esc(d.v)}</p>
    <dl class="kv">
      <dt>Who</dt><dd>${esc(d.e)}</dd>
      <dt>How to use</dt><dd>${esc(d.r)}</dd>
      <dt>Where</dt><dd>${esc(d.loc)}</dd>
      <dt>How long</dt><dd>${esc(d.d)}${d.exp?` · ends ${esc(d.exp)}`:""}</dd>
      <dt>Category</dt><dd>${esc(d.c)}</dd>
    </dl>
    ${d.n?`<p class="note">${esc(d.n)}</p>`:""}
    <div class="sheetfoot">
      ${d.u?`<a class="btn btn-primary" href="${esc(d.u)}" target="_blank" rel="noopener">Open the source</a>`:""}
      <button class="btn btn-ghost" id="closeSheet" type="button">Close</button>
      <span style="font-size:13px;color:var(--ink-soft)">${fmtDate(d.vd)}</span>
    </div>`;

  state.benefit = d.id;
  if(push) history.pushState({benefit:d.id},"",urlFor());
  else writeURL();

  const dlg = $("sheet");
  if(!dlg.open) dlg.showModal();
  /* A dialog autofocuses its first focusable child — here the source link, which
     sits at the bottom. On a tall phone sheet that scrolls the panel past its
     own title. Take focus to the top of the sheet instead. */
  body.scrollTop = 0;
  body.focus({preventScroll:true});
  body.querySelector("#closeSheet").addEventListener("click",closeSheet);
  return true;
}

/* Every close route funnels through here rather than through the dialog's
   own close event, which not every engine fires reliably. Idempotent, so the
   close event can call it again harmlessly. */
function closeSheet(){
  const dlg = $("sheet");
  if(dlg.open) dlg.close();
  if(syncing) return;
  const inURL = new URLSearchParams(location.search).get("benefit");
  if(!inURL) return;
  const ours = history.state && history.state.benefit === inURL;
  state.benefit = null;
  if(ours) history.back();
  else writeURL();
}

/* Reconcile the dialog with whatever the URL says — used on back/forward. */
function syncSheetToURL(){
  syncing = true;
  const dlg = $("sheet");
  const want = new URLSearchParams(location.search).get("benefit");
  if(want && DATA.some(x=>x.id===want)){
    openSheet(want,false);
  }else{
    state.benefit = null;
    if(dlg.open) dlg.close();
  }
  syncing = false;
}

function render(){
  renderTiles();
  renderFacets(["f-elig","m-elig"],ELIGS,"elig");
  renderFacets(["f-dur","m-dur"],DURS,"dur","dur");
  renderFacets(["f-loc","m-loc"],LOCS,"loc");
  renderGrid();
  renderFilterButton();
  writeURL();
}

/* ---------- wiring ---------- */
const qEl = $("q");
qEl.addEventListener("input",()=>{ state.q = qEl.value.trim(); render(); });

/* Once the nav takes its share of the bar, the full placeholder gets cut
   mid-word, which reads as broken rather than truncated. */
const tightBar = matchMedia("(max-width:900px)");
function setPlaceholder(){
  qEl.placeholder = tightBar.matches ? "Search benefits…" : "Search benefits, places, providers…";
}
tightBar.addEventListener("change",setPlaceholder);
setPlaceholder();

/* The magnifier doesn't submit anything — results are already live. It jumps to
   them and dismisses the phone keyboard, which is the only thing left to do. */
$("searchBtn").addEventListener("click",()=>{
  qEl.blur();
  document.querySelector(".results").scrollIntoView({behavior:"smooth",block:"start"});
});
qEl.addEventListener("keydown",e=>{ if(e.key==="Enter") $("searchBtn").click(); });

function clearFilters(){
  state.elig.clear(); state.dur.clear(); state.loc.clear();
  render();
}
$("reset").addEventListener("click",()=>{
  state.cat="all"; state.q=""; qEl.value="";
  clearFilters();
  qEl.focus();
});
$("filterReset").addEventListener("click",clearFilters);

$("sheet").addEventListener("click",e=>{
  if(e.target.id==="sheet") closeSheet();   // click backdrop to dismiss
});
$("sheet").addEventListener("close",closeSheet);   // catches Escape

/* Filter sheet — phones only. Filtering happens live as you tap, so "Done"
   just dismisses; there is nothing to apply or cancel. */
$("filterBtn").addEventListener("click",()=>$("filterSheet").showModal());
$("filterDone").addEventListener("click",()=>$("filterSheet").close());
$("filterSheet").addEventListener("click",e=>{
  if(e.target.id==="filterSheet") e.target.close();
});

addEventListener("popstate",syncSheetToURL);

/* ---------- load ---------- */
notice("Loading benefits…","One moment.");
fetch("data/benefits.json")
  .then(r=>{ if(!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r.json(); })
  .then(rows=>{
    DATA = rows.filter(publishable);
    readURL();
    qEl.value = state.q;
    const wanted = state.benefit;
    state.benefit = null;
    render();
    // A shared link lands here: open its detail view, or quietly drop a stale id.
    if(wanted && !openSheet(wanted,false)) writeURL();
  })
  .catch(err=>{
    console.error(err);
    $("count").textContent = "";
    notice("The catalog didn't load.",
      "Betterson reads <code>data/benefits.json</code> over HTTP, so it needs a local server — opening the file directly won't work. Run <code>python3 scripts/serve.py</code> in the project folder.");
  });
