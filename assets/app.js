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
    const out = document.querySelector("#out"), mail = document.querySelector("#mail");
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
      const to = "nocurvefit@proton.me", su = encodeURIComponent("Strategy test: " + (f.name || "my strategy")), body = encodeURIComponent(out.textContent);
      mail.href = `mailto:${to}?subject=${su}&body=${body}`;
      document.querySelector("#gmail").href = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
      document.querySelector("#outlook").href = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}&body=${body}`;
    };
    form.addEventListener("input", build);
    build();
    const copy = (btn, text, label) => navigator.clipboard.writeText(text).then(() => { btn.textContent = "Copied"; setTimeout(() => btn.textContent = label, 1500); });
    document.querySelector("#copy").addEventListener("click", e => copy(e.target, out.textContent, "Copy text"));
    document.querySelector("#copymail").addEventListener("click", e => copy(e.target, "nocurvefit@proton.me", "Copy address"));
  }
});
