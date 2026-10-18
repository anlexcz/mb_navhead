#!/usr/bin/env python3
"""Build a standalone PHP upload directory with a unique one-time install code."""
import argparse
from pathlib import Path
import secrets
import zipfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('output', type=Path)
args = parser.parse_args()
token = secrets.token_urlsafe(24)
guide = f'''NAVIGAČNÍ LIŠTA METROBUSU – PHP HOSTING

1. Rozbal archiv. Složku navhead nahraj přes FTP/SFTP do prostoru webu.
   Stávající soubory webu nenahrazuj. Přenes i soubory .htaccess.
2. Otevři https://TVOJE-DOMENA/navhead/admin/setup.php.
3. Zadej jednorázový instalační kód uvedený níže a zvol si heslo účtu admin.
4. Administrace: https://TVOJE-DOMENA/navhead/admin/.
   Přihlašovací jméno admin; heslo ověří standardní dialog prohlížeče.
5. Uložit draft ukládá na server. Publikovat zpřístupní změny všem webům.

Jednorázový instalační kód: {token}
Po nastavení hesla se kód zneplatní. Tento návod nech na počítači;
nenahrávej ho zvlášť na web a nikomu nesděluj své zvolené heslo.

Požadavky: PHP 8+, rozšíření DOM/XML, sessions, HTTPS.
PHP musí smět zapisovat do navhead/private a navhead/v2.
Nepoužívej plošná oprávnění 777. Setup uvede, pokud potřebná práva chybí.
Pokud se zobrazí zdrojový PHP kód nebo se soubor PHP stahuje, instalaci
nepoužívej: hosting musí nejdřív zapnout zpracování PHP.
Pokud server hlásí chybu 500, zkontroluj jeho error log / podporu .htaccess.

KÓD DO HEAD KAŽDÉHO WEBU (nahraď doménu):
<script type="module" src="https://TVOJE-DOMENA/navhead/v2/metrobus-nav.js"></script>

PRVNÍ PRVEK V BODY, PŘED VLASTNÍ HLAVIČKOU:
<metrobus-nav-v2 active="sotofoto"></metrobus-nav-v2>

active: metrobus, videa, studio, forendors, vyroci, kalendar, sotofoto, odkazy.
Font, skript a JSON zůstávají na jednom místě. Veřejné soubory potřebují CORS;
přiložený .htaccess nastavuje Access-Control-Allow-Origin: * pouze pro statické
soubory. Pokud host tuto hlavičku nepodporuje, musí ji nastavit jeho správce.

Před ostrým použitím ověř přihlášení, uložení, publikování, mobil a vložení
na jinou doménu. Parametry konkrétního hostingu se ověří až po nahrání.
Záloha: stáhni celý navhead/private (obsahuje heslový hash a draft) a
navhead/v2/config.json. Přístup k záloze chraň jako k administraci.
'''
args.output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(args.output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for folder in ('v2', 'assets'):
        for path in sorted((root / folder).rglob('*')):
            if path.is_file():
                archive.write(path, 'navhead/' + path.relative_to(root).as_posix())
    for path in sorted((root / 'hosting/php').rglob('*')):
        if path.is_file() and path.name != 'settings.example.php':
            archive.write(path, 'navhead/' + path.relative_to(root / 'hosting/php').as_posix())
    archive.writestr('navhead/private/settings.php', "<?php\nreturn ['install_token' => '" + token + "', 'password_hash' => ''];\n")
    archive.writestr('navhead/index.html', '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=admin/"><a href="admin/">Administrace navheadu</a>')
    archive.writestr('CTI-ME.txt', guide)
print(args.output.resolve())
