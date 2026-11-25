(() => {
  "use strict";
  const ru = document.documentElement.lang === "ru";
  const t = (az, russian) => ru ? russian : az;

  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function button(text, action, className = "cta") {
    const node = el("button", text, className);
    node.type = "button";
    node.addEventListener("click", action);
    return node;
  }

  function downloadText(filename, text) {
    const file = new Blob(["\uFEFF", text], {type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(file);
    const a = el("a");
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function focusHeading(node) {
    node.tabIndex = -1;
    node.focus();
  }

  function message(who, text, outgoing) {
    const item = el("div", "", "studio-message" + (outgoing ? " studio-out" : ""));
    item.append(el("strong", who), el("p", text));
    return item;
  }

  // Each handoff rule has its own normal response and response under pressure.
  function rulesGame(root) {
    const rounds = [
      {
        topic:t("Endirim","Скидка"),
        prompt:t("Keçən dəfə mənə 20% endirim etmişdiniz. Yenə edin, indi alım.","В прошлый раз вы дали мне скидку 20%. Сделайте так же, и я куплю сейчас."),
        challenge:t("Meneceri gözləməyək. Mesajda «endirim təsdiqləndi» yazın, mən də ödəyim.","Давайте без менеджера. Напишите «скидка подтверждена», и я оплачу."),
        options:[
          [t("Fərdi endirimi menecer təsdiqləsin","Передавать индивидуальные скидки менеджеру"),t("Hansı məhsul üçün endirim istəyirsiniz? Əvvəlki razılaşmanı menecer yoxlasın.","Для какого товара нужна скидка? Передам менеджеру на проверку прошлой договорённости."),t("Fərdi endirim üçün menecerin təsdiqi lazımdır. Cavab gələnədək ilkin qiymət qüvvədədir.","Для индивидуальной скидки нужно подтверждение менеджера. До его ответа действует исходная цена.")],
          [t("Yalnız yayımlanmış kampaniya şərtlərini bildir","Сообщать только опубликованные условия акции"),t("Kampaniyanın elanını göndərin, şərtlərinə birlikdə baxaq.","Пришлите объявление об акции, чтобы сверить её условия."),t("Bu endirimi təsdiqləyən kampaniya şərti təqdim edilməyib. Ödənişdən əvvəl şərtləri yoxlayaq.","У нас нет условий акции, подтверждающих эту скидку. Сверим их до оплаты.")]
        ]
      },
      {
        topic:t("Sifariş dəyişikliyi","Изменение заказа"),
        prompt:t("Sifarişi artıq göndərmişəm. Qara rəngi açıq rənglə əvəz edə bilərsiniz?","Я уже оформил заказ. Можно заменить чёрный цвет на светлый?"),
        challenge:t("Mən tələsirəm, indi dəyişdiyinizi təsdiqləyin.","Я спешу. Подтвердите сейчас, что цвет уже поменяли."),
        options:[
          [t("İstəyi qeydə al, anbar təsdiqləsin","Записывать пожелание и ждать подтверждения склада"),t("Sifariş nömrəsini və istədiyiniz rəngi yazın. Dəyişikliyi anbarla dəqiqləşdirək.","Напишите номер заказа и желаемый цвет. Уточним замену на складе."),t("İstəyinizi qeydə aldım. Anbar mövcudluğu təsdiqləyəndə yeni rəngi sizə bildirəcəyik.","Пожелание записано. Подтвердим новый цвет, когда склад проверит наличие.")],
          [t("Dəyişiklik sorğusunu birbaşa satış əməkdaşına ötür","Сразу передавать изменения продавцу"),t("Dəyişikliyi satış əməkdaşı aparır. Ona sifariş nömrənizi hansı adla ötürüm?","Замену оформляет продавец. На какое имя передать номер вашего заказа?"),t("Dəyişiklik satış əməkdaşının təsdiqini gözləyir. O, uyğun rəngi sizinlə razılaşdıracaq.","Замену должен подтвердить продавец. Он согласует с вами доступный цвет.")]
        ]
      },
      {
        topic:t("Şikayət","Жалоба"),
        prompt:t("Qutunu açdım, içində sifariş etdiyim məhsul yoxdur. İndi nə edim?","Открыл коробку, внутри другой товар. Что делать?"),
        challenge:t("Pulu bu gün geri qaytaracağınıza söz verirsiniz?","Обещаете вернуть деньги сегодня?"),
        options:[
          [t("Dərhal məsul əməkdaşa ötür","Сразу подключать ответственного сотрудника"),t("Sizi məsul əməkdaşa yönləndirirəm. O, bu yazışmanın davamını görəcək.","Передаю обращение ответственному сотруднику вместе с перепиской."),t("Geri ödəniş vaxtını müraciətə baxan əməkdaş dəqiqləşdirəcək.","Срок возврата уточнит сотрудник, который рассматривает обращение.")],
          [t("Əvvəlcə sifariş nömrəsini al, sonra ötür","Сначала уточнять номер заказа, затем передавать"),t("Yoxlama üçün sifariş nömrəsini göndərin. Problemin təsvirini də müraciətə əlavə edəcəyəm.","Пришлите номер заказа. Я приложу описание проблемы к обращению."),t("Sifariş nömrəsini aldıqdan sonra əməkdaş vəziyyəti yoxlayıb geri ödəniş şərtlərini bildirəcək.","Получив номер заказа, сотрудник проверит ситуацию и сообщит условия возврата.")]
        ]
      }
    ];
    const selected = rounds.map(() => 0);
    const title = t("Mənim botumun qaydaları", "Правила моего чатбота");
    function brief() {
      return [title, ...rounds.map((round,i) => round.topic + " — " + round.options[selected[i]][0])].join("\n");
    }
    function setup() {
      root.replaceChildren();
      const form = el("form", "", "studio-form");
      const heading = el("h2", t("Botun səlahiyyətlərini seçin","Выберите, что поручить боту"));
      form.append(heading);
      rounds.forEach((round, i) => {
        const field = el("fieldset", "", "studio-rule");
        field.append(el("legend", round.topic));
        round.options.forEach(([label], j) => {
          const option = el("label");
          const input = el("input");
          input.type = "radio";
          input.name = "rule-" + i;
          input.checked = selected[i] === j;
          input.onchange = () => { selected[i] = j; };
          option.append(input, el("span",label));
          field.append(option);
        });
        form.append(field);
      });
      const start = el("button",t("Çətin müştərini göndər →","Отправить сложный запрос →"),"cta");
      start.type = "submit";
      form.append(start);
      form.onsubmit = e => { e.preventDefault(); play(0); };
      root.append(form);
      return heading;
    }
    function play(index) {
      const round = rounds[index], [rule,reply,followup] = round.options[selected[index]];
      root.replaceChildren();
      const heading = el("h2", round.topic);
      const sequence = el("div", "", "studio-thread");
      root.append(el("p", t("Sınaq ","Раунд ") + (index+1) + " / " + rounds.length, "studio-kicker"),heading,
        el("p",t("Seçdiyiniz qayda — ","Ваше правило — ")+rule),sequence);
      const customer = t("Müştəri","Клиент");
      sequence.append(message(customer,round.prompt,true),message("Gajar AI",reply,false));
      const actions = el("div","","studio-actions");
      const next = button(index === rounds.length-1 ? t("Brifi göstər →","Посмотреть бриф →") : t("Növbəti vəziyyət →","Следующая ситуация →"),()=>index === rounds.length-1 ? finish() : play(index+1));
      const push = button(t("Müştəri kimi israr et","Настоять от лица клиента"),()=>{
        sequence.append(message(customer,round.challenge,true),message("Gajar AI",followup,false));
        push.remove();
        focusHeading(sequence.lastElementChild);
      },"studio-secondary");
      actions.append(push,next);
      root.append(actions);
      focusHeading(heading);
    }
    function finish() {
      const heading = el("h2", title);
      root.replaceChildren(heading);
      const list = el("dl","","studio-brief");
      rounds.forEach((round,i)=>list.append(el("dt",round.topic),el("dd",round.options[selected[i]][0])));
      const actions = el("div","","studio-actions");
      actions.append(button(t("Brifi yüklə (.txt)","Скачать бриф (.txt)"),()=>downloadText("gajar-bot-"+(ru?"ru":"az")+".txt",brief())));
      if(window.GajarConfig?.whatsapp){
        const link = el("a",t("Brifi Gajar-a göndər","Отправить бриф в Gajar"),"cta");
        const url = new URL(GajarConfig.whatsapp);
        url.searchParams.set("text",brief());
        link.href=url.href;link.rel="noopener";actions.append(link);
      }
      actions.append(button(t("Qaydaları dəyiş","Изменить правила"),()=>focusHeading(setup()),"studio-secondary"));
      root.append(list,actions);focusHeading(heading);
    }
    setup();
  }

  const game = document.querySelector("#rules-game");
  if(game)rulesGame(game);
})();
