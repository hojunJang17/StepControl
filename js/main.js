// Lazy-load videos, play while on screen, and keep each group in sync.
const videos = [...document.querySelectorAll("video[data-src]")];
const groups = [...document.querySelectorAll(".group")];

const load = (v) => {
  if (!v.src) v.src = v.dataset.src;
};

// Videos of a group start together once all are ready and the group is visible.
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    const vs = [...e.target.querySelectorAll("video")];
    if (e.isIntersecting) {
      vs.forEach(load);
      restart(vs);
    } else {
      vs.forEach((v) => v.pause());
    }
  });
}, { threshold: 0.25 });

function restart(vs) {
  vs.forEach((v) => { v.pause(); v.currentTime = 0; });
  const ready = vs.map((v) => v.readyState >= 3
    ? Promise.resolve()
    : new Promise((r) => v.addEventListener("canplay", r, { once: true })));
  Promise.all(ready).then(() => vs.forEach((v) => v.play().catch(() => {})));
}

groups.forEach((g) => {
  io.observe(g);
  g.querySelector(".sync")?.addEventListener("click", () => restart([...g.querySelectorAll("video")]));
});

// Teaser (not in a group)
videos.filter((v) => !v.closest(".group")).forEach((v) => {
  load(v);
  new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())), { threshold: 0.25 }).observe(v);
});
