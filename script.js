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

  /* --- przyciski: rozbicie napisu na litery ---
     Każda litera dostaje własny <span> i numer w kolejności, z którego CSS liczy
     opóźnienie podskoku — stąd fala od lewej do prawej. Czytnik ekranu dostaje
     całą frazę z aria-label, a same litery są przed nim ukryte; bez tego czytałby
     napis głoska po głosce. Ruszamy wyłącznie węzły tekstowe, więc ikony i inne
     elementy w środku przycisku zostają nietknięte. */
  document.querySelectorAll('.btn').forEach(function (btn) {
    var pelny = btn.textContent.replace(/\s+/g, ' ').trim();
    if (!pelny) return;
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', pelny);

    var licznik = 0;
    var rozbij = function (wezel) {
      Array.prototype.slice.call(wezel.childNodes).forEach(function (dziecko) {
        if (dziecko.nodeType === 3) {
          var tekst = dziecko.nodeValue;
          if (!tekst.trim()) return;
          // Litery idą do wspólnego opakowania. Wrzucone wprost do przycisku
          // stałyby się osobnymi elementami flexa i każdą rozdzielałby odstęp
          // spod gap — napis rozjechałby się na całą szerokość.
          var opak = document.createElement('span');
          opak.className = 'btn__t';
          for (var i = 0; i < tekst.length; i++) {
            var s = document.createElement('span');
            s.className = 'btn__z';
            s.setAttribute('aria-hidden', 'true');
            s.style.setProperty('--i', licznik++);
            s.textContent = tekst[i];
            opak.appendChild(s);
          }
          wezel.replaceChild(opak, dziecko);
        } else if (dziecko.nodeType === 1 && dziecko.tagName !== 'SVG') {
          rozbij(dziecko);
        }
      });
    };
    rozbij(btn);
  });

  /* Na ekranie dotykowym nie ma najechania, więc fala liter nie miałaby jak się
     pokazać. Puszczamy ją raz na przycisk, kiedy wjedzie w widok. */
  if (!reduced && window.matchMedia('(hover: none)').matches
      && 'IntersectionObserver' in window) {
    var obsFala = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) {
        if (!w.isIntersecting) return;
        var el = w.target;
        obsFala.unobserve(el);
        el.classList.add('is-fala');
        setTimeout(function () { el.classList.remove('is-fala'); }, 1400);
      });
    }, { threshold: 0.9 });
    document.querySelectorAll('.btn').forEach(function (b) { obsFala.observe(b); });
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
