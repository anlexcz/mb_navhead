# Administrace navheadu

Aktuální rozhraní je `v2/admin.html` s oddělenými `admin.css` a `admin.js`.
`/admin/` na GitHub Pages přesměrovává na tento veřejný prototyp.

- Dvě sekce: Navigace a Oznámení.
- Úpravy probíhají přímo v rozbalené položce, bez modálních oken.
- Stejný produkční `metrobus-nav-v2` vykresluje živý náhled.
- Nové odkazy používají `target="_blank"` a `rel="noopener noreferrer"`; lze zvolit stejný tab.
- Draft se ukládá ručně do localStorage pod `metrobus-navhead-draft-v2`.
- Stažení konfigurace exportuje `config.json`. Samotný export nepublikuje změny na web.
- Žádná maketa účtů, hesel ani historie.

## Jeden účet admin

Skutečné přihlášení lze provozovat přes přiložený `server.mjs` na Node.js.
Uživatelské jméno je `admin`, heslo určuje proměnná prostředí
`NAVHEAD_ADMIN_PASSWORD`. Server se bez ní nespustí. Heslo se nikdy nezapisuje
do HTML, JavaScriptu ani do repozitáře.

```sh
NAVHEAD_ADMIN_PASSWORD='vlastni-heslo' node server.mjs
```

Administrace je na `/admin/`; přihlášení obstará standardní přihlašovací dialog
prohlížeče (HTTP Basic). Veřejná komponenta a konfigurace přihlášení nevyžadují.
Přímá adresa `/v2/admin.html` má stejnou ochranu. Produkční server musí být za
HTTPS reverzní proxy. Výchozí poslech je `127.0.0.1:3000`, lze změnit přes `HOST`
a `PORT`. Server poskytuje soubory, nikoli API pro vzdálené publikování.

GitHub Pages spouštět Node.js neumí a tento přístup heslem nechrání. Na Pages
je proto rozhraní pouze veřejný prototyp. Pro aktivaci přihlášení je nutné
nasadit `server.mjs` na server s Node.js a nastavit heslo mimo Git.
