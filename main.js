function copyCoupon(btn) {
  var code = btn.getAttribute('data-code');
  var card = btn.closest('.coupon-card');
  var ctaLink = card ? card.querySelector('.card-cta') : null;
  var url = ctaLink ? ctaLink.href : null;
  navigator.clipboard.writeText(code).then(function () {
    btn.classList.add('revealed', 'copied');
    btn.querySelector('.code-copy-hint').textContent = '복사 완료! 2초 후 이동합니다...';
    if (url) {
      setTimeout(function () {
        window.open(url, '_blank', 'noopener');
      }, 2000);
    }
    setTimeout(function () {
      btn.classList.remove('copied', 'revealed');
      btn.querySelector('.code-copy-hint').textContent = '클릭하여 확인';
    }, 3000);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Platform filter tabs
  var tabs = document.querySelectorAll('.filter-tab');
  var cards = document.querySelectorAll('.coupon-card');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var filter = tab.getAttribute('data-filter');
      cards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-platform') === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Coupon code copy is handled by global copyCoupon function

  // Mobile menu toggle
  var toggle = document.querySelector('.menu-toggle');
  var navList = document.querySelector('.nav-list');
  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', navList.classList.contains('open'));
    });
  }
});
