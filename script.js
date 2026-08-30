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

  /* --- wideo w tle hero ---
     Plik podpinamy dopiero ze skryptu i z preload="none", więc pierwsze wejście
     na stronę nie ciągnie 2 MB, zanim pokaże się treść. Przy ustawieniu
     „ogranicz ruch” w ogóle go nie wczytujemy — zostaje sam plakat, czyli
     nieruchoma pierwsza klatka. */
  var wideo = document.getElementById('wideoSalon');
  if (wideo && !reduced) {
    var wlaczWideo = function () {
      wideo.src = 'media/hero/salon.mp4';
      var p = wideo.play();
      // Przeglądarka może odmówić autoodtwarzania — wtedy zostaje plakat
      // i nic się nie psuje, więc odrzucenie tylko pochłaniamy.
      if (p && p.catch) p.catch(function () {});
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(wlaczWideo, { timeout: 2500 });
    else window.addEventListener('load', wlaczWideo);
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

  /* --- kursor-nożyczki ---
     Nożyczki płyną za myszką z interpolacją, przy kliknięciu ostrza się schodzą,
     a nad elementem klikalnym rosną. Pętla rysowania zatrzymuje się, gdy kursor
     dogoni wskaźnik, więc nic nie mieli procesora w tle. Przy ograniczonym ruchu
     nożyczki zostają, ale bez płynięcia — doklejają się wprost do wskaźnika. */
  var kursor = document.getElementById('kursor');
  if (kursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.documentElement.classList.add('kursor-nozyczki');

    var KLIKALNE = 'a, button, summary, label, [role="button"], .btn, .tile, .ikona, .metam__suwak, .nav__burger';
    var celX = window.innerWidth / 2, celY = window.innerHeight / 2;
    var kx = celX, ky = celY, klatka = null, ruszony = false, ciachTimer = null;
    var plynnie = reduced ? 1 : 0.35;

    var ustaw = function (x, y) {
      kursor.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) translate(-50%, -50%)';
    };

    var rysuj = function () {
      kx += (celX - kx) * plynnie;
      ky += (celY - ky) * plynnie;
      ustaw(kx, ky);
      klatka = (Math.abs(celX - kx) > 0.3 || Math.abs(celY - ky) > 0.3)
        ? window.requestAnimationFrame(rysuj)
        : null;
    };

    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      celX = e.clientX;
      celY = e.clientY;

      if (!ruszony) {                 // pierwszy ruch — pojaw się od razu na miejscu
        ruszony = true;
        kx = celX; ky = celY;
        ustaw(kx, ky);
        kursor.classList.add('jest-widoczny');
      }

      kursor.classList.toggle('nad-klikalnym', !!(e.target.closest && e.target.closest(KLIKALNE)));
      if (!klatka) klatka = window.requestAnimationFrame(rysuj);
    }, { passive: true });

    window.addEventListener('mousedown', function () {
      kursor.classList.add('ciach');
      clearTimeout(ciachTimer);
      ciachTimer = setTimeout(function () { kursor.classList.remove('ciach'); }, 110);
    });

    document.addEventListener('mouseleave', function () { kursor.classList.remove('jest-widoczny'); });
    document.addEventListener('mouseenter', function () { if (ruszony) kursor.classList.add('jest-widoczny'); });
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
