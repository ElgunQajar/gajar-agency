(() => {
  const rail = document.querySelector(".people");
  if (!rail || rail.children.length < 2) return;
  const cards = [...rail.children];
  const count = cards.length;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const controls = rail.parentElement;
  const next = controls.querySelector("#next");
  const previous = controls.querySelector("#prev");
  function copyCard(card) {
    const copy = card.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    return copy;
  }
  rail.prepend(...cards.map(copyCard));
  rail.append(...cards.map(copyCard));
  let stride = 0;
  let visible = false;
  let touching = false;
  let hovering = false;
  let timer;
  let settle;
  const jump = left => rail.scrollTo({left, behavior:"instant"});
  function normalize() {
    if (!stride || touching) return;
    const span = stride * count;
    if (rail.scrollLeft < span - 1) jump(rail.scrollLeft + span);
    else if (rail.scrollLeft >= span * 2 - 1) jump(rail.scrollLeft - span);
  }
  function measure() {
    const newStride = cards[1].offsetLeft - cards[0].offsetLeft;
    if (!newStride || Math.abs(newStride - stride) < .1) return;
    const current = stride ? Math.round(rail.scrollLeft / stride) % count : 0;
    stride = newStride;
    jump(cards[current].offsetLeft - rail.children[0].offsetLeft);
  }
  function schedule() {
    clearTimeout(timer);
    if (!visible || document.hidden || motion.matches || touching || hovering || controls.contains(document.activeElement)) return;
    timer = setTimeout(() => move(1), 3100);
  }
  function move(direction) {
    normalize();
    rail.scrollTo({left:(Math.round(rail.scrollLeft / stride) + direction) * stride, behavior:motion.matches ? "instant" : "smooth"});
    schedule();
  }
  next.onclick = () => move(1);
  previous.onclick = () => move(-1);
  rail.tabIndex = 0;
  rail.setAttribute("role", "region");
  rail.setAttribute("aria-label", document.documentElement.lang === "ru" ? "Цифровая команда" : "Rəqəmsal komanda");
  rail.onkeydown = e => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      move(e.key === "ArrowLeft" ? -1 : 1);
    }
  };
  rail.addEventListener("scroll", () => {
    clearTimeout(settle);
    settle = setTimeout(() => {normalize(); schedule();}, 180);
  }, {passive:true});
  controls.addEventListener("pointerenter", e => {hovering = e.pointerType === "mouse"; schedule();});
  controls.addEventListener("pointerleave", () => {hovering = false; schedule();});
  rail.addEventListener("pointerdown", () => {touching = true; schedule();});
  for (const event of ["pointerup","pointercancel"]) window.addEventListener(event, () => {touching = false; schedule();});
  controls.addEventListener("focusin", schedule);
  controls.addEventListener("focusout", () => queueMicrotask(schedule));
  motion.addEventListener("change", schedule);
  document.addEventListener("visibilitychange", schedule);
  new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; schedule();}).observe(rail);
  new ResizeObserver(measure).observe(rail);
  measure();
})();