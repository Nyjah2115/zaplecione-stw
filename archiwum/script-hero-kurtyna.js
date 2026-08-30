/* Zaplecione_Stw — drobna interaktywność, bez bibliotek */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- wariant hero: kurtyna | warkocz | foto ---
     Sterowany parametrem ?hero= albo roboczym przełącznikiem w rogu hero.
     Wideo gra raz i zatrzymuje się na otwartym kadrze — pętla „zatrzaskiwałaby"
     kurtynę z powrotem co 5 sekund. */
  var WARIANTY = {
    kurtyna: { src: 'media/hero/kurtyna-jasna.mp4', poster: 'media/hero/kurtyna-jasna.jpg' },
    ciemna:  { src: 'media/hero/kurtyna.mp4',       poster: 'media/hero/kurtyna.jpg' },
    warkocz: { src: 'media/hero/warkocz.mp4',       poster: 'media/hero/warkocz.jpg' },
    foto:    null
  };

  var media = document.getElementById('heroMedia');
  var video = document.getElementById('heroVideo');

  function ustawWariant(nazwa) {
    if (!(nazwa in WARIANTY)) nazwa = 'kurtyna';
    media.dataset.wariant = nazwa;
    var w = WARIANTY[nazwa];
    if (!w) { video.removeAttribute('src'); video.load(); return; }
    video.poster = w.poster;
    video.src = w.src;
    video.muted = true;
    video.currentTime = 0;
    // pierwsze play() tuż po podmianie src bywa odrzucane — ponawiamy, gdy plik jest gotowy
    var odpal = function () {
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* autoplay zablokowany — zostaje poster */ });
    };
    odpal();
    video.addEventListener('canplay', odpal, { once: true });
  }

  // włosy po bokach rozpływają się i wpuszczają światło — zostaje jasne tło,
  // a razem z nim zjeżdża górny pasek nawigacji
  function otworz() {
    if (media) media.classList.add('is-otwarte');
    document.documentElement.classList.remove('nav-ukryta');
  }

  if (media && video) {
    var wybrany = new URLSearchParams(location.search).get('hero') || 'kurtyna';
    ustawWariant(reduced ? 'foto' : wybrany);

    if (reduced) {
      otworz();
    } else {
      // chowamy pasek dopiero tutaj: gdyby skrypt nie wystartował,
      // nawigacja zostaje widoczna zamiast zniknąć na dobre
      document.documentElement.classList.add('nav-ukryta');
      // kurtyna jest praktycznie rozsunięta ok. 3 s przed końcem klipu — nie ma po co
      // trzymać widza na ciemnym kadrze do samego 'ended'
      video.addEventListener('timeupdate', function () {
        if (video.currentTime >= 3) otworz();
      });
      video.addEventListener('ended', otworz);
      // gdyby autoplay był zablokowany albo plik się nie doczytał — i tak odsłoń tło
      setTimeout(otworz, 6000);
    }
  }

  /* --- pasek nawigacji po scrollu --- */
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('is-stuck', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- menu mobilne --- */
  var burger = document.getElementById('burger');
  var links = document.querySelector('.nav__links');
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    links.classList.toggle('is-open', !open);
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      burger.setAttribute('aria-expanded', 'false');
      links.classList.remove('is-open');
    }
  });

  /* --- wejścia sekcji --- */
  var items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var group = entry.target.parentElement;
      var siblings = group ? Array.prototype.filter.call(group.children, function (c) {
        return c.classList && c.classList.contains('reveal');
      }) : [];
      var i = siblings.indexOf(entry.target);
      // hero ma własne opóźnienia w CSS — czeka, aż rozsunie się kurtyna
      if (!entry.target.closest('.hero')) {
        entry.target.style.setProperty('--d', (i > 0 ? Math.min(i, 6) * 70 : 0) + 'ms');
      }
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  items.forEach(function (el) { io.observe(el); });

  /* --- warkocz doplatany scrollem ---
     Długość odsłoniętego warkocza to po prostu pozycja dolnej krawędzi okna
     względem początku warkocza. Liczone w rAF, żeby nie zamulać scrolla. */
  var warkocz = document.getElementById('warkocz');
  if (warkocz && !reduced) {
    var przelicz = function () {
      var r = warkocz.getBoundingClientRect();
      var dlugosc = Math.max(0, Math.min(r.height, window.innerHeight - r.top));
      warkocz.style.setProperty('--postep', dlugosc + 'px');
    };
    // liczone wprost w handlerze, bez rAF: to jeden odczyt geometrii i jeden zapis
    // stylu, a przy rAF maska zostawała zamrożona, gdy karta była w tle
    window.addEventListener('scroll', przelicz, { passive: true });
    window.addEventListener('resize', przelicz, { passive: true });
    przelicz();
  }

  /* --- rok w stopce --- */
  var rok = document.getElementById('rok');
  if (rok) rok.textContent = new Date().getFullYear();
})();
