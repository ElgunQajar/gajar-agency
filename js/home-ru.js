(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const questions = [
  [
    "Услуги",
    "Какие услуги вы предлагаете?",
    "У нас два основных направления. Система автоматизации обрабатывает обращения, заказы и отчёты. Система маркетинга объединяет контент-план, видео, дизайн, кампании Meta Ads и анализ входящих обращений."
  ],
  [
    "Чатбот",
    "Как работает чатбот?",
    "Клиент пишет в Instagram или WhatsApp, а бот отвечает прямо в переписке в любое время суток."
  ],
  [
    "Язык",
    "Бот понимает азербайджанский?",
    "Да. Он умеет отвечать на вопросы клиентов на азербайджанском языке."
  ],
  [
    "Запуск",
    "Сколько времени занимает настройка?",
    "Настройка бесплатная. Чатбот готов за 2–3 дня."
  ],
  [
    "Пакеты",
    "Как выбрать пакет?",
    "START — для контента, PRO — для контента и рекламы. В GAJAR также входит чатбот."
  ],
  [
    "Отдельные услуги",
    "Можно заказать услуги отдельно?",
    "Чатбот стоит 300 ₼ в месяц, ведение Meta Ads — 300 ₼. Контент доступен в пакетах."
  ],
  [
    "Реклама",
    "Входит ли рекламный бюджет в цену?",
    "Нет. Клиент оплачивает расходы на размещение рекламы отдельно."
  ],
  [
    "Офис",
    "Где находится офис и когда вы работаете?",
    "Баку, ул. Шамиля Азизбекова, 140, Jalə Plaza, 3-й этаж. Пн–пт 11:00–20:00."
  ],
  [
    "Первый шаг",
    "С чего начать?",
    "Расскажите в WhatsApp о своём бизнесе и задаче. Мы поможем подобрать услугу или пакет."
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
