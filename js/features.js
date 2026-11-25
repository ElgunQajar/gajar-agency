(() => {
  const cfg=window.GajarConfig;
  const lang=document.documentElement.lang;
  const ru=lang==="ru";
  const t=(az,rus)=>ru?rus:az;
  const base=document.body.dataset.root;
  const asset=src=>new URL(src,new URL((ru?"../":"")+base,document.baseURI)).href;
  const pages=base+"pages/";
  const home=document.body.dataset.page==="index";
  function load(src){
    const script=document.createElement("script");
    script.async=true;script.src=src;document.head.append(script);
  }
  if(cfg.metaPixelId?.trim()){
    function pixel(){if(pixel.callMethod)pixel.callMethod.apply(pixel,arguments);else pixel.queue.push(arguments);}
    pixel.queue=[];pixel.push=pixel;pixel.loaded=true;pixel.version="2.0";
    window.fbq=window._fbq=pixel;
    pixel("init",cfg.metaPixelId.trim());pixel("track","PageView");
    load("https://connect.facebook.net/en_US/fbevents.js");
  }
  if(cfg.ga4Id?.trim()){
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    gtag("js",new Date());gtag("config",cfg.ga4Id.trim());
    load("https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(cfg.ga4Id.trim()));
  }
  if(cfg.clarityId?.trim()){
    window.clarity=function(){(window.clarity.q ||= []).push(arguments);};
    load("https://www.clarity.ms/tag/"+encodeURIComponent(cfg.clarityId.trim()));
  }
  const track=()=>window.fbq?.("track","Lead");
  document.addEventListener("click",event=>{
    const a=event.target.closest("a[href]");
    if(a && !a.hasAttribute("data-team-share") && /^(wa\.me|api\.whatsapp\.com)$/.test(a.hostname) && !event.defaultPrevented)track();
  });
  async function send(form,fields,whatsappMessage){
    if(form.dataset.sending)return false;
    form.dataset.sending="true";
    const data={name:"",phone:"",business:"",service:"",message:"",...fields,pageUrl:location.href,timestamp:new Date().toISOString(),language:lang};
    track();
    if(cfg.leadWebhookUrl?.trim()){
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),2500);
      try{
        await fetch(cfg.leadWebhookUrl.trim(),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data),signal:controller.signal});
      }catch{/* The WhatsApp draft and scan result are available offline too. */}
      finally{clearTimeout(timeout);}
    }
    if(whatsappMessage)location.assign(cfg.whatsapp+"?text="+encodeURIComponent(whatsappMessage));
    delete form.dataset.sending;
    return true;
  }
  window.GajarLead={send};
  document.querySelectorAll("[data-email]").forEach(a=>{
    if(!cfg.email?.trim())return;
    a.href="mailto:"+cfg.email.trim();a.hidden=false;
    if(!a.dataset.icon)a.textContent=cfg.email.trim();
  });
  const botTools=[
    [cfg.simulatorPage,t("Öz biznesini müştəri kimi sına","Станьте клиентом своего бизнеса"),t("Bir mesaj göndərin. Həm müştərinin telefonuna, həm də menecerin ekranına baxın.","Отправьте сообщение и посмотрите на него глазами клиента и менеджера."),t("Söhbətə başla","Начать диалог")],
    [cfg.rulesPage,t("Botu çətinə sal","Испытайте бота сложным вопросом"),t("Endirim istəyən və ya fikrini dəyişən müştəri üçün botun sərhədlərini siz müəyyən edin.","Решите, что может сделать бот, если клиент просит скидку или меняет заказ."),t("Qaydaları seç","Задать правила")],
  ].filter(([file])=>file);
  const businessTools=[
    [cfg.workflowDemoPage,t("Avtomatlaşdırmanı iş başında görün","Посмотрите автоматизацию в работе"),t("Müraciət, sifariş və reklam qərarının addımlarını işə salın. Sistemin nəyi qeydə aldığını və harada təsdiq istədiyini görün.","Запустите сценарий заявки, заказа или решения по рекламе. Посмотрите, что система записывает и когда спрашивает согласование."),t("İş axınını sına","Запустить демо")],
    [cfg.salesStudioPage,t("Avtomatik kontent studiyası","Автоматическая контент-студия"),t("Məhsul məlumatını daxil edin. Paylaşım mətni, video ssenarisi və müştəriyə cavab alın.","Добавьте сведения о продукте, чтобы получить пост, сценарий ролика и ответ клиенту."),t("Kontent hazırla","Подготовить контент")],
    ["meta-ads.html",t("Reklam büdcəsi hara gedir?","Куда уходит рекламный бюджет?"),t("Reklam botunun nəticələri necə müqayisə etdiyini və növbəti addımı necə seçdiyini sınayın.","Посмотрите, как бот сравнивает результаты рекламы и предлагает следующий шаг."),t("Analizi sına","Попробовать анализ")]
  ].filter(([file])=>file);
  const hubPath="ai-chatbot.html#bot-sinaqlari";
  const hubTitle=t("Chatbotu almadan əvvəl sına","Попробуйте чатбота перед покупкой");
  function addCards(grid,items){
    for(const [file,name,description,action] of items){
      const a=document.createElement("a");a.className="case-card";a.href=pages+file;
      const h=document.createElement("h3");h.textContent=name;
      const p=document.createElement("p");p.textContent=description;
      const label=document.createElement("span");label.textContent=action+" →";
      a.append(h,p,label);grid.append(a);
    }
  }
  if(home){
    const section=document.createElement("section");section.className="panel release-panel scan-invite";
    const title=document.createElement("h2");title.textContent=t("Hansı iş vaxtınızı alır?","Какая задача отнимает ваше время?");
    const grid=document.createElement("div");grid.className="experience-grid";
    addCards(grid,[
      ["biznes-prosesleri.html",t("Sifarişi cədvələ əllə köçürürsünüz?","Переносите заказы в таблицу вручную?"),t("Məlumatı müştəridən bir dəfə alın. Sistem sifarişi qeydə alsın və məsul şəxsə bildirsin.","Получите данные от клиента один раз. Система запишет заказ и уведомит ответственного."),t("Sifariş nümunəsinə bax","Посмотреть пример заказа")],
      ...businessTools
    ]);
    const hubLink=document.createElement("a");hubLink.href=pages+hubPath;hubLink.className="cta";
    hubLink.textContent=hubTitle+" →";
    section.append(title,grid,hubLink);
    document.querySelector(".hero").after(section);
  }
  const hub=document.querySelector("#bot-sinaqlari .experience-grid");
  if(hub){
    addCards(hub,botTools);
    const caseDescriptions={
      "gajar-academy":t("Şagirdin səsli mesajını dinləyin və menecerin Telegram-da nə gördüyünə baxın.","Послушайте голосовое сообщение ученика и посмотрите, что получает менеджер в Telegram."),
      "bio4n":t("Müştəriyə veriləcək sualı seçin və müraciətin mütəxəssisə necə ötürüldüyünü görün.","Выберите вопрос покупателю и проследите, как запрос передаётся специалисту.")
    };
    const cases=(cfg.cases||[]).filter(c=>caseDescriptions[c.id]&&c.name);
    addCards(hub,cases.map(c=>["keysler.html#"+c.id,c.name,caseDescriptions[c.id],t("Keysi sına","Открыть пример")]));
  }
  const experienceNav=document.querySelector("[data-experience-nav]");
  const botExperience=botTools.some(([file])=>location.pathname.endsWith("/"+file));
  const experiences=botExperience?[[hubPath,hubTitle],...botTools,["ai-chatbot.html#qiymet",t("Chatbotun qiyməti","Стоимость чатбота")]]:[...businessTools,[hubPath,hubTitle]];
  if(experienceNav)for(const [file,name] of experiences){
    if(location.pathname.endsWith("/"+file))continue;
    const a=document.createElement("a");a.href=pages+file;a.textContent=name+" →";experienceNav.append(a);
  }
  if(home&&cfg.showreelUrl?.trim()){
    const hero=document.querySelector(".hero-inner"), phone=hero.querySelector(".phone-demo");
    const media=matchMedia("(max-width:760px), (prefers-reduced-motion:reduce)");
    function show(){
      hero.querySelector(".showreel")?.remove();phone.hidden=false;
      if(media.matches&&!cfg.showreelPoster)return;
      const el=document.createElement(media.matches?"img":"video");el.className="showreel";
      const label=t("Gajar Agency işlərindən nümunələr","Примеры работ Gajar Agency");
      if(media.matches){el.src=asset(cfg.showreelPoster);el.alt=label;}
      else{el.setAttribute("aria-label",label);el.muted=true;el.loop=true;el.autoplay=true;el.playsInline=true;if(cfg.showreelPoster)el.poster=asset(cfg.showreelPoster);el.src=asset(cfg.showreelUrl);}
      el.onerror=()=>{el.remove();phone.hidden=false;};phone.hidden=true;phone.after(el);
    }
    media.addEventListener("change",show);show();
  }
  if(cfg.voiceDemoUrl?.trim()){
    const hosts=[...document.querySelectorAll("article#sesli,.mobile-services details:has(a[href$='#sesli'])")];
    const card=document.querySelector(".fan a[href$='#sesli']");
    if(card){
      const article=document.createElement("article");article.className=card.className;
      card.replaceWith(article);article.append(...card.childNodes);
      const more=document.createElement("a");more.href=card.href;more.append(article.lastElementChild);article.append(more);hosts.push(article);
    }
    for(const host of hosts){
      const figure=document.createElement("figure");figure.className="voice-player";
      const caption=document.createElement("figcaption");caption.textContent=t("Nümunə zəng — Demo Klinika","Пример звонка — Демо Клиника");
      const button=document.createElement("button");button.type="button";button.className="cta";button.textContent=t("Dinlə ▶","Слушать ▶");
      const audio=document.createElement("audio");audio.controls=true;audio.preload="none";audio.src=asset(cfg.voiceDemoUrl);audio.hidden=true;audio.setAttribute("aria-label",caption.textContent);
      button.onclick=()=>{button.hidden=true;audio.hidden=false;audio.play().catch(()=>{});audio.focus();};
      figure.append(caption,button,audio);host.append(figure);
    }
  }
})();
