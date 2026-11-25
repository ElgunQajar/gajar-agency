(() => {
  const portraits = Array.from(
    document.querySelectorAll('img[src*="/agents/"], img[src$="/elgun.jpg"]'),
    image => {
      const light = image.getAttribute("src");
      const dark = light.replace(/(\.(?:png|jpg))$/, "-dark$1");
      return { image, light, dark };
    }
  );
  if (!portraits.length) return;

  const root = document.documentElement;
  function matchTheme() {
    for (const { image, light, dark } of portraits) {
      const source = root.dataset.theme === "dark" ? dark : light;
      if (image.getAttribute("src") !== source) image.setAttribute("src", source);
    }
  }
  matchTheme();
  new MutationObserver(matchTheme).observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
})();
