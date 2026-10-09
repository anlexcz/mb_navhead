# Metrobus Navhead V2 – vývojový rebuild

Tato větev je čistší V2 implementace navheadu postavená znovu podle:

1. hlavního README repozitáře (vizuální a responsive referenční specifikace),
2. dokumentu **Metrobus Navhead – finální specifikace systému** uloženého v projektových souborech,
3. pravidla, že admin live preview musí používat **stejnou produkční komponentu**, nikoli mock.

## V2 soubory

- `v2/metrobus-nav.js` – nová Web Component `<metrobus-nav-v2>` se Shadow DOM.
- `v2/config.json` – obecný datový model `navigation`, `group`, `children`, `announcements`.
- `v2/index.html` – playground s přepínáním aktivní služby a Desktop / Tablet / Mobil.
- `v2/admin.html` – lehký admin prototyp se skutečnou V2 komponentou jako live preview.

## Designové invarianty

- charcoal `#25282D`, Metrobus akcent `#87CEFA`, bílý text,
- Montserrat,
- ostré hrany, žádné pill/kartové AI UI v navheadu,
- desktop: tenký řádek, aktivní položka modré pozadí + tmavý text,
- mobil: **žádný hamburger**, horizontální lišta + dynamické `Další`,
- Forendors zůstává viditelný co nejdéle,
- `Aplikace` je group, ne odkaz,
- max. dvě úrovně,
- announcement je vždy jeden řádek; `<br>` je explicitní další frame,
- fallback config a selhání komponenty nesmí ovlivnit hostitelský web,
- live preview administrace = stejný renderer jako publikovaný navhead.

## Co tato V2 ukázka už řeší

- obecný model link/group místo hardcodovaného `apps`,
- active key včetně aktivace parent group,
- desktop submenu,
- mobilní overflow podle reálné šířky,
- prioritní zachování Forendors,
- announcement `visible_from` / `visible_to`,
- explicitní `<br>` framy a rotaci,
- reduced motion,
- desktop/tablet/mobile playground,
- admin shell a live draft preview přes `setConfig()` stejné komponenty.

## Co zatím není produkční backend

V2 v této větvi je primárně designový a frontendový rebuild k otestování. `admin.html` je statický prototyp. PHP session, JSON persistence, CSRF, revision locking, atomické Save/Publish, historie snapshotů, audit a správa uživatelů podle finální specifikace jsou další implementační vrstva.

Také není ještě dokončen plný HTML-aware automatický splitter announcementů; explicitní `<br>` funguje. Produkční implementace musí splitter doplnit podle finální specifikace.
