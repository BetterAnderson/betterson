/* Assembles mailto links at runtime from two halves held in data attributes,
   so no address sits in the markup as one harvestable string. Any element with
   data-u and data-d is upgraded; its contents are replaced with the address and
   its href set. Without this script the markup still reads as
   "name [at] domain", which a person can use and a scraper's regex won't match.

   Not armour — a harvester driving a real browser still gets it. It stops the
   ones that fetch HTML and pattern-match, which is most of them. */
document.querySelectorAll("[data-u][data-d]").forEach(function(el){
  var address = el.dataset.u + "@" + el.dataset.d;
  el.href = "mailto:" + address +
    (el.dataset.subject ? "?subject=" + encodeURIComponent(el.dataset.subject) : "");
  var slot = el.querySelector("[data-address]") || el;
  /* Built from nodes rather than a string so a <wbr> can sit after the @.
     In a narrow column an address is too long for one line, and without a
     break opportunity the browser splits it mid-word — "anderson.ucla.e du".
     This makes the @ the preferred place to wrap. */
  slot.textContent = "";
  slot.append(el.dataset.u + "@", document.createElement("wbr"), el.dataset.d);
});
