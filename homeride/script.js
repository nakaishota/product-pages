/* HomeRide LP — progressive enhancement only.
   JS が無効でも全コンテンツは表示される（.js クラスで演出をゲート）。 */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  var reduced = false;
  if (window.matchMedia) {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---- スクロールリビール ---- */
  var targets = document.querySelectorAll('.reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );
    targets.forEach(function (t) { io.observe(t); });
  } else {
    /* reduced-motion または IO 非対応: 即時表示 */
    targets.forEach(function (t) { t.classList.add('is-visible'); });
  }

  /* ---- ナビの境界線（スクロール時のみ表示） ---- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (nav) {
      nav.classList.toggle('nav--scrolled', window.scrollY > 8);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- TestFlight フォーム AJAX 送信 ----
     fetch 非対応時は preventDefault しないので、従来どおり素の POST で送信される（フェイルセーフ）。 */
  var form = document.getElementById('tf-form');
  if (form && window.fetch) {
    var statusEl = document.getElementById('tf-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var btnDefaultText = submitBtn ? submitBtn.textContent : '';

    function showStatus(message, kind) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = 'form__status form__status--' + kind;
      statusEl.hidden = false;
    }
    function restoreButton() {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = btnDefaultText;
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (statusEl) {
        statusEl.hidden = true;
        statusEl.className = 'form__status';
        statusEl.textContent = '';
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中…';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          showStatus('ご登録ありがとうございます。準備が整い次第、ご登録のメールアドレスへ TestFlight 招待リンクをお送りします。', 'ok');
          restoreButton();
        } else {
          throw new Error('bad status');
        }
      }).catch(function () {
        showStatus('送信に失敗しました。時間をおいて再度お試しください。', 'err');
        restoreButton();
      });
    });
  }
})();
