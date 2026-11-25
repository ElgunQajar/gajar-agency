const root = document.body.dataset.root;
const page = document.body.dataset.page;
const whatsapp = GajarConfig.whatsapp;
const navItems = [
  ["index", "Ana səhifə"], ["paketler", "Paketlər"], ["xidmetler", "Xidmətlər"],
  ["elgun-gajar", "Elgün Gajar kimdir?"], ["keysler", "Keyslər"], ["faq", "FAQ"], ["bloq","Bloq"], ["elaqe", "Əlaqə"]
];
function pageLink([slug, label]) {
  const url = root + (slug === "index" ? "index.html" : "pages/" + slug + ".html");
  return `<a href="${url}" ${page === slug ? 'aria-current="page"' : ''}>${label}</a>`;
}
const iconPaths = {
  phone: '<path d="m7 3 3 5-2 2c1 3 3 5 6 6l2-2 5 3c-1 4-3 5-6 4C8 19 4 15 2.8 8 2 5 4 3 7 3Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
  wa: '<path d="M3 21l1.4-5A9 9 0 1 1 8 20Z"/><path d="M8 7c-2 3 3 9 7 9 1 0 2-1 2-2l-3-1-1 1c-2-1-3-2-3.5-3.5l1-1L9 7Z" fill="currentColor" stroke="none"/>',
  bot: '<rect x="3" y="7" width="18" height="13" rx="5"/><path d="M12 7V3m-4 9v2m8-2v2m-6 3h4"/>'
};
function icon(name) {
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]}</svg>`;
}
const menu = navItems.map(pageLink).join("");
const logo = `<a class="brand" href="${root}index.html"><img src="${root}img/logo-black.svg" alt="Gajar Agency — ana səhifə"></a>`;
document.querySelector("#header").innerHTML = `${logo}<nav aria-label="Əsas menyu">${menu}</nav>
<button class="menu-toggle" aria-label="Menyunu aç" aria-controls="mobile-menu" aria-expanded="false">☰</button>
<dialog id="mobile-menu" aria-label="Əsas menyu">
<a class="brand" href="${root}index.html"><img src="${root}img/logo-icon.svg" alt="Gajar Agency — ana səhifə"></a>
<button class="close" aria-label="Menyunu bağla">×</button><nav>${menu}</nav>
<div class="menu-social"><a class="cta" href="${whatsapp}">${icon("wa")} WhatsApp-a yaz</a>
<a class="social" href="https://www.instagram.com/gajar.agency/" aria-label="Instagram">${icon("instagram")}</a></div></dialog>`;
const dialog = document.querySelector("#mobile-menu");
const toggle = document.querySelector(".menu-toggle");
toggle.onclick = () => { dialog.showModal(); toggle.setAttribute("aria-expanded","true"); };
dialog.querySelector("button").onclick = () => dialog.close();
dialog.onclose = () => { toggle.setAttribute("aria-expanded","false"); toggle.focus(); };
matchMedia("(min-width: 1101px)").addEventListener("change", e => { if (e.matches && dialog.open) dialog.close(); });

const destination = encodeURIComponent("Jalə Plaza, Şamil Əzizbəyov küçəsi 140, Bakı");
const route = "https://www.google.com/maps/dir/?api=1&destination=" + destination;
const address = "Jalə Plaza, 3-cü mərtəbə, Şamil Əzizbəyov küç. 140, Nəsimi r-nu, Bakı";
const contacts = [
  ["Telefon", "+994 99 795 79 05", "tel:+994997957905", "phone"],
  ["WhatsApp", "+994 99 795 79 05", whatsapp, "wa"],
  ["E-poçt", GajarConfig.email, "mailto:"+GajarConfig.email, "mail"]
];
document.querySelector("footer").innerHTML = `
<div class="champagne footer-top"><div class="footer-grid">
<section><h2>Ünvan</h2><address>${address}</address><small>28 May metrosunun yaxınlığı</small>
<p>B.e.–Cümə 10:00–19:00<br>Şənbə, bazar: qeyri-iş günü.</p><a class="dark-btn" href="${route}" target="_blank" rel="noopener">Marşrut qur <svg class="arrow-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path transform="rotate(-45 12 12)" d="M4 12h15m-6-6 6 6-6 6"/></svg></a></section>
<section><h2>Əlaqə</h2>${contacts.filter(row=>row[1]).map(([label,value,url,symbol]) => `<a class="contact-row" href="${url}"><span><small>${label}</small>${value}</span><i>${icon(symbol)}</i></a>`).join("")}</section>
<section class="map"><h2>Ofisimiz xəritədə</h2><iframe title="Jalə Plaza, Bakı — Google xəritəsi" data-src="https://maps.google.com/maps?q=${destination}&amp;z=16&amp;output=embed" referrerpolicy="no-referrer-when-downgrade"></iframe></section>
</div></div>
<div class="champagne footer-bottom">${logo}<div><p>© 2026 Gajar Agency. Bütün hüquqlar qorunur.</p>
<nav aria-label="Alt menyu">${[navItems[1],["haqqimizda","Haqqımızda"],["mexfilik","Məxfilik siyasəti"]].map(pageLink).join("")}</nav></div>
<a class="social" href="https://www.instagram.com/gajar.agency/" aria-label="Gajar Agency Instagram hesabı">${icon("instagram")}</a></div>`;

const mapFrame = document.querySelector(".map iframe");
function loadOfficeMap() {
  mapFrame.src = mapFrame.dataset.src;
}
if ("IntersectionObserver" in window) {
  const footerObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    loadOfficeMap();
    footerObserver.disconnect();
  }, {rootMargin: "280px 0px"});
  footerObserver.observe(document.querySelector("#contacts"));
} else {
  loadOfficeMap();
}
