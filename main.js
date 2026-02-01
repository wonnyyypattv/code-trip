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

// Google 스프레드시트 연동 설정
// 스프레드시트 "웹에 게시" 후 아래 SHEET_ID를 교체하세요
var SHEET_ID = '1AT7S-PJCpvY4sIB8irYMcer69D5AlcytBD3HKdLfVtw';
var SHEET_GID = '0';
var SHEET_URL = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:json&gid=' + SHEET_GID;

var AFFILIATE_URLS = {
  klook: 'https://www.klook.com/ko/?aid=110430',
  agoda: 'https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1957557',
  tripcom: 'https://www.trip.com/t/LsTtSuOjKT2',
  hotelscom: 'https://www.hotels.com/affiliate/9FLUW4d',
  myrealtrip: 'https://myrealt.rip/U5kT3d'
};

var AFFILIATE_PARAMS = {
  klook: { key: 'aid', value: '110430' },
  agoda: { key: 'cid', value: '1957557' },
  tripcom: { key: 'utm_source', value: 'codetrip' },
  hotelscom: { key: 'rffrid', value: '9FLUW4d' },
  myrealtrip: null
};

function appendAffiliate(url, platform) {
  if (!url) return AFFILIATE_URLS[platform] || '#';
  var param = AFFILIATE_PARAMS[platform];
  if (!param) return url;
  try {
    var u = new URL(url);
    if (!u.searchParams.has(param.key)) {
      u.searchParams.set(param.key, param.value);
    }
    return u.toString();
  } catch (e) {
    return url;
  }
}

var PLATFORM_NAMES = {
  klook: { name: 'Klook', colorClass: 'klook-color' },
  agoda: { name: 'Agoda', colorClass: 'agoda-color' },
  tripcom: { name: 'Trip.com', colorClass: 'tripcom-color' },
  hotelscom: { name: 'Hotels.com', colorClass: 'hotelscom-color' },
  myrealtrip: { name: '마이리얼트립', colorClass: 'myrealtrip-color' }
};

function loadPromotions() {
  if (SHEET_ID === 'YOUR_SHEET_ID_HERE') return;
  var grid = document.querySelector('.coupon-grid');
  if (!grid) return;

  fetch(SHEET_URL)
    .then(function (res) { return res.text(); })
    .then(function (text) {
      // Google Visualization API 응답에서 JSON 추출
      var json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
      var cols = json.table.cols.map(function (c) { return c.label; });
      var rows = json.table.rows;
      var now = new Date();

      rows.forEach(function (row) {
        var data = {};
        cols.forEach(function (col, i) {
          var cell = row.c[i];
          data[col] = cell ? (cell.v !== null ? cell.v : '') : '';
        });

        // active 필터
        if (data.active === false || String(data.active).toUpperCase() === 'FALSE') return;

        // platform이 비어있으면 스킵
        if (!data.platform) return;

        // 만료일 필터 (Google gviz 날짜: "Date(2026,1,28)" 형식)
        if (data.expiresAt) {
          var expires;
          var dm = String(data.expiresAt).match(/Date\((\d+),(\d+),(\d+)\)/);
          if (dm) {
            expires = new Date(parseInt(dm[1]), parseInt(dm[2]), parseInt(dm[3]));
          } else {
            expires = new Date(data.expiresAt);
          }
          if (!isNaN(expires.getTime()) && expires < now) return;
        }

        var platform = String(data.platform).toLowerCase();
        var pInfo = PLATFORM_NAMES[platform] || { name: platform, colorClass: '' };
        var url = appendAffiliate(data.url, platform);

        var article = document.createElement('article');
        article.className = 'coupon-card';
        article.setAttribute('data-platform', platform);
        article.setAttribute('data-category', data.category || 'etc');
        article.setAttribute('data-source', 'dynamic');
        article.innerHTML =
          '<div class="card-badge">' + (data.badge || '') + '</div>' +
          '<div class="card-platform"><span class="platform-name ' + pInfo.colorClass + '">' + pInfo.name + '</span></div>' +
          '<h2 class="card-title">' + (data.title || '') + '</h2>' +
          '<p class="card-desc">' + (data.description || '') + '</p>' +
          '<div class="card-detail">' +
            '<span class="discount-tag">' + (data.discountTag || '') + '</span>' +
            '<span class="card-condition">' + (data.condition || '') + '</span>' +
          '</div>' +
          '<a href="' + url + '" target="_blank" rel="noopener sponsored" class="card-cta">쿠폰 받으러 가기</a>';

        grid.appendChild(article);
      });
    })
    .catch(function (err) {
      console.error('프로모션 로드 실패:', err);
    });
}

function applyFilter(filter) {
  var allCards = document.querySelectorAll('.coupon-card');
  allCards.forEach(function (card) {
    if (filter === 'all' || card.getAttribute('data-platform') === filter) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Platform filter tabs
  var tabs = document.querySelectorAll('.filter-tab');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      applyFilter(tab.getAttribute('data-filter'));
    });
  });

  // 스프레드시트에서 프로모션 로드
  loadPromotions();

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
