# Higgsfield — 3 warianty hero do wygenerowania

Stan konta (27.08.2026): **30 kredytów**, plan `plus`.
Generowanie z sesji Claude jest blokowane, więc odpalasz to sam na
https://higgsfield.ai/ai/video i wrzucasz pliki do `media/hero/`.

## Ustawienia — te same dla wszystkich trzech
| Parametr | Wartość |
|---|---|
| Model | **Kling v3.0** |
| Mode | **std** (nie `pro`, nie `4k` — `4k` to 30 kr za jeden klip) |
| Duration | **5 s** |
| Sound | **off** — mniej kredytów, a i tak leci w pętli bez dźwięku |
| Aspect ratio | **16:9** (pion na IG zrobię kadrowaniem, nie generuj drugi raz) |
| Koszt | **7,5 kr / klip** → trzy warianty = 22,5 z 30 |

⚠️ **Kling v3.0 na Higgsfield nie ma pola „negative prompt".** Sprawdzone przez API:
jedyne parametry modelu to `duration`, `mode` i `sound`. Wszystkie wykluczenia
(„bez twarzy", „bez napisów") są więc wpisane w treść promptów poniżej — wklejasz
jeden blok i nic więcej nie ustawiasz.

Pliki nazwij `hero-a.mp4`, `hero-b.mp4`, `hero-c.mp4`.

---

## Wariant A — kurtyna z włosów (pomysł Dawida) ✅ WYGENEROWANY
`media/hero/kurtyna.mp4` — wyszedł bardzo dobrze, kurtyna faktycznie się rozsuwa
i kończy otwarta, z ciemnym środkiem pod napisy. To jest teraz domyślne hero.

```
Extreme close-up of a dense curtain of long, glossy honey-blonde hair filling the entire frame, seen from behind the head only. Warm golden light glows from behind the hair. The hair slowly parts down the middle and sweeps outward to both sides, revealing soft dark empty space behind it. Silky strands catch the light as they move. Slow, elegant, weightless motion. Shallow depth of field, cinematic beauty-campaign lighting, warm champagne and deep espresso tones. Healthy, smooth, well-groomed hair. Clean empty background with no objects, no people, no faces, no hands, no text, no captions, no watermark, no logo.
```

Jeśli mimo to wyjdzie twarz, dopisz na samym początku: `Back of the head only. The camera never sees a face.`

---

## Wariant B — splatający się warkocz (nawiązanie do nazwy) ✅ WYGENEROWANY
`media/hero/warkocz.mp4` — trzy pasma faktycznie zaplatają się w prawdziwy warkocz.
Minus: nakręcone na zimnym szarym tle, więc dociągam kolor filtrem CSS, a pod napisy
musiałem dołożyć osobne przyciemnienie środka.

```
Overhead macro shot of three thick sections of long, healthy caramel-blonde hair lying on dark matte fabric. The three sections weave over one another and braid themselves together in one continuous, hypnotic motion, forming a perfect thick braid that fills the frame diagonally. Warm directional light rakes across the hair, revealing shine and texture. Slow motion, luxurious, tactile, realistic human hair. Nothing else is in the shot: no hands, no fingers, no arms, no people, no faces, no tools, no text, no captions, no watermark, no logo.
```

Mój faworyt — jako jedyny gra z nazwą *Zaplecione*.

---

## Wariant C — pasmo, które rośnie (sprzedaje przedłużanie) ⬜ niewygenerowany

```
Side view close-up of shoulder-length dull blonde hair against a dark warm background. In one continuous seamless shot with no cuts, the hair gradually flows and extends downward, growing longer and visibly glossier as it falls, until it becomes long, thick, luminous waist-length hair with a mirror-like shine. Warm golden rim light, cinematic beauty commercial, champagne and deep brown palette. Realistic healthy human hair. No face, no eyes, no people in shot, no hands, no jump cuts, no text, no captions, no watermark, no logo.
```

---

## Obróbka, którą zrobiłem po Twojej stronie
Oryginały (1920×1080, po 10,7 MB) leżą w `media/hero/orig/`. Na stronę idą wersje
przepuszczone przez `avconvert --preset PresetAppleM4V720pHD` → 1280×720, ok. 4 MB.
Plakaty (pierwsza klatka) wycięte skryptem `tools/poster.swift`.

## Jak to wpinam w stronę
Hero jest zbudowane tak, że wideo jest wymienne — leci w pętli w tle, przyciemnione
gradientem, kurtyna CSS rozsuwa się po wierzchu, a napisy i „Umów wizytę" siedzą na górze.
Jak wrzucisz trzy pliki, podłączę je pod przełącznik, żebyś mógł je obejrzeć na żywo
w hero i wybrać. Do tego czasu strona działa na statycznym zdjęciu i jest kompletna.

## Zapas kredytów (7,5 kr)
Jeśli zostanie i zechcesz, dorobiłbym pionowy klip 9:16 na relacje IG — ale dopiero
po wyborze zwycięskiego wariantu.

---

# ⭐ Wersja 2 — pod jasny motyw (27.08.2026)

Strona przeszła na motyw jasny, a `kurtyna.mp4` jest podświetlona od tyłu i kończy się
ciemnym kadrem. Dlatego muszę ją wygaszać przez 1,1 s, zanim wpuszczę kremowe tło.
Klip nakręcony od razu w jasnej tonacji ten szew likwiduje.

**Kluczowe: klip ma się KOŃCZYĆ jasnym, prawie białym kadrem** — wtedy przejście
w tło strony (`#F5ECE1`) jest niewidoczne. Dlatego w promptach jest wprost napisane,
jak ma wyglądać ostatnia klatka.

Zostało **15 kredytów** = dwa klipy po 7,5. Ustawienia bez zmian: **Kling v3.0 · std ·
1080p · 5 s · sound off · 16:9**. Negative prompt nadal nie istnieje, wykluczenia siedzą
w treści.

## A2 — jasna kurtyna ✅ WYGENEROWANA 29.08.2026 — TO JEST OBECNE HERO
`media/hero/kurtyna-jasna.mp4`. Wyszła dokładnie tak, jak miała: zaczyna pełną
kurtyną, rozsuwa się i kończy prawie białym kadrem z włosami tylko przy krawędziach.
Dzięki temu welon zniknął, a przejście w tło strony jest niewidoczne.
Wygenerowana z sesji przez MCP (7,5 kr), po przepięciu na nowe konto Higgsfield.

```
Extreme close-up of a dense curtain of long, glossy champagne-blonde hair filling the entire frame, seen from behind the head only, lit by soft high-key daylight from the front. The hair slowly parts down the middle and sweeps outward to both sides, revealing a bright, clean, empty ivory-white studio background. Silky strands catch soft diffused light as they move. Slow, elegant, weightless motion. Airy, luminous, bright beauty-campaign lighting, warm ivory and soft cream palette, no dark shadows anywhere. The final frame is bright and almost white, with hair remaining only along the far left and right edges. Clean empty background with no objects, no people, no faces, no hands, no text, no captions, no watermark, no logo.
```

Plik nazwij `kurtyna-jasna.mp4`.

## B2 — warkocz na jasnym płótnie (gdyby zostały kredyty)

```
Overhead macro shot of three thick sections of long, healthy champagne-blonde hair lying on soft cream linen fabric. The three sections weave over one another and braid themselves together in one continuous, hypnotic motion, forming a perfect thick braid that fills the frame diagonally. Bright soft diffused daylight from a large window, gentle soft shadows, airy and luminous, warm ivory and cream palette. Slow motion, luxurious, tactile, realistic human hair. Nothing else is in the shot: no hands, no fingers, no arms, no people, no faces, no tools, no text, no captions, no watermark, no logo.
```

Plik nazwij `warkocz-jasny.mp4`.

## Co zmienię na stronie, gdy dostanę jasny klip
- **Znika welon** (`.hero__veil`) — jest tam tylko po to, żeby przyciemnić jasny tekst
  na ciemnym wideo. Przy jasnym klipie jest zbędny.
- **Napisy mogą wejść wcześniej** — dziś czekają 3,5 s, aż tło się rozjaśni. Przy jasnym
  klipie zejdę do ok. 1,5 s, bo ciemny tekst od razu ma jasne podłoże.
- **Przejście wideo → tło robi się niewidoczne**, więc mogę je wydłużyć i zrobić
  łagodniejsze zamiast szybkiego wygaszenia.
- Stare `kurtyna.mp4` zostawię w `media/hero/` jako zapas, nie kasuję.


---

# Animacja logo — zaplatanie pierścienia (30.08.2026)

`media/hero/orig/orig-logo-zaplatanie.mp4` — 5 s, 1280×720, 1,3 MB, 7,5 kr.
**Jeszcze nigdzie nie wpięte na stronie.**

## ⚠️ Kling 3.0 wymaga klatki POCZĄTKOWEJ
Pierwsza próba z samą `end_image` **padła** (status `failed`, bez komunikatu,
bez pobrania kredytów). Dopiero para `start_image` + `end_image` ruszyła.
Zapamiętać: sama klatka końcowa nie wystarczy.

## Jak zrobione
- **Klatka startowa**: pierścień z logo wygaszony maską poza lewym fragmentem —
  zostają luźne końcówki, z których warkocz ma się spleść.
- **Klatka końcowa**: sam pierścień (bez napisu!) na kremowym tle `#FBF7F2`.
  Napisu celowo nie ma — modele psują litery, a na stronie i tak nakładamy go wektorowo.
- Oba kadry 1920×1080, pierścień na 80% wysokości, wyśrodkowany.

## Prompt
```
A few loose strands of glossy champagne-blonde hair on a plain warm ivory background weave and braid themselves onward, the braid growing steadily to the right and curving around until it closes into a complete oval wreath of braided hair with soft wispy ends. One continuous unbroken motion, no cuts. Soft high-key diffused daylight, airy and luminous, warm ivory and cream palette, no dark shadows. Realistic human hair with a single soft pink strand woven in. Nothing else in the shot: no hands, no fingers, no people, no faces, no text, no captions, no watermark, no logo.
```

## Uwaga o presetach
Higgsfield podpowiedział preset **„IN THE DARK"** — odwrotność jasnej sceny.
Odrzucony przez `declined_preset_id`. Takie podpowiedzi trzeba czytać, nie klikać.

## Ograniczenie
Tło jest **wypalone na kremowo**, więc klip zadziała tylko na jasnym tle.
W ciemnej stopce trzeba by generować od nowa. Wersja bez wideo (maska CSS,
`podglad-logo.html`) działa na obu tłach i nie ma tego problemu.
