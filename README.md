# Navigační lišta Metrobusu

Hlavní větev obsahuje provozní verzi odpovídající čistému instalačnímu ZIPu
nahranému na hosting. Starší prototypy jsou ve větvi
[`archive/development-2026-10-18`](https://github.com/anlexcz/mb_navhead/tree/archive/development-2026-10-18).

## Co se nahrává na hosting

Pouze složka `navhead/`, včetně `.htaccess`. Obsahuje hlavičku,
PHP administraci s živým náhledem, veřejnou konfiguraci a lokální Montserrat.
Databáze ani Node na hostingu nejsou potřeba. Požadavky: PHP 8+, DOM/XML,
sessions, HTTPS a právo zápisu do `navhead/` a `navhead/private/`.

Heslo, instalační kód a rozpracovaný serverový draft se do Gitu neukládají.
`config.json` odpovídá počáteční konfiguraci z instalačního ZIPu; změny
publikované později v administraci se do GitHubu nepřenášejí automaticky.

## Nová instalace

```sh
python3 scripts/package_php.py navhead-php.zip
```

Rozbal ZIP, nahraj složku `navhead/` a otevři `/navhead/admin/setup.php`.
Jednorázový instalační kód je v přiloženém `CTI-ME.txt`; tento návod
nenahrávej na hosting. Nastav heslo účtu `admin` a otevři `/navhead/admin/`.

`Uložit draft` ukládá na server. `Publikovat` uloží a zveřejní změny pro
připojené weby. `Stáhnout zálohu` stáhne právě upravovanou konfiguraci.

## Aktualizace existující instalace

Aktualizuj provozní kód ze složky `navhead/`. Zachovej serverové `private/`
a `config.json`, aby se nepřepsalo heslo, draft ani publikovaná data.
Před aktualizací si stáhni zálohu celé instalace. Neinstaluj znovu účet.

## Vložení na web

Do `head` vlož:

```html
<script type="module" src="https://TVOJE-DOMENA/navhead/metrobus-nav.js"></script>
```

Na začátek `body` před vlastní hlavičku vlož:

```html
<metrobus-nav active="sotofoto"></metrobus-nav>
```

`active` odpovídá poli **ID** v editoru položky. ID je jedinečné v celé
navigaci; povolená jsou písmena bez diakritiky, čísla, pomlčka a podtržítko
(1–100 znaků). Když ID změníš, uprav i atribut `active` na příslušném webu. Hlavička se spravuje na
jednom místě; fonty ani skript nemusíš kopírovat na jednotlivé weby.
Přiložený `.htaccess` nastavuje CORS pro použití na různých doménách.
GitHub Pages nabízí [ukázku hlavičky](https://anlexcz.github.io/mb_navhead/)
a [administraci s náhledem](https://anlexcz.github.io/mb_navhead/admin.html).
Náhled používá stejné komponenty a editory jako hosting, ale ukládá jen do
prohlížeče. PHP přihlášení a serverové publikování fungují na hostingu.

Soubory `preview/`, kořenové HTML a přesměrování starých adres jsou pouze pro
GitHub Pages. Do instalačního ZIPu nevstupují. Po změně `admin/view.php` nebo
jeho odkazů spusť `python3 scripts/build_preview.py`; nevzniká druhý editor.

## Ověření

```sh
node --test tests/admin-navigation.test.mjs
python3 tests/package_php_test.py
```
