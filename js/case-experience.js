(() => {
  const ru=document.documentElement.lang==="ru", t=(a,b)=>ru?b:a;
  const element=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e};
  const cases=[
    {id:"gajar-academy",name:"Gajar Academy",file:"academy",voice:t("Salam! İngilis dilini sıfırdan öyrənmək istəyirəm. İşdən sonra dərslərə qoşula bilərəm?","Здравствуйте! Хочу учить английский с нуля. Смогу заниматься после работы?"),
      dialog:[
        t("Gajar Academy-yə xoş gəlmisiniz! Axşam vaxtı axtardığınızı qeyd etdim. İngilis dilini əsasən iş, səyahət, yoxsa gündəlik danışıq üçün öyrənirsiniz?","Добро пожаловать в Gajar Academy! Вы ищете вечерние занятия. Английский вам нужен для работы, поездок или повседневного общения?"),
        t("İş üçün. Onlayn dərs mənə daha rahatdır.","Для работы. Удобнее заниматься онлайн."),
        t("Başlanğıc səviyyə, iş üçün ingilis dili, onlayn axşam qrupu. Menecer uyğun saatları yoxlaya bilər. Sizə burada yazaq?","Записал: с нуля, английский для работы, онлайн по вечерам. Менеджер может уточнить расписание. Ответить вам здесь?"),
        t("Bəli, burada yazın.","Да, напишите здесь."),
        t("Oldu! Menecer istəyinizi və danışdıqlarımızı görəcək. Sizdən hər şeyi yenidən soruşmağa ehtiyac qalmayacaq.","Готово! Менеджер увидит ваш запрос и детали разговора. Повторять всё сначала не придётся.")],
      subject:"General English",note:t("Başlanğıc səviyyə · iş üçün · onlayn · axşam qrupu. Direct-də cavab istəyir.","С нуля · для работы · онлайн · вечер. Просит ответить в Direct.")},
    {id:"bio4n",name:"Bio4N",file:"bio",voice:t("Salam! Saçım yuyulduqdan sonra tez yağlanır. Gündəlik qulluq üçün nə seçə bilərəm?","Здравствуйте! После мытья волосы быстро становятся жирными. Что выбрать для ежедневного ухода?"),
      dialog:[
        t("Bio4N-ə xoş gəlmisiniz! Yağlanmanı ən çox diblərdə hiss edirsiniz? Uclar da eyni vəziyyətdədir, yoxsa qurudur?","Добро пожаловать в Bio4N! Быстрее жирнеют корни? А кончики тоже жирные или сухие?"),
        t("Dibləri tez yağlanır, ucları isə qurudur.","Корни быстро жирнеют, кончики сухие."),
        t("Onda diblər və uclar üçün ehtiyacı ayrı qeyd edək. Hazırda şampun axtarırsınız, yoxsa tam qulluq dəsti?","Тогда отметим потребности корней и кончиков отдельно. Ищете шампунь или полный уход?"),
        t("Əvvəlcə şampun seçmək istəyirəm.","Хочу начать с шампуня."),
        t("Qeyd etdim. Mütəxəssis kataloqdakı uyğun variantı tərkibi və istifadə qaydası ilə birlikdə sizə göndərəcək. Sifarişə keçəndə çatdırılma məlumatlarını dəqiqləşdirərik.","Записал. Специалист пришлёт подходящий вариант из каталога, состав и способ применения. Если решите заказать, уточним доставку.")],
      subject:t("Şampun seçimi","Подбор шампуня"),note:t("Dibləri tez yağlanır, uclar qurudur. Əvvəlcə şampun istəyir.","Жирные корни, сухие кончики. Хочет начать с шампуня.")}
  ];
  for(const data of cases){
    const container=document.getElementById(data.id);if(!container)continue;
    const details=element("details","","cx");details.append(element("summary",t("Instagram yazışmasını izlə","Посмотреть переписку в Instagram")));
    const body=element("div","","cx-body");details.append(body);container.append(details);
    const intro=element("p",t("Nümunə yazışma · səs və məlumatlar nümayiş üçün hazırlanıb.","Пример переписки · голос и данные подготовлены для демонстрации."),"cx-caption");
    const phone=element("div","","dm-scene");phone.append(element("strong",(data.file==="academy"?"Yonca · Gajar Academy":"Bio4N Chatbot")+" · Instagram Direct"));
    const log=element("div","","dm-log");log.setAttribute("aria-live","polite");
    const first=element("div","","dm-turn dm-user");const audio=element("audio");audio.controls=true;audio.preload="none";const voicePath=window.GajarConfig.caseVoiceMessages?.[data.file]?.[ru?"ru":"az"];
    if(voicePath)audio.src=new URL(voicePath,new URL(ru?"../../":"../",location.href)).href;else audio.hidden=true;
    const transcript=element("details");transcript.append(element("summary",t("Səsin mətni","Текст сообщения")),element("p",data.voice));first.append(audio,transcript);log.append(first);phone.append(log);
    const step=element("button",t("Botun cavabına bax","Посмотреть ответ бота"),"cta");step.type="button";
    const handoff=element("div","","cx-output");handoff.hidden=true;
    const label=t("Nümunə müraciət","Демонстрационная заявка");
    const rows=[[t("Ad","Имя"),label],[data.file==="academy"?t("Fənn","Предмет"):t("Sorğu","Запрос"),data.subject],[t("Telefon","Телефон"),"—"],[t("Maraq səviyyəsi","Статус"),"Normal"],[t("İlkin tarix","Первый контакт"),t("Nümunə günü","День примера")],[t("Son tarix","Последний контакт"),t("Həmin gün","Тот же день")],[t("Qeyd","Заметка"),data.note]];
    const grid=element("dl","","cx-fields");rows.forEach(([k,v])=>{const row=element("div");row.append(element("dt",k),element("dd",v));grid.append(row)});
    handoff.append(element("h3",data.file==="academy"?"Google Sheets · CRM":"CRM"),grid,element("h3",data.file==="academy"?t("Telegram · Yeni müraciət","Telegram · Новая заявка"):t("Mütəxəssisə ötürülən məlumat","Передача специалисту")),element("p",data.name+" · Instagram Direct · "+data.subject),element("p",data.note));
    let position=0;
    function advance(){
      if(position===data.dialog.length){audio.pause();audio.currentTime=0;log.replaceChildren(first);position=0;handoff.hidden=true;step.textContent=t("Botun cavabına bax","Посмотреть ответ бота");return}
      const user=position%2===1, turn=element("div","","dm-turn "+(user?"dm-user":"dm-bot"));turn.append(element("small",user?t("Müştəri","Клиент"):(data.file==="academy"?"Yonca":"Bio4N Chatbot")),element("p",data.dialog[position]));log.append(turn);position++;
      log.scrollTop=log.scrollHeight;handoff.hidden=position!==data.dialog.length;
      step.textContent=handoff.hidden?t("Söhbəti davam etdir","Продолжить диалог"):t("Yenidən bax","Посмотреть сначала");
    }
    step.onclick=advance;audio.onended=()=>{if(!position)advance()};details.ontoggle=()=>{if(!details.open)audio.pause()};
    phone.append(step);body.append(intro,phone,handoff);
    const link=element("a",t("Chatbotu biznesimdə necə qura bilərəm?","Как подключить чатбота в моём бизнесе?"),"cta");link.href="ai-chatbot.html#chatbot-mene";body.append(link);
    const follow=()=>{if(location.hash==="#"+data.id)details.open=true};follow();window.addEventListener("hashchange",follow);
  }
})();
