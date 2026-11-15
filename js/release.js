(() => {
  const cfg = window.GajarConfig;
  const ru = document.documentElement.lang === "ru";
  const t = (az,rus) => ru ? rus : az;
  const rel = document.body.dataset.root;
  const assets = ru ? (rel + "../") : rel;
  const main = document.querySelector("main");
  const slug = location.pathname.split("/").pop().replace(".html","") || "index";
  const home = document.body.dataset.page === "index";
  const money = n => Math.round(n).toLocaleString(ru?"ru-RU":"az-AZ")+" ₼";
  const wa = msg => cfg.whatsapp+"?text="+encodeURIComponent(msg);
  const link = (url,label) => '<a class="cta" rel="noopener" href="'+url+'">'+label+'</a>';
  const group = (title,html) => {
    const section = document.createElement("section");
    section.className="panel release-panel";
    section.innerHTML="<h2>"+title+"</h2>"+html;
    main.append(section);
    return section;
  };
  const header=document.querySelector("#header");

  const options=document.createElement("div");
  options.className="preferences";
  options.innerHTML='<button class="theme-toggle" aria-label="'+t("Rəng rejimini dəyiş","Сменить тему")+'"></button><a hreflang="'+(ru?"az":"ru")+'" href="'+document.body.dataset.other+'">'+(ru?"AZ | <b>RU</b>":"<b>AZ</b> | RU")+'</a>';
  header.insertBefore(options,header.querySelector(".menu-toggle"));
  options.querySelector("button").onclick=window.toggleTheme;

  new IntersectionObserver(([entry])=>{
    document.querySelector("#assistant").hidden=entry.isIntersecting;
  }).observe(document.querySelector("footer"));

  function inquiry(section,fields,prefix) {
    const form=document.createElement("form");
    form.className="request-form";
    fields.forEach(([label,type])=>{
      const wrap=document.createElement("label");
      wrap.textContent=label;
      const input=document.createElement("input"); input.required=true;input.type=type; input.maxLength=120;
      wrap.append(input);form.append(wrap);
    });
    const audit=fields.length===3;
    const names=audit?["name","business","phone"]:["name","phone"];
    form.querySelectorAll("input").forEach((input,i)=>input.name=names[i]);
    const button=document.createElement("button");
    button.className="cta";button.textContent=t("WhatsApp-da yaz","Написать в WhatsApp");
    form.append(button);
    form.onsubmit=event=>{
      event.preventDefault();
      const message=[prefix,...Array.from(form.querySelectorAll("label"),label=>label.firstChild.textContent+": "+label.control.value.trim())].join("\n");
      GajarLead.send(form,{type:audit?"audit":"lesson",...Object.fromEntries(new FormData(form)),message:prefix},message);
    };
    section.append(form);
  }
  function phoneDemo(){
    const phone=document.querySelector(".phone-demo");if(!phone)return;
    const lines=[t("Salam, qiymət neçədir?","Здравствуйте, сколько стоит?"),t("Salam! Hansı xidmət maraqlıdır?","Здравствуйте! Какая услуга вас интересует?"),t("Chatbot","Чатбот"),t("AI chatbot aylıq ","AI-чатбот стоит ")+money(cfg.prices.chatbot)+t(", quraşdırma pulsuzdur. Nömrənizi yazın, əlaqə saxlayaq."," в месяц, настройка бесплатная. Оставьте номер, и мы с вами свяжемся."),cfg.demoPhone,t("Sifariş qəbul olundu ✓","Заявка принята ✓")];
    const log=phone.querySelector(".messages"),typing=phone.querySelector("small");
    const motion=matchMedia("(prefers-reduced-motion: reduce)");let timer;
    function add(i){const p=document.createElement("p");p.className=i%2?"bot-bubble":"user-bubble";p.textContent=lines[i];log.append(p);log.scrollTop=log.scrollHeight;}
    function cycle(i=0){if(i===0)log.replaceChildren();typing.textContent=i%2?t("Bot yazır…","Бот печатает…"):t("Müştəri yazır…","Клиент печатает…");typing.hidden=false;timer=setTimeout(()=>{add(i);typing.hidden=true;timer=setTimeout(()=>cycle((i+1)%lines.length),i===lines.length-1?4500:350);},900);}
    function start(){clearTimeout(timer);log.replaceChildren();if(motion.matches){lines.forEach((_,i)=>add(i));typing.hidden=true;}else cycle();}
    motion.addEventListener("change",start);start();
  }
  phoneDemo();
  const ruForm=document.querySelector("#ru-problem");
  if(ruForm){const field=ruForm.querySelector("input"),a=ruForm.querySelector("a");field.oninput=()=>a.href=wa("Здравствуйте! "+field.value.trim());a.onclick=e=>{if(!ruForm.reportValidity())e.preventDefault();};ruForm.onsubmit=e=>e.preventDefault();}
  const catalog=window.serviceCatalog||[];
  const index=ru?1:0;
  const routeList=cfg.servicePages;
  const expl=(r)=>'<dl class="value-chain">'+[t("Problem","Проблема"),t("Biz nə edirik","Что мы делаем"),t("Siz nə qazanırsınız","Что вы получаете")].map((label,i)=>'<div><dt>'+label+'</dt><dd>'+r[2+i*2+index]+'</dd></div>').join("")+'</dl>';
  const fan=document.querySelector(".fan");
  if(fan){
    const mobile=document.createElement("div");mobile.className="mobile-services";
    mobile.innerHTML=catalog.map((r,i)=>'<details><summary><i aria-hidden="true">'+["✦","◈","◎","⇄","◇","✧","▤","▧","✦","◉"][i]+'</i><span><b>'+r[index]+'</b><small>'+(i>=5?t("Tezliklə · ","Скоро · "):"")+r[2+index]+'</small></span></summary>'+expl(r)+link(rel+"pages/"+routeList[i],t("Daha ətraflı","Подробнее"))+'</details>').join("");
    fan.after(mobile);
  }
  if(slug==="xidmetler"){const old=main.querySelector(".chain");if(old)old.remove();const s=group(t("Xidmət nəyi həll edir?","Какие задачи решают услуги?"),catalog.map(r=>'<details><summary>'+r[index]+'</summary>'+expl(r)+'</details>').join(""));main.querySelector("header")?.after(s);}
  function quiz(){
    const section=group(t("Hansı paket sizə uyğundur?","Какой пакет вам подойдёт?"),"");
    const questions=[
      [t("Biznesiniz nə qədərdir?","Какого размера ваш бизнес?"),[t("Yeni başlayıram","Только начинаю"),t("Kiçik","Малый"),t("Orta-böyük","Средний или крупный")]],
      [t("Əsas ehtiyacınız?","Что вам прежде всего нужно?"),[t("Kontent","Контент"),t("Reklam ilə satış","Продажи через рекламу"),t("Hamısı bir yerdə","Всё вместе")]],
      [t("Aylıq büdcə?","Какой бюджет в месяц?"),[t(money(cfg.budgetBands[0])+"-a qədər","До "+money(cfg.budgetBands[0])),cfg.budgetBands[0]+"–"+money(cfg.budgetBands[1]),money(cfg.budgetBands[1])+"+"]]];
    const form=document.createElement("form");form.className="request-form";section.append(form);
    form.innerHTML=questions.map(([q,opts],i)=>'<label>'+q+'<select required><option value="">'+t("Seçin","Выберите")+'</option>'+opts.map((o,j)=>'<option value="'+j+'">'+o+'</option>').join("")+'</select></label>').join("")+'<button class="cta">'+t("Tövsiyəni göstər","Подобрать пакет")+'</button><div role="status"></div>';
    const result=form.lastElementChild;form.oninput=()=>result.replaceChildren();
    form.onsubmit=e=>{e.preventDefault();const selects=[...form.querySelectorAll("select")];const need=+selects[1].value,budget=+selects[2].value;
      const name=["START","PRO","GAJAR"][Math.min(need,budget)];
      const summary=name+" · "+money(cfg.prices[name])+t("/ay","/мес.");
      const reason=[t("Aylıq video və dizayn postları üçün.","Для ежемесячных роликов и постов."),t("Kontent və Meta Ads idarəetməsi üçün.","Для контента и ведения Meta Ads."),t("Kontent, Meta Ads və chatbot üçün.","Для контента, рекламы и чатбота.")][Math.min(need,budget)];
      result.innerHTML='<h3>'+summary+'</h3><p>'+reason+(need>budget?t(" Tam ehtiyacınız üçün daha yüksək büdcə lazımdır."," Для всех выбранных задач потребуется больший бюджет."):"")+'</p>'+link(wa(questions.map(([q],i)=>q+" "+selects[i].selectedOptions[0].textContent).join("\n")+"\n"+summary),t("WhatsApp-da yaz","Написать в WhatsApp"));};
  }
  if(slug==="paketler")quiz();
  async function available(src){try {const r=await fetch(src,{method:"HEAD"});if(!r.ok||r.headers.get("content-type")?.includes("text/html"))return false; const size=r.headers.get("content-length");if(size!==null)return Number(size)>0;const sample=await fetch(src,{headers:{Range:"bytes=0-0"}});const reader=sample.body.getReader();try{return sample.ok&&!(await reader.read()).done;}finally{await reader.cancel();}} catch{return false;}}
  if(home){
    const works=group(t("İşlərimiz","Наши работы"),'<div class="video-grid"></div>');works.hidden=true;

    if(location.protocol!=="file:")Promise.all(cfg.videos.map(async(v,i)=>{if(!await available(assets+v.src))return;const video=document.createElement("video");video.controls=true;video.preload="none";video.playsInline=true;video.src=assets+v.src;video.setAttribute("aria-label",t("Video işi ","Видеоработа ")+(i+1));if(await available(assets+v.poster))video.poster=assets+v.poster;works.querySelector("div").append(video);works.hidden=false;}));
    const cards=cfg.cases.map(item=>{
      return '<a class="case-card" href="'+rel+'pages/keysler.html#'+item.id+'"><h3>'+item.name+'</h3><p>'+item.preview[index]+'</p><span>'+t("Keysə bax →","Посмотреть кейс →")+'</span></a>';
    });
    group(t("Keyslər","Кейсы"),'<div class="case-grid">'+cards.join("")+'</div>');
  }
  if(slug==="keysler"){
    cfg.cases.forEach(c=>{
      const response=t("Bütün mesajlara bot cavab verir. Orta cavab vaxtı təxminən "+cfg.caseSeconds+" saniyədir.","На все сообщения отвечает бот. Среднее время ответа — около "+cfg.caseSeconds+" секунд.");
      const rows=[
        [t("Problem","Проблема"),c.problem[index]],
        [t("Biz nə etdik","Что мы сделали"),c.solution[index]],
        [t("Nəticə","Результат"),[response,c.resultNote[index]].filter(Boolean).join(" ")]
      ];
      const s=group(c.name,'<p>'+c.sector[index]+'</p><dl class="value-chain">'+rows.map(([label,copy])=>'<div><dt>'+label+'</dt><dd>'+copy+'</dd></div>').join("")+'</dl>');
      s.id=c.id;
      if(c.monthlyMessages!==""){const p=document.createElement("p");p.textContent=t("Aylıq mesaj sayı: ","Сообщений за месяц: ")+c.monthlyMessages;s.append(p);}
      if(location.protocol!=="file:")available(assets+c.image).then(ok=>{
        if(ok){const img=new Image();img.src=assets+c.image;img.alt=c.name+t(" · anonim söhbət"," · обезличенный диалог");s.append(img);}
      });
    });
  }
  if(slug==="ai-chatbot"){
    const s=group(t("Qənaət kalkulyatoru","Калькулятор расходов"),'<form class="request-form">'+[t("Operator sayı","Число операторов"),t("Bir operatorun aylıq maaşı (₼)","Месячная зарплата одного оператора (₼)"),t("Gündə neçə saat cavab verilir?","Сколько часов в сутки вы отвечаете?")].map((label,i)=>'<label>'+label+'<input type="number" required min="0" '+(i===0?'step="1"':i===2?'step="any" max="'+cfg.dailyHours+'"':'step="any"')+'></label>').join("")+'<button class="cta">'+t("Hesabla","Рассчитать")+'</button><output></output></form>');
    const f=s.querySelector("form");f.noValidate=true;f.oninput=()=>f.querySelector("output").textContent="";
    f.onsubmit=e=>{e.preventDefault();const out=f.querySelector("output");if(!f.checkValidity()){out.textContent=t("Bütün sahələrə mənfi olmayan rəqəm yazın. Saat 24-dən çox ola bilməz. Operator sayını tam ədədlə yazın.","Заполните все поля неотрицательными числами. Укажите целое число операторов и не более 24 часов.");return;}const [n,salary,h]=[...f.querySelectorAll("input")].map(x=>x.valueAsNumber);const cost=n*salary,diff=cost-cfg.prices.chatbot;
    out.textContent=t("Aylıq əməkhaqqı: ","Зарплаты в месяц: ")+money(cost)+t(". Chatbot: ",". Чатбот: ")+money(cfg.prices.chatbot)+t("/ay. Aylıq fərq: ","/мес. Разница за месяц: ")+money(diff)+t(". İllik fərq: ",". Разница за год: ")+money(diff*cfg.months)+t(". İnsan dəstəyi: ",". Операторы: ")+h+t(" saat/gün. Bot: 24/7. Hesab maaşları müqayisə edir, vergi və əlavə xərclər daxil deyil."," ч/день. Бот: 24/7. В расчёте только зарплаты, без налогов и дополнительных расходов.");};
  }
  if(home){
    const s=group(t("Biznesinizə pulsuz AI audit","Бесплатный AI-аудит вашего бизнеса"),"");
    s.classList.add("audit-card");
    const intro=document.createElement("div");
    intro.append(s.querySelector("h2"));
    intro.insertAdjacentHTML("beforeend","<p>"+t("Hansı işləri avtomatlaşdıra biləcəyinizi birlikdə müəyyən edək. Biznes sahənizi qeyd edib müraciətinizi WhatsApp ilə göndərin.","Разберём, какие задачи можно автоматизировать в вашем бизнесе. Укажите сферу деятельности и отправьте заявку в WhatsApp.")+"</p>"+link(cfg.phone,t("Zəng et","Позвонить")));
    s.append(intro);
    inquiry(s,[[t("Ad","Имя"),"text"],[t("Biznes sahəsi","Сфера бизнеса"),"text"],[t("Telefon","Телефон"),"tel"]],t("Pulsuz AI audit istəyirəm.","Хочу бесплатный AI-аудит."));
  }
    const num=(cfg.demoBotWhatsapp||"").trim().replace(/^https:\/\/wa\.me\//,"").replace(/^\+/,"");
  if((slug==="ai-chatbot"||home)&&/^\d{7,15}$/.test(num)){
    const s=group(t("Botu sına","Попробуйте бота"),"");

    const url=cfg.whatsappBase+num;s.insertAdjacentHTML("beforeend",link(url,t("WhatsApp-da sına","Открыть в WhatsApp")));const qr=document.createElement("div");qr.className="qr";s.append(qr);const lib=document.createElement("script");lib.src=cfg.qrLibrary;lib.onload=()=>new QRCode(qr,{text:url,width:140,height:140});document.head.append(lib);
  }
  if(slug==="ai-chatbot"){
    const s=group(t("Öncə və sonra","До и после"),'<div class="compare"><div><b>'+t("Botla","С ботом")+'</b><p>'+t("03:00 · Təxminən 2 saniyədə cavab. Sifariş qəbul olundu.","03:00 · Ответ примерно через 2 секунды. Заявка принята.")+'</p></div><div class="before"><b>'+t("Botsuz","Без бота")+'</b><p>'+t("03:00 · Mesaj cavabsız qalır. Müştəri gedir.","03:00 · Сообщение без ответа. Клиент уходит.")+'</p></div></div><label>'+t("Nümunələri müqayisə et","Сравните сценарии")+'<input class="slider" type="range" min="0" max="100" value="50"></label>');
    s.querySelector("input").oninput=e=>s.style.setProperty("--split",e.target.value+"%");
    group(t("Chatbot imkanları","Возможности чатбота"),'<p>'+t("Qoşulacaq imkanları biznesinizə uyğun seçirik.","Подбираем интеграции под задачи бизнеса.")+'</p><ol class="feature-list">'+window.chatFeatures.map(f=>'<li>'+f[index]+'</li>').join("")+'</ol>');
  }
  if(home){
    if(cfg.lessonDate?.trim()){
      const s=group(t("Sahibkarlar üçün pulsuz AI dərsləri","Бесплатные занятия по AI для предпринимателей"),"");const date=document.createElement("p");date.textContent=cfg.lessonDate.trim();s.append(date);inquiry(s,[[t("Ad","Имя"),"text"],[t("WhatsApp nömrəsi","Номер WhatsApp"),"tel"]],t("Pulsuz AI dərsinə qeydiyyat: ","Запись на занятие по AI: ")+cfg.lessonDate);
    }
    if(cfg.referralReward?.trim()){
      const referral=group(t("Dostunu gətir, bonus qazan","Порекомендуйте нас другу и получите бонус"),"");const reward=document.createElement("p");reward.textContent=cfg.referralReward.trim();referral.append(reward);referral.insertAdjacentHTML("beforeend",link(wa(t("Tövsiyə proqramının şərtlərini bilmək istəyirəm.","Хочу узнать условия программы рекомендаций.")),t("WhatsApp-da yaz","Написать в WhatsApp")));
    }
    if(cfg.counterCsvUrl)loadCounters();
  }
  async function loadCounters(){try{const r=await fetch(cfg.counterCsvUrl);if(!r.ok)return;const lines=(await r.text()).replace(/^\uFEFF/,"").trim().split(/\r?\n/);if(lines.length!==2)return;const keys=lines[0].split(",").map(v=>v.trim()),cells=lines[1].split(",").map(v=>v.trim());const values=["messages","workers"].map(k=>cells[keys.indexOf(k)]);if(!values.every(v=>v!==undefined&&/^\d+$/.test(v)&&Number.isSafeInteger(Number(v))))return;
    const s=group(t("Bu ay","В этом месяце"),[t("Cavablanan mesajlar (bu ay)","Сообщений обработано за месяц"),t("Aktiv AI işçilər","Активные AI-агенты")].map(l=>'<p>'+l+' <b>0</b></p>').join(""));const nums=s.querySelectorAll("b");const observer=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;observer.disconnect();const start=performance.now();function draw(now){const progress=matchMedia("(prefers-reduced-motion:reduce)").matches?1:Math.min(1,(now-start)/800);values.forEach((v,i)=>nums[i].textContent=Math.round(Number(v)*progress));if(progress<1)requestAnimationFrame(draw);}requestAnimationFrame(draw);});observer.observe(s);
  }catch{}}
  if(slug==="ai-chatbot"){
    const rows=[[t("İş saatı","График"),cfg.shiftHours+t(" saat"," часов"),"24/7"],[t("Cavab vaxtı","Время ответа"),t("Dəqiqələr","Минуты"),"≈ "+cfg.caseSeconds+t(" saniyə"," секунды")],[t("Həftəsonu və bayram","Выходные и праздники"),t("Növbəyə bağlıdır","По графику"),t("Aktivdir","На связи")],[t("Xəstəlik və məzuniyyət","Больничный и отпуск"),t("Əvəzləmə tələb olunur","Нужна замена"),t("Məzuniyyət götürmür","Без отпуска")],[t("Paralel yazışmalar","Параллельные диалоги"),t("Operatorun yükünə bağlıdır","Зависит от нагрузки"),t("Sistem limitləri daxilində","В пределах лимитов системы")],[t("Aylıq xərc","Расходы в месяц"),t("Maaş və vergi","Зарплата и налоги"),money(cfg.prices.chatbot)]];
    group(t("İşçi və AI chatbot","Оператор и AI-чатбот"),'<div class="vs">'+rows.map(([a,b,c])=>'<article><h3>'+a+'</h3><p>'+t("İşçi","Оператор")+': '+b+'</p><p>AI: '+c+'</p></article>').join("")+'</div>');
  }
  document.querySelectorAll('a[href^="https://wa.me/"],a[href^="https://www.instagram.com/"]').forEach(a=>a.rel="noopener");
})();
