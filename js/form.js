/* Add a benefit — submission form.
   Validation runs on blur and on submit, never on every keystroke: correcting
   someone mid-word is hostile. Errors sit against the field they belong to. */

/* Supabase. The publishable key belongs in client code — it is an identifier,
   not a credential. What protects the data is Row Level Security: the policy
   allows insert and nothing else, so this key cannot read a single submission
   back. Never disable RLS, and never put the service_role key here.
   Schema and policies: docs/supabase-setup.sql */
const SUPABASE_URL  = "https://fkdpzjloiyapjtkmefyq.supabase.co";
const SUPABASE_KEY  = "sb_publishable_bjzmnzdQB5R7qmtvOJkDjw_x403CFZu";
const PHOTO_BUCKET  = "submission-photos";

const ALLOWED_DOMAINS = ["@anderson.ucla.edu", "@g.ucla.edu", "@ucla.edu"];
const WORD_LIMIT      = 200;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES     = ["image/jpeg","image/png","image/heic","image/heif"];
const RATE_LIMIT_MS   = 60 * 1000;
const RATE_KEY        = "betterson:lastSubmit";

const form = document.getElementById("benefitForm");
const $ = id => document.getElementById(id);
const val = id => ($(id)?.value || "").trim();
const radio = name => form.querySelector(`input[name="${name}"]:checked`)?.value || "";
const words = s => s.split(/\s+/).filter(Boolean).length;
const today = () => new Date().toISOString().slice(0,10);
const escapeHtml = s => String(s ?? "")
  .replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* Wire each control to its hint and its error message, so a screen reader
   announces "Photos need to be JPG…" and not just the label. Errors stay in
   aria-describedby even while hidden — assistive tech skips hidden nodes. */
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

/* ---------- per-field checks ----------
   Only the link and who you are are required. Everything about the benefit is
   optional — with a working link we can fill the rest in ourselves, and asking
   a student to do it was costing two minutes and losing submissions. Optional
   fields are still format-checked once someone actually fills one in. */
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
  },

  /* --- everything below is optional --- */

  "f-description": () => {
    const v = val("f-description");
    if(!v) return null;
    const n = words(v);
    if(n > WORD_LIMIT) return `That's ${n} words. Trim it to ${WORD_LIMIT} or fewer.`;
    return null;
  },

  "f-end": () => {
    if(radio("duration") !== "Limited") return null;
    const v = val("f-end");
    if(!v) return "You picked Limited — either add the end date or choose \u201cNot sure\u201d.";
    if(v < today()) return "That date has already passed. Check it, or pick \u201cNot sure\u201d above.";
    return null;
  },

  "f-photo": () => {
    const file = $("f-photo").files[0];
    if(!file) return null;
    if(!PHOTO_TYPES.includes(file.type))
      return "Photos need to be JPG, PNG or HEIC.";
    if(file.size > MAX_PHOTO_BYTES)
      return `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 10MB.`;
    return null;
  }
};

/* Only the credit choice is still a required radio. Duration and "have you
   used it" are optional now, so they report nothing when left blank. */
const RADIO_CHECKS = {
  "f-credit": () => radio("credit") ? null
    : "Choose whether to be credited. Either answer is fine."
};

function setRadioError(key, message){
  const err = $(`${key}-err`);
  if(!err) return;
  err.hidden = !message;
  if(message) err.textContent = message;
}

/* ---------- live helpers ---------- */
const descEl = $("f-description");
descEl.addEventListener("input", () => {
  const n = words(descEl.value.trim());
  const c = $("f-wordcount");
  c.textContent = `${n} of ${WORD_LIMIT} words`;
  c.classList.toggle("over", n > WORD_LIMIT);
});

/* Limited is the only duration that needs an end date, so only it reveals one. */
form.querySelectorAll('input[name="duration"]').forEach(r => {
  r.addEventListener("change", () => {
    const limited = radio("duration") === "Limited";
    $("f-endwrap").hidden = !limited;
    if(!limited) setError("f-end", null);
    setRadioError("f-duration", null);
  });
});

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
form.querySelectorAll('input[name="used"]').forEach(r => {
  r.addEventListener("change", () => setRadioError("f-used", null));
});

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
$("f-photo").addEventListener("change", () => setError("f-photo", CHECKS["f-photo"]()));

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

/* The row as the database wants it. `status` and `trusted` are absent on
   purpose — the column grant excludes them, so a submission can't arrive
   pre-approved or self-promoted up the queue. */
function payload(){
  const orNull = v => v || null;   // "" would fail the column's length check
  return {
    link:            val("f-link"),
    first_name:      val("f-first"),
    last_initial:    val("f-initial").toUpperCase(),
    email:           val("f-email").toLowerCase(),
    credit:          radio("credit") === "yes",
    name:            orNull(val("f-name")),
    provider:        orNull(val("f-provider")),
    category:        orNull(val("f-category")),
    description:     orNull(val("f-description")),
    eligibility:     orNull(val("f-eligibility")),
    duration:        orNull(radio("duration")),
    ends:            radio("duration") === "Limited" ? orNull(val("f-end")) : null,
    where_used:      orNull(val("f-where")),
    used_personally: orNull(radio("used")),
    redeem:          orNull(val("f-redeem")),
    photo_path:      null
  };
}

const sbHeaders = extra => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  ...extra
});

/* Photos go to a private bucket. The path is random rather than the original
   filename — people name things after themselves. */
async function uploadPhoto(file){
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${crypto.randomUUID()}.${ext || "jpg"}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${PHOTO_BUCKET}/${path}`, {
    method: "POST",
    headers: sbHeaders({"Content-Type": file.type, "x-upsert": "false"}),
    body: file
  });
  if(!res.ok) throw new Error(`photo ${res.status}: ${await res.text()}`);
  return path;
}

/* Production would still need the email domain re-checked server-side and a
   confirmation email sent; a check that runs in the browser is bypassable. */
async function submitBenefit(row, file){
  if(file) row.photo_path = await uploadPhoto(file);
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
  // Only the link is guaranteed; show whatever else they chose to give.
  const rows = [
    ["Link", `<a href="${escapeHtml(row.link)}" target="_blank" rel="noopener">${escapeHtml(row.link)}</a>`],
    row.name     && ["Benefit", escapeHtml(row.name)],
    row.provider && ["Provider", escapeHtml(row.provider)],
    row.category && ["Category", escapeHtml(row.category)],
    ["Credit", `Added by ${escapeHtml(credited)}`]
  ].filter(Boolean);
  box.innerHTML = `
    <h2>Thanks — we've got it.</h2>
    <p>We'll open that link, check the offer against it, and add it if it holds up.
       That usually takes a few days, and we'll email you at ${escapeHtml(row.email)} either way.</p>
    <dl>${rows.map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
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
    await submitBenefit(row, $("f-photo").files[0] || null);
    try{ localStorage.setItem(RATE_KEY, String(Date.now())); }catch(e){}
    showSuccess(row);
  }catch(err){
    console.error("[betterson]", err);
    btn.disabled = false;
    btn.textContent = "Submit benefit";
    const note = $("f-formerr");
    note.textContent = String(err).includes("photo")
      ? "The photo didn't upload. Try a smaller file, or remove it and send the rest."
      : "That didn't send. Check your connection and try again.";
    note.hidden = false;
  }
});
