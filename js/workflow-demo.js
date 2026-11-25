(() => {
  const ru = document.documentElement.lang === "ru";
  const t = (az, rus) => ru ? rus : az;
  const picker = document.querySelector("[data-picker]");
  const workspace = document.querySelector("[data-workspace]");
  const scenarios = [
    {
      name: t("Instagram müraciəti", "Заявка из Instagram"),
      question: t("Müştəri nə yazır?", "Что написал клиент?"),
      options: [
        {
          input: t("Axşam qrupuna necə yazılım?", "Как записаться в вечернюю группу?"),
          steps: [
            t("Instagram mesajı qəbul edildi.", "Получено сообщение из Instagram."),
            t("Bot axşam qrupu üçün qeydiyyat istəyini müəyyənləşdirdi.", "Бот распознал запрос на запись в вечернюю группу."),
            t("Google Sheets sətrinə qrupun adı və müraciət statusu yazıldı. Menecerə bildiriş göndərildi.", "В строку Google Sheets внесены группа и статус. Менеджеру отправлено уведомление.")
          ],
          result: t("Google Sheets · Axşam qrupu — menecerin cavabı gözlənilir.", "Google Sheets · Вечерняя группа — ожидается ответ менеджера.")
        },
        {
          input: t("Fərdi dərs üçün endirim edə bilərsiniz?", "Сделаете скидку на индивидуальные занятия?"),
          steps: [
            t("Instagram mesajı qəbul edildi.", "Получено сообщение из Instagram."),
            t("Bot endirim istəyini müəyyənləşdirdi. Təsdiqlənmiş tarifdə belə endirim yoxdur.", "Бот распознал просьбу о скидке. В утверждённом тарифе такой скидки нет."),
            t("Sual menecerə ötürüldü. Müştəriyə menecerin cavab verəcəyi bildirildi.", "Вопрос передан менеджеру. Клиенту сообщили, что менеджер ответит.")
          ],
          result: t("Google Sheets · Fərdi dərs — endirim barədə qərar gözlənilir.", "Google Sheets · Индивидуальные занятия — решение по скидке ожидается.")
        }
      ]
    },
    {
      name: t("Sifariş və anbar", "Заказ и склад"),
      question: t("Anbarda məhsul varmı?", "Есть ли товар на складе?"),
      options: [
        {
          input: t("Məhsul mövcuddur", "Товар есть в наличии"),
          steps: [
            t("Sifariş forması qəbul edildi.", "Получена форма заказа."),
            t("Sistem məhsul kodunu anbar cədvəlində tapdı və qalıq olduğunu yoxladı.", "Система нашла код товара в складской таблице и проверила остаток."),
            t("Sifariş qeydə alındı və anbar əməkdaşına yığım tapşırığı yaradıldı.", "Заказ зарегистрирован, сотруднику склада поставлена задача на сборку.")
          ],
          result: t("Sifariş cədvəli · Yığıma hazırdır.", "Таблица заказов · Готов к сборке.")
        },
        {
          input: t("Məhsul bitib", "Товар закончился"),
          steps: [
            t("Sifariş forması qəbul edildi.", "Получена форма заказа."),
            t("Anbar cədvəlində qalıq sıfırdır. Sifarişin yığıma ötürülməsi dayandırıldı.", "Остаток в складской таблице равен нулю. Передача на сборку остановлена."),
            t("Satış əməkdaşına alternativ məhsulu dəqiqləşdirmək üçün tapşırıq yaradıldı.", "Сотруднику отдела продаж поставлена задача уточнить подходящую замену.")
          ],
          result: t("Sifariş cədvəli · Alternativ məhsul təklifi gözlənilir.", "Таблица заказов · Ожидается предложение замены.")
        }
      ]
    },
    {
      name: t("Meta Ads nəzarəti", "Контроль Meta Ads"),
      question: t("Nümunə kampaniyada nə baş verib?", "Что произошло в демонстрационной кампании?"),
      options: [
        {
          input: t("Müraciət xərci hədəfdən yuxarıdır", "Стоимость обращения выше цели"),
          steps: [
            t("Həftəlik reklam hesabatı oxundu.", "Прочитан недельный отчёт по рекламе."),
            t("Bir müraciətin xərci razılaşdırılmış həddi keçir.", "Стоимость обращения превышает согласованный предел."),
            t("Təklif hazırdır: büdcə sabit qalsın, bir yeni reklam mətni sınağa hazırlansın.", "Предложение готово: сохранить бюджет и подготовить новый текст объявления к тесту.")
          ],
          approval: t("Nümunə tapşırığa yeni reklam mətninin hazırlanması əlavə edildi.", "В демонстрационный план добавлена подготовка нового текста объявления.")
        },
        {
          input: t("Reklama xərc gedib, müraciət görünmür", "Расход есть, обращений не видно"),
          steps: [
            t("Həftəlik reklam hesabatı oxundu.", "Прочитан недельный отчёт по рекламе."),
            t("Xərc qeydə alınıb, hesabatda müraciət yoxdur.", "Расход зафиксирован, в отчёте нет обращений."),
            t("Təklif hazırdır: test müraciəti göndərməklə ölçməni yoxlayaq.", "Предложение готово: проверить учёт с помощью тестовой заявки.")
          ],
          approval: t("Nümunə tapşırığa ölçmənin yoxlanılması əlavə edildi.", "В демонстрационный план добавлена проверка учёта заявок.")
        }
      ]
    }
  ];

  function element(tag, contents, className) {
    const node = document.createElement(tag);
    if (contents) node.textContent = contents;
    if (className) node.className = className;
    return node;
  }

  function button(label, highlighted = false) {
    const node = element("button", label, highlighted ? "cta gold" : "cta");
    node.type = "button";
    return node;
  }

  const picks = scenarios.map((scenario, index) => {
    const pick = button(scenario.name);
    pick.addEventListener("click", () => selectScenario(index));
    return pick;
  });
  picker.append(...picks);

  function selectScenario(index) {
    const scenario = scenarios[index];
    picks.forEach((pick, i) => pick.setAttribute("aria-pressed", String(i === index)));
    const form = element("form", "", "workflow-controls");
    const label = element("label", scenario.question);
    const options = element("select");
    scenario.options.forEach((option, i) => options.add(new Option(option.input, String(i))));
    label.append(options);
    const run = button(t("Axını işə sal", "Запустить процесс"), true);
    run.type = "submit";
    form.append(label, run);

    const feedback = element("div", "", "workflow-feedback");
    feedback.hidden = true;
    const list = element("ol", "", "workflow-history");
    const out = element("div", "", "workflow-result");
    const published = element("p", "", "workflow-status");
    published.setAttribute("role", "status");
    feedback.append(list, out);
    options.addEventListener("change", () => {
      feedback.hidden = true;
      published.textContent = "";
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      const selected = scenario.options[Number(options.value)];
      list.replaceChildren(...selected.steps.map(step => element("li", step)));
      out.replaceChildren(element("h3", t("Nümunə nəticəsi", "Результат демо")));
      if (selected.approval) {
        const status = element("p", t("Sizin qərarınız gözlənilir.", "Ожидается ваше решение."));
        const approve = button(t("Təklifi təsdiqlə", "Согласовать предложение"), true);
        const reject = button(t("Təklifi saxla", "Отложить предложение"));
        const actions = element("div", "", "actions workflow-actions");
        function finish(message) {
          status.textContent = message;
          published.textContent = message;
          actions.remove();
          run.focus();
        }
        approve.onclick = () => finish(selected.approval);
        reject.onclick = () => finish(t("Təklif saxlanıldı. Nümunə kampaniyada dəyişiklik yoxdur.", "Предложение отложено. Состояние демонстрационной кампании прежнее."));
        actions.append(approve, reject);
        out.append(status, actions);
      } else {
        out.append(element("p", selected.result));
      }
      const whatsapp = window.GajarConfig?.whatsapp;
      if (whatsapp) {
        const contact = element("a", t("Bu axını biznesim üçün müzakirə et", "Обсудить этот процесс для моего бизнеса"), "cta");
        const message = t("Salam! Bu iş axınını biznesimdə qurmaq istəyirəm. ", "Здравствуйте! Хочу настроить этот процесс для своего бизнеса. ") + scenario.name;
        contact.href = whatsapp + "?text=" + encodeURIComponent(message);
        out.append(contact);
      }
      feedback.hidden = false;
      published.textContent = selected.result || t("Təklif hazırdır və təsdiq gözlənilir.", "Предложение готово и ожидает согласования.");
    });
    workspace.replaceChildren(
      element("p", t("Sınaq məlumatları brauzerinizdə işlənir.", "Данные демо обрабатываются в браузере."), "workflow-note"),
      form, feedback, published
    );
  }
  selectScenario(0);
})();
