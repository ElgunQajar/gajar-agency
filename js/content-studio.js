(() => {
  "use strict";
  const root = document.querySelector("#sales-studio");
  if (!root) return;
  const lang = document.documentElement.lang;
  const t = (az, ru) => lang === "ru" ? ru : az;
  const form = root.querySelector("form");
  const brief = form.elements.brief;
  const file = form.elements.source;
  const notice = root.querySelector("[data-notice]");
  const result = root.querySelector("[data-result]");
  const send = form.querySelector("[type=submit]");
  const url = window.GajarConfig?.contentWebhookUrl?.trim();
  const limit = brief.maxLength;
  const headings = [
    t("Instagram paylaşımı", "Пост для Instagram"),
    t("Reels ssenarisi", "Сценарий Reels"),
    t("Direct üçün cavab", "Ответ в Direct")
  ];
  const targets = {
    consult: [t("Nə axtardığınızı mesajda yazın, uyğun variantı birlikdə seçək.", "Напишите, что вы ищете, и мы поможем подобрать вариант."), t("Seçim edərkən sizin üçün nə vacibdir?", "Что для вас важнее всего при выборе?")],
    order: [t("Sifariş üçün məhsulun adını və istədiyiniz sayı mesajda yazın.", "Для заказа напишите нам название и количество."), t("Sizin üçün neçə ədəd qeyd edək?", "Сколько штук вы хотите заказать?")],
    book: [t("Qeydiyyat üçün sizə uyğun günü mesajda yazın.", "Чтобы записаться, напишите, какой день вам подойдёт."), t("Hansı gün sizə uyğundur? Mümkün vaxtı dəqiqləşdirək.", "Какой день вам удобен? Уточним доступное время.")]
  };
  const example = t(
    "Keramika fincan emalatxanası\nİlk dəfə gil ilə işləyənlər üçün açıq dərs.\nƏvvəlcə fincanınızı formaya salır, sonra üzərinə naxış çəkirsiniz.\nGil, boyalar və bişirmə dərsə daxildir.\nBişmiş fincanı emalatxanadan götürürsünüz.",
    "Мастерская керамических кружек\nОткрытое занятие для тех, кто впервые работает с глиной.\nСначала вы придаёте кружке форму, затем наносите рисунок.\nГлина, краски и обжиг входят в занятие.\nГотовую кружку можно забрать в мастерской."
  );

  let revision = 0;
  let exported = "";
  let controller;
  function invalidate() {
    revision++;
    controller?.abort();
    send.disabled = false;
    notice.textContent = "";
    result.hidden = true;
    brief.setCustomValidity("");
  }
  brief.addEventListener("input", invalidate);
  form.elements.goal.addEventListener("change", invalidate);
  root.querySelector("[data-example]").onclick = () => {
    invalidate();
    brief.value = example;
    form.elements.goal.value = "book";
    file.value = "";
    brief.focus();
  };
  file.addEventListener("change", async () => {
    invalidate();
    const version = revision;
    const selected = file.files[0];
    if (!selected) return;
    try {
      if (!/\.txt$/i.test(selected.name) || selected.size > limit * 4) throw Error();
      const decoded = new TextDecoder("utf-8", {fatal:true}).decode(await selected.arrayBuffer()).trim();
      if (!decoded || decoded.includes("\0") || decoded.length > limit) throw Error();
      if (revision !== version) return;
      brief.value = decoded;
      notice.textContent = t("Fayl oxundu. Mətni aşağıda yoxlaya bilərsiniz.", "Файл прочитан. Вы можете проверить текст ниже.");
    } catch {
      if (revision === version) notice.textContent = t("Faylı oxumaq mümkün olmadı. UTF-8 formatında, ən çox 6000 işarəlik TXT faylı seçin.", "Не удалось прочитать файл. Выберите TXT в кодировке UTF-8 длиной до 6000 знаков.");
    }
  });

  function localKit(name, details, goal) {
    const facts = details.split(/\n+|(?<=[.!?])\s+(?=[A-ZА-ЯƏÇÖÜŞĞİЁ])/u)
      .map(item => item.trim().replace(/^[-•]+\s*/, "")).filter(Boolean);
    const matches = pattern => facts.find(fact => pattern.test(fact));
    const costing = matches(/₼|\bAZN\b|qiymət|manat|стои(т|мость)|манат|цен[ауые]/iu);
    const includes = matches(/daxildir|daxil olan|komplekt|входит|включ|комплект/iu);
    const timing = matches(/saat|həftə|gün|müddət|расписани|недел|час|дн[яеи]|день/iu);
    const process = matches(/əvvəl|sonra|hazırl|formaya|сначала|затем|изгот|делае/iu);
    const action = targets[goal];
    const sentence = text => /[.!?…]$/u.test(text) ? text : text + ".";
    const detail = includes || costing || timing || facts[0];
    const ask = includes ? t("Təklifə nələr daxildir?", "Что входит в предложение?") :
      costing ? t("Qiymət nə qədərdir?", "Сколько это стоит?") :
      timing ? t("Vaxt barədə məlumat verərdiniz?", "Подскажите по срокам?") :
      t("Ətraflı məlumat verə bilərsiniz?", "Расскажете подробнее?");
    const post = [name, facts.slice(0, 5).map(sentence).join(" "), action[0]].join("\n\n");
    const shot = process || facts.find(fact => fact !== detail) || detail;
    const reel = [
      t("Açılış kadrı", "Первый кадр") + " — " + t("Başlığı ekrana çıxarın: ", "Заголовок на экране: ") + name + ". " + t("Səsləndirmə: ", "Голос за кадром: ") + ask,
      t("Əsas kadr", "Основной кадр") + " — " + t("Bu detalı göstərin: ", "Покажите эту деталь: ") + sentence(shot),
      t("Son kadr", "Последний кадр") + " — " + (detail !== shot ? sentence(detail) + " " : "") + action[0]
    ].join("\n\n");
    const reply = t("Müştəri", "Клиент") + " — «" + name + "». " + ask + "\n\n" +
      t("Bot — Salam! ", "Бот — Здравствуйте! ") + sentence(detail) + " " + action[1];
    return {post,reel,reply};
  }

  function render(kit, name) {
    const values = [kit.post, kit.reel, kit.reply];
    result.querySelectorAll("[data-copy]").forEach((el, index) => { el.textContent = values[index]; });
    exported = [name, ...values.map((value, index) => headings[index] + "\n" + value)].join("\n\n");
    result.hidden = false;
    result.querySelector("h2").focus();
  }
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const [name, ...lines] = brief.value.trim().split(/\r?\n/);
    const details = lines.join("\n").trim();
    if (!name || !/[\p{L}\p{N}]/u.test(details)) {
      brief.setCustomValidity(t("Birinci sətirdə adı, növbəti sətirdə ən azı bir detalı yazın.", "На первой строке укажите название, на следующей — хотя бы одну деталь."));
      brief.reportValidity();
      return;
    }
    invalidate();
    const goal = form.elements.goal.value;
    const version = revision;
    let kit = localKit(name, details, goal);
    if (url) {
      send.disabled = true;
      notice.textContent = t("Kontent hazırlanır…", "Готовим контент…");
      controller = new AbortController();
      const request = controller;
      const timeout = setTimeout(() => request.abort(), 20000);
      try {
        const response = await fetch(url, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({type:"content-studio", lang, offer:name, brief:details, goal}), signal:request.signal});
        if (!response.ok) throw Error();
        const data = await response.json();
        if (![data.post,data.reel,data.reply].every(text => typeof text === "string" && text.trim())) throw Error();
        kit = data;
        if (version === revision) notice.textContent = t("Kontent hazırdır.", "Контент готов.");
      } catch {
        if (version === revision) notice.textContent = t("Kontent xidmətindən cavab gəlmədi. Aşağıda brifinizdən brauzerdə hazırlanan nümunə var.", "Сервис не ответил. Ниже — пример, собранный из вашего брифа в браузере.");
      } finally {
        clearTimeout(timeout);
        if (version === revision) send.disabled = false;
      }
    }
    if (version === revision) render(kit, name);
  });
  root.querySelector("[data-export]").onclick = () => {
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(new Blob(["\uFEFF",exported], {type:"text/plain;charset=utf-8"}));
    link.href = objectUrl;
    link.download = "gajar-kontent-" + lang + ".txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  };
  if (url) root.querySelector("[data-mode]").textContent = t("Hazırlama düyməsinə basanda brifiniz qoşulmuş kontent xidmətinə göndəriləcək.", "При нажатии кнопки ваш бриф будет отправлен в подключённый сервис генерации.");
})();
