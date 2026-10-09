# Admin prototype – pravidla živého náhledu

## Produkční parita preview

Živý náhled v administraci **není simulace ani druhá implementace navheadu**. Je to skutečná produkční komponenta `metrobus-nav`, pouze napojená na aktuální draftová data.

- Preview a publikované weby musí používat tentýž produkční renderer, CSS a responsive logiku.
- Rozdíl smí být pouze ve zdroji konfigurace: preview = draft, produkce = publikovaná konfigurace.
- Stejné musí být měření šířky, overflow `Další`, skupiny/submenu, announcementy, interakce, typografie, rozměry i barvy.
- Změna produkční komponenty se musí automaticky projevit v preview; paralelní mock renderer je zakázán.
- Akcent je `#87CEFA`.
- Mobilní globální navhead nepoužívá hamburger. Ukazuje maximum hlavních položek, které se vejdou, a zbytek přesouvá do `Další`.
- Preview o zvolené šířce musí odpovídat tomu, co při stejné šířce dostane produkční web.

Toto je architektonický invariant administrace.
