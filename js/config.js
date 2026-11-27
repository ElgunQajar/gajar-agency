window.GajarConfig = {
  // Kontent studiyası n8n-ə {type,lang,offer,brief,goal} göndərir və {post,reel,reply} gözləyir.
  contentWebhookUrl:"",
  leadWebhookUrl:"", email:"gajar.agency@gmail.com", metaPixelId:"", clarityId:"", ga4Id:"",
  showreelUrl:"", showreelPoster:"",
  simulatorPage:"biznes-sina.html", rulesPage:"botu-sina.html", salesStudioPage:"satis-yolu.html", workflowDemoPage:"is-axinlari.html",
  webhookUrl: "", demoBotWhatsapp: "", counterCsvUrl: "", lessonDate: "", referralReward: "", voiceDemoUrl: "audio/operator-demo.mp3",
  whatsapp: "https://wa.me/994997957905", phone: "tel:+994997957905", instagram: "https://www.instagram.com/gajar.agency/",
  prices: {START:299, PRO:599, GAJAR:999, chatbot:300, ads:300}, budgetBands:[300,700],
  servicePages:["ai-chatbot.html","kontent.html","meta-ads.html","marketinq-avtomatlasdirmasi.html","biznes-prosesleri.html","tezlikle.html#smm","tezlikle.html#crm","tezlikle.html#erp","tezlikle.html#sexsi-ai-assistent","tezlikle.html#sesli"],
  caseSeconds:2, months:12, dailyHours:24, shiftHours:8, publishDate:"2026-11-15",
  cases:[
    {
      name:"Gajar Academy", id:"gajar-academy", image:"img/cases/gajar-academy.jpg", monthlyMessages:"",
      sector:["Dil kursları","Языковые курсы"],
      preview:["Dil kursları haqqında suallardan menecerə bildirişədək.","От вопроса о языковом курсе до уведомления менеджеру."],
      problem:["Instagram DM-də kurslar, qiymətlər və müəllimlər haqqında eyni suallar tez-tez təkrarlanırdı. Gecə yazanlar cavabsız qalırdı. Şagirdi uyğun qrupa yönləndirmək üçün səviyyəsini, vaxtını və dərs formatını öyrənmək lazım idi. Bu detallar ayrı-ayrı yazışmalarda qalanda növbəti addımı izləmək çətinləşirdi.","В Instagram Direct часто повторялись вопросы о курсах, ценах и преподавателях. Ночные сообщения оставались без ответа. Для подбора группы нужно уточнить уровень, время и формат занятий. Когда эти детали остаются в отдельных переписках, следующий шаг труднее отследить."],
      solution:["Instagram DM üçün bot qurduq. Bot bütün kurslar, müəllimlər və qiymətlər haqqında sualları cavablandırır, səsli mesajları başa düşür, müraciəti Google Sheets-ə yazır və menecerə Telegram-da bildiriş göndərir.","Мы настроили бота для Instagram Direct. Он отвечает на вопросы обо всех курсах, преподавателях и ценах, понимает голосовые сообщения, записывает заявку в Google Sheets и уведомляет менеджера в Telegram."],
      resultNote:["",""]
    },
    {
      name:"Bio4N", id:"bio4n", image:"img/cases/bio4n.jpg", monthlyMessages:"",
      sector:["Saç baxımı məhsulları · Instagram","Средства для ухода за волосами · Instagram"],
      preview:["Saç baxımı üzrə sualdan uyğun məhsul seçiminədək.","От вопроса об уходе за волосами до подбора средства."],
      problem:["Instagram DM-ə hər gün saç tökülməsi, saçın uzanması, kəpək və yağlanma ilə bağlı çoxlu sual gəlirdi. Hər müştərinin problemini öyrənib uyğun məhsulu seçmək komandanın çox vaxtını alırdı. Gecə yazanlar cavabsız qalırdı.","Каждый день в Instagram Direct поступало много вопросов о выпадении и росте волос, перхоти и жирности. Команда тратила много времени, чтобы уточнить проблему каждого клиента и подобрать средство. Ночные сообщения оставались без ответа."],
      solution:["Instagram DM üçün bot qurduq. Bot əvvəlcə müştəridən saç problemini soruşur, səbəbini qısa izah edir və 11 məhsul arasından uyğun olanı tövsiyə edir. Səsli mesajları başa düşür, adı, telefonu və ünvanı CRM cədvəlinə yazır, satışı tamamlamaq üçün müraciəti mütəxəssisə ötürür.","Мы настроили бота для Instagram Direct. Он спрашивает, что беспокоит клиента, кратко объясняет причину и рекомендует подходящее средство из линейки в 11 продуктов. Бот понимает голосовые сообщения, записывает имя, телефон и адрес в CRM-таблицу и передаёт заявку специалисту для завершения продажи."],
      resultNote:["Komanda yalnız alışa hazır müştərilərlə məşğul olur.","Команда работает только с клиентами, готовыми к покупке."]
    }
  ],
  videos:[1,2,3].map(n=>({src:"img/videos/video-"+n+".mp4",poster:"img/videos/video-"+n+".jpg"})),
  illustratedTime:"03:00", demoPhone:"+994 •• ••• •• ••", articleBase:"https://elgunqajar.github.io/gajar-agency",
  whatsappBase:"https://wa.me/",
  qrLibrary:"https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"
};
(() => {
  const preference = window.matchMedia("(prefers-color-scheme: dark)");
  const key = "gajar-theme-override";
  let choice = null;
  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      const theme = typeof saved === "string" ? saved : saved?.theme;
      choice = ["light","dark"].includes(theme) ? theme : null;
    } catch { choice = null; }
  }
  function apply() {
    document.documentElement.dataset.themeMode = choice ? "manual" : "auto";
    document.documentElement.dataset.theme = choice || (preference.matches ? "dark" : "light");
    document.dispatchEvent(new Event("gajar-theme-change"));
  }
  restore();
  apply();
  preference.addEventListener("change", apply);
  window.addEventListener("storage", event => {
    if (event.key === key || event.key === null) { restore(); apply(); }
  });
  window.toggleTheme = () => {
    choice = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    try { localStorage.setItem(key, JSON.stringify(choice)); } catch {}
    apply();
  };
})();

// Tədris keysi üçün yaradılmış nümunə səsli mesajlar.
window.GajarConfig.academyMessageAudio = {
  az: "audio/academy-message-az.wav",
  ru: "audio/academy-message-ru.wav"
};

window.GajarConfig.caseVoiceMessages = {
  academy: { az: "audio/academy-dm-az.mp3", ru: "audio/academy-dm-ru.mp3" },
  bio: { az: "audio/bio-dm-az.mp3", ru: "audio/bio-dm-ru.mp3" }
};
