#!/usr/bin/env python3
"""Build only the production PHP application; development pages stay in Git."""
import argparse
from pathlib import Path
import re
import secrets
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def replace_once(text, old, new):
    if text.count(old) != 1:
        raise ValueError(f'Production build source changed: {old[:90]}')
    return text.replace(old, new, 1)


def production_files(token):
    files = {}
    def source(path):
        return (ROOT / path).read_text()

    nav = source('v2/metrobus-nav.js').replace('MetrobusNavV2', 'MetrobusNav').replace('metrobus-nav-v2', 'metrobus-nav')
    files['metrobus-nav.js'] = replace_once(nav, '../assets/fonts/montserrat.js', './fonts/montserrat.js')
    files['config.json'] = (ROOT / 'v2/config.json').read_bytes()
    for name in ('montserrat.css', 'montserrat.js', 'montserrat-latin-ext.woff2', 'OFL.txt'):
        files['fonts/' + name] = (ROOT / 'assets/fonts' / name).read_bytes()

    view = source('v2/admin.html').replace('metrobus-nav-v2', 'metrobus-nav')
    view = replace_once(view, '../assets/fonts/montserrat.css', '../fonts/montserrat.css')
    view = replace_once(view, '</head>', '<meta name="navhead-api" content="./api.php">\n</head>')
    view = replace_once(view, '<button class="button primary" id="exportConfig" type="button" title="Stažení konfigurace změny na webu nepublikuje.">Stáhnout konfiguraci</button>', '<button class="button" id="exportConfig" type="button">Stáhnout zálohu</button><button class="button primary" id="publishConfig" type="button">Publikovat</button>')
    view = replace_once(view, '<small>Stažení změny nepublikuje.</small>', '')
    view = re.sub(r'\?v=20261018-[a-z]+', '', view)
    files['admin/view.php'] = "<?php if (!defined('NH_ROOT')) { http_response_code(404); exit; } ?>\n" + view
    files['admin/admin.css'] = source('v2/admin.css')
    files['admin/admin-navigation.mjs'] = source('v2/admin-navigation.mjs')

    js = source('v2/admin.js')
    js = replace_once(js, "import './metrobus-nav.js?v=20261018-php';", "import '../metrobus-nav.js';")
    js = replace_once(js, "./admin-navigation.mjs?v=20261018-tree", './admin-navigation.mjs')
    js = replace_once(js, "const storageKey = 'metrobus-navhead-draft-v2';\n", '')
    js = replace_once(js, "    if (apiMeta) {serverState=await serverRequest('save',draft);draft=serverState.config;updatePreview();}\n    else localStorage.setItem(storageKey,JSON.stringify(draft));", "    serverState=await serverRequest('save',draft);draft=serverState.config;updatePreview();")
    js = replace_once(js, "toast(apiMeta?'Draft uložen na serveru.':'Draft uložen v tomto prohlížeči.')", "toast('Draft uložen.')")
    js = replace_once(js, "toast(apiMeta?error.message:'Draft se nepodařilo uložit. Stáhni konfiguraci.')", 'toast(error.message)')
    js = replace_once(js, "toast('Staženo. Změny nejsou publikované.')", "toast('Záloha stažena.')")
    start = js.index("  const response = await fetch(new URL('./config.json', import.meta.url)")
    end = js.index('  function defaults(items)', start)
    js = js[:start] + '  serverState=await serverRequest();draft=serverState.config;\n  if (!validConfig(draft)) throw new Error(\'Neplatná konfigurace.\');\n' + js[end:]
    files['admin/admin.js'] = js
    for name in ('.htaccess', 'admin/index.php', 'admin/bootstrap.php', 'admin/api.php', 'admin/setup.php', 'private/.htaccess'):
        files[name] = source('hosting/php/' + name)
    files['private/settings.php'] = "<?php\nreturn ['install_token' => '" + token + "', 'password_hash' => ''];\n"
    files['index.php'] = "<?php header('Location: admin/', true, 302); exit;\n"
    # Explicit allowlist above keeps demos, legacy implementations and tools out.
    for path, contents in files.items():
        if isinstance(contents, str) and re.search(r'metrobus-nav-v2|/v2/|localStorage|20261018-', contents):
            raise ValueError('Development reference in production file: ' + path)
    return files


def build(output):
    token = secrets.token_urlsafe(24)
    guide = f'''NAVIGAČNÍ LIŠTA METROBUSU

1. Rozbal archiv. Na hosting přes FTP/SFTP nahraj pouze složku navhead,
   včetně souborů .htaccess. Dej ji vedle současných souborů webu.
2. Otevři https://TVOJE-DOMENA/navhead/admin/setup.php.
3. Zadej instalační kód a nastav heslo pro účet admin.
4. Administrace je na https://TVOJE-DOMENA/navhead/admin/.

Instalační kód: {token}
Po nastavení hesla přestane fungovat. Tento návod nech na počítači.

Uložit draft: uloží změny na server, na webech se ještě neprojeví.
Publikovat: uloží a zveřejní změny pro všechny připojené weby.
Stáhnout zálohu: stáhne právě upravovanou konfiguraci do počítače.

VLOŽENÍ NA WEB
Do head vlož (nahraď doménu):
<script type="module" src="https://TVOJE-DOMENA/navhead/metrobus-nav.js"></script>

Na začátek body před vlastní hlavičku vlož:
<metrobus-nav active="sotofoto"></metrobus-nav>

active označuje aktuální web: metrobus, videa, studio, forendors, vyroci,
kalendar, sotofoto nebo odkazy. Na jiném webu atribut vynech.
Hlavička, font i data se načítají z jednoho místa. Databáze není potřeba.

POŽADAVKY HOSTINGU
PHP 8+, DOM/XML, sessions a HTTPS. PHP musí smět zapisovat do navhead
(konfigurace) a navhead/private (nastavení a draft). Nepoužívej práva 777.
Instalátor zkontroluje základní podmínky. Při chybě 500 ověř error log
nebo podporu .htaccess. Pokud se PHP stáhne nebo zobrazí jako zdrojový kód,
nejprve zapni jeho zpracování na hostingu.
Pro vložení na jiné domény nastavuje .htaccess veřejným souborům CORS.
Pokud ho server nepodporuje, hlavičku musí nastavit správce hostingu.

Před připojením webů ověř přihlášení, uložení, publikování a mobilní náhled.
Celou složku navhead pravidelně zálohuj; private obsahuje heslový hash.
Při aktualizaci nepřepisuj config.json ani private svými instalačními kopiemi.
'''
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, contents in production_files(token).items():
            archive.writestr('navhead/' + name, contents)
        archive.writestr('CTI-ME.txt', guide)
    return output.resolve()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    print(build(parser.parse_args().output))
