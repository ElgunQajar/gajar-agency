// Çatın interfeysi və WhatsApp ehtiyat keçidi.
const panel = document.querySelector("#assistant");
const endpoint = window.GajarConfig.webhookUrl.trim();
panel.innerHTML = `<section id="chat" class="chat" aria-label="AI-помощник" hidden>
<header><strong>AI-помощник</strong><button type="button" aria-label="Закрыть чат">×</button></header>
<div class="chat-log" role="log" aria-live="polite"><p>${endpoint ? "Здравствуйте! Что вы хотите узнать о Gajar Agency?" : "Здравствуйте! Напишите вопрос, и мы подготовим сообщение для WhatsApp."}</p></div>
<form><input aria-label="Ваше сообщение" placeholder="Напишите сообщение…" required maxlength="2000"><button>Отправить</button></form></section>
<button type="button" class="fab" id="chat-toggle" aria-expanded="false" aria-controls="chat" aria-label="AI-помощник" title="AI-помощник">${icon("bot")}</button>
<a class="fab wa" href="${whatsapp}" target="_blank" rel="noopener" aria-label="Написать в WhatsApp" title="Написать в WhatsApp">${icon("wa")}</a>`;
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
function addWhatsAppLink(message) {
  const link = document.createElement("a");
  link.href = whatsapp + "?text=" + encodeURIComponent(message);
  link.textContent = "Открыть в WhatsApp";
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
  if (!endpoint) {
    if (/qiymət|цена|стоимость/i.test(message)) append(document.documentElement.lang==="ru" ? "AI-чатбот — "+GajarConfig.prices.chatbot+" ₼/мес. Настройка бесплатно." : "AI chatbot aylıq "+GajarConfig.prices.chatbot+" ₼, quraşdırma pulsuzdur.");
    addWhatsAppLink(message).focus();
    return;
  }
  const send = form.querySelector("button");
  send.disabled = true;
  const pending = append("Ожидаем ответ…");
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
    pending.textContent = "Не удалось получить ответ. Можно отправить сообщение в WhatsApp.";
    addWhatsAppLink(message);
  } finally {
    clearTimeout(timeout);
    send.disabled = false;
    log.scrollTop = log.scrollHeight;
  }
};
