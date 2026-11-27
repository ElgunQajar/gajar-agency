(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const questions = [
  [
    "Xidmətlər",
    "Hansı xidmətləri təklif edirsiniz?",
    "İki əsas istiqamətimiz var. Avtomatlaşdırma sistemi müraciətləri, sifarişləri və hesabatları idarə edir. Marketinq sistemi kontent planını, video və dizaynı, Meta Ads kampaniyalarını və gələn müraciətlərin təhlilini birləşdirir."
  ],
  [
    "AI Chatbot",
    "AI chatbot necə işləyir?",
    "Müştəri Instagram və ya WhatsApp-da biznesinizə yazanda AI chatbot mesajı qəbul edir və günün istənilən vaxtında cavablandırır."
  ],
  [
    "Dil",
    "Chatbot Azərbaycan dilini başa düşür?",
    "Bəli. Chatbot müştərilərinizin Azərbaycan dilində yazdığı sualları başa düşür və həmin dildə cavab verir."
  ],
  [
    "Qurulum",
    "Chatbot nə qədər vaxta hazır olur?",
    "Qurulum pulsuzdur. AI chatbot 2–3 günə təhvil verilir."
  ],
  [
    "Paketlər",
    "Hansı paket mənə uyğundur?",
    "Yalnız kontent üçün START, kontent və reklam üçün PRO uyğundur. GAJAR paketinə bunlarla yanaşı AI chatbot da daxildir."
  ],
  [
    "Seçim",
    "Xidmətləri ayrıca almaq olar?",
    "AI chatbot ayda 300 ₼, Meta Ads idarəetməsi isə 300 ₼-dir. Video və dizayn yalnız paketlərdə təqdim olunur."
  ],
  [
    "Reklam",
    "Reklam büdcəsi qiymətə daxildirmi?",
    "Xeyr. Meta Ads üçün reklam büdcəsini müştəri ayrıca ödəyir."
  ],
  [
    "Ofis",
    "Ofisiniz haradadır və iş saatlarınız necədir?",
    "Bakı, Nəsimi rayonu, Şamil Əzizbəyov küçəsi 140, Jalə Plaza, 3-cü mərtəbə. B.e.–Cümə 11:00–20:00."
  ],
  [
    "İlk addım",
    "Necə başlayaq?",
    "Biznesinizin sahəsini və ehtiyacınızı WhatsApp-da bizə yazın. Uyğun xidmət və ya paketi birlikdə seçək."
  ]
];
  const buttons = [...document.querySelectorAll(".wheel button")];
  const faqPanel = document.querySelector(".faq");
  let hovering = false;
  let current = 0;
  let automatic = true;
  let faqVisible = false;
  let timer;
  function selectQuestion(index) {
    current = index;
    const [category, question, answer] = questions[index];
    document.querySelector("#category").textContent = category;
    document.querySelector("#question").textContent = question;
    document.querySelector("#answer").textContent = answer;
    document.querySelector("#count").textContent = String(index + 1).padStart(2,"0") + " / 09";
    buttons.forEach((button,i) => button.setAttribute("aria-pressed", String(i === index)));
  }
  function schedule() {
    clearInterval(timer);

    const running = automatic && !reduced.matches && !hovering && !faqPanel.contains(document.activeElement) && faqVisible && !document.hidden;
    faqPanel.classList.toggle("orbit-running", running);
    if (running) timer = setInterval(() => selectQuestion((current + 1) % questions.length), 8500);
  }
  buttons.forEach((button,i) => button.onclick = () => {automatic = false; selectQuestion(i); schedule();});
  faqPanel.onpointerenter = e => { hovering = e.pointerType !== "touch"; schedule(); };
  faqPanel.onpointerleave = () => { hovering = false; schedule(); };
  faqPanel.onfocusin = schedule;
  faqPanel.onfocusout = () => queueMicrotask(schedule);
  new IntersectionObserver(([entry]) => {faqVisible = entry.isIntersecting; schedule();}).observe(faqPanel);
  reduced.addEventListener("change", schedule);
  document.addEventListener("visibilitychange", schedule);
  selectQuestion(0);
  schedule();

  document.querySelectorAll(".track a").forEach(link => { link.innerHTML = icon(link.dataset.icon); });
})();
