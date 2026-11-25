(() => {
  const ru = document.documentElement.lang === "ru";
  const t = (az, rus) => ru ? rus : az;
  const cfg = window.GajarConfig;
  const ads = document.querySelector("[data-ads]");
  const prospect = document.querySelector("[data-prospect]");

  if (ads) {
    ads.innerHTML = '<form><div class="demo-fields"></div><button class="cta">' + t("Təklifi hesabla", "Рассчитать предложение") + '</button></form><div class="demo-reply" aria-live="polite" hidden></div>';
    const form = ads.querySelector("form");
    const output = ads.querySelector(".demo-reply");
    const fields = [
      ["spend", t("Dövr üzrə xərc (₼)", "Расход за период (₼)"), "0", "0.01"],
      ["leads", t("Həmin dövrdə müraciətlər", "Обращения за тот же период"), "0", "1"],
      ["goal", t("Müraciət üçün xərc hədəfi (₼)", "Целевая стоимость обращения (₼)"), "0.01", "0.01"]
    ];
    for (const [name, caption, min, step] of fields) {
      const label = document.createElement("label");
      label.textContent = caption;
      const input = document.createElement("input");
      Object.assign(input, {name, type:"number", required:true, min, step, max:"999999999"});
      input.inputMode = step === "1" ? "numeric" : "decimal";
      label.append(input);
      form.querySelector(".demo-fields").append(label);
    }
    form.addEventListener("input", () => {output.hidden = true; output.replaceChildren();});
    const money = new Intl.NumberFormat(ru ? "ru-AZ" : "az-AZ", {maximumFractionDigits:2});
    form.addEventListener("submit", event => {
      event.preventDefault();
      const [spend, leads, goal] = fields.map(([name]) => form.elements[name].valueAsNumber);
      const cpl = leads ? spend / leads : null;
      const title = document.createElement("h3");
      let decision;
      if (!spend) {
        title.textContent = t("Xərc qeydə alınmayıb", "Расход ещё не зафиксирован");
        decision = t("Tarix intervalını və reklamın yayım statusunu yoxlamağı təklif edirəm. Müraciət varsa, onun mənbəyini dəqiqləşdirək.", "Предлагаю проверить период и статус показа. Если обращения уже есть, уточним их источник.");
      } else if (!leads) {
        title.textContent = t("Xərc var, müraciət görünmür", "Есть расход, но обращений не видно");
        decision = t("Öncə test müraciəti ilə ölçməni yoxlayaq. Ölçmə işləyirsə, elanla keçid səhifəsindəki təklifi müqayisə edək. Büdcəni sabit saxlamağı təklif edirəm.", "Сначала предлагаю проверить учёт тестовой заявкой. Если учёт работает, сверим обещание в объявлении с предложением на странице. Бюджет пока сохраним.");
      } else {
        title.textContent = t("Bir müraciətin xərci ", "Стоимость обращения ") + money.format(cpl) + " ₼";
        decision = money.format(spend) + " ₼ ÷ " + leads + " = " + money.format(cpl) + " ₼. " +
          (cpl > goal ? t("Xərc hədəfdən yuxarıdır. Eyni büdcə ilə fərqli reklam mətnini sınamağı təklif edirəm. Hansı variantın uyğun müraciət gətirdiyini müqayisə edək.", "Стоимость выше цели. Предлагаю проверить другой текст при том же бюджете и сравнить, какой вариант приносит подходящие заявки.") :
            t("Xərc hədəf daxilindədir. Cari büdcəni saxlayaq və müraciətlərin satışa çevrilib-çevrilmədiyini menecerlə yoxlayaq.", "Стоимость в пределах цели. Предлагаю сохранить бюджет и вместе с менеджером проверить, привели ли обращения к продажам."));
      }
      const suggestion = document.createElement("p");
      suggestion.textContent = decision;
      const approve = document.createElement("button");
      approve.type = "button";
      approve.className = "cta";
      approve.textContent = t("Nümunədə addımı təsdiqlə", "Согласовать шаг в демо");
      approve.addEventListener("click", () => {
        const status = document.createElement("p");
        status.textContent = t("Nümunə planınıza əlavə olundu. Növbəti hesabatda bu addımın nəticəsi yoxlanılacaq.", "Шаг добавлен в демонстрационный план. В следующем отчёте по нему проверяется результат.");
        approve.replaceWith(status);
      });
      output.replaceChildren(title, suggestion, approve);
      output.hidden = false;
    });
  }

  if (prospect) {
    const endpoint = cfg.webhookUrl?.trim();
    const sessionId = "service-" + Array.from(crypto.getRandomValues(new Uint32Array(4))).join("-");
    const mode = endpoint ? t("AI məsləhətçiyə işiniz barədə sual verin.", "Задайте AI-консультанту вопрос о своей работе.") :
      t("Nümunə söhbət. Öz sualınızı yazın və ya aşağıdakı suallardan birini seçin.", "Демонстрационный диалог. Напишите свой вопрос или выберите один из вариантов.");
    prospect.innerHTML = '<p>'+mode+'</p><div class="demo-reply prospect-log" role="log" aria-live="polite"></div><div class="prospect-prompts"></div><form><label>'+t("Sualınız", "Ваш вопрос")+'<input maxlength="600" required autocomplete="off"></label><button class="cta">'+t("Soruş", "Спросить")+'</button></form>';
    const form = prospect.querySelector("form");
    const log = prospect.querySelector('[role="log"]');
    const choices = prospect.querySelector(".prospect-prompts");
    const field = form.querySelector("input");
    let sector = "";
    let lastQuestion = "";
    let busy = false;
    function bubble(who, message) {
      const turn = document.createElement("div");
      turn.className = "prospect-turn";
      const speaker = document.createElement("b");
      speaker.textContent = who;
      const copy = document.createElement("p");
      copy.textContent = message;
      turn.append(speaker, copy);
      log.append(turn);
      log.scrollTop = log.scrollHeight;
      return copy;
    }
    const scenes = [
      [/kurs|təhsil|ders|dərs|müəllim|школ|курс|обуч|преподав/, t("Kursu seçən müştəri səviyyəsini və uyğun saatları yazır. Bot sizin proqram və cədvəlinizdən cavab verir, sınaq dərsi istəyən şəxsin müraciətini menecerə ötürür.", "Ученик пишет свой уровень и удобное время. Бот сверяется с вашей программой и расписанием, а запрос на пробное занятие передаёт менеджеру.")],
      [/mağaza|magaza|sifariş|məhsul|магазин|заказ|товар/, t("Alıcı gecə ölçü və çatdırılma barədə soruşanda bot kataloqunuzdan cavab verir. Seçilən variantı və sifariş istəyini bir yerdə menecerə ötürür.", "Покупатель ночью спрашивает о размере и доставке. Бот отвечает по вашему каталогу и передаёт менеджеру выбранный вариант вместе с запросом на заказ.")],
      [/klinika|klinik|həkim|salon|qəbul|клиник|врач|салон|приём|прием/, t("Bot xidmət və iş saatları barədə məlumat verir, müştəridən uyğun günü soruşur və qeydiyyat istəyini administratora ötürür. Qəbul vaxtını administrator təsdiqləyir.", "Бот расскажет об услуге и графике, уточнит удобный день и передаст запрос администратору. Время записи подтвердит администратор.")],
      [/restoran|kafe|masa|ресторан|кафе|столик/, t("Bot menyu və ünvanla bağlı sualı cavablayır. Rezerv istəyən qonaqdan vaxtı və nəfər sayını alıb administratora göndərir.", "Бот отвечает о меню и адресе. Если гость хочет забронировать столик, он уточняет время и число гостей и отправляет запрос администратору.")]
    ];
    function localReply(question) {
      const q = question.toLocaleLowerCase(ru ? "ru" : "az");
      const scene = scenes.find(([pattern]) => pattern.test(q));
      if (scene) sector = scene[1];
      if (/qiymət|qiymet|neçəyə|neçəyə|цена|цену|стоим|сколько/.test(q)) {
        return t("Aylıq xidmət haqqı ", "Чатбот стоит ") + cfg.prices.chatbot + t(" ₼-dir. Qurulum pulsuzdur. Əvvəl ən çox təkrarlanan suallarınızı seçək ki, hansı işi botun görəcəyi aydın olsun.", " ₼ в месяц. Настройка бесплатная. Начнём с самых частых вопросов, чтобы было понятно, какую работу возьмёт бот.");
      }
      if (/səhv|bilmir|bilməsə|боюсь|ошиб|не знает|знать|неправильн/.test(q)) return t("Qiymət, saat və şərtləri sizin təsdiqlədiyiniz materiallardan götürürük. Cavab bazada yoxdursa, bot sualı olduğu kimi menecerə ötürür. İşə salmazdan əvvəl bunu sizin suallarınızla yoxlayırıq.", "Цены, график и условия берём из согласованных материалов. Если ответа в базе нет, бот сохраняет вопрос и передаёт его менеджеру. До запуска проверяем этот сценарий на ваших вопросах.");
      if (/quraşdır|qurulum|başlaya|inteqra|crm|sheets|подключ|настрой|интегра|запуск/.test(q)) return t("Tez-tez verilən sualları, düzgün cavabları və menecerə ötürmə qaydasını paylaşın. Instagram və ya WhatsApp üçün söhbəti qurub sizinlə sınaqdan keçiririk. Müraciətin düşəcəyi CRM və ya cədvəli əvvəlcədən seçirik.", "Передайте частые вопросы, верные ответы и условия передачи менеджеру. Мы настроим диалог для Instagram или WhatsApp и проверим вместе с вами. Заранее согласуем CRM или таблицу для заявок.");
      if (scene) return scene[1] + " " + t("Sizin komandanıza daha çox hansı sual gəlir?", "Какой вопрос вашей команде задают чаще всего?");
      if (/gecə|gece|axşam|ноч|вечер/.test(q)) return t("Gecə yazan müştəri səhəri gözləmədən iş saatını, qiyməti və sifariş qaydasını öyrənir. Menecer səhər söhbət tarixçəsini və əlaqə istəyini hazır görür.", "Клиент ночью сразу узнает график, цену и порядок заказа. Утром менеджер увидит переписку и запрос на связь.");
      if (/niyə|lazım|fayda|зачем|почему|польз|нужен|нужно/.test(q)) return sector || t("Komandanız eyni qiyməti və iş saatını hər gün yenidən yazırsa, bot bu cavabları üzərinə götürə bilər. Müştəri sifarişə hazır olanda menecerə onun nə istədiyi artıq məlumdur. Siz mağaza, kurs, klinika, yoxsa başqa xidmət idarə edirsiniz?", "Если команда каждый день печатает одни и те же цены и часы работы, это можно поручить боту. Когда клиент готов заказать, менеджер уже знает его запрос. У вас магазин, курсы, клиника или другой бизнес?");
      return t("Bu nümunədə gecə mesajlarını, qiyməti, sifarişi və menecerə ötürməni göstərə bilərəm. Müştərinin ən çox yazdığı sualı seçin və ya iş sahənizi deyin.", "В демо можно разобрать ночные сообщения, цены, заказ и передачу менеджеру. Выберите частый вопрос клиента или укажите сферу вашего бизнеса.");
    }
    bubble("Gajar Agency", t("Siz işdən çıxandan sonra müştərilər ən çox nə soruşurlar?", "Что чаще всего спрашивают клиенты после окончания вашего рабочего дня?"));
    const prompts = [
      t("Chatbot mənə niyə lazımdır?", "Зачем мне чатбот?"),
      t("Mağazam var", "У меня магазин"),
      t("Cavabı bilməsə?", "А если бот не знает ответа?"),
      t("Qiymət nə qədərdir?", "Сколько стоит?")
    ];
    for (const phrase of prompts) {
      const button = document.createElement("button");
      button.type = "button"; button.textContent = phrase;
      button.addEventListener("click", () => {field.value = phrase; form.requestSubmit();});
      choices.append(button);
    }
    const contact = document.createElement("a");
    contact.className = "cta"; contact.hidden = true;
    contact.textContent = t("Biznesim üçün chatbotu müzakirə edək", "Обсудить чатбота для моего бизнеса");
    prospect.append(contact);
    async function liveReply(message) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18000);
      try {
        const response = await fetch(endpoint, {method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({message, sessionId, language:document.documentElement.lang, topic:"chatbot-consultation"}), signal:controller.signal});
        if (!response.ok) throw Error();
        const data = await response.json();
        const reply = data.output || data.reply;
        if (typeof reply !== "string" || !reply.trim()) throw Error();
        return reply;
      } finally {clearTimeout(timeout);}
    }
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const question = field.value.trim();
      if (!question || busy) return;
      busy = true;
      const controls = [...choices.children, form.querySelector("button")];
      controls.forEach(button => {button.disabled = true;});
      bubble(t("Siz", "Вы"), question);
      const reply = bubble("Gajar Agency", t("Cavab hazırlanır…", "Готовим ответ…"));
      field.value = "";
      try {
        reply.textContent = endpoint ? await liveReply(question) : localReply(question);
      } catch {
        reply.textContent = t("Canlı bağlantı alınmadı. Nümunə cavab. ", "Связь с консультантом прервалась. Ответ из демо. ") + localReply(question);
      } finally {
        busy = false;
        controls.forEach(button => {button.disabled = false;});
        log.scrollTop = log.scrollHeight;
      }
      lastQuestion = question;
      if (cfg.whatsapp?.trim()) {
        contact.href = cfg.whatsapp + "?text=" + encodeURIComponent(t("Salam! Biznesim üçün chatbot istəyirəm. Sualım — ", "Здравствуйте! Хочу обсудить чатбота. Мой вопрос — ") + lastQuestion);
        contact.hidden = false;
      }
    });
  }
})();
