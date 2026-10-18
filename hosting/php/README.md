# Balíček pro PHP hosting

Vytvoření čistého instalačního ZIPu:

```sh
python3 scripts/package_php.py navhead-php.zip
```

Na hosting patří pouze složka `navhead` z tohoto archivu, včetně `.htaccess`.
Návod a jednorázový instalační kód jsou v `CTI-ME.txt` mimo webovou složku.
Každé sestavení vytváří nový kód. Instalační ZIP není aktualizační balíček:
při pozdější aktualizaci zachovej existující `private/` i `config.json`.

Výstup obsahuje jednu komponentu `metrobus-nav.js`, veřejnou konfiguraci
`config.json`, lokální `fonts/`, PHP administraci `admin/` a neveřejné
úložiště `private/`. Nepotřebuje databázi, Node ani build nástroje na hostingu.

Zdroje `v2/` slouží jako společný základ pro stávající statický náhled a balíček.
Generátor vybírá soubory explicitně, přejmenuje veřejnou komponentu na
`metrobus-nav`, sestaví chráněnou šablonu administrace a odstraní režim
ukládání do prohlížeče. Při změně očekávaného zdrojového textu sestavení
skončí chybou, aby nevznikl neúplný balíček. Samotné `hosting/php/` proto
nekopíruj na hosting; chyběly by vygenerované soubory.

Veřejný embed:

```html
<script type="module" src="https://TVOJE-DOMENA/navhead/metrobus-nav.js"></script>
<metrobus-nav active="sotofoto"></metrobus-nav>
```

`Uložit draft` mění pouze neveřejnou serverovou kopii. `Publikovat` uloží
aktuální editaci a zveřejní ji do `config.json`. `Stáhnout zálohu` umožňuje
zachránit rozpracovanou editaci i při konfliktu s jinou otevřenou administrací.
