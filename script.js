/* Zaplecione_Stw — drobna interaktywność, bez bibliotek */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- hero: warkocz ciągnięty scrollem ---
     Sekwencja klatek rysowana na canvasie; numer klatki wynika z tego, jak daleko
     przewinięta jest wysoka sekcja hero. To ten sam pomysł co scroll-scrubbed wideo,
     ale bez seekowania po H.264, które na telefonach potrafi zacinać. */
  var KLATEK = 90;
  var hero = document.querySelector('.hero');
  var canvas = document.getElementById('heroCanvas');
  var kroki = document.querySelectorAll('.hero__krok');

  if (hero && canvas) {
    var ctx = canvas.getContext('2d', { alpha: false });
    var obrazy = new Array(KLATEK);
    var wczytane = 0;
    var ostatnia = -1;
    var biezacyPostep = 0;

    var sciezka = function (i) {
      return 'media/warkocz-klatki/k' + String(i).padStart(3, '0') + '.jpg';
    };

    var wymiaruj = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      ostatnia = -1;
    };

    // Warkocz stoi mniej więcej na środku źródłowego kadru, a na stronie ma stać
    // po lewej, żeby zrobić miejsce na tekst. Samo kadrowanie „cover" nie ma na to
    // dość zapasu, więc dopasowujemy klatkę do wysokości i przesuwamy ją w bok,
    // a powstałe puste pole domalowujemy rozciągniętą krawędzią klatki — tło jest
    // jednolicie kremowe, więc szew jest niewidoczny.
    var SRODEK_WARKOCZA = 0.53;   // gdzie warkocz siedzi w klatce źródłowej
    var rysuj = function (i) {
      var im = obrazy[i];
      if (!im || !im.complete || !im.naturalWidth) return;
      var cw = canvas.width, ch = canvas.height;
      var skala = ch / im.naturalHeight;
      var w = im.naturalWidth * skala;
      // Klatka jest dopasowywana do wysokości, więc na wąskim i wysokim ekranie
      // robi się bardzo szeroka — warkocz zajmowałby cały ekran. Dlatego na telefonie
      // przesuwamy jego środek poza lewą krawędź i zostaje sam pas włosów przy brzegu.
      var cel = window.innerWidth < 900 ? -0.10 : 0.24;
      var x = cel * cw - SRODEK_WARKOCZA * w;

      ctx.drawImage(im, x, 0, w, ch);
      // dociągnięcie tła krawędziowym pikselem klatki
      if (x > 0) {
        ctx.drawImage(im, 0, 0, 2, im.naturalHeight, 0, 0, Math.ceil(x) + 1, ch);
      }
      if (x + w < cw) {
        ctx.drawImage(im, im.naturalWidth - 2, 0, 2, im.naturalHeight,
                      Math.floor(x + w) - 1, 0, cw - (x + w) + 2, ch);
      }
      ostatnia = i;
    };

    var najblizszaGotowa = function (i) {
      for (var d = 0; d < KLATEK; d++) {
        if (obrazy[i - d] && obrazy[i - d].complete && obrazy[i - d].naturalWidth) return i - d;
        if (obrazy[i + d] && obrazy[i + d].complete && obrazy[i + d].naturalWidth) return i + d;
      }
      return -1;
    };

    var odswiez = function () {
      var r = hero.getBoundingClientRect();
      var droga = r.height - window.innerHeight;
      var postep = droga > 0 ? Math.min(1, Math.max(0, -r.top / droga)) : 0;
      biezacyPostep = postep;

      var i = Math.round(postep * (KLATEK - 1));
      if (i !== ostatnia) {
        var gotowa = najblizszaGotowa(i);
        if (gotowa >= 0) rysuj(gotowa);
        ostatnia = i;
      }

      for (var k = 0; k < kroki.length; k++) {
        var od = parseFloat(kroki[k].dataset.od);
        var doo = parseFloat(kroki[k].dataset.do);
        kroki[k].classList.toggle('is-widoczny', postep >= od && postep <= doo);
      }

      // nawigacja pojawia się, gdy tylko zaczniesz przewijać
      if (postep > 0.02) document.documentElement.classList.remove('nav-ukryta');
    };

    // pierwsza klatka ma priorytet, reszta doczytuje się w tle
    var wczytaj = function (i, potem) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () {
        wczytane++;
        if (i === 0 || Math.round(biezacyPostep * (KLATEK - 1)) === i) rysuj(i);
        if (potem) potem();
      };
      im.src = sciezka(i);
      obrazy[i] = im;
    };

    // na telefonie bierzemy co drugą klatkę — połowa transferu, a przy krótszej
    // drodze przewijania różnicy i tak nie widać
    var krokLadowania = window.innerWidth < 760 ? 2 : 1;

    wymiaruj();
    wczytaj(0, function () { odswiez(); });
    var nastepna = krokLadowania;
    var kolejka = function () {
      if (nastepna >= KLATEK) {
        if (!obrazy[KLATEK - 1]) wczytaj(KLATEK - 1);
        return;
      }
      var i = nastepna;
      nastepna += krokLadowania;
      wczytaj(i, kolejka);
    };
    kolejka();

    window.addEventListener('scroll', odswiez, { passive: true });
    window.addEventListener('resize', function () { wymiaruj(); odswiez(); }, { passive: true });

    // portret Anny jest opcjonalny — dopóki nie ma pliku, chowamy go zamiast
    // zostawiać złamaną ikonę obrazka
    var portret = document.getElementById('portretAnny');
    if (portret) {
      portret.addEventListener('error', function () {
        var osoba = portret.closest('.hero__osoba');
        if (osoba) osoba.classList.add('bez-zdjecia');
      });
      if (portret.complete && !portret.naturalWidth) {
        var osoba0 = portret.closest('.hero__osoba');
        if (osoba0) osoba0.classList.add('bez-zdjecia');
      }
    }

    // Przy ograniczonym ruchu pasek nawigacji nie chowa się na start — reszta hero
    // (przewijanie klatek) działa tak samo, bo steruje nim sam użytkownik.
    if (!reduced) document.documentElement.classList.add('nav-ukryta');
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
