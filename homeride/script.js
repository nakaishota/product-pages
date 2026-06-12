/* HomeRide LP — interactions */

// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    }
  });
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Auto-reveal common section blocks
document.querySelectorAll(
  ".section-head, .compare__card, .screens__card, .liveact__copy, .liveact__device, .breakdown__device, .annot__item, .cta__h, .cta__p, .cta__form, .cta__buttons, .statement__h, .statement__p"
).forEach((el) => {
  el.classList.add("reveal");
  io.observe(el);
});

// Subtle parallax on hero device
const dev = document.querySelector(".hero__device .device");
if (dev) {
  const heroSection = document.querySelector(".hero");
  let raf = 0;
  window.addEventListener("scroll", () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const r = heroSection.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, 1 - r.bottom / (window.innerHeight + r.height)));
      dev.style.transform = `translateY(${(-progress * 24).toFixed(2)}px)`;
      raf = 0;
    });
  }, { passive: true });
}

// Clock tick on lock screens (purely decorative)
function tickClocks() {
  const now = new Date();
  // Keep the staged time fixed — design choice. No-op.
}
tickClocks();

// Nav scroll shadow
const nav = document.getElementById("nav");
const onScroll = () => {
  if (window.scrollY > 8) nav.style.boxShadow = "0 1px 0 rgba(0,0,0,.06)";
  else nav.style.boxShadow = "";
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Measure dev notice so nav sits flush beneath it
const devNotice = document.querySelector(".dev-notice");
const setNavOffset = () => {
  if (!devNotice) return;
  const h = devNotice.getBoundingClientRect().height;
  document.documentElement.style.setProperty("--dev-notice-h", `${Math.round(h)}px`);
};
setNavOffset();
window.addEventListener("resize", setNavOffset);
if (window.ResizeObserver && devNotice) {
  new ResizeObserver(setNavOffset).observe(devNotice);
}

// ─── TestFlight signup form (Formspree) ───
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  const status = document.querySelector(".cta__status");
  const submit = signupForm.querySelector(".cta__submit");
  const submitLabel = signupForm.querySelector(".cta__submit-label");
  const originalLabel = submitLabel ? submitLabel.textContent : "";

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Guard: tell the developer if Formspree ID hasn't been set
    if (signupForm.action.includes("YOUR_FORM_ID")) {
      status.textContent =
        "Formspree のフォーム ID が未設定です。HomeRide.html の <form action> を、Formspree で取得した URL に置き換えてください。";
      status.className = "cta__status cta__status--err";
      return;
    }

    submit.disabled = true;
    if (submitLabel) submitLabel.textContent = "送信中…";
    status.textContent = "";
    status.className = "cta__status";

    try {
      const res = await fetch(signupForm.action, {
        method: "POST",
        body: new FormData(signupForm),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        signupForm.reset();
        signupForm.classList.add("cta__form--success");
        status.textContent =
          "ご登録ありがとうございます。準備が整い次第、ご登録のメールアドレスへ TestFlight 招待リンクをお送りします。";
        status.className = "cta__status cta__status--ok";
        if (submitLabel) submitLabel.textContent = "登録完了";
      } else {
        const data = await res.json().catch(() => ({}));
        const msg =
          (data.errors && data.errors.map((e) => e.message).join(" / ")) ||
          "送信に失敗しました。時間をおいて再度お試しください。";
        status.textContent = msg;
        status.className = "cta__status cta__status--err";
        submit.disabled = false;
        if (submitLabel) submitLabel.textContent = originalLabel;
      }
    } catch (err) {
      status.textContent =
        "通信エラーが発生しました。ネットワーク環境をご確認のうえ、再度お試しください。";
      status.className = "cta__status cta__status--err";
      submit.disabled = false;
      if (submitLabel) submitLabel.textContent = originalLabel;
    }
  });
}
