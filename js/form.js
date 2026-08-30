/* Add a benefit — submission form.
   Five fields: the link, who you are, and whether to credit you. Nothing that
   describes the benefit is asked for, because a working link tells us all of
   it and asking cost us submissions. Validation runs on blur and on submit,
   never on every keystroke: correcting someone mid-word is hostile. Errors sit
   against the field they belong to. */

/* Supabase. The publishable key belongs in client code — it is an identifier,
   not a credential. What protects the data is Row Level Security: the policy
   allows insert and nothing else, so this key cannot read a single submission
   back. Never disable RLS, and never put the service_role key here.
   Schema and policies: docs/supabase-setup.sql */
const SUPABASE_URL  = "https://fkdpzjloiyapjtkmefyq.supabase.co";
const SUPABASE_KEY  = "sb_publishable_bjzmnzdQB5R7qmtvOJkDjw_x403CFZu";

const ALLOWED_DOMAINS = ["@anderson.ucla.edu", "@g.ucla.edu", "@ucla.edu"];
const RATE_LIMIT_MS   = 60 * 1000;
const RATE_KEY        = "betterson:lastSubmit";

const form = document.getElementById("benefitForm");
const $ = id => document.getElementById(id);
const val = id => ($(id)?.value || "").trim();
const radio = name => form.querySelector(`input[name="${name}"]:checked`)?.value || "";
const escapeHtml = s => String(s ?? "")
  .replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* Wire each control to its hint and its error message, so a screen reader
   announces "Submissions need a UCLA address…" and not just the label. Errors
   stay in aria-describedby even while hidden — assistive tech skips hidden
   nodes. */
form.querySelectorAll(".field").forEach(box => {
  const input = box.querySelector("input:not([type=radio]), select, textarea");
  if(!input || !input.id) return;
  const ids = [];
  const hint = box.querySelector(":scope > .hint");
  if(hint){
    hint.id = hint.id || `${input.id}-hint`;
    ids.push(hint.id);
  }
  const err = box.querySelector(":scope > .fielderr");
  if(err) ids.push(err.id);
  if(ids.length) input.setAttribute("aria-describedby", ids.join(" "));
});

/* ---------- error plumbing ---------- */
function fieldOf(id){
  return $(id)?.closest(".field") || null;
}
function setError(id, message){
  const err = $(`${id}-err`);
  const box = fieldOf(id);
  const input = $(id);
  if(!err) return;
  if(message){
    err.textContent = message;
    err.hidden = false;
    box?.classList.add("invalid");
    input?.setAttribute("aria-invalid","true");
  }else{
    err.hidden = true;
    box?.classList.remove("invalid");
    input?.removeAttribute("aria-invalid");
  }
}
function clearAllErrors(){
  form.querySelectorAll(".fielderr").forEach(e => e.hidden = true);
  form.querySelectorAll(".field.invalid").forEach(e => e.classList.remove("invalid"));
  form.querySelectorAll("[aria-invalid]").forEach(e => e.removeAttribute("aria-invalid"));
  $("f-formerr").hidden = true;
}

/* ---------- per-field checks ---------- */
const CHECKS = {
  "f-link": () => {
    const v = val("f-link");
    if(!v) return "Paste the link. It's the one thing we can't work out ourselves.";
    try{
      const u = new URL(v);
      if(u.protocol !== "http:" && u.protocol !== "https:") throw 0;
    }catch(e){
      return "That doesn't look like a web address. It should start with https://";
    }
    return null;
  },

  "f-first": () => val("f-first") ? null
    : "Add your first name.",

  "f-initial": () => {
    const v = val("f-initial");
    if(!v) return "Add your last initial.";
    if(!/^[A-Za-z]$/.test(v)) return "One letter only.";
    return null;
  },

  "f-email": () => {
    const v = val("f-email");
    if(!v) return "Add your UCLA email so we can tell where this came from.";
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "That doesn't look like an email address.";
    const lower = v.toLowerCase();
    if(!ALLOWED_DOMAINS.some(d => lower.endsWith(d)))
      return "Submissions need a UCLA address — @anderson.ucla.edu, @g.ucla.edu, or @ucla.edu. This helps us check where a benefit came from.";
    return null;
  }
};

const RADIO_CHECKS = {
  "f-credit": () => radio("credit") ? null
    : "Choose whether to be credited."
};

function setRadioError(key, message){
  const err = $(`${key}-err`);
  if(!err) return;
  err.hidden = !message;
  if(message) err.textContent = message;
}

/* ---------- live helpers ---------- */
/* Show the credit line exactly as it will appear, so the choice is concrete. */
function updateCreditPreview(){
  const choice = radio("credit");
  const el = $("f-creditpreview");
  if(!choice){ el.hidden = true; return; }
  const first = val("f-first");
  const initial = val("f-initial").toUpperCase();
  const name = (first && initial) ? escapeHtml(`${first} ${initial}.`) : "your name";
  el.innerHTML = choice === "yes"
    ? `Your listing will read <b>Added by ${name}</b>`
    : `Your listing will read <b>Added by a fellow Bruin</b>`;
  el.hidden = false;
}
form.querySelectorAll('input[name="credit"]').forEach(r => {
  r.addEventListener("change", () => { setRadioError("f-credit", null); updateCreditPreview(); });
});
["f-first","f-initial"].forEach(id => $(id).addEventListener("input", updateCreditPreview));

/* Validate on blur — and once a field is showing an error, clear it as soon as
   the person starts fixing it rather than making them wait for another blur. */
Object.keys(CHECKS).forEach(id => {
  const el = $(id);
  if(!el) return;
  el.addEventListener("blur", () => setError(id, CHECKS[id]()));
  el.addEventListener("input", () => {
    if(fieldOf(id)?.classList.contains("invalid") && !CHECKS[id]()) setError(id, null);
  });
});

/* ---------- submit ---------- */
function validateAll(){
  const bad = [];
  for(const id of Object.keys(CHECKS)){
    const msg = CHECKS[id]();
    setError(id, msg);
    if(msg) bad.push($(id));
  }
  for(const key of Object.keys(RADIO_CHECKS)){
    const msg = RADIO_CHECKS[key]();
    setRadioError(key, msg);
    if(msg) bad.push($(`${key}-err`).closest(".field").querySelector("input"));
  }
  // Report in document order so focus lands on the first problem, not the last.
  bad.sort((a,b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  return bad;
}

/* The row as the database wants it. The columns describing the benefit are
   left out entirely rather than sent as nulls — the form no longer asks, and
   an absent column is the honest way to say so. `status` and `trusted` are
   absent on purpose too: the column grant excludes them, so a submission can't
   arrive pre-approved or self-promoted up the queue. */
function payload(){
  return {
    link:         val("f-link"),
    first_name:   val("f-first"),
    last_initial: val("f-initial").toUpperCase(),
    email:        val("f-email").toLowerCase(),
    credit:       radio("credit") === "yes"
  };
}

const sbHeaders = extra => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  ...extra
});

/* Production would still need the email domain re-checked server-side and a
   confirmation email sent; a check that runs in the browser is bypassable. */
async function submitBenefit(row){
  const res = await fetch(`${SUPABASE_URL}/rest/v1/benefit_submissions`, {
    method: "POST",
    headers: sbHeaders({"Content-Type": "application/json", Prefer: "return=minimal"}),
    body: JSON.stringify(row)
  });
  if(!res.ok) throw new Error(`insert ${res.status}: ${await res.text()}`);
}

function showSuccess(row){
  form.hidden = true;
  document.querySelector(".formintro")?.remove();
  const box = $("formSuccess");
  const credited = row.credit
    ? `${row.first_name} ${row.last_initial}.`
    : "a fellow Bruin";
  box.innerHTML = `
    <h2>Thanks — we've got it.</h2>
    <p>We'll open that link, check the offer against it, and add it if it holds up.
       That usually takes a few days, and we'll email you at ${escapeHtml(row.email)} either way.</p>
    <dl>
      <dt>Link</dt>
      <dd><a href="${escapeHtml(row.link)}" target="_blank" rel="noopener">${escapeHtml(row.link)}</a></dd>
      <dt>Credit</dt>
      <dd>Added by ${escapeHtml(credited)}</dd>
    </dl>
    <p><a href="index.html">Back to browsing</a></p>`;
  box.hidden = false;
  box.focus();
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  clearAllErrors();

  // Honeypot: only automated fillers ever touch this. Look successful, store nothing.
  if(val("website")){ showSuccess(payload()); return; }

  const since = Date.now() - (+localStorage.getItem(RATE_KEY) || 0);
  if(since < RATE_LIMIT_MS){
    const wait = Math.ceil((RATE_LIMIT_MS - since) / 1000);
    const note = $("f-formerr");
    note.textContent = `You've just sent one through. Give it ${wait} more seconds.`;
    note.hidden = false;
    return;
  }

  const bad = validateAll();
  if(bad.length){
    const note = $("f-formerr");
    note.textContent = bad.length === 1
      ? "One field needs a look before this can go."
      : `${bad.length} fields need a look before this can go.`;
    note.hidden = false;
    bad[0].focus();
    bad[0].scrollIntoView({behavior:"smooth", block:"center"});
    return;
  }

  const btn = $("f-submit");
  btn.disabled = true;
  btn.textContent = "Sending…";
  const row = payload();
  try{
    await submitBenefit(row);
    try{ localStorage.setItem(RATE_KEY, String(Date.now())); }catch(e){}
    showSuccess(row);
  }catch(err){
    console.error("[betterson]", err);
    btn.disabled = false;
    btn.textContent = "Submit benefit";
    const note = $("f-formerr");
    note.textContent = "That didn't send. Check your connection and try again.";
    note.hidden = false;
  }
});
