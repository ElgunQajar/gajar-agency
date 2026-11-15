(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const problem = document.querySelector("#problem");
  const field = problem.querySelector("input");
  const choices = [...document.querySelectorAll(".choices button")];
  function markChoice() {
    choices.forEach(button => button.setAttribute("aria-pressed", String(button.textContent === field.value)));
    field.setCustomValidity("");
    problem.parentElement.querySelector(".draft-link")?.remove();
  }
  choices.forEach(button => button.onclick = () => {
    field.value = button.textContent;
    markChoice();
    field.focus();
  });
  field.oninput = markChoice;
  problem.onsubmit = event => {
    event.preventDefault();
    if (!field.value.trim()) {
      field.setCustomValidity("Кратко опишите задачу.");
      field.reportValidity();
      return;
    }
    GajarLead.send(problem,{type:"problem",message:field.value.trim()},field.value.trim());
  };

  const questions = [
  [
    "Услуги",
    "Какие услуги вы предлагаете?",
    "Мы настраиваем чатботов, готовим видео и дизайн, ведём Meta Ads и автоматизируем маркетинг и бизнес-процессы."
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
    "Чатбот стоит 300 ₼ в месяц, ведение Meta Ads — 400 ₼. Контент доступен в пакетах."
  ],
  [
    "Реклама",
    "Входит ли рекламный бюджет в цену?",
    "Нет. Клиент оплачивает расходы на размещение рекламы отдельно."
  ],
  [
    "Офис",
    "Где находится офис и когда вы работаете?",
    "Баку, ул. Шамиля Азизбекова, 140, Jalə Plaza, 3-й этаж. Пн–пт 10:00–19:00."
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

    if (automatic && !reduced.matches && !hovering && !faqPanel.contains(document.activeElement) && faqVisible && !document.hidden) timer = setInterval(() => selectQuestion((current + 1) % questions.length), 8500);
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
  const people = document.querySelector(".people");
  const prev = document.querySelector("#prev");
  const next = document.querySelector("#next");
  function move(direction) {
    const stride = people.children[1].offsetLeft - people.children[0].offsetLeft;
    people.scrollBy({left: direction * stride, behavior: reduced.matches ? "instant" : "smooth"});
  }
  function updateArrows() {
    prev.disabled = people.scrollLeft <= 1;
    next.disabled = people.scrollLeft + people.clientWidth >= people.scrollWidth - 1;
  }
  prev.onclick = () => move(-1);
  next.onclick = () => move(1);
  people.onscroll = updateArrows;
  new ResizeObserver(updateArrows).observe(people);

  // Şəbəkə çipin mərkəzindən yayılır. Görünməyən hero animasiya işlətmir.
  const hero = document.querySelector(".hero");
  const canvas = hero.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let width, height, center, points;
  let visible = true;
  let frame = 0;
  let pointer = {x:0, y:0};
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const chip = (hero.querySelector(".showreel") || hero.querySelector(".phone-demo")).getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const scale = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale,0,0,scale,0,0);
    center = {x:chip.left + chip.width/2 - rect.left, y:chip.top + chip.height/2 - rect.top};
    points = Array.from({length:Math.min(100,Math.ceil(width * height / 10000))}, () => ({
      x:Math.random()*width,y:Math.random()*height,phase:Math.random()*6.28
    }));
    restart();
  }
  function draw(time) {
    frame = 0;
    const t = reduced.matches ? 0 : time / 10000;
    ctx.clearRect(0,0,width,height);
    const nodes = points.map(p => ({
      x:p.x+Math.sin(t+p.phase)*9+pointer.x*Math.cos(p.phase),
      y:p.y+Math.cos(t+p.phase)*9+pointer.y*Math.sin(p.phase)
    }));
    nodes.push(center);
    nodes.forEach((a,i) => {
      for (let j=i+1;j<nodes.length;j++) {
        const b=nodes[j], distance=Math.hypot(a.x-b.x,a.y-b.y);
        const reach=b===center ? 280 : 180;
        if(distance>=reach) continue;
        ctx.strokeStyle="rgba(222,173,87," + (1-distance/reach)*.44 + ")";
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
      ctx.fillStyle="#bc944fa8";ctx.beginPath();ctx.arc(a.x,a.y,1.7,0,Math.PI*2);ctx.fill();
    });
    if (!reduced.matches && visible && !document.hidden) frame=requestAnimationFrame(draw);
  }
  function restart() {
    cancelAnimationFrame(frame);
    if(visible && !document.hidden && points) draw(performance.now());
  }
  hero.onpointermove = e => {
    if(reduced.matches) return;
    const rect=hero.getBoundingClientRect();
    pointer={x:((e.clientX-rect.left)/width-.5)*10,y:((e.clientY-rect.top)/height-.5)*10};
  };
  hero.onpointerleave = () => {pointer={x:0,y:0};};
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry]) => {visible=entry.isIntersecting;restart();}).observe(hero);
  document.addEventListener("visibilitychange",restart);
  reduced.addEventListener("change",restart);
})();
