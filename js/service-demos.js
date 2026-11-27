(() => {
  const ru = document.documentElement.lang === "ru";
  const t = (az, rus) => ru ? rus : az;
  const cfg = window.GajarConfig;
  const ads = document.querySelector("[data-ads]");
  const prospect = document.querySelector("[data-prospect]");

  if (ads) {
    ads.innerHTML = '<form><div class="demo-fields"></div><button class="cta">' + t("Bir müraciətin qiymətini hesabla", "Рассчитать цену обращения") + '</button></form><div class="demo-reply" aria-live="polite" hidden></div>';
    const form = ads.querySelector("form");
    const output = ads.querySelector(".demo-reply");
    const fields = [
      ["spend", t("Son 7 gündə reklama neçə manat xərclədiniz?", "Сколько манатов вы потратили на рекламу за последние 7 дней?"), "0", "0.01"],
      ["leads", t("Həmin 7 gündə reklamdan sizə neçə nəfər yazdı və ya zəng etdi?", "Сколько человек написали или позвонили по рекламе за эти 7 дней?"), "0", "1"],
      ["goal", t("Bir nəfərin sizə yazması üçün ən çox neçə manat ödəmək istəyirsiniz?", "Сколько манатов вы готовы заплатить за одно обращение?"), "0.01", "0.01"]
    ];
    for (const [name, caption, min, step] of fields) {
      const label = document.createElement("label");
      label.textContent = caption;
      const input = document.createElement("input");
      Object.assign(input, {name, type:"number", required:true, min, step, max:"999999999"});
      input.placeholder = ["150", "15", "12"][fields.findIndex(row => row[0] === name)];
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
    if (!endpoint) {
      const prompt = document.createElement("p");
      prompt.textContent=t("Biznesinizin sahəsini və müştərinizdən gələn tipik sualı bizə göndərin. Canlı demoda botun həmin söhbəti necə apardığını birlikdə yoxlayaq.","Пришлите сферу бизнеса и типичный вопрос клиента. На живом демо вместе посмотрим, как бот проведёт такой разговор.");
      const link=document.createElement("a");link.className="cta gold";
      link.href=cfg.whatsapp+"?text="+encodeURIComponent(t("Salam! Öz biznesim üçün canlı chatbot demosu görmək istəyirəm.","Здравствуйте! Хочу посмотреть живую демонстрацию чатбота для моего бизнеса."));
      link.textContent=t("WhatsApp-da canlı demo istə","Запросить живое демо в WhatsApp");
      prospect.replaceChildren(prompt,link);
      return;
    }
    const sessionId = "service-" + Array.from(crypto.getRandomValues(new Uint32Array(4))).join("-");
    const mode = endpoint ? t("AI məsləhətçiyə işiniz barədə sual verin.", "Задайте AI-консультанту вопрос о своей работе.") :
      t("Nümunə söhbət. Öz sualınızı yazın və ya aşağıdakı suallardan birini seçin.", "Демонстрационный диалог. Напишите свой вопрос или выберите один из вариантов.");
    prospect.innerHTML = '<p>'+mode+'</p><div class="demo-reply prospect-log" role="log" aria-live="polite"></div><div class="prospect-prompts"></div><form><label>'+t("Sualınız", "Ваш вопрос")+'<input maxlength="600" required autocomplete="off"></label><button class="cta">'+t("Soruş", "Спросить")+'</button></form>';
    const form = prospect.querySelector("form");
    const log = prospect.querySelector('[role="log"]');
    const choices = prospect.querySelector(".prospect-prompts");
    const field = form.querySelector("input");

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
    bubble("Gajar AI", t("Biznesiniz nə ilə məşğuldur? Bir müştərinin sizə yazdığı sualı göndərin, həmin söhbətdən başlayaq.", "Чем занимается ваш бизнес? Пришлите типичный вопрос клиента — начнём с него."));
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
      const reply = bubble("Gajar AI", t("Cavab hazırlanır…", "Готовим ответ…"));
      field.value = "";
      try {
        reply.textContent = await liveReply(question);
      } catch {
        reply.textContent = t("Bağlantı alınmadı. Yenidən yazın və ya sualı WhatsApp-da göndərin.","Не удалось получить ответ. Повторите вопрос или отправьте его в WhatsApp.");
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
