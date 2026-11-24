(() => {
  const ru = document.documentElement.lang === "ru";
  const t = (az, rus) => ru ? rus : az;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function action(label, onClick) {
    const button = element("button", "cx-action", label);
    button.type = "button";
    button.onclick = onClick;
    return button;
  }
  function experience(container, title) {
    const details = element("details", "cx");
    const summary = element("summary", "", title);
    const body = element("div", "cx-body");
    details.append(summary, body);
    container.append(details);
    return body;
  }
  function fieldList(rows) {
    const list = element("dl", "cx-fields");
    for (const [label, value] of rows) {
      const row = element("div");
      row.append(element("dt", "", label), element("dd", "", value));
      list.append(row);
    }
    return list;
  }
  function academy(container) {
    const body = experience(container, t("Bir səsli mesajın yolunu izlə", "Проследить путь голосового сообщения"));
    const transcript = t("Salam! İngilis dilinə sıfırdan başlamaq istəyirəm. İşdən sonra hansı qrupunuz var?", "Здравствуйте! Я хочу учить английский с нуля. В какую группу можно ходить после работы?");
    const figure = element("figure", "cx-voice");
    const audioPath = window.GajarConfig.academyMessageAudio?.[ru ? "ru" : "az"];
    figure.append(element("figcaption", "", t("Instagram DM · Nümunə müraciət", "Instagram Direct · Пример обращения")));
    if (audioPath?.trim()) {
      const audio = element("audio");
      audio.controls = true;
      audio.preload = "none";
      audio.src = new URL((ru ? "../" : "") + document.body.dataset.root + audioPath, document.baseURI).href;
      audio.setAttribute("aria-label", t("Şagirdin mesajı · sintetik səs", "Сообщение ученика · синтезированный голос"));
      figure.append(audio);
    }
    figure.append(element("blockquote", "", transcript));
    body.append(figure);
    const prompt = t("Mesajdan sonra nə baş verir?", "Что происходит после сообщения?");
    const controls = element("div", "cx-controls");
    controls.setAttribute("role", "group");
    controls.setAttribute("aria-label", prompt);
    const panel = element("div", "cx-output");
    panel.id = "academy-case-view";
    panel.setAttribute("aria-live", "polite");
    const views = [
      [t("Şagird", "Ученик"), t("Şagird nə görür?", "Что видит ученик?"),
        element("p", "", t("Bot: Salam! Başlanğıc səviyyə və axşam dərsi istəyinizi qeyd etdim. Menecer uyğun qrupun cədvəlini dəqiqləşdirəndə sizə burada yazsın?", "Бот: Здравствуйте! Отметил начальный уровень и вечернее время. Вам удобно, если менеджер уточнит расписание подходящей группы и напишет сюда?"))],
      ["Google Sheets", t("Cədvəldə hansı qeyd yaranır?", "Какая запись появится в таблице?"),
        fieldList([[t("Mənbə", "Источник"), "Instagram DM"], [t("Dil və səviyyə", "Язык и уровень"), t("İngilis dili · başlanğıc", "Английский · с нуля")], [t("Uyğun vaxt", "Удобное время"), t("İşdən sonra", "После работы")], [t("Növbəti addım", "Следующий шаг"), t("Axşam qrupunun cədvəlini yoxlamaq", "Проверить расписание вечерней группы")]])],
      [t("Menecer", "Менеджер"), t("Menecerə nə çatır?", "Что получает менеджер?"),
        element("p", "", t("Telegram bildirişi: Instagram-dan yeni müraciət. İngilis dilinə sıfırdan başlamaq istəyir. İşdən sonra dərs axtarır. Axşam qrupu üzrə cədvəli yoxlayıb Direct-də cavablandırın.", "Уведомление в Telegram: новая заявка из Instagram. Ученик хочет начать английский с нуля и ищет занятия после работы. Проверьте расписание вечерней группы и ответьте в Direct."))]
    ];
    function select(index) {
      [...controls.children].forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
      panel.replaceChildren(element("h4", "", views[index][1]), views[index][2]);
    }
    views.forEach(([label], index) => {
      const button = action(label, () => select(index));
      button.setAttribute("aria-controls", panel.id);
      controls.append(button);
    });
    body.append(element("h3", "", prompt), controls, panel);
    select(0);
    container.querySelector("details.cx").addEventListener("toggle", event => {
      if (!event.currentTarget.open) figure.querySelector("audio")?.pause();
    });
  }

  function bio(container) {
    const body = experience(container, t("Məhsul seçiminə aparan söhbəti sına", "Пройти диалог по подбору средства"));
    body.append(element("p", "cx-caption", t("Instagram DM · Nümunə dialoq", "Instagram Direct · Пример диалога")));
    body.append(element("blockquote", "", t("Salam, saçım üçün məhsul axtarıram. Hansını seçə bilərəm?", "Здравствуйте! Ищу средство для волос. Что выбрать?")));
    const heading = element("h3");
    heading.tabIndex = -1;
    const controls = element("div", "cx-controls");
    const output = element("div", "cx-output");
    output.setAttribute("aria-live", "polite");
    body.append(heading, controls, output);

    function step(title, focus) {
      heading.textContent = title;
      controls.replaceChildren();
      output.replaceChildren();
      output.hidden = true;
      if (focus) heading.focus();
    }
    function first(focus = false) {
      step(t("İlk olaraq nəyi soruşardınız?", "Что вы уточните в первую очередь?"), focus);
      controls.append(
        action(t("Saçla bağlı hansı çətinliyiniz var?", "Что именно вас беспокоит?"), concerns),
        action(t("Çatdırılma ünvanınız haradır?", "Какой у вас адрес доставки?"), () => {
          output.hidden = false;
          output.textContent = t("Ünvan çatdırılma üçün lazım olacaq. Əvvəlcə müştərinin hansı qayğıya ehtiyacı olduğunu öyrənin ki, seçim məqsədə uyğun olsun.", "Адрес понадобится для доставки. Сначала уточните потребность клиента, чтобы осмысленно подобрать уход.");
        })
      );
    }
    function concerns() {
      step(t("Müştəri kimi cavab verin", "Ответьте от лица покупателя"), true);
      [
        t("Saçım tez yağlanır.", "Волосы быстро становятся жирными."),
        t("Kəpəklə bağlı qulluq axtarıram.", "Ищу уход от перхоти."),
        t("Qayğımı necə izah edəcəyimi bilmirəm.", "Не знаю, как описать свой запрос.")
      ].forEach((label, index) => controls.append(action(label, () => choice(label, index))));
    }
    function choice(answer, index) {
      step(t("Bot nəyi dəqiqləşdirdi?", "Что уточнил бот?"), true);
      output.hidden = false;
      output.append(element("p", "", answer), element("p", "", index === 2
        ? t("Bot: Mütəxəssisimizin sizə yazmasını təklif edirəm. Sualınızı ona ötürüm?", "Бот: Предлагаю подключить нашего специалиста. Передать ему ваш вопрос?")
        : t("Bot: İstəyinizi qeyd etdim. Bu ehtiyaca uyğun qulluq vasitəsi üçün müraciətinizi mütəxəssisə ötürüm?", "Бот: Запрос записан. Передать его специалисту для подбора подходящего средства?")));
      controls.append(action(t("Bəli, müraciəti ötür", "Да, передать запрос"), () => handoff(answer, index)));
    }
    function handoff(answer, index) {
      step(t("Mütəxəssisin aldığı müraciət", "Что увидит специалист"), true);
      output.hidden = false;
      output.append(fieldList([
        [t("Kanal", "Канал"), "Instagram DM"],
        [t("Müştərinin istəyi", "Запрос клиента"), answer],
        [t("Növbəti addım", "Следующий шаг"), index === 2
          ? t("Ehtiyacı yazışmada dəqiqləşdirmək", "Уточнить потребность в переписке")
          : t("Kataloqdan uyğun məhsulu təsdiqləmək və sifarişi tamamlamaq", "Согласовать подходящее средство из каталога и оформить заказ")]
      ]));
      output.append(element("p", "", t("Sifarişə keçəndə ad, telefon və çatdırılma ünvanı CRM cədvəlinə yazılır.", "При оформлении заказа имя, телефон и адрес доставки заносятся в CRM-таблицу.")));
      controls.append(action(t("Başqa cavabı sına", "Попробовать другой ответ"), () => first(true)));
    }
    first();
  }
  const academyCase = document.getElementById("gajar-academy");
  const bioCase = document.getElementById("bio4n");
  if (academyCase) academy(academyCase);
  if (bioCase) bio(bioCase);
  for(const section of [academyCase,bioCase]){
    const body=section?.querySelector(".cx-body");
    if(!body)continue;
    const link=element("a","cta",t("Chatbotun qiymətinə bax →","Посмотреть стоимость чатбота →"));
    link.href="ai-chatbot.html#qiymet";body.append(link);
  }
  function openLinkedCase(){
    const active=[academyCase,bioCase].find(c=>c&&location.hash==="#"+c.id);
    const details=active?.querySelector("details.cx");
    if(details)details.open=true;
  }
  openLinkedCase();
  window.addEventListener("hashchange",openLinkedCase);
})();
