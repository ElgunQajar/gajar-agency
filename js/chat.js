// Çatın interfeysi və WhatsApp ehtiyat keçidi.
const panel = document.querySelector("#assistant");
const endpoint = window.GajarConfig.webhookUrl.trim();
panel.innerHTML = `<section id="chat" class="chat" aria-label="AI köməkçi" hidden>
<header><strong>AI köməkçi</strong><button type="button" aria-label="Çatı bağla">×</button></header>
<div class="chat-log" role="log" aria-live="polite"><p>${endpoint ? "Salam! Gajar Agency haqqında nə bilmək istəyirsiniz?" : "Salam! Sualınızı yazın. Mesajınız WhatsApp-da göndərilməyə hazır açılacaq."}</p></div>
<form><input aria-label="Mesajınız" placeholder="Mesajınızı yazın…" required maxlength="2000"><button>Göndər</button></form></section>
<button type="button" class="fab" id="chat-toggle" aria-expanded="false" aria-controls="chat" aria-label="AI köməkçi" title="AI köməkçi">${icon("bot")}</button>
<a class="fab wa" href="${whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp-a yaz" title="WhatsApp-a yaz">${icon("wa")}</a>`;
const chat = panel.querySelector("#chat");
const launcher = panel.querySelector("#chat-toggle");
const form = chat.querySelector("form");
const input = form.querySelector("input");
const log = chat.querySelector(".chat-log");
function setChat(open) {
  chat.hidden = !open;
  launcher.setAttribute("aria-expanded", String(open));
  (open ? input : launcher).focus();
}
launcher.onclick = () => setChat(chat.hidden);
chat.querySelector("header button").onclick = () => setChat(false);
panel.addEventListener("keydown", event => {
  if (event.key === "Escape" && !chat.hidden) setChat(false);
});
function append(text, user = false) {
  const bubble = document.createElement("p");
  bubble.textContent = text;
  if (user) bubble.className = "from-user";
  log.append(bubble);
  log.scrollTop = log.scrollHeight;
  return bubble;
}
const buyPrompt = "Chatbot almaq istəyirəm";
const quickBuy = document.createElement("button");
quickBuy.type = "button";
quickBuy.className = "chat-buy";
quickBuy.textContent = buyPrompt;
log.after(quickBuy);
function showChatbotChoices() {
  const reply = append("Biznesinizə uyğun chatbotu seçmək üçün bir sınaqdan başlayın.");
  reply.classList.add("chat-buyer-links");
  const pages = document.body.dataset.root + "pages/";
  const options = [
    [GajarConfig.simulatorPage, "Müştəri və menecer kimi sına"],
    [GajarConfig.rulesPage, "Botu çətinə sal"],
    ...(GajarConfig.cases || []).filter(c => c.id && c.name).map(c => ["keysler.html#" + encodeURIComponent(c.id), c.name]),
    ["ai-chatbot.html#bot-sinaqlari", "Chatbotun bütün sınaqları"],
    ["ai-chatbot.html#qiymet", "Chatbotun qiymətinə bax"]
  ];
  for (const [path, title] of options) {
    if (!path) continue;
    const a = document.createElement("a");
    a.href = pages + path;
    a.textContent = title;
    a.addEventListener("click", () => setChat(false));
    reply.append(a);
  }
  quickBuy.hidden = true;
  reply.querySelector("a").focus({preventScroll:true});
  log.scrollTop = reply.offsetTop - reply.parentElement.offsetTop;
}
quickBuy.onclick = () => {
  append(buyPrompt, true);
  showChatbotChoices();
};
function addWhatsAppLink(message) {
  const link = document.createElement("a");
  link.href = whatsapp + "?text=" + encodeURIComponent(message);
  link.textContent = "WhatsApp-da aç";
  link.target = "_blank";
  link.rel = "noopener";
  append("").append(link);
  log.scrollTop = log.scrollHeight;
  return link;
}
// Söhbət identifikatoru yalnız açıq səhifə ərzində saxlanılır.
const sessionId = Array.from(crypto.getRandomValues(new Uint32Array(4))).join("-");
form.onsubmit = async event => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message || form.querySelector("button").disabled) return;
  append(message, true);
  input.value = "";
  const intent = message.toLocaleLowerCase("az").replace(/[.!?…]+$/u,"").replace(/\s+/g," ").trim();
  if (/^(?:mən )?(?:ai )?(?:çat[- ]?|chat[- ]?)?bot(?:u)? (?:almaq|sifariş etmək) istəyirəm$/u.test(intent)) {
    showChatbotChoices();
    return;
  }
  if (!endpoint) {
    if (/qiymət|цена|стоимость/i.test(message)) append(document.documentElement.lang==="ru" ? "AI-чатбот — "+GajarConfig.prices.chatbot+" ₼/мес. Настройка бесплатно." : "AI chatbot aylıq "+GajarConfig.prices.chatbot+" ₼, quraşdırma pulsuzdur.");
    addWhatsAppLink(message).focus();
    return;
  }
  const send = form.querySelector("button");
  send.disabled = true;
  const pending = append("Cavab gözlənilir…");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(endpoint, {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({message, sessionId}), signal: controller.signal
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    const answer = data.output ?? data.reply;
    if (typeof answer !== "string" || !answer.trim()) throw new Error();
    pending.textContent = answer;
  } catch {
    pending.textContent = "Cavab alınmadı. Mesajınızı WhatsApp-da göndərə bilərsiniz.";
    addWhatsAppLink(message);
  } finally {
    clearTimeout(timeout);
    send.disabled = false;
    log.scrollTop = log.scrollHeight;
  }
};
