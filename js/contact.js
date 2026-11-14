const inquiry = document.querySelector("#contact-form");
inquiry.addEventListener("input", event => event.target.setCustomValidity(""));
inquiry.addEventListener("submit", event => {
  event.preventDefault();
  const lines = ["Salam, Gajar Agency!"];
  for (const label of inquiry.querySelectorAll("label")) {
    const control = label.control;
    const value = control.value.trim();
    if (!value) {
      control.setCustomValidity("Bu sahəni doldurun.");
      control.reportValidity();
      return;
    }
    lines.push(label.firstChild.textContent.trim() + ": " + value);
  }
  window.open(whatsapp + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
});
