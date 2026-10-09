# Metrobus Navhead – kompletní specifikace

Univerzální horní navigační proužek pro weby a aplikace Metrobusu.

Navhead **není hlavička konkrétního webu**. Je to samostatná globální navigační vrstva Metrobusu vložená úplně nahoře, nad vlastní hlavičku, logo a menu konkrétní služby. Má proto zůstat nízká, vizuálně jednoduchá a snadno rozpoznatelná jako společný prvek celé rodiny webů.

Tento dokument je referenční specifikace vzhledu, rozměrů, responsive chování a interakcí. Aktuální produkční implementace je `nav/metrobus-nav.js`.

---

## 1. Základní vizuální princip

- Navhead je plochý a hranatý. Nepoužívá karty, zaoblení ani „AI dashboard“ estetiku.
- Nemá vlastní logo ani velký nadpis Metrobusu.
- Pozadí navigace je tmavě šedé `#25282D`.
- Primární akcent Metrobusu je světle modrá `#87CEFA`.
- Základní text navigace je bílý `#FFFFFF`.
- Aktivní položka používá modré pozadí `#87CEFA` a tmavý text `#25282D`.
- Hover/focus neaktivní položky mění text na `#87CEFA`.
- Spodní hrana navigační části je zvýrazněna souvislým modrým pruhem o výšce `3px`.
- Jemné oddělovače používají bílou s nízkou průhledností, aktuálně `rgba(255,255,255,.12)`.
- Dropdowny a overflow panel používají stejné tmavé pozadí jako hlavní navhead; nemají působit jako cizí světlá karta.

### CSS tokeny

```css
--mb-nav-bg: #25282d;
--mb-nav-blue: #87cefa;
--mb-nav-text: #fff;
--mb-nav-active-text: #25282d;
--mb-nav-border: rgba(255,255,255,.12);
--mb-nav-height: 38px;
--mb-announcement-height: 34px;
```

Na kompaktním zobrazení se používá navigační výška `35px` a announcement `32px`.

---

## 2. Typografie

- Primární font je **Montserrat**.
- Produkční komponenta načítá řezy `500`, `600` a `700`.
- Fallback je Arial / sans-serif.
- Navigační položky jsou výrazné, ale navhead nesmí být typograficky těžký nebo vysoký.
- Desktopové odkazy a ovládací prvky používají font-weight `700`.
- Kompaktní mobilní položky mají přibližně `13px`, weight `500`; Forendors je zvýrazněn weightem `600`.
- `Další` používá přibližně `13px`, weight `600`.
- Desktopový announcement používá přibližně `12.5px`, weight `600`.
- Mobilní announcement používá přibližně `11.5px`; pod 360 px přibližně `11px`.
- Používá se mírně záporný letter-spacing pro kompaktní vzhled (`-.025em`, na mobilu přibližně `-.035em`).

---

## 3. Struktura navheadu

Navhead může mít dvě vertikální části:

1. **announcement bar** – volitelný horní informační proužek,
2. **globální navigace** – hlavní řádek odkazů.

Obě části používají stejné tmavé pozadí. Announcement je od navigace oddělen jemnou linkou. Modrý 3px proužek patří až pod navigační část.

Maximální vnitřní šířka obsahu je `1180px`; na širokém monitoru tedy obsah zůstává centrovaný, zatímco tmavé pozadí pokračuje přes celou šířku stránky.

Desktopové vnitřní horizontální odsazení je `14px`. Kompaktní navigace používá velmi malé odsazení (`4px`), aby se využila dostupná šířka.

---

## 4. Announcement bar

- Standardní výška desktop: `34px`.
- Kompaktní režim: `32px`.
- Text je vodorovně i svisle centrovaný.
- Announcement má být jedním nenápadným informačním řádkem, nikoli bannerovou kartou.
- Text se nepřelévá mimo komponentu.
- Na úzké šířce komponenta dlouhý announcement rozdělí na logické textové framy a střídá je.
- Dělení preferuje hranice vět, interpunkci a přirozené jazykové předěly před mechanickým useknutím textu.
- Přechod framů je krátký vertikální pohyb + změna opacity; nemá být agresivní.
- Aktuální čas střídání je přibližně `4.2 s`.
- Při `prefers-reduced-motion: reduce` se animace vypínají.
- Announcement může obsahovat více položek z konfigurace; komponenta z nich vytvoří zobrazované framy.

---

## 5. Desktopová navigace

Desktop zobrazuje hlavní položky v jednom nízkém řádku uprostřed.

Aktuální základní pořadí:

1. Metrobus
2. Videa
3. Studio
4. Forendors
5. Aplikace
6. Odkazy

### Rozměry

- Celková standardní výška navigace: `38px`, včetně spodního modrého proužku.
- Hlavní položky mají horizontální padding přibližně `20px`.
- Mezi položkami je velmi malá mezera (`2px`).
- Položky nemají vlastní rámečky ani zaoblení.

### Aktivní stav

Aktivní služba se určuje atributem `active` na `<metrobus-nav>`. Aktivní hlavní položka má modré pozadí a tmavý text. Pokud je aktivní některá aplikace uvnitř skupiny Aplikace, jako aktivní se na desktopu vizuálně označí trigger **Aplikace**.

### Hover a focus

Neaktivní položka při hover/focus mění text na modrou. Aktivní položka zůstává tmavá na modrém pozadí. Focus musí zůstat funkčně dostupný z klávesnice, ale nemá přidávat cizí browserový vzhled, který rozbíjí navhead.

---

## 6. Skupina Aplikace

`Aplikace` není běžný odkaz. Je to skupina / kontejner.

Aktuálně obsahuje:

- Dopravní výročí,
- Šotoušův kalendář,
- Šotofoto.

Na desktopu má Aplikace malou šipku dolů tvořenou CSS, nikoli textovým znakem. Dropdown:

- se otevírá pod položkou,
- je centrovaný vůči triggeru,
- má šířku přibližně `230px`,
- používá tmavé pozadí,
- jemný border a stín,
- vnitřní padding `5px`,
- položky jsou zarovnané vlevo,
- jednotlivá položka má minimální výšku přibližně `38px` a horizontální padding `12px`.

Dropdown se zpřístupňuje kliknutím a desktopově také hover/focus-within chováním.

---

## 7. Mobilní / kompaktní navhead – zásadní pravidlo

**Globální Metrobus navhead na mobilu nepoužívá hamburger.**

Hamburger je záměrně zakázaný, protože by mohl být zaměněn za hlavní menu konkrétního webu, které se nachází pod navheadem. Globální a lokální navigace musí být na první pohled rozlišitelné.

Mobilní navhead proto stále zůstává **tenkou horizontální lištou**.

### Princip dynamického overflow

- Komponenta změří skutečnou dostupnou šířku.
- Zobrazí maximum hlavních položek, které se do řádku reálně vejdou.
- Co se nevejde, přesune pod položku **`Další`** se šipkou.
- Počet viditelných položek tedy není pevně určen konkrétním breakpointem.
- Změna šířky musí layout přepočítat.
- `Forendors` má zvýšenou prioritu a má zůstat přímo viditelný co nejdéle.

Typický výsledek může být například:

```text
Metrobus   Videa   Forendors   Další⌄
```

nebo na o něco širším zařízení:

```text
Metrobus   Videa   Studio   Forendors   Další⌄
```

Nejde o pevně předepsané kombinace. Jsou pouze ilustrací výsledku měření.

### Současná priorita schovávání

Produkční algoritmus při nedostatku prostoru postupně přesouvá do overflow hlavní položky v pořadí:

1. Odkazy,
2. Studio,
3. Metrobus,
4. Videa.

Forendors se tímto způsobem drží přímo v liště jako prioritní položka.

### Rozměry kompaktní lišty

- navigační výška přibližně `35px`,
- vnitřní horizontální padding `4px`,
- položky přibližně `13px`,
- horizontální padding položek přibližně `9px`,
- pod 360 px se padding snižuje přibližně na `7px` a font na `12.5px`.

---

## 8. `Další` a mobilní overflow panel

`Další` je součást stejné horizontální lišty, ne samostatný hamburgerový řádek.

- Od inline položek je jemně oddělen vertikální linkou.
- Má malou CSS šipku dolů.
- V otevřeném stavu je text modrý a šipka se otočí.
- Otevření `Další` **nerozbalí všechny hlavní položky do obřího mobilního menu**.
- Pod kompaktní lištou se otevře samostatný full-width overflow panel.
- Panel má stejné tmavé pozadí jako navhead.
- Má jemnou horní linku, stín a dole modrý `3px` proužek.
- Otevírá se krátkou kombinací opacity / translate / clip animace.
- Kliknutí mimo komponentu panel zavře.

Panel obsahuje:

1. pouze ty hlavní položky, které byly kvůli nedostatku místa skryty z inline řádku,
2. sekci **Aplikace** a její položky.

Nad aplikacemi je drobný uppercase section label. Aktuální styl je přibližně `9.5px`, weight `700`, s tlumenou bílou a horním oddělovačem.

Položky v overflow panelu jsou kompaktní, vlevo zarovnané, minimální výška přibližně `29px`, font přibližně `12.5px`.

---

## 9. Responsive logika

Současná hranice pro přechod mezi desktopovou a kompaktní strukturou je `720px`.

Důležité ale je rozlišovat dvě věci:

- breakpoint určuje, zda se používá desktopová nebo kompaktní struktura,
- **uvnitř kompaktní struktury se počet viditelných položek určuje dynamickým měřením skutečné šířky**, nikoli sadou dalších breakpointů.

Komponenta používá `ResizeObserver`, takže se má přepočítat i při změně dostupné šířky bez klasického reloadu stránky.

---

## 10. Chování na hostitelských webech

Komponenta je Web Component se **Shadow DOM**. Důvodem je izolace:

- CSS hostitelského webu nemá měnit vzhled navheadu,
- CSS navheadu nemá rozbíjet hostitelský web,
- jednotlivé weby Metrobusu mají dostat vizuálně totožnou globální navigaci.

Navhead má vždy šířku `100%` svého dostupného prostoru a vysoký `z-index`, aby dropdown/overflow nebyl schovaný pod bezprostředním obsahem stránky.

Hostitelský web určuje aktivní službu atributem:

```html
<metrobus-nav active="sotofoto"></metrobus-nav>
```

Příklady hodnot: `studio`, `videa`, `kalendar`, `vyroci`, `sotofoto`.

---

## 11. Data a konfigurace

Produkční komponenta standardně načítá `nav/config.json`. Když konfiguraci nelze načíst, má interní fallback, aby navigace nezmizela úplně.

Konfigurace odděluje:

- `announcements`,
- hlavní `main` položky,
- `apps` položky skupiny Aplikace.

Forendors může být v datech označen jako prioritní položka. Aplikace je typ skupiny, nikoli URL odkaz.

---

## 12. Animace a pohyb

Pohyb je pouze funkční a krátký.

- hover změny přibližně `140ms`,
- otočení šipky přibližně `160ms`,
- otevření overflow panelu přibližně `120–160ms`,
- announcement přechod přibližně `260–340ms`.

Nepoužívat pružné efekty, velké transformace ani dekorativní animace. Při `prefers-reduced-motion` musí být přechody a animace vypnuté.

---

## 13. Co se nesmí při dalších úpravách rozbít

- Nepřidávat hamburger pro globální mobilní navigaci.
- Nedělat z mobilu vertikální seznam všech položek jako výchozí navigaci.
- Nezaměnit `Další` za menu konkrétního webu.
- Nechat Forendors prioritně viditelný.
- Zachovat dynamické měření dostupné šířky.
- Zachovat skupinu Aplikace jako skupinu, ne běžný link.
- Nepřidávat zaoblené karty, pill buttons nebo výrazné gradienty.
- Neměnit Metrobus akcent z `#87CEFA` bez vědomého rozhodnutí pro celý systém.
- Neudržovat druhou vizuální implementaci navheadu pouze pro administraci.

---

## 14. Administrace a live preview

Administrace může mít vlastní pracovní UI; jeho detailní vzhled není součástí této specifikace navheadu. Platí ale jeden **tvrdý architektonický invariant**:

> **Live preview není simulace navheadu. Je to skutečný produkční navhead vykreslený stejným komponentovým kódem, pouze nad draftovými daty.**

Z toho plyne:

- preview používá stejný `metrobus-nav` jako publikované weby,
- žádný samostatný mock renderer,
- žádná duplikovaná CSS pravidla navheadu v administraci,
- stejná typografie, barvy, rozměry, dropdowny, overflow, announcementy, animace i responsive algoritmus,
- změna produkční komponenty se automaticky musí projevit v preview,
- jediný zamýšlený rozdíl je zdroj dat: **draft vs. published**.

Pokud administrace simuluje šířku například `390px`, výsledný navhead musí funkčně a vizuálně odpovídat publikované komponentě při stejné dostupné šířce.

Na skutečném mobilním zařízení je live preview administrace ve výchozím stavu skryté. Uživatel jej může tlačítkem **Zobrazit / Skrýt** otevřít. Na mobilu administrace není potřeba zobrazovat přepínače Desktop / Tablet / Mobil; ty jsou užitečné pro testování z větší obrazovky.

Podrobnější technické pravidlo preview je také v `admin/README.md`.

---

## 15. Integrace

Cílový princip integrace:

```html
<script type="module" src="https://static.metrobus.cz/nav/v1/metrobus-nav.js"></script>
<metrobus-nav active="sotofoto"></metrobus-nav>
```

Aktuální repozitář používá:

- `nav/metrobus-nav.js` – produkční Web Component,
- `nav/config.json` – publikovaná konfigurace,
- `index.html` – demonstrační stránka,
- `admin-prototype.html` – prototyp administrace používající produkční komponentu pro preview,
- `admin/README.md` – pravidla administrátorského preview.

---

## 16. Referenční charakter dokumentu

Při budoucím vývoji mají být designové změny vědomé. Pokud se změní schválený vzhled nebo chování navheadu, musí se současně aktualizovat:

1. produkční komponenta,
2. tato specifikace,
3. případné související integrační pokyny.

Administrátorské preview se samostatně „dorovnávat“ nesmí, protože používá tutéž produkční komponentu.
