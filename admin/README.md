# Admin prototype – pravidla živého náhledu

## Produkční parita preview

Živý náhled v administraci **nesmí být samostatná napodobenina navigační hlavičky**.

- Preview a publikované weby musí používat tentýž produkční renderer / komponentu `metrobus-nav`.
- Rozdíl mezi preview a publikovaným stavem smí být pouze ve zdroji konfigurace: preview používá aktuální draft, produkce publikovanou konfiguraci.
- Responsive chování, měření dostupné šířky, overflow `Další`, skupiny, submenu, announcementy, interakce, typografie, rozměry a barvy musí být v preview totožné s produkcí.
- Změna produkční komponenty se musí automaticky projevit i v preview; nesmí vzniknout druhá paralelní implementace.
- Akcent Metrobusu je `#87CEFA`.
- Na mobilu globální navhead nepoužívá hamburger. Zobrazuje maximum hlavních položek, které se vejdou; zbytek přesouvá do `Další`.

Toto je architektonický invariant administrace, ne pouze doporučení vzhledu.
