(() => {
  const root=document.querySelector("#scan");
  const ru=document.documentElement.lang==="ru";
  const t=(az,rus)=>ru?rus:az;
  const questions=[
    [t("Biznesiniz hansı sahədədir?","В какой сфере вы работаете?"),t("Klinika|Restoran|Onlayn mağaza|Təhsil mərkəzi|Xidmət biznesi|Digər","Клиника|Ресторан|Интернет-магазин|Учебный центр|Сфера услуг|Другое")],
    [t("Gündə neçə mesaj gəlir?","Сколько сообщений приходит в день?"),"0–10|10–50|50+"],
    [t("Mesajlara kim cavab verir?","Кто отвечает на сообщения?"),t("Özüm|İşçi|Heç kim, cavab gecikir","Я сам(а)|Сотрудник|Никто, ответ задерживается")],
    [t("Gecə və həftəsonu mesajlara cavab verilir?","Отвечаете ли вы ночью и в выходные?"),t("Bəli|Bəzən|Yox","Да|Иногда|Нет")],
    [t("Reklam verirsiniz?","Запускаете рекламу?"),t("Yox|Özüm|Agentlik","Нет|Самостоятельно|Через агентство")],
    [t("Kontent necə hazırlanır?","Кто готовит контент?"),t("Özüm|İşçi|Heç hazırlanmır","Я сам(а)|Сотрудник|Контент не готовим")],
    [t("Sifariş və qeydiyyat necə qeyd olunur?","Где фиксируются заказы и записи?"),t("Dəftər|Excel|CRM|Heç cür","В тетради|В Excel|В CRM|Нигде")]
  ];
  const choices=questions.map(q=>q[1].split("|"));
  const answers=[];let step=0;
  function render(focus=false){
    root.innerHTML='<p class="scan-step"></p><progress max="7"></progress><h2 tabindex="-1"></h2><div class="scan-options"></div>';
    root.querySelector(".scan-step").textContent=step<7?t("Addım ","Шаг ")+(step+1)+" / 7":t("Suallar tamamlandı","Вопросы пройдены");
    root.querySelector("progress").value=Math.min(step+1,7);
    root.querySelector("progress").setAttribute("aria-label",t("İrəliləyiş","Прогресс"));
    const heading=root.querySelector("h2");
    heading.textContent=step<7?questions[step][0]:t("Tam nəticənizi görün","Посмотрите полный результат");
    if(step<7){
      choices[step].forEach((label,i)=>{
        const button=document.createElement("button");button.type="button";button.textContent=label;
        button.setAttribute("aria-pressed",String(answers[step]===i));
        button.onclick=()=>{answers[step]=i;step++;render(true);};root.querySelector(".scan-options").append(button);
      });
    }else{
      const form=document.createElement("form");form.className="request-form";
      form.innerHTML='<label>'+t("Adınız","Ваше имя")+'<input name="name" required maxlength="100" autocomplete="name"></label><label>'+t("WhatsApp nömrəniz","Ваш номер WhatsApp")+'<input name="phone" type="tel" required maxlength="32" autocomplete="tel" placeholder="+994…"></label><button class="cta">'+t("Nəticəni göstər","Посмотреть результат")+'</button>';
      root.append(form);form.oninput=e=>e.target.setCustomValidity("");
      form.onsubmit=async e=>{
        e.preventDefault();
        const name=form.elements.name,phone=form.elements.phone;
        if(!name.value.trim())name.setCustomValidity(t("Adınızı yazın.","Введите имя."));
        if(!/^\+?[\d\s().-]+$/.test(phone.value.trim())||!/^\d{7,15}$/.test(phone.value.replace(/\D/g,"")))phone.setCustomValidity(t("Telefon nömrəsini yoxlayın.","Проверьте номер телефона."));
        if(!form.reportValidity()||form.dataset.sending)return;
        form.querySelector("button").disabled=true;root.querySelector(".scan-back").disabled=true;
        const [,volume,staff,after,ads,content,orders]=answers;
        const coverage=[100,50,0][after],response=[50,75,0][staff],records=[20,55,100,0][orders];
        const values=[Math.round((response+coverage)/2),Math.round(([0,45,80][ads]+[40,65,0][content])/2),Math.round((response+records)/2),records];
        const score=Math.round(values.reduce((a,b)=>a+b,0)/4);
        const plan=volume>0&&(after===2||staff===2)?"GAJAR":ads!==0||volume===2?"PRO":"START";
        const details=questions.map(([question],i)=>({question,answer:choices[i][answers[i]]}));
        await GajarLead.send(form,{type:"biznes-skan",name:name.value.trim(),phone:phone.value.trim(),business:details[0].answer,service:plan,answers:details,score,areas:values});
        root.innerHTML='<h2 tabindex="-1">'+t("Avtomatlaşdırma səviyyəniz","Ваш уровень автоматизации")+' · '+score+'%</h2><p>'+t("Təxmini hesablama. Cavablarınız əsasında dörd sahəyə bal verilir. Ümumi faiz bu balların ortasıdır.","Приблизительный расчёт. Ответы дают баллы по четырём направлениям. Итоговый процент — их среднее значение.")+'</p>';
        [t("Müştəri xidməti","Обслуживание клиентов"),t("Marketinq","Маркетинг"),t("Satış","Продажи"),t("Hesabatlar","Отчётность")].forEach((label,i)=>{
          const row=document.createElement("label");row.className="score-row";row.textContent=label+" · "+values[i]+"%";
          const bar=document.createElement("progress");bar.max=100;bar.value=values[i];row.append(bar);root.append(row);
        });
        const a=document.createElement("a");a.className="cta";a.href="paketler.html#"+plan.toLowerCase();a.textContent=t("Tövsiyə olunan paket","Рекомендуемый пакет")+" · "+plan+" →";root.append(a);root.querySelector("h2").focus();
      };
    }
    if(step){const back=document.createElement("button");back.className="scan-back";back.textContent=t("← Geri","← Назад");back.onclick=()=>{step--;render(true);};root.append(back);}
    if(focus)heading.focus();
  }
  render();
})();
