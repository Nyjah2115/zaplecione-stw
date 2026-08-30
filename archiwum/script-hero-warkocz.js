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
    // Kadr jest o tyle wyższy od ekranu, o ile warkocz ma zjechać w dół przez całą
    // sekcję. Zaczynamy od dolnej części kadru i wędrujemy ku górnej, więc obraz
    // przesuwa się w dół razem z przewijaniem — i ani przez chwilę nie odsłania
    // pustego pola, bo zapas jest zawsze poza ekranem.
    var NADMIAR = 0.22;
    // Jedna klatka sekwencji, z opcjonalną przezroczystością.
    var polozKlatke = function (im, postep, alfa) {
      var cw = canvas.width, ch = canvas.height;
      var hRys = ch * (1 + NADMIAR);
      var skala = hRys / im.naturalHeight;
      var w = im.naturalWidth * skala;
      // Ułamek szerokości ekranu, na którym ma się kończyć warkocz. Na telefonie
      // klatka jest rozciągana ponad dwukrotnie, więc bez zejścia niżej włosy
      // zajmowałyby prawie cały kadr i tekst leżałby na nich.
      var cel = window.innerWidth < 900 ? 0.46 : 0.42;
      var x = cel * cw - PRAWA_KRAWEDZ * w;
      var y = -NADMIAR * ch * (1 - postep);

      ctx.globalAlpha = alfa;
      ctx.drawImage(im, x, y, w, hRys);
      // dociągnięcie tła krawędziowym pikselem klatki
      if (x > 0) {
        ctx.drawImage(im, 0, 0, 2, im.naturalHeight, 0, y, Math.ceil(x) + 1, hRys);
      }
      if (x + w < cw) {
        ctx.drawImage(im, im.naturalWidth - 2, 0, 2, im.naturalHeight,
                      Math.floor(x + w) - 1, y, cw - (x + w) + 2, hRys);
      }
      ctx.globalAlpha = 1;
    };

    // Sekwencja ma 90 klatek na cały cykl, czyli około 11 na sekundę — za mało,
    // żeby ruch był gładki. Zamiast doskakiwać do najbliższej klatki, mieszamy
    // dwie sąsiednie proporcjonalnie do miejsca pomiędzy nimi. Ekran dostaje
    // wtedy pełne 60 klatek na sekundę, mimo że materiału jest dziesięć razy mniej.
    var rysuj = function (postep) {
      var idx = postep * (KLATEK - 1);
      var i0 = najblizszaGotowa(Math.floor(idx));
      if (i0 < 0) return;
      var im0 = obrazy[i0];
      polozKlatke(im0, postep, 1);

      var reszta = idx - Math.floor(idx);
      if (reszta > 0.01) {
        var i1 = najblizszaGotowa(Math.ceil(idx));
        if (i1 >= 0 && i1 !== i0) polozKlatke(obrazy[i1], postep, reszta);
      }
      ostatnia = i0;
    };

    var najblizszaGotowa = function (i) {
      for (var d = 0; d < KLATEK; d++) {
        if (obrazy[i - d] && obrazy[i - d].complete && obrazy[i - d].naturalWidth) return i - d;
        if (obrazy[i + d] && obrazy[i + d].complete && obrazy[i + d].naturalWidth) return i + d;
      }
      return -1;
    };

    var odswiez = function (postep) {
      biezacyPostep = postep;
      rysuj(postep);

      // Napisy przełączają się razem ze zjazdem warkocza: na górze cyklu widać
      // nazwę salonu, w dolnej połowie blok o Ani. Każdy zjeżdża w dół w obrębie
      // własnego okna, żeby wchodzący zaczynał od zera, a nie w połowie drogi.
      var DRYF = 90;
      for (var k = 0; k < kroki.length; k++) {
        var od = parseFloat(kroki[k].dataset.od);
        var doo = parseFloat(kroki[k].dataset.do);
        var widoczny = postep >= od && postep <= doo;
        kroki[k].classList.toggle('is-widoczny', widoczny);
        if (widoczny && doo > od) {
          var lokalny = (postep - od) / (doo - od);
          kroki[k].style.setProperty('--dryf', (lokalny * DRYF).toFixed(1) + 'px');
        }
      }
    };

    // pierwsza klatka ma priorytet, reszta doczytuje się w tle
    var wczytaj = function (i, potem) {
      var im = new Image();
      im.decoding = 'async';
      im.onload = function () {
        wczytane++;
        if (i === 0 || Math.abs(biezacyPostep * (KLATEK - 1) - i) < 1.5) rysuj(biezacyPostep);
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
    wczytaj(0, function () { odswiez(biezacyPostep); });
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

    // Warkocz gra sam z siebie, bez przewijania. Postęp liczy zegar, a nie pozycja
    // scrolla. Cykl chodzi tam i z powrotem: warkocz się zaplata i schodzi w dół,
    // potem wraca. Wygładzenie sinusem sprawia, że w punktach zwrotnych prędkość
    // schodzi do zera i zawrócenia w ogóle nie widać — bez tego pętla szarpałaby
    // przy każdym nawrocie.
    // Pełne tam i z powrotem. Przy 20 s nazwa salonu z przyciskami stoi na ekranie
    // około 9 s, a blok o Ani około 10 s — obie rzeczy zdąży się przeczytać.
    var CYKL = 20000;
    var start = null;
    var gra = true;
    var klatkaId = 0;

    var petla = function (czas) {
      klatkaId = window.requestAnimationFrame(petla);
      if (start === null) start = czas;
      var t = ((czas - start) % CYKL) / CYKL;               // 0…1 przez cały cykl
      var postep = (1 - Math.cos(t * 2 * Math.PI)) / 2;      // 0 → 1 → 0, gładko
      odswiez(postep);
    };

    var wlacz = function () {
      if (gra) return;
      gra = true; start = null;
      klatkaId = window.requestAnimationFrame(petla);
    };
    var wylacz = function () {
      if (!gra) return;
      gra = false;
      window.cancelAnimationFrame(klatkaId);
    };

    window.addEventListener('resize', function () {
      wymiaruj();
      odswiez(biezacyPostep);
    }, { passive: true });

    // Nie ma sensu malować kadru, którego nikt nie widzi — ani gdy hero wyjechało
    // poza ekran, ani gdy karta poszła w tło.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (wpisy) {
        if (wpisy[0].isIntersecting) wlacz(); else wylacz();
      }, { threshold: 0 }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) wylacz(); else wlacz();
    });


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

    // Animacja chodzi teraz sama z siebie, więc przy włączonym „ogranicz ruch”
    // naprawdę trzeba ją zatrzymać: pokazujemy jeden statyczny kadr z połowy
    // sekwencji i na tym koniec.
    if (reduced) {
      gra = false;
      wczytaj(Math.round(KLATEK * 0.45), function () {
        odswiez(0.45);
      });
    } else {
      klatkaId = window.requestAnimationFrame(petla);
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
