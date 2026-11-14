// İctimai n8n webhook ünvanı. Boş olduqda WhatsApp açılır.
// POST sorğusu { message, sessionId } göndərir. Cavab JSON: { output: "..." }.
// n8n saytın domenindən gələn POST və OPTIONS sorğularına icazə verməlidir.
window.GajarConfig = { webhookUrl: "" };
