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

/* Per-benefit marks, keyed by the optional `ic` field. A UCLA logo on the 27
   campus listings would tell you nothing; what a benefit *is* distinguishes it.
   Anything missing or unrecognised falls back to its category icon. */
const BENEFIT_ICON = {
  bus: ICON.Transportation,
  ticket: ICON.Experience,
  utensils: ICON.Dining,
  basket: ICON.Shopping,
  apps: ICON.all,
  card: '<rect x="2.6" y="5.2" width="18.8" height="13.6" rx="2.4"/><path d="M2.6 9.8h18.8M6.2 14.6h3.4"/>',
  train: '<rect x="5" y="3.4" width="14" height="12.4" rx="2.6"/><path d="M5 10h14M8.6 19.8l-2 2M15.4 19.8l2 2M7.4 15.8v4h9.2v-4"/><circle cx="9" cy="12.9" r=".9"/><circle cx="15" cy="12.9" r=".9"/>',
  tree: '<path d="M12 3.2 6.6 11h3L5.6 17.2h12.8L14.4 11h3L12 3.2zM12 17.2v3.6"/>',
  film: '<rect x="3" y="4.6" width="18" height="14.8" rx="2.2"/><path d="M8 4.6v14.8M16 4.6v14.8M3 12h18M3 8.3h5M3 15.7h5M16 8.3h5M16 15.7h5"/>',
  trophy: '<path d="M7.4 4h9.2v5.2a4.6 4.6 0 0 1-9.2 0V4zM7.4 5.6H4.8v1.6a3 3 0 0 0 2.6 3M16.6 5.6h2.6v1.6a3 3 0 0 1-2.6 3M12 13.8v3.4M8.6 20.4h6.8l-.8-3.2H9.4z"/>',
  music: '<path d="M9.2 17.6V6.2l9-1.8v11"/><circle cx="6.6" cy="17.6" r="2.6"/><circle cx="15.6" cy="15.4" r="2.6"/>',
  museum: '<path d="M12 3 3 7.6h18L12 3zM5.4 10.4v7M9.8 10.4v7M14.2 10.4v7M18.6 10.4v7M3 20.4h18M3.6 17.4h16.8"/>',
  dumbbell: '<path d="M3.2 9.4v5.2M6.4 7.2v9.6M17.6 7.2v9.6M20.8 9.4v5.2M6.4 12h11.2"/>',
  bowl: '<path d="M3.4 11.6h17.2a8.6 8.6 0 0 1-8.6 8.2 8.6 8.6 0 0 1-8.6-8.2zM9 8.2c0-1.4 1.2-1.8 1.2-3M13.6 8.2c0-1.4 1.2-1.8 1.2-3"/>',
  tag: '<path d="M11.2 3.4H20v8.8l-8.8 8.8-8.8-8.8z"/><circle cx="16.2" cy="7.8" r="1.4"/>',
  coffee: '<path d="M4.4 8h12v6.4a4.6 4.6 0 0 1-4.6 4.6H9a4.6 4.6 0 0 1-4.6-4.6zM16.4 9.6h1.8a2.6 2.6 0 0 1 0 5.2h-1.8M3 21.4h15M8 3.2v2M12 3.2v2"/>',
  laptop: '<rect x="4" y="4.8" width="16" height="10.8" rx="1.8"/><path d="M2.2 19h19.6l-1.4-3.4H3.6z"/>',
  download: '<path d="M12 3.6v10.2M8.2 10.2 12 14l3.8-3.8M4 16.4v2.4a1.8 1.8 0 0 0 1.8 1.8h12.4a1.8 1.8 0 0 0 1.8-1.8v-2.4"/>',
  book: '<path d="M12 6.6C10.2 5 7.6 4.2 4 4.2v13.2c3.6 0 6.2.8 8 2.4 1.8-1.6 4.4-2.4 8-2.4V4.2c-3.6 0-6.2.8-8 2.4zM12 6.6v13.2"/>',
  printer: '<path d="M6.6 9V3.6h10.8V9M6.6 17.4H4.8A1.8 1.8 0 0 1 3 15.6v-4.8A1.8 1.8 0 0 1 4.8 9h14.4a1.8 1.8 0 0 1 1.8 1.8v4.8a1.8 1.8 0 0 1-1.8 1.8h-1.8"/><rect x="6.6" y="14.4" width="10.8" height="6" rx="1"/>',
  scales: '<path d="M12 3.6v16.8M6.6 6.2h10.8M7.8 20.4h8.4M6.6 6.2 3.4 13h6.4zM17.4 6.2 14.2 13h6.4z"/>',
  bolt: '<path d="M13.4 2.6 4.6 13.4h6L10.6 21.4l8.8-10.8h-6z"/>',
  list: '<path d="M9 6.6h11M9 12h11M9 17.4h11"/><circle cx="4.6" cy="6.6" r="1.2"/><circle cx="4.6" cy="12" r="1.2"/><circle cx="4.6" cy="17.4" r="1.2"/>',
  bike: '<circle cx="5.6" cy="17.2" r="3.6"/><circle cx="18.4" cy="17.2" r="3.6"/><path d="M5.6 17.2 9.8 8.4h4.4l4.2 8.8M9 8.4h4.6M14.6 8.4l1.8 3.6"/>',
  water: '<path d="M2.6 17.4c1.9 0 1.9-1.6 3.8-1.6s1.9 1.6 3.8 1.6 1.9-1.6 3.8-1.6 1.9 1.6 3.8 1.6 1.9-1.6 3.8-1.6M2.6 21c1.9 0 1.9-1.6 3.8-1.6s1.9 1.6 3.8 1.6 1.9-1.6 3.8-1.6 1.9 1.6 3.8 1.6 1.9-1.6 3.8-1.6M6.6 12.6V4.8l10.6 2.4v5.4"/>',
  gamepad: '<path d="M7.4 9.4h9.2a4.6 4.6 0 0 1 4.5 3.7l.7 3.6a2.3 2.3 0 0 1-4.1 1.8l-1.6-2.1H7.9l-1.6 2.1a2.3 2.3 0 0 1-4.1-1.8l.7-3.6a4.6 4.6 0 0 1 4.5-3.7z"/><path d="M6.6 12.2v2.4M5.4 13.4h2.4"/><circle cx="16" cy="12.8" r=".9"/><circle cx="17.8" cy="14.8" r=".9"/>',
  heart: ICON["Social Support"],
  sparkle: '<path d="M12 3.2l1.9 5.1 5.1 1.9-5.1 1.9L12 17.2l-1.9-5.1L5 10.2l5.1-1.9zM18.4 15.4l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9z"/>',
  baseball: '<circle cx="12" cy="12" r="9"/><path d="M6.2 5.4c2 2 3.2 4.2 3.2 6.6s-1.2 4.6-3.2 6.6M17.8 5.4c-2 2-3.2 4.2-3.2 6.6s1.2 4.6 3.2 6.6"/>'
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

const today = () => new Date().toISOString().slice(0,10);

/* Entries that must never reach the page, whatever the filters say:
   an expired Limited offer, or one with no verified date to stand behind. */
function publishable(d){
  if(!d.vd) return false;
  if(d.exp && d.exp < today()) return false;
  return true;
}

/* A seasonal offer that exists but can't be used yet — the Rams promo before
   the NFL season opens. It stays listed, but the card says so rather than
   implying you could go and use it this afternoon. */
const notYetOpen = d => !!d.starts && d.starts > today();

/* `n` stays a plain string, but a blank line inside it starts a new paragraph.
   Some entries carry a caveat that applies to a different reader than the rest
   of the note, and running it on to the end buries it. Each part is escaped on
   its own, so splitting can't be used to smuggle markup through. */
function notes(n){
  if(!n) return "";
  return String(n).split(/\n\s*\n/)
    .map(s => s.trim()).filter(Boolean)
    .map(s => `<p class="note">${esc(s)}</p>`).join("");
}

/* ---------- rendering ---------- */
function shortDate(s){
  const [y,m,dd] = s.split("-");
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[+m-1]} ${+dd}`;
}

function fmtDate(s){
  const [y,m,dd] = s.split("-");
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `Verified ${months[+m-1]} ${+dd}, ${y}`;
}

/* Brand marks, from Simple Icons (CC0-licensed SVG, simpleicons.org). Single
   filled paths in the brand's own colour, on a white badge so they read as
   logos rather than another category glyph. Trademarks belong to their owners;
   these identify whose offer a listing is, nothing more. */
const BRAND_ICON = {
  mcdonalds: {c:"#FBC817", d:"M17.243 3.006c2.066 0 3.742 8.714 3.742 19.478H24c0-11.588-3.042-20.968-6.766-20.968-2.127 0-4.007 2.81-5.248 7.227-1.241-4.416-3.121-7.227-5.231-7.227C3.031 1.516 0 10.888 0 22.476h3.014c0-10.763 1.658-19.47 3.724-19.47 2.066 0 3.741 8.05 3.741 17.98h2.997c0-9.93 1.684-17.98 3.75-17.98Z"},
  spotify: {c:"#1ED760", d:"M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"},
  apple: {c:"#000000", d:"M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"}
};

/* Brands whose mark is a file in img/logos/ rather than an inlined path —
   the ones Simple Icons doesn't carry. `fb` is the type icon to show until the
   file exists, or if it's missing or misnamed. Prefer an inlined path in
   BRAND_ICON when one is available; a file costs a request per card. */
const BRAND_FILE = {
  chipotle:     {fb:"bowl"},
  jackinthebox: {fb:"baseball"},
  pandaexpress: {fb:"baseball"},
  carlsjr:      {fb:"baseball"},
  mountaindew:  {fb:"baseball"},
  habitburger:  {fb:"baseball", ext:"png"},
  norms:        {fb:"utensils", ext:"png"},
  onohawaiianbbq:{fb:"bowl",    ext:"png"},
  ucla:         {fb:"apps", ext:"png"}   // ext skips the .svg probe and its 404
};

function lineIcon(key, cat, size){
  const paths = BENEFIT_ICON[key] || ICON[cat] || ICON.all;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.7" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

/* Resolved once at startup: ic -> usable URL, or null if no file is there.
   Probing up front rather than per card means a brand with no logo yet costs
   two requests for the whole session instead of two on every re-render. */
const logoSrc = {};

function tryLoad(src){
  return new Promise((ok, fail) => {
    const img = new Image();
    img.onload = () => ok(src);
    img.onerror = fail;
    img.src = src;
  });
}

function resolveLogos(){
  return Promise.all(Object.entries(BRAND_FILE).map(([key, cfg]) => {
    const exts = cfg.ext ? [cfg.ext] : ["svg","png"];
    return exts
      .reduce((chain, ext) => chain.catch(() => tryLoad(`img/logos/${key}.${ext}`)),
              Promise.reject())
      .then(src => { logoSrc[key] = src; })
      .catch(() => { logoSrc[key] = null; });
  }));
}

/* `ic` is optional — an entry without one still gets a sensible mark.
   A brand mark is filled and coloured; everything else is a navy line icon. */
function iconFor(d, size){
  const brand = BRAND_ICON[d.ic];
  if(brand){
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"
      fill="${brand.c}" aria-hidden="true"><path d="${brand.d}"/></svg>`;
  }
  if(BRAND_FILE[d.ic] && logoSrc[d.ic]){
    return `<img src="${esc(logoSrc[d.ic])}" alt="" width="${size}" height="${size}">`;
  }
  // No file yet — fall back to the type icon named in BRAND_FILE.
  const key = BRAND_FILE[d.ic] ? BRAND_FILE[d.ic].fb : d.ic;
  return lineIcon(key, d.c, size);
}
const isBrand = d => !!(BRAND_ICON[d.ic] || (BRAND_FILE[d.ic] && logoSrc[d.ic]));

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
  keepActiveTileInView();
  updateTileFades();
  syncHeadMetrics();   // the tiles just changed the sticky header's height
}

/* Which edge of the chip row still has chips behind it. Above 1024px the row
   is a grid and never overflows, so both come off and the fades never show. */
function updateTileFades(){
  const row = $("tiles");
  const bar = row && row.closest(".catbar");
  if(!bar) return;
  const max = row.scrollWidth - row.clientWidth;
  const slack = 2;                     // sub-pixel widths never land exactly
  const scrolls = max > slack;
  bar.classList.toggle("more-left",  scrolls && row.scrollLeft > slack);
  bar.classList.toggle("more-right", scrolls && row.scrollLeft < max - slack);
}

/* The row itself outlives every re-render — renderTiles() only replaces its
   children — so this binds once. */
(function watchTileScroll(){
  const row = $("tiles");
  if(!row) return;
  row.addEventListener("scroll", updateTileFades, {passive:true});
  addEventListener("resize", updateTileFades);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(updateTileFades);
})();

/* Below 1024px the tiles are one horizontally scrolling row, so the selected
   one can sit off-screen — on load from a shared link, or after picking a
   category further along the row. Nudge it back into view. Horizontal only:
   scrollIntoView() would also drag the page vertically. */
function keepActiveTileInView(){
  const row = $("tiles");
  const active = row.querySelector('.tile[aria-pressed="true"]');
  if(!active || row.scrollWidth <= row.clientWidth) return;
  /* Measured against the row's own box rather than offsetLeft: the tiles are
     position:relative and the sticky header is a positioned ancestor, so
     offsetParent isn't the scroller and offsetLeft measures from the wrong
     origin. Rect maths doesn't care what the offsetParent is. */
  const pad = 16;
  const rowBox = row.getBoundingClientRect();
  const box = active.getBoundingClientRect();
  const left = row.scrollLeft + (box.left - rowBox.left) - pad;
  const right = row.scrollLeft + (box.right - rowBox.left) + pad;
  if(left < row.scrollLeft){
    row.scrollTo({left});
  }else if(right > row.scrollLeft + row.clientWidth){
    row.scrollTo({left: right - row.clientWidth});
  }
}

/* The sticky header is a different height on every page and changes again when
   the top bar wraps on a phone, so anything that has to clear it reads this
   rather than a constant. Assigned by trackStickyHead(); a no-op on pages that
   have no sticky header. */
let syncHeadMetrics = () => {};

function trackStickyHead(){
  const head = document.querySelector(".stickyhead");
  if(!head) return;
  const root = document.documentElement;
  syncHeadMetrics = () => {
    root.style.setProperty("--stickyhead-h", head.offsetHeight + "px");
    /* On a phone the top bar wraps to three rows — brand, then nav, then
       search — and pinning all of it would hold a third of the screen. So the
       header is pulled up by exactly the height of the rows above the first
       one that has to stay, and that first one is the nav: the links are worth
       reaching from anywhere, and starting the pinned block with a bare search
       field reads as a fragment. Only the brand scrolls away.

       Measured to the nav's top rather than a constant, because the gap
       doesn't change as the header sticks — both move together — so it holds
       at any scroll position. Used only below 768px; above it the top bar is a
       single row, the nav sits in it, and the offset is nearly nothing. */
    const firstPinned = head.querySelector(".topnav") || head.querySelector(".search");
    let off = 0;
    if(firstPinned){
      off = firstPinned.getBoundingClientRect().top - head.getBoundingClientRect().top;
      /* Stop short by the row gap. Pulling up by the full distance lands the
         nav hard against the top edge, because the gap that was sitting above
         it scrolls away with the brand. Read rather than hard-coded so it
         tracks the stylesheet. */
      const rows = firstPinned.parentElement;
      const gap = rows ? parseFloat(getComputedStyle(rows).rowGap) : 0;
      off -= Number.isFinite(gap) ? gap : 0;
    }
    root.style.setProperty("--head-offset", Math.max(0, Math.round(off)) + "px");
  };
  /* Measured from the events that actually change the height rather than from
     a ResizeObserver alone: the tiles arrive with the catalog, so the header
     is ~70px shorter at first paint than it will be a moment later, and a
     stale reading leaves the sidebar tucked under the bar. renderTiles() calls
     this once the tiles are in. RO stays on as a backstop where it works — it
     is silently inert in some engines, which is why it can't be the only one. */
  syncHeadMetrics();
  addEventListener("resize", syncHeadMetrics);
  addEventListener("orientationchange", syncHeadMetrics);
  // Fonts land after first paint and change the wrapped height of the top bar.
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeadMetrics);
  if("ResizeObserver" in window) new ResizeObserver(syncHeadMetrics).observe(head);
}
trackStickyHead();

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
      <span class="cardhead">
        <span class="ic${isBrand(d)?" ic-brand":""}">${iconFor(d,19)}</span>
        <span class="provider">${esc(d.p)}</span>
      </span>
      <h3 class="title">${esc(d.t)}</h3>
      <span class="value">${esc(d.v)}</span>
      <span class="tagrow">
        <span class="tag elig">${esc(d.e)}</span>
        ${notYetOpen(d)
          ? `<span class="tag dur-soon">Starts ${shortDate(d.starts)}</span>`
          : `<span class="tag dur-${esc(d.d)}">${esc(d.d)}</span>`}
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
    <p class="cardhead"><span class="ic${isBrand(d)?" ic-brand":""}">${iconFor(d,21)}</span><span class="provider">${esc(d.p)}</span></p>
    <h2>${esc(d.t)}</h2>
    <p class="value">${esc(d.v)}</p>
    <dl class="kv">
      <dt>Who</dt><dd>${esc(d.e)}</dd>
      <dt>How to use</dt><dd>${esc(d.r)}</dd>
      <dt>Where</dt><dd>${esc(d.loc)}</dd>
      <dt>How long</dt><dd>${notYetOpen(d)?`Starts ${shortDate(d.starts)} · `:""}${esc(d.d)}${d.exp?` · ends ${esc(d.exp)}`:""}</dd>
      <dt>Category</dt><dd>${esc(d.c)}</dd>
    </dl>
    ${notes(d.n)}
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
   own close event, which not every engine fires reliably.

   `closing` exists because history.back() is asynchronous. The dialog's close
   event fires while that navigation is still in flight — at which point the
   URL still carries ?benefit= and history.state still holds the id, so both
   checks below pass and we would go back a *second* time, stepping past
   Browse to whatever the person was looking at before they arrived. */
let closing = false;

function closeSheet(){
  const dlg = $("sheet");
  if(dlg.open) dlg.close();
  if(syncing || closing) return;
  const inURL = new URLSearchParams(location.search).get("benefit");
  if(!inURL) return;
  const ours = history.state && history.state.benefit === inURL;
  state.benefit = null;
  if(ours){
    closing = true;
    // popstate clears this; the timer is a fallback in case it never arrives,
    // so a missed event can't leave the close button permanently dead.
    setTimeout(() => { closing = false; }, 500);
    history.back();
  }else{
    writeURL();
  }
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

addEventListener("popstate",()=>{ closing = false; syncSheetToURL(); });

/* ---------- load ---------- */
notice("Loading benefits…","One moment.");
fetch("data/benefits.json")
  .then(r=>{ if(!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r.json(); })
  .then(rows=>{
    DATA = rows.filter(publishable);
    return resolveLogos().then(()=>rows);   // know which logos exist before first paint
  })
  .then(()=>{
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
