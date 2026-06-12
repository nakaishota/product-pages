const swiper_about = new Swiper("#js-about__swiper", {
  loop: true,
  slidesPerView: 8,
  spaceBetween: 18,
  speed: 5000,
  allowTouchMove: false,
  autoplay: {
    delay: 0,
  },

  breakpoints: {
    901: {
      slidesPerView: 9,
    },
  },
});

const swiper_spots = new Swiper("#js-spots__swiper", {
  navigation: {
    nextEl: "#js-spots__next",
    prevEl: "#js-spots__prev",
  },

  loop: true,
  speed: 500,
  slidesPerView: 1.525,
  spaceBetween: 16,
  centeredSlides: true,

  breakpoints: {
    601: {
      slidesPerView: 2,
      spaceBetween: 16,
      centeredSlides: true,
    },
    901: {
      slidesPerView: 2.457,
      spaceBetween: 32,
      centeredSlides: false,
    },
    1201: {
      slidesPerView: 3.2234,
      spaceBetween: 32,
      centeredSlides: false,
    },
  },
});

// qaセクション
jQuery(".js-accordion").on("click", function (e) {
  e.preventDefault();

  if (!jQuery(this).parent().hasClass("is-open")) {
    jQuery(this).parent().addClass("is-open");
    jQuery(this).next().slideDown();
  } else {
    jQuery(this).parent().removeClass("is-open");
    jQuery(this).next().slideUp();
  }
});

// ドロワーメニュー
jQuery("#js-drawer-icon").on("click", function (e) {
  e.preventDefault(); //ブラウザ標準機能無効
  jQuery("#js-drawer-icon").toggleClass("is-checked");
  jQuery("#js-drawer-content").toggleClass("is-checked");
});
jQuery('#js-drawer-content a[href^="#"]').on("click", function () {
  jQuery("#js-drawer-icon").removeClass("is-checked");
  jQuery("#js-drawer-content").removeClass("is-checked");
});

// ページトップボタン
jQuery(window).on("scroll", function () {
  if (300 < jQuery(window).scrollTop()) {
    jQuery("#js-pagetop").addClass("is-show");
  } else {
    jQuery("#js-pagetop").removeClass("is-show");
  }
});
jQuery('a[href^="#"]').on("click", function (e) {
  const speed = 500;
  const id = jQuery(this).attr("href");
  const target = jQuery("#" == id ? "html" : id);
  const position = jQuery(target).offset().top;

  jQuery("html,body").animate(
    {
      scrollTop: position,
    },
    speed,
    "swing"
  );
});

// prize item ダイアログ表示
jQuery(".prizes__item").on("click", function () {
  // 画像設定
  let imgSrc = jQuery(this).find("img").attr("src");
  jQuery("#js-modal__image").attr("src", imgSrc);

  // タイトル設定
  let title = jQuery(this).find(".prizes__title").text();
  jQuery("#js-modal__title").text(title);

  // テキスト設定
  let id = jQuery(this).attr("id");
  switch (id) {
    case "js-prizes_1":
      jQuery("#js-modal__text").html("海沿いにあるケーキ屋さん、<br>海街洋菓子店の人気焼き菓子<br class='modal-sp'>詰め合わせセット。<br>こだわりのバターをふんだんに使った<br class='modal-sp'>リッチな味わいで、濃厚なコクが<br class='modal-sp'>後を引く美味しさです。");
      break;
    case "js-prizes_2":
      jQuery("#js-modal__text").html("お土産としても大人気の<br class='modal-sp'>猫グッズを集めました。<br>お家で、オフィスで、<br>眺めているだけでも癒されてしまう<br>愛らしい猫たちと一緒に。");
      break;
    case "js-prizes_3":
      jQuery("#js-modal__text").html("全国にファンがいる本格的な<br class='modal-sp'>尾道ラーメンをお家で。<br>尾道ラーメンといえば、<br class='modal-sp'>透き通った醤油スープと、<br>平打ち麺が特徴です。<br>コクがありながら<br class='modal-sp'>まろやかな味のスープは<br>思わず飲み干したくなるお味。");
      break;
    case "js-prizes_4":
      jQuery("#js-modal__text").html("尾道の人気喫茶店のコーヒー豆を<br class='modal-sp'>使用したドリップバッグと<br class='modal-sp'>マグカップのセット。<br>香り高い深煎りの豆は、<br class='modal-sp'>カフェオレにするのも◎<br>カンタンに楽しめるドリップバッグは、<br>オフィスや在宅ワーク時、<br class='modal-sp'>忙しい家事の合間など<br>日常のさまざまなシーンで大活躍。");
      break;
    case "js-prizes_5":
      jQuery("#js-modal__text").html("工房尾道帆布とコラボした、<br>本キャンペーンオリジナルトート。<br>シンプルなデザインで、シーンを選ばず<br>お使いいただけます。<br>しっかりした生地で、<br>年月とともに<br class='modal-sp'>変化していく風合いも魅力。");
      break;
    default:
      break;
  }

  jQuery(".modal-back").css({
    opacity: "1",
    visibility: "visible",
  });
  jQuery("body").css("overflow", "hidden");
  jQuery("#js-pagetop").removeClass("is-show");
});

// クリックで半透明解除(ポップアップ)
jQuery(".modal-back").on("click", function () {
  jQuery(this).css({
    opacity: "0",
    visibility: "hidden",
  });
  // スクロール固定解除
  jQuery("body").css("overflow", "auto");
  if (300 < jQuery(window).scrollTop()) {
    jQuery("#js-pagetop").addClass("is-show");
  }
});

// 中身はクリックしても閉じない(ポップアップ)
jQuery(".modal-inner").on("click", function (e) {
  e.stopPropagation();
});

// 閉じるボタン(ポップアップ)
jQuery("#js-modal__button").on("click", function () {
  jQuery(".modal-back").css({
    opacity: "0",
    visibility: "hidden",
  });
  // スクロール固定解除
  jQuery("body").css("overflow", "auto");
  if (300 < jQuery(window).scrollTop()) {
    jQuery("#js-pagetop").addClass("is-show");
  }
});

// ふわっと表示
const intersectionObserver = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in-view");
      }
    });
  },
  {
    rootMargin: "0px 0px -100px 0px", // 下に100pxずらして表示開始
  }
);

// サンプル用ダイアログ
// ダイアログ内のSNS
jQuery(".show-dialog").on("click", function (e) {
  e.preventDefault();
  if (!jQuery(".mydialog").hasClass("is-disped")) {
    jQuery(".mydialog").addClass("is-disped");
  }
});
jQuery(".mydialog").on("click", function () {
  jQuery(".mydialog").removeClass("is-disped");
});

// form invalid
jQuery("#your-name, #your-email, #your-select, #your-message").on("invalid", function (event) {
  let form_field = jQuery(this).closest(".form-field");
  if (form_field === null) {
    console.error("Form field not found.");
    return;
  }
  form_field.addClass("is-invalid");
});

// フォームの入力値が変更されたときにバリデーションエラーをクリア
jQuery("#your-name, #your-email, #your-select, #your-message").on("change", function () {
  let form_field = jQuery(this).closest(".form-field");
  if (form_field !== null && form_field.hasClass("is-invalid")) {
    form_field.removeClass("is-invalid");
  }
});

// // 読み込み画面
window.onload = function () {
  // 5秒後にloadedクラスを追加するために遅延を設定
  setTimeout(function () {
    const loading = document.getElementById("loading");
    loading.classList.add("loaded");

    // アニメーション開始
    const inViewItems = document.querySelectorAll(".simple-anime, .original-anime");
    inViewItems.forEach(function (inViewItem) {
      intersectionObserver.observe(inViewItem);
    });
  }, 4000);
};
