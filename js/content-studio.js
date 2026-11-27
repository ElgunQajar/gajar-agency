(() => {
  const root = document.querySelector("#sales-studio");
  if (!root) return;
  const lang = document.documentElement.lang, ru = lang === "ru";
  const t = (az, rus) => ru ? rus : az;
  const cfg = window.GajarConfig, storageKey = "gajar-brand-profile-" + lang;
  const groups = [
    [t("Biznes", "Бизнес"), [
      ["brand",t("Biznesinizin adı","Название бизнеса"),t("Brend adı","Название бренда")],
      ["offer",t("Müştəri sizdən nə alır?","Что клиент у вас покупает?"),t("Əsas xidmət, qiymət və təklifə daxil olanlar","Основная услуга, цена и что входит")],
      ["proof",t("Hansı faktları istifadə edə bilərik?","На какие факты можно опираться?"),t("Təsdiqli şərtlər, nümunələr və məhdudiyyətlər","Условия, примеры и ограничения")]]],
    [t("Müştəri","Клиент"),[
      ["audience",t("Təklif kimə uyğundur?","Кому подходит предложение?"),t("Müştəri hansı vəziyyətdə sizə yazır?","В какой ситуации вам пишет клиент?")],
      ["question",t("Qərar verməzdən əvvəl nə soruşur?","О чём спрашивают перед решением?"),t("Müştərinin öz sözləri ilə bir sual","Вопрос словами покупателя")],
      ["objection",t("Onu nə tərəddüdə salır?","Что мешает принять решение?"),t("Qiymət, vaxt, seçim və ya başqa səbəb","Цена, сроки, выбор или другая причина")]]],
    [t("Brend qaydaları","Правила бренда"),[
      ["tone",t("Müştəri ilə hansı tonda danışırsınız?","Каким тоном вы общаетесь?"),t("Məsələn, qısa və səmimi","Например, кратко и дружелюбно")],
      ["visual",t("Vizual üslubunuz necədir?","Как выглядит ваш бренд?"),t("Rənglər, çəkiliş tərzi, nümunə linki","Цвета, стиль съёмки, ссылка на пример")],
      ["avoid",t("Nəyi demək və göstərmək olmaz?","Чего обещать или показывать нельзя?"),t("Qadağan sözlər, təsdiq tələb edən iddialar","Запрещённые слова и заявления, требующие проверки")]]]
  ];
  const form = root.querySelector("form"), result=root.querySelector("[data-result]");
  const fields = new Map(), required=new Set(["brand","offer","audience","question"]);
  function node(tag,text,cls) {const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;return el;}
  const panels=groups.map(([name,items],i)=>{
    const pane=node("fieldset");pane.append(node("legend",(i+1)+". "+name));
    for(const [id,label,hint] of items){
      const box=node("label",label+(required.has(id)?" *":"")),field=node("textarea");field.rows=2;field.maxLength=1200;field.placeholder=hint;field.name=id;field.required=required.has(id);
      box.append(field);pane.append(box);fields.set(id,field);
    }
    return pane;
  });
  const campaign=node("fieldset");campaign.append(node("legend","4. "+t("Kampaniya","Кампания")));
  function select(label,name,options){const box=node("label",label),el=node("select");el.name=name;options.forEach(([id,txt])=>el.add(new Option(txt,id)));box.append(el);campaign.append(box);return el;}
  const goal=select(t("Bu paylaşımın məqsədi nədir?","Цель публикации"),"goal",[["consult",t("Məsləhət üçün müraciət","Запрос на консультацию")],["order",t("Sifariş","Заказ")],["book",t("Qeydiyyat","Запись")]]);
  const mode=select(t("İstehsalı kim aparsın?","Кто ведёт производство?"),"mode",[["automate",t("Sistemi bizim komandaya qurun","Настроить систему для моей команды")],["agency",t("Materialları Gajar komandası hazırlasın","Поручить производство команде Gajar")]]);
  const topic=node("textarea");topic.required=true;topic.rows=2;topic.maxLength=1200;const topicLabel=node("label",t("Bu dəfə hansı mövzunu işləyək? *","Тема этой кампании *"));topicLabel.append(topic);campaign.append(topicLabel);
  panels.push(campaign);
  const progress=node("p"), controls=node("div","","studio-actions"), back=node("button",t("Geri","Назад"),"cta"),next=node("button",t("Davam et","Далее"),"cta gold");
  back.type="button";next.type="submit";controls.append(back,next);
  const remember=node("input");remember.type="checkbox";const rememberLabel=node("label","","remember-brand");rememberLabel.append(remember,document.createTextNode(t("Brend profilini bu cihazda saxla","Сохранить профиль бренда на этом устройстве")));
  const status=node("p");status.setAttribute("role","status");const clear=node("button",t("Saxlanmış profili sil","Удалить сохранённый профиль"),"studio-secondary");clear.type="button";clear.hidden=true;
  const forget=()=>{try{localStorage.removeItem(storageKey)}catch{} clear.hidden=true;};clear.onclick=()=>{forget();remember.checked=false;status.textContent=t("Bu cihazdakı yaddaş silindi.","Сохранённая копия удалена.");};
  remember.onchange=()=>{if(!remember.checked)forget()};
  try{const saved=JSON.parse(localStorage.getItem(storageKey)||"null");if(saved){for(const [id,field] of fields)field.value=typeof saved[id]==="string"?saved[id]:"";remember.checked=true;clear.hidden=false}}catch{}
  form.replaceChildren(progress,...panels,rememberLabel,clear,controls,status);
  form.noValidate=true;
  let step=0, busy=false;
  function show(focus=false){panels.forEach((p,i)=>p.hidden=i!==step);back.hidden=!step;progress.textContent=(step+1)+" / "+panels.length;next.textContent=step===3?t("Kampaniya planını hazırla","Собрать план кампании"):t("Davam et","Далее");if(focus)panels[step].querySelector("textarea,select").focus();}
  back.onclick=()=>{if(step){step--;show(true)}};show();
  result.setAttribute("aria-live","polite");
  form.oninput=()=>{result.hidden=true;status.textContent=""};
  form.onsubmit=async event=>{
    event.preventDefault();if(busy)return;
    for(const field of panels[step].querySelectorAll("textarea")){if(field.required&&!field.value.trim()){field.setCustomValidity(t("Bu sahəni doldurun.","Заполните это поле."));field.reportValidity();field.oninput=()=>field.setCustomValidity("");return}}
    if(step<3){step++;show(true);return}
    const profile=Object.fromEntries([...fields].map(([k,v])=>[k,v.value.trim()]));
    if(remember.checked){try{localStorage.setItem(storageKey,JSON.stringify(profile));clear.hidden=false}catch{}}
    const cta=goal.selectedOptions[0].textContent,subject=topic.value.trim(), service=mode.selectedOptions[0].textContent;
    const plan=[
      [t("Paylaşım mətni","Текст поста"),profile.question+"\n\n"+profile.offer+(profile.proof?"\n"+profile.proof:"")+"\n\n"+t("Ətraflı danışmaq üçün bizə yazın.","Напишите нам, чтобы обсудить детали.")],
      [t("Şəkil və karusel","Визуал и карусель"),t("İlk slayd","Первый слайд")+" — "+subject+"\n"+t("İkinci slayd","Второй слайд")+" — "+profile.question+"\n"+t("Son slayd","Последний слайд")+" — "+cta+(profile.visual?"\n"+profile.visual:"")],
      [t("Video ssenarisi","Сценарий видео"),t("Açılış","Начало")+" — "+profile.question+"\n"+t("Nümayiş","Демонстрация")+" — "+(profile.proof||profile.offer)+"\n"+t("Son kadr","Финал")+" — "+subject+" · "+cta],
      [t("Meta Ads tapşırığı","Задание для Meta Ads"),[subject,profile.audience,profile.objection,cta].filter(Boolean).join("\n")],
      [t("Yayım və məsuliyyət","Публикация и ответственность"),service+"\n"+t("Redaktor faktları və vizualı yoxlayır. Təsdiq etdiyiniz material təqvimə düşür. Sonra reklamdan gələn müraciət CRM-də kampaniya ilə əlaqələndirilir.","Редактор сверяет факты и визуал. Согласованный материал попадает в календарь. Обращение из рекламы связывается с кампанией в CRM.")]];
    let title=t("Brifiniz üzrə ilkin istehsal planı","Предварительный план по вашему брифу");
    if(cfg.contentWebhookUrl){
      busy=true;form.inert=true;status.textContent=t("Brend profiliniz əsasında hazırlanır…","Готовим по профилю бренда…");
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),55000);
      try{
        const res=await fetch(cfg.contentWebhookUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"content-studio",lang,offer:profile.offer,brief:Object.values(profile).join("\n"),brandProfile:profile,topic:subject,goal:goal.value,delivery:mode.value}),signal:controller.signal});
        if(!res.ok)throw Error();const kit=await res.json();
        if(![kit.post,kit.reel].every(v=>typeof v==="string"&&v.trim()))throw Error();
        plan[0][1]=kit.post;plan[2][1]=kit.reel;
        if(typeof kit.visual==="string")plan[1][1]=kit.visual;if(typeof kit.ads==="string")plan[3][1]=kit.ads;
        title=t("Kampaniyanızın ilk variantı","Первый вариант кампании");status.textContent="";
      }catch{status.textContent=t("Studiyadan cavab gəlmədi. Aşağıda yerli brif planını görə bilərsiniz.","Студия не ответила. Ниже доступен локальный план по брифу.")}
      finally{clearTimeout(timer);busy=false;form.inert=false}
    }
    const heading=node("h2",title);heading.tabIndex=-1;const cards=node("div","","content-kit");
    plan.forEach(([name,text])=>{const card=node("article");card.append(node("h3",name),node("p",text));cards.append(card)});
    const request=node("a",t("Bu brifi Gajar ilə müzakirə et","Обсудить этот бриф с Gajar"),"cta gold");
    request.href=cfg.whatsapp+"?text="+encodeURIComponent([profile.brand,subject,service,cta].join("\n"));
    const download=node("button",t("Brifi və planı yüklə","Скачать бриф и план"),"cta");
    download.type="button";download.onclick=()=>{const a=node("a");a.download="gajar-"+lang+".txt";const txt=[...groups.flatMap(([,items])=>items.map(([id,name])=>name+" — "+profile[id])),...plan.map(v=>v.join("\n"))].join("\n\n");const url=URL.createObjectURL(new Blob([txt],{type:"text/plain;charset=utf-8"}));a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)};
    const actions=node("div","","studio-actions");actions.append(download,request);result.replaceChildren(heading,cards,actions);result.hidden=false;heading.focus();
  };
})();
