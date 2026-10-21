// NoCurveFit site behaviour: mobile menu, table sort and filters, the strategy message builder.
document.addEventListener("DOMContentLoaded", () => {
  const burger = document.querySelector(".burger"), nav = document.querySelector(".nav");
  if (burger) burger.addEventListener("click", () => nav.classList.toggle("open"));

  // filter tabs: <div class="tabs" data-target="tableId"><button data-f="Classic">
  document.querySelectorAll(".tabs[data-target]").forEach(tabs => {
    const rows = [...document.querySelectorAll(`#${tabs.dataset.target} tbody tr`)];
    tabs.querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
      tabs.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
      rows.forEach(r => { r.style.display = (!b.dataset.f || r.dataset.f === b.dataset.f) ? "" : "none"; });
    }));
  });

  // sortable columns: <th class="sort"> and <td data-v="number">
  document.querySelectorAll("table.sortable").forEach(t => {
    t.querySelectorAll("th.sort").forEach((th, _) => th.addEventListener("click", () => {
      const i = [...th.parentNode.children].indexOf(th), body = t.tBodies[0];
      const dir = th.dataset.dir === "desc" ? "asc" : "desc";
      t.querySelectorAll("th.sort").forEach(x => delete x.dataset.dir);
      th.dataset.dir = dir;
      const val = r => { const c = r.children[i]; const v = c.dataset.v; return v !== undefined ? parseFloat(v) : c.textContent.trim().toLowerCase(); };
      [...body.rows].sort((a, b) => { const x = val(a), y = val(b); return (x > y ? 1 : x < y ? -1 : 0) * (dir === "asc" ? 1 : -1); })
        .forEach(r => body.appendChild(r));
    }));
  });

  // strategy message builder (submit page)
  const form = document.querySelector("#builder");
  if (form) {
    const out = document.querySelector("#out");
    const build = () => {
      const f = Object.fromEntries(new FormData(form).entries());
      const lines = [
        `Strategy: ${f.name || "(no name)"}`,
        `Entry: ${f.entry || "-"}`,
        `Exit: ${f.exit || "-"}`,
        `Stop-loss / take-profit: ${f.stops || "none"}`,
        `Chart: ${f.tf}`,
        `Direction: ${f.dir}`,
        `Coins: ${f.coins || "default 10 (BTC, ETH, SOL, XRP, BNB, DOGE, HYPE, LINK, AVAX, SUI)"}`,
      ];
      if (f.notes) lines.push(`Notes: ${f.notes}`);
      out.textContent = lines.join("\n");
      if (f.contact) out.textContent += `\nSend the report to: ${f.contact}`;
    };
    form.addEventListener("input", build);
    build();
    const copy = (btn, text, label) => navigator.clipboard.writeText(text).then(() => { btn.textContent = "Copied"; setTimeout(() => btn.textContent = label, 1500); });
    document.querySelector("#copy").addEventListener("click", e => copy(e.target, out.textContent, "Copy text"));
    // "Send strategy": posted straight to our inbox through FormSubmit (no email app needed on the visitor's side)
    const send = document.querySelector("#send"), status = document.querySelector("#status");
    send.addEventListener("click", async () => {
      const f = Object.fromEntries(new FormData(form).entries());
      if (f._honey) return;
      if (!f.entry || !f.exit) { status.innerHTML = '<span class="dn">Please fill in the entry and exit rule.</span>'; return; }
      if (!f.contact) { status.innerHTML = '<span class="dn">Please tell us where to send your report.</span>'; return; }
      send.disabled = true; send.textContent = "Sending..."; status.textContent = "";
      const payload = { _subject: "Strategy test: " + (f.name || "website form"), _template: "box", _captcha: "false",
        strategy: f.name, entry: f.entry, exit: f.exit, stops: f.stops, chart: f.tf, direction: f.dir, coins: f.coins, notes: f.notes,
        send_report_to: f.contact, full_message: out.textContent };
      if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.contact)) payload._replyto = f.contact;
      try {
        const r = await fetch("https://formsubmit.co/ajax/nocurvefit@proton.me", { method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) });
        const j = await r.json();
        if (r.ok && String(j.success) === "true") {
          status.innerHTML = '<span class="up">Sent. Your report will be sent to ' + f.contact.replace(/[<>&"]/g, "") + " within 24 hours.</span>";
          send.textContent = "Sent";
        } else { throw new Error(j.message || "failed"); }
      } catch (err) {
        status.innerHTML = '<span class="dn">Could not send right now. Copy the text and DM us on X instead.</span>';
        send.disabled = false; send.textContent = "Send strategy";
      }
    });
  }
});
