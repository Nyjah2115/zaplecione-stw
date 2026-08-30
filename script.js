/* Zaplecione_Stw — drobna interaktywność, bez bibliotek */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- hero: suwak metamorfozy ---
     Cała mechanika to jedna zmienna --ciecie: szerokość, do której przycinana jest
     warstwa „przed". Bierze się wprost z natywnego <input type="range">, więc mysz,
     dotyk, klawiatura i czytniki ekranu działają bez pisania własnej obsługi.
     Suwak jest w CSS rozszerzony o szerokość uchwytu, dzięki czemu środek kciuka
     przejeżdża dokładnie od lewej do prawej krawędzi zdjęcia i wartość można wziąć
     wprost. Bez JS suwak nadal się rusza, tylko zdjęcie nie reaguje — dlatego
     domyślne 50% siedzi w CSS, a nie tutaj. */
  var suwak = document.getElementById('metamSuwak');
  var metam = document.getElementById('metam');
  if (suwak && metam) {
    // Etykieta gaśnie, kiedy jej zdjęcie schodzi z kadru. Próg 8% z zapasem
    // pokrywa szerokość samej etykiety, żeby nie wisiała nad cudzym zdjęciem,
    // a przejście przez 12% daje płynne wygaszenie zamiast mrugnięcia.
    var krycie = function (odleglosc) {
      return Math.max(0, Math.min(1, (odleglosc - 8) / 12)).toFixed(2);
    };
    var etykPrzed = metam.querySelector('.metam__etykieta--przed');
    var etykPo = metam.querySelector('.metam__etykieta--po');
    var ustawCiecie = function () {
      var v = Number(suwak.value);
      metam.style.setProperty('--ciecie', v + '%');
      if (etykPrzed) etykPrzed.style.opacity = krycie(v);
      if (etykPo) etykPo.style.opacity = krycie(100 - v);
    };
    suwak.addEventListener('input', ustawCiecie);
    ustawCiecie();
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

  /* --- certyfikat ISO: awaryjne odsłonięcie tabelki ---
     Zdjęcie jest widoczne domyślnie (CSS). Jeśli pliku nie da się wczytać,
     dokładamy klasę i w to miejsce wraca tabelka z danymi. */
  var zdjecieIso = document.getElementById('zdjecieIso');
  var isoDowod = document.getElementById('isoDowod');
  if (zdjecieIso && isoDowod) {
    var brakIso = function () { isoDowod.classList.add('bez-zdjecia'); };
    zdjecieIso.addEventListener('error', brakIso);
    if (zdjecieIso.complete && !zdjecieIso.naturalWidth) brakIso();
  }

  /* --- rok w stopce --- */
  var rok = document.getElementById('rok');
  if (rok) rok.textContent = new Date().getFullYear();

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

})();
