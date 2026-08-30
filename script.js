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

    // Klatki mają 618 px wysokości, więc powyżej pewnego rozmiaru canvas nie niesie
    // już żadnego detalu — dokłada tylko pracy przy każdym przemalowaniu. Na dużym
    // monitorze bufor 2880 px wysokości oznaczał czterokrotnie więcej pikseli do
    // przepisania niż na laptopie, przy dokładnie tym samym obrazku. Ograniczamy go
    // do 1600 px; resztę do rozmiaru okna dociąga już samo skalowanie CSS.
    var MAX_BUFOR = 1600;
    var wymiaruj = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var h = Math.min(canvas.clientHeight * dpr, MAX_BUFOR);
      var skalaBufora = canvas.clientHeight ? h / (canvas.clientHeight * dpr) : 1;
      canvas.width = Math.round(canvas.clientWidth * dpr * skalaBufora);
      canvas.height = Math.round(h);
      ctx.imageSmoothingQuality = 'high';
      ostatnia = -1;
    };

    // Warkocz stoi mniej więcej na środku źródłowego kadru, a na stronie ma stać
    // po lewej, żeby zrobić miejsce na tekst. Samo kadrowanie „cover" nie ma na to
    // dość zapasu, więc dopasowujemy klatkę do wysokości i przesuwamy ją w bok,
    // a powstałe puste pole domalowujemy rozciągniętą krawędzią klatki — tło jest
    // jednolicie kremowe, więc szew jest niewidoczny.
    // Kadrujemy po PRAWEJ krawędzi warkocza, nie po jego środku. Środek wędruje —
    // w pierwszej klatce warkocz jest wąski i siedzi na 0.52 szerokości, w ostatniej
    // rozplata się i sięga do 0.37 — natomiast prawa krawędź stoi w miejscu na
    // 0.61 przez całą sekwencję (zmierzone na klatkach 0, 45 i 89). Trzymając się
    // jej, wiemy dokładnie, w którym miejscu ekranu kończą się włosy, a zaczyna
    // miejsce na tekst.
    var PRAWA_KRAWEDZ = 0.61;
    var rysuj = function (i) {
      var im = obrazy[i];
      if (!im || !im.complete || !im.naturalWidth) return;
      var cw = canvas.width, ch = canvas.height;
      var skala = ch / im.naturalHeight;
      var w = im.naturalWidth * skala;
      // Ułamek szerokości ekranu, na którym ma się kończyć warkocz. Na telefonie
      // klatka jest rozciągana ponad dwukrotnie, więc bez zejścia niżej włosy
      // zajmowałyby prawie cały kadr i tekst leżałby na nich.
      var cel = window.innerWidth < 900 ? 0.38 : 0.42;
      var x = cel * cw - PRAWA_KRAWEDZ * w;

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

    // Na telefonie pierwsze przejście bierze co drugą klatkę, żeby warkocz ruszył
    // po połowie transferu. Braki dociągamy dopiero drugim przejściem, gdy strona
    // już działa — droga przewijania jest na tyle długa, że przeskoki byłyby widoczne.
    var krokLadowania = window.innerWidth < 760 ? 2 : 1;

    wymiaruj();
    wczytaj(0, function () { odswiez(); });
    var nastepna = krokLadowania;
    var uzupelnij = function () {
      for (var i = 0; i < KLATEK; i++) {
        if (!obrazy[i]) { wczytaj(i, uzupelnij); return; }
      }
    };
    var kolejka = function () {
      if (nastepna >= KLATEK) {
        if (!obrazy[KLATEK - 1]) wczytaj(KLATEK - 1, uzupelnij);
        else uzupelnij();
        return;
      }
      var i = nastepna;
      nastepna += krokLadowania;
      wczytaj(i, kolejka);
    };
    kolejka();

    // Przeglądarka potrafi wysłać zdarzenie scroll częściej niż odświeża ekran.
    // Bez tego na monitorze 120 Hz przemalowywaliśmy canvas kilka razy na klatkę
    // zupełnie bez potrzeby — stąd szarpanie na większych ekranach.
    var czeka = false;
    var naScroll = function () {
      if (czeka) return;
      czeka = true;
      window.requestAnimationFrame(function () { czeka = false; odswiez(); });
    };

    window.addEventListener('scroll', naScroll, { passive: true });
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
