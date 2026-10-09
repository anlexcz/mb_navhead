# mb_navhead

Univerzální horní navigační proužek pro weby a aplikace Metrobusu.

Nejde o hlavičku konkrétního webu. Komponenta je úzká globální navigační lišta, která se vkládá **nad vlastní hlavičku a menu** daného webu.

## Princip

- bez loga a bez nadpisu Metrobusu,
- tmavě šedé pozadí, bílý text, modrý spodní proužek,
- Montserrat SemiBold/Bold,
- aktivní položka: modré pozadí + tmavý text,
- hover: modrý text,
- desktop: všechny hlavní odkazy v jednom úzkém řádku,
- mobil: kompaktní lišta s Forendors a rozbalovacím menu,
- Web Component se Shadow DOM, aby se styly neovlivňovaly s hostitelským webem.

## Demo

Otevři `index.html` přes lokální HTTP server nebo GitHub Pages.

## Integrace

```html
<script type="module" src="https://static.metrobus.cz/nav/v1/metrobus-nav.js"></script>
<metrobus-nav active="sotofoto"></metrobus-nav>
```

Atribut `active` označí aktuální službu / aplikaci. Např. `studio`, `videa`, `kalendar`, `vyroci`, `sotofoto`.

## Soubory

- `nav/metrobus-nav.js` – samotný Web Component,
- `nav/config.json` – centrální navigační konfigurace,
- `index.html` – jednoduché živé demo.

Barvy jsou schválně vedené jako CSS proměnné v komponentě, aby šlo finální metrobusí odstíny snadno sjednotit podle existujícího brandingu.
