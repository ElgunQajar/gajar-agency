(() => {
  const cfg=window.GajarConfig;
  const lang=document.documentElement.lang;
  const ru=lang==="ru";
  const t=(az,rus)=>ru?rus:az;
  const base=document.body.dataset.root;
  const asset=src=>new URL(src,new URL((ru?"../":"")+base,document.baseURI)).href;
  const pages=base+"pages/";
  const home=document.body.dataset.page==="index";
  document.querySelectorAll("[data-scan-link]").forEach(a=>{
    if(cfg.scanPage){a.href=pages+cfg.scanPage;a.hidden=false;}
  });
  document.querySelectorAll("[data-sector-wa]").forEach(a=>{
    if(!cfg.whatsapp)return;
    const message=t("Bu sahə üçün avtomatlaşdırma barədə məlumat istəyirəm: ","Хочу узнать об автоматизации для отрасли: ")+a.dataset.sector;
    a.href=cfg.whatsapp+"?text="+encodeURIComponent(message);a.hidden=false;
  });

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
    if(a && /^(wa\.me|api\.whatsapp\.com)$/.test(a.hostname) && !event.defaultPrevented)track();
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
  const sectors=(cfg.sectors||[]).filter(item=>item[0]&&item[ru?2:1]);
  document.querySelectorAll("#header nav").forEach(nav=>{
    if(!sectors.length)return;
    const menu=document.createElement("details");menu.className="sector-menu";
    const title=document.createElement("summary");title.textContent=t("Sahələr","Отрасли");menu.append(title);
    const links=document.createElement("div");
    sectors.forEach(([slug,az,rus])=>{
      const a=document.createElement("a");a.href=pages+slug+".html";a.textContent=t(az,rus);
      if(location.pathname.endsWith("/"+slug+".html"))a.setAttribute("aria-current","page");
      links.append(a);
    });
    menu.append(links);nav.children[2]?.after(menu);
    document.addEventListener("click",e=>{if(!menu.contains(e.target))menu.open=false;});
    menu.addEventListener("keydown",e=>{if(e.key==="Escape"&&menu.open){e.stopPropagation();menu.open=false;title.focus();}});
  });
  if(home&&cfg.scanPage){
    const section=document.createElement("section");section.className="panel release-panel scan-invite";
    section.innerHTML='<h2>'+t("Biznesinizi skan edin","Проверьте свой бизнес")+'</h2><p>'+t("Altı suala cavab verin və hansı gündəlik işi əvvəlcə avtomatlaşdırmağa dəyər, öyrənin.","Ответьте на шесть вопросов и узнайте, какие повседневные задачи стоит автоматизировать в первую очередь.")+'</p><a class="cta"></a>';
    const a=section.querySelector("a");a.href=pages+cfg.scanPage;a.textContent=t("Testə başla →","Пройти тест →");
    document.querySelector(".hero").after(section);
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
