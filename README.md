# Zaplecione_Stw — strona

Jednostronicowa strona salonu fryzjerskiego Zaplecione_Stw ze Stalowej Woli.
Czysty HTML/CSS/JS, bez frameworków i bez builda.

## Publikacja
**https://nyjah2115.github.io/zaplecione-stw/** — repo `Nyjah2115/zaplecione-stw`,
gałąź `main`, katalog `/`. Po każdej zweryfikowanej zmianie: commit i push.

W `.gitignore` celowo: `DANE-DO-POTWIERDZENIA.md` (prywatne), `media/hero/orig/` (33 MB
oryginałów) i `media/logo/zrodlo-canva.svg` (2,2 MB, nieużywany przez stronę).

## Podgląd lokalny
Konfiguracja `zaplecione` w `/Users/macbook/claude/.claude/launch.json`, port **8907**.

## Pliki
- `index.html` · `style.css` · `script.js`
- `archiwum/` — odrzucone warianty: wersja ciemna, poprzednie hero z kurtyną
  oraz boczny warkocz `warkocz-boczny.svg`. Nie kasować, Dawid może chcieć wrócić.
- `media/foto/` — zdjęcia wybrane na stronę (z publicznego Instagrama salonu)
- `media/ig/` — komplet 12 pobranych postów + `urls.txt` ze źródłami
- `media/hero/` — tu trafią klipy z Higgsfield
- `BADANIE.md` — co ustaliłem o firmie i skąd
- `DANE-DO-POTWIERDZENIA.md` — **wszystko, co jest zmyślone i wymaga potwierdzenia**
- `HIGGSFIELD-PROMPTY.md` — trzy prompty na hero + ustawienia i koszty
- `design-system/` — wygenerowany system projektowy (paletę nadpisałem ręcznie)

## Hero — warkocz ciągnięty scrollem
Wzorowane na scroll-scrubbed wideo (Dawid pokazał stronę Emberline ze strumieniem kawy).
Sekcja `.hero` ma **340svh** wysokości (260svh na telefonie); scena w środku jest
`position:sticky`, a pozycja przewinięcia wybiera klatkę rysowaną na `<canvas>`.

**Sekwencja klatek zamiast wideo.** `media/warkocz-klatki/k000–k089.jpg` — 90 klatek,
1100 px szerokości, 3,3 MB razem (mniej niż oryginalny klip 5,6 MB). Powód: scrubbing
po `currentTime` wideo tnie na telefonach, bo każdy ruch palcem zmusza dekoder do skoku
do klatki kluczowej. Obrazki nie mają tego problemu.
Źródło: `media/hero/orig/orig-warkocz-w-dol.mp4` (Higgsfield, Kling 3.0, 10 s, 15 kr).
Klatki wycięte skryptem z zakresu **1,70–9,95 s** — wcześniej w prawym górnym rogu
widać palec, który trzyma warkocz.

**Kadrowanie.** Warkocz stoi na środku klatki źródłowej, a na stronie ma stać po lewej,
żeby zrobić miejsce na tekst. Samo „cover" nie ma na to zapasu, więc klatka jest
dopasowana do wysokości i przesunięta w bok, a puste pole domalowane rozciągniętą
krawędzią klatki — tło jest jednolicie kremowe, więc szwu nie widać.
Stała `SRODEK_WARKOCZA` w `script.js` mówi, gdzie warkocz siedzi w źródle.

**Portret Anny** — `media/foto/anna.jpg`, wycięty skryptem `tools/kadr.swift` ze zrzutu
`~/Desktop/ZAPLECIONE/Zrzut ekranu 2026-08-28 o 00.48.33.png` (kadr 300,262 360×450).
Gdyby plik kiedyś zniknął, skrypt chowa obrazek klasą `bez-zdjecia` i zostaje sam tekst,
zamiast złamanej ikony.
⚠️ W tle zdjęcia widać ściankę z logotypami **BeYou / Beauty for You** — to marka szkoleniowa,
u której Anna się kształciła. Warto potwierdzić, czy chce mieć cudze logo w hero.

**Dwa przystanki tekstowe** (`.hero__krok` z `data-od` / `data-do` w skali postępu 0–1).
Wychodzący tekst gaśnie w 0,3 s, wchodzący startuje z opóźnieniem 0,3 s — bez tego
przez moment nakładały się dwa akapity w tym samym miejscu.
Trzeci przystanek („Czasem najlepsze, co możemy zrobić, to odmówić") został na życzenie
Dawida usunięty, a Anna dostała całą drugą połowę przewijania. Jej tekst jest napisany
**w pierwszej osobie** — przedstawia się sama. W tym przystanku **celowo nie ma żadnego
przycisku**: numer telefonu jest w pasku nawigacji i w pierwszym przystanku, a tu ma być
tylko przedstawienie się.

**Na telefonie** układ jest taki sam jak na dużym ekranie: warkocz po lewej, treść
po prawej, bez żadnej podkładki pod tekstem. Ładuje się co druga klatka (połowa transferu).

⚠️ Klatka jest dopasowywana do **wysokości**, więc na wąskim i wysokim ekranie robi się
bardzo szeroka i warkocz zająłby cały ekran. Dlatego na telefonie punkt docelowy
(`cel` w `rysuj()`) jest **ujemny (−0,10)** — środek warkocza ląduje poza lewą krawędzią
i zostaje z niego pas przy brzegu. Wcześniej była tu kremowa karta na pół ekranu,
która zasłaniała warkocz — nie wracać do niej.
Przy `prefers-reduced-motion` sekcja ma zwykłe 100svh, jeden statyczny kadr i od razu
widoczny pierwszy tekst.

Poprzednie hero (jasna kurtyna) leży w `archiwum/index-hero-kurtyna.html`
+ `style-hero-kurtyna.css` + `script-hero-kurtyna.js` — komplet do przywrócenia.

## Nagłówek hero to logo
`media/logo/zaplecione.webp` (+ `.png` jako zapas w `<picture>`) — logo od Dawida:
napis ZAPLECIONE w pierścieniu z warkocza. Źródło:
`~/Downloads/Salon Fryzjerski Logo Zaplecione.png`, 2000×2000, kadr 100,355 1810×1320
skryptem `tools/kadrpng.swift`.

**Tło zostało wycięte programowo.** Oryginał ma płaskie kremowe tło (253,245,235),
więc alfę policzyłem z odległości każdego piksela od tego koloru: poniżej 14 — pełna
przezroczystość, powyżej 46 — pełna kryjomość, pomiędzy liniowo. Bez tego na kadrze
warkocza siedział widoczny prostokąt.

Wcześniej próbowałem `mix-blend-mode: multiply` — **nie działa**, bo `.hero__krok`
miał `z-index` i tworzył własny kontekst układania, więc nie było z czym mieszać.
Dlatego `z-index` z `.hero__krok` jest usunięty (kroki i tak malują się nad canvasem,
bo są dalej w DOM) — gdyby ktoś go przywrócił, blendowanie znów by padło.

WebP waży 101 kB zamiast 938 kB PNG-a — przy pełnej alfie to jedyny sensowny format.

## Logo
Źródło: `media/logo/zrodlo-canva.svg` (2,2 MB, eksport z Canvy — trzymany tylko jako
oryginał, **nie linkowany ze strony**). W środku są dwie rzeczy:

- **warkocz jako bitmapa z prawdziwą alfą** — wyciągnięta i zapisana jako
  `media/logo/warkocz.webp` (188 kB, + `.png` jako zapas). W SVG leżała jako obraz RGB
  plus osobna maska w skali szarości; złożyłem je w jeden plik z kanałem alfa.
- **napis jako ścieżki wektorowe** — wstawiony **raz** do `index.html` jako
  `<g id="napisZaplecione">` w ukrytym „sprite", używany trzykrotnie przez `<use>`.
  Kolor idzie z `currentColor`, więc ten sam wektor jest ciemny w hero i kremowy w stopce
  bez żadnego drugiego pliku.

Komponent `.logo` = obraz warkocza + `<svg class="logo__napis">` na wierzchu. Oba
korzystają z **układu współrzędnych 1500×1500 z pliku źródłowego**, dlatego `viewBox`
napisu to `93.75 281.25 1312.5 914.25` (czyli dokładnie miejsce, w którym Canva rysuje
warkocz) i wszystko nakłada się co do piksela. W pasku ten sam wektor ma węższy kadr:
`viewBox="440 655 675 180"` — sam napis, bez pierścienia.

⚠️ **Dwie pułapki, na które się nadziałem:**
1. `<symbol>` zamiast `<g>` — symbol zakłada własny viewport 100%×100%, przez co
   dochodziło do podwójnego mapowania i napis w hero był przesunięty, a w pasku
   całkiem przycięty. `<g>` nie tworzy viewportu i wszystko wróciło na miejsce.
2. Poprzednia wersja logo (jeden PNG) wymagała ręcznego wycinania kremowego tła
   i przemalowywania napisu na jasny. Przy nowym pliku **nie jest to już potrzebne** —
   nie odtwarzać tamtych skryptów.

Monogram „Z" (`.nav__mark`) usunięty wcześniej — nie odtwarzać.

## Kolejność sekcji
hero → certyfikat → usługi → metamorfozy → skup → cennik → przed wizytą → kontakt.
Usunięte na polecenie Dawida, **nie odtwarzać**: sekcja „Jak pracuję" (`#proces`)
oraz pasek zaufania z liczbami (`#zaufanie`, klasy `.trust*` — 9,9/10, 98%, 5,5 tys.,
Orły 2025). Strzałka „przewiń w dół" w hero celowała w pasek zaufania, więc po jego
usunięciu wskazuje na `#certyfikat`.

## Ikony społecznościowe
Instagram i Facebook występują jako okrągłe ikony (`.ikona`) w **dwóch miejscach**:
w lewym górnym rogu przy nazwie w pasku (wariant `.ikona--mala`, 36 px) i w sekcji
kontaktu (48 px). W pasku to `.nav__spolecznosciowe` przejmuje `margin-right:auto`,
bo to ono odpycha resztę nawigacji w prawo — `.nav__brand` już tego nie robi.
Poniżej 760 px ikony w pasku są ukryte, żeby nie ściskać nazwy i telefonu;
w sekcji kontaktu zostają.
Nazwa serwisu została w kodzie jako `.tylko-czytnik` — sam glif nie mówi czytnikowi
ekranu, dokąd prowadzi odnośnik.
Animacja: ciemne koło wjeżdża od dołu (`::before` ze `scale(0)` → `scale(1)`,
`transform-origin: bottom`), glif rozjaśnia się do koloru papieru i lekko rośnie,
a cały przycisk unosi się o 3 px. To samo dzieje się na `:focus-visible`, więc
efekt działa też przy nawigacji klawiaturą. Przy `prefers-reduced-motion`
zostaje sama zmiana koloru.

## Sekcja certyfikatu
Prawa kolumna `#certyfikat` pokazuje **zdjęcie certyfikatu**, jeśli istnieje plik
`media/foto/certyfikat-iso.jpg`. Skrypt dokłada wtedy klasę `ma-zdjecie` na `#isoDowod`,
co pokazuje `<img>` i chowa `.iso__dane`. Bez pliku zostaje tabelka z danymi — sekcja
nigdy nie jest pusta i nigdy nie pokazuje złamanej ikony obrazka.
Przetestowane w obie strony: z plikiem i bez.
Zdjęcie **nie ma `loading="lazy"`** — przy leniwym ładowaniu najpierw mignęłaby tabelka,
a dopiero potem podmieniło się zdjęcie.
Kadr zrobiony `tools/kadr.swift` (118,512 782×1002) ze zrzutu z pulpitu.

## Typografia
**Prata** (nagłówki) + **Inter** (tekst). Prata została dobrana jako najbliższy
dostępny odpowiednik kroju z logo — logo ma tylko krzywe dziesięciu liter, nie font,
więc nie da się go użyć do składu. Porównanie przez nałożenie kandydatów na krzywe
z logo: Prata pokrywa się niemal jeden do jednego, Gilda Display i Antic Didone są
wyraźnie szersze.

⚠️ **Prata nie ma kursywy ani odmian grubości.** Dlatego:
- `h1 em, h2 em` mają `font-style: normal` — akcent w nagłówkach niesie sam kolor.
  Przy `italic` przeglądarka pochylałaby litery sztucznie i wyglądało to źle.
- Tekst ciągły, przyciski, tabele i cennik zostają na **Inter**. Prata to krój
  displayowy — w akapitach i w tabelach z cenami byłaby męcząca, a bez odmiany
  półgrubej przyciski straciłyby wyrazistość.

Nazwa w hero i w pasku to **nie font, tylko wektor z logo** — tam mamy oryginalny krój
co do krzywej.

## Głos strony
Cała treść jest napisana **w pierwszej osobie liczby pojedynczej**, jakby pisała ją sama
Ania: „poproszę", „oceniam", „Zapraszam na Staszica", „Co robię", „Jak pracuję",
„otrzymałam certyfikat". Przy dopisywaniu czegokolwiek trzeba trzymać ten głos.

Szybka kontrola, czy nic nie wróciło do liczby mnogiej:

```bash
grep -oE '[a-zaceilnoszz]+(amy|emy|imy|ymy)\b' index.html
```

Ma nie zwracać nic poza jednym świadomym wyjątkiem: „Cały proces **załatwiamy razem**
na miejscu" przy ratach — tam liczba mnoga oznacza „ja i klientka".

## Motyw
Strona jest w **motywie jasnym** (ciepła kość słoniowa `#FBF7F2`, brąz `#2B211A`,
przygaszone złoto `#A9803F`). Wcześniejsza wersja ciemna leży nietknięta
w `archiwum/style-ciemny.css` i `archiwum/index-ciemny.html`.

Konsekwencje przejścia na jasny motyw:
- główny przycisk jest **ciemny, nie złoty** — złoto na jasnym tle nie wyrabiało
  kontrastu 4,5:1;
- pasek nawigacji jest **nieprzezroczysty od pierwszej sekundy**, bo pod spodem leci
  ciemne wideo;
- podpisy w galerii są **widoczne od razu**, a nie po najechaniu;
- mapa straciła filtr inwersji, kafle usług zostały ciemne (biały tekst na zdjęciu),
  a stopka jest ciemna i domyka stronę.

## Uwagi projektowe
- Paleta z generatora (róż + lawenda) nie pasowała, więc świadomie ją nadpisałem.
  Typografia i struktura sekcji zostały z rekomendacji: Playfair Display + Inter.
- Animacje respektują `prefers-reduced-motion`.
- Żadnych zmyślonych opinii — na stronie są wyłącznie liczby, do których mam źródła.
