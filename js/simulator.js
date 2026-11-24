(() => {
  const root = document.querySelector("#simulator");
  if (!root) return;
  const ru = document.documentElement.lang === "ru";
  const t = (az, rus) => ru ? rus : az;
  const sectors = [
    t("Klinika", "Клиника"), t("Restoran", "Ресторан"), t("Onlayn mağaza", "Интернет-магазин"),
    t("Təhsil mərkəzi", "Учебный центр"), t("Xidmət biznesi", "Сфера услуг"), t("Digər", "Другое")
  ];
  const scenarios = [
    {
      request: t("Konsultasiyaya yazılmaq istəyirəm.", "Хочу записаться на консультацию."),
      prompt: t("Sizə hansı gün və saat aralığı uyğundur?", "Какой день и время вам удобны?"),
      detail: t("Çərşənbə axşamı günortadan sonra.", "Во вторник после обеда."),
      change: t("Konsultasiya üçün cümə axşamı səhər daha uyğundur.", "Для консультации лучше подойдёт утро четверга.")
    },
    {
      request: t("Şənbə axşamı dörd nəfərlik masa istəyirəm.", "Хочу столик на четверых на вечер субботы."),
      prompt: t("Saat neçədə gəlmək istəyirsiniz?", "К какому часу вы хотели бы прийти?"),
      detail: t("Saat 20:00-da.", "К 20:00."),
      change: t("Şənbə beş nəfər olacağıq. Masanı saat 21:00-a dəyişək.", "В субботу нас будет пятеро. Перенесём бронь на 21:00.")
    },
    {
      request: t("Çanta sifariş etmək istəyirəm.", "Хочу заказать сумку."),
      prompt: t("Hansı modeli və rəngi yoxlayaq?", "Какую модель и цвет проверить?"),
      detail: t("Kiçik ölçülü qara çanta.", "Маленькая сумка чёрного цвета."),
      change: t("Kiçik ölçülü bej çanta istəyirəm.", "Мне нужна маленькая сумка бежевого цвета.")
    },
    {
      request: t("Axşam ingilis dili qrupuna yazılmaq istəyirəm.", "Хочу записаться на вечерний курс английского."),
      prompt: t("Hansı səviyyədən başlamaq istəyirsiniz?", "С какого уровня вы хотите начать?"),
      detail: t("Sıfırdan başlayıram. Mənə axşam qrupu uyğundur.", "Начинаю с нуля. Мне подходит вечерняя группа."),
      change: t("Başlanğıc səviyyə üçün həftəsonu qrupuna üstünlük verirəm.", "Предпочитаю группу выходного дня для начинающих.")
    },
    {
      request: t("Usta çağırmaq istəyirəm.", "Хочу вызвать мастера."),
      prompt: t("Hansı iş görülməlidir və nə vaxt sizə uyğundur?", "Какая работа нужна и когда вам удобно?"),
      detail: t("Kran dəyişdirilməlidir. Sabah səhər evdəyəm.", "Нужно заменить кран. Буду дома завтра утром."),
      change: t("Kranı dəyişmək üçün sabah günortadan sonra gəlin.", "Для замены крана подойдёт завтра после обеда.")
    },
    {
      request: t("Xidmət haqqında məlumat istəyirəm.", "Хочу узнать об услуге."),
      prompt: t("Menecerə hansı istəyinizi çatdırım?", "Какой запрос передать менеджеру?"),
      detail: t("Mənə seçimləri və şərtləri yazın.", "Пришлите варианты и условия."),
      change: t("Yalnız fərdi xidmətin şərtləri maraqlıdır.", "Меня интересуют только условия индивидуального обслуживания.")
    }
  ];
  const firstQuestions = [
    t("Qəbula necə yazılım?", "Как записаться на приём?"),
    t("Şənbəyə masa sifariş edə bilərəm?", "Можно забронировать столик на субботу?"),
    t("Bu məhsulu necə sifariş edim?", "Как заказать этот товар?"),
    t("Axşam qrupu varmı?", "Есть ли вечерняя группа?"),
    t("Xidmət üçün necə müraciət edim?", "Как оставить заявку на услугу?"),
    t("Sifariş vermək üçün nə etməliyəm?", "Как оформить заказ?")
  ];

  const url = new URL(location.href);
  const chosen = url.searchParams.get("sector");
  let sector = chosen !== null && /^[0-5]$/.test(chosen) ? Number(chosen) : 3;
  let answer = new URLSearchParams(url.hash.slice(1)).get("answer") || "";
  if (!answer && url.searchParams.get("source") === "scan") {
    try { answer = sessionStorage.getItem("gajar-demo-answer") || ""; } catch { /* Storage may be disabled. */ }
  }
  answer = answer.trim().slice(0, 2000);
  let stage, request, details, record, recordDetails, recordStatus, activity;
  const el = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  function button(label, onClick, cls = "cta") {
    const b = el("button", label, cls);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }
  root.classList.add("simulator");
  const setup = el("form", "", "sim-setup");
  const sectorLabel = el("label", t("Biznes sahəsi", "Сфера бизнеса"));
  const select = el("select");select.name = "sector";
  sectors.forEach((s, i) => select.add(new Option(s, String(i))));
  select.value = String(sector);sectorLabel.append(select);
  const nameLabel = el("label", t("Biznesin adı (istəyə görə)", "Название бизнеса (необязательно)"));
  const nameInput = el("input");nameInput.name = "business";nameInput.maxLength = 60;
  function updatePlaceholder() { nameInput.placeholder = select.value === "3" ? "Gajar Academy" : sectors[Number(select.value)]; }
  updatePlaceholder();select.onchange = updatePlaceholder;nameLabel.append(nameInput);
  const start = el("button", t("Sınağa başla", "Начать пробный диалог"), "cta");
  setup.append(sectorLabel, nameLabel, start);root.append(setup);
  const work = el("div", "", "sim-work");work.hidden = true;root.append(work);
  const brand = el("h2");brand.tabIndex = -1;
  const note = el("p", t("Nümunə dialoqdur. Yazdıqlarınız yalnız bu ekranda işlənir.", "Это пробный диалог. Введённые сообщения обрабатываются только на этой странице."));
  const views = el("div", "", "sim-switch");
  const customer = el("section", "", "sim-phone");
  customer.id = "sim-customer";
  const manager = el("section", "", "sim-manager");manager.id = "sim-manager";
  const customerTitle = t("Müştərinin telefonu", "Телефон клиента");
  const managerTitle = t("Menecerin ekranı", "Экран менеджера");
  const switchers = [customerTitle, managerTitle].map((label,i) => {
    const b = button(label, () => changeView(i));
    b.setAttribute("aria-controls", i ? manager.id : customer.id);
    views.append(b);return b;
  });
  function changeView(i) {
    work.dataset.view = i ? "manager" : "customer";
    switchers.forEach((b,j) => b.setAttribute("aria-pressed", String(i === j)));
  }
  const log = el("div", "", "sim-log");log.setAttribute("role", "log");
  log.setAttribute("aria-label", customerTitle);log.tabIndex = 0;
  const form = el("form", "", "sim-composer");
  const fieldLabel = el("label", t("Mesajınız", "Ваше сообщение"));
  const input = el("textarea");input.name = "message";input.rows = 2;input.maxLength = 700;input.required = true;
  fieldLabel.append(input);
  const send = el("button", t("Göndər", "Отправить"), "cta");
  form.append(fieldLabel, send);
  const actions = el("div", "", "sim-actions");
  customer.append(el("h3", customerTitle),log,form,actions);
  manager.append(el("h3", managerTitle));
  const queue = el("div");queue.setAttribute("aria-live","polite");manager.append(queue);
  const confirm = button(t("Menecer kimi təsdiqlə", "Подтвердить как менеджер"), () => {
    if (stage !== "waiting") return;
    stage = "confirmed";
    recordStatus.textContent = t("Menecer təsdiqlədi", "Менеджер подтвердил");
    activity.textContent = t("Təsdiq mesajı müştərinin telefonunda göründü.", "Подтверждение появилось в переписке клиента.");
    bubble(t("Menecer son istəyinizi təsdiqlədi. Müraciətiniz qəbul olundu.", "Менеджер подтвердил ваш последний запрос. Заявка принята."));
    changeView(0);refreshControls();if (actions.firstElementChild) actions.firstElementChild.focus();
  });
  manager.append(confirm);
  const columns = el("div", "", "sim-columns");columns.append(customer,manager);
  const restart = button(t("Başqa biznesdə sına", "Попробовать с другим бизнесом"), () => {
    work.hidden = true;setup.hidden = false;select.focus();
  });
  work.append(brand,note,views,columns,restart);

  function bubble(text, fromCustomer=false) {
    const p = el("p", "", fromCustomer ? "sim-out" : "sim-in");
    p.append(el("strong", fromCustomer ? t("Siz", "Вы") : t("Köməkçi", "Помощник")), document.createTextNode(text));
    log.append(p);log.scrollTop = log.scrollHeight;
  }
  function makeRecord() {
    record = el("div", "", "sim-record");
    const title = sector === 1 ? t("Masa rezervi", "Бронь столика") : t("Müraciət kartı", "Карточка заявки");
    recordDetails = el("p");recordStatus = el("strong");activity = el("p");
    record.append(el("h4",title),recordStatus,recordDetails,activity);queue.replaceChildren(record);
  }
  function refreshControls() {
    const sc = scenarios[sector];
    actions.replaceChildren();
    const suggestion = {opening:sc.request, detail:sc.detail, change:sc.change}[stage];
    form.hidden = !suggestion;confirm.hidden = stage !== "waiting";
    if (suggestion) {
      input.placeholder = suggestion;
      actions.append(button(t("Nümunəni göndər", "Отправить пример"), () => submit(suggestion), "sim-quiet"));
    }
    if (stage === "waiting" || stage === "confirmed") {
      actions.append(button(t("Fikrini dəyiş", "Изменить запрос"), () => {
        stage = "change";refreshControls();
        bubble(t("Yenilənmiş istəyinizi bütün detalları ilə bir mesajda yazın.", "Опишите обновлённый запрос со всеми деталями в одном сообщении."));input.focus();
      }, "sim-quiet"));
    }
    if (stage === "waiting") actions.append(button(t("Menecerin gördüyünü göstər", "Посмотреть, что видит менеджер"), () => {
      changeView(1);confirm.focus();
    }));
  }
  function submit(text) {
    if (!text.trim()) {input.value = "";input.reportValidity();return;}
    bubble(text, true);input.value = "";
    if (stage === "opening") {
      request = text;bubble(scenarios[sector].prompt);stage = "detail";
    } else {
      const changed = stage === "change";
      details = changed ? text : request+" "+text;
      if (!record) makeRecord();
      recordDetails.textContent = details;
      recordStatus.textContent = t("Təsdiq gözləyir", "Ожидает подтверждения");
      activity.textContent = changed
        ? t("Eyni müraciətin detalları yeniləndi.", "Данные той же заявки обновлены.")
        : sector === 3 ? t("Google Sheets sətri hazırlandı. Telegram bildirişi üçün menecerə müraciətin mətni ötürüldü (nümunə).", "Подготовлена строка Google Sheets и уведомление менеджеру в Telegram с текстом заявки (пример).")
        : t("Müraciət menecerin siyahısına əlavə edildi.", "Заявка добавлена в список менеджера.");
      bubble(changed ? t("Dəyişikliyi eyni müraciətdə saxladım. Menecer təsdiqləyəcək.", "Изменения сохранены в той же заявке. Менеджер их подтвердит.")
        : t("İstəyinizi qeyd etdim və təsdiq üçün menecerə ötürdüm.", "Записал ваши пожелания и передал заявку менеджеру на подтверждение."));
      stage = "waiting";
    }
    refreshControls();
    if (form.hidden) actions.lastElementChild?.focus();else input.focus();
  }
  form.onsubmit = e => {e.preventDefault();submit(input.value.trim());};
  setup.onsubmit = e => {
    e.preventDefault();
    sector = Number(select.value);
    brand.textContent = nameInput.value.trim() || (sector === 3 ? "Gajar Academy" : sectors[sector]);
    stage = "opening";record = null;request = "";details = "";input.value = "";
    log.replaceChildren();
    if (answer && sector === Number(chosen) && chosen !== null) {
      bubble(firstQuestions[sector],true);bubble(answer);
    } else {
      bubble(t("Müraciətinizi yazın. İstəsəniz, aşağıdakı nümunəni göndərin.", "Напишите ваш запрос или отправьте предложенный пример."));
    }
    queue.replaceChildren(el("p",t("Müştəri istəyini dəqiqləşdirəndə müraciət burada görünəcək.", "Заявка появится здесь, когда клиент уточнит свои пожелания.")));
    changeView(0);refreshControls();setup.hidden = true;work.hidden = false;brand.focus();
  };
})();
