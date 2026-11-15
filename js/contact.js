const inquiry = document.querySelector("#contact-form");
inquiry.addEventListener("input", event => {event.target.setCustomValidity("");inquiry.querySelector(".draft-link")?.remove();});
inquiry.addEventListener("submit", event => {
  event.preventDefault();
  const russian = document.documentElement.lang === "ru";
  const lines = [russian ? "Здравствуйте, Gajar Agency!" : "Salam, Gajar Agency!"];
  for (const label of inquiry.querySelectorAll("label")) {
    const control = label.control;
    const value = control.value.trim();
    if (!value) {
      control.setCustomValidity(russian ? "Заполните это поле." : "Bu sahəni doldurun.");
      control.reportValidity();
      return;
    }
    lines.push(label.firstChild.textContent.trim() + ": " + value);
  }
  GajarLead.send(inquiry,{type:"contact",...Object.fromEntries(new FormData(inquiry))},lines.join("\n"));
});
