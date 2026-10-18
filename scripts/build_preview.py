#!/usr/bin/env python3
"""Render a static Pages entry point using the real production admin assets."""
from pathlib import Path
import hashlib
ROOT = Path(__file__).resolve().parents[1]


def build():
    view = (ROOT / 'navhead/admin/view.php').read_text()
    view = view[view.index('<!doctype html>'):]
    view = view.replace('../fonts/', './navhead/fonts/')
    view = view.replace('./admin.css', './navhead/admin/admin.css')
    view = view.replace('<script type="module" src="./admin.js', '<script src="./preview/api.js"></script>\n<script type="module" src="./navhead/admin/admin.js')
    view = view.replace('content="./api.php"', 'content="./preview-api"').replace('content="./login.php"', 'content="./login.html"')
    view = view.replace('>Publikovat</button>', '>Publikovat v náhledu</button>')
    view = view.replace('<body>', '<body>\n<div class="preview-tools" role="note">Zkušební náhled · změny se ukládají jen v tomto prohlížeči. <a href="./">Zobrazit hlavičku</a></div>')
    api_hash=hashlib.sha256((ROOT/'preview/api.js').read_bytes()).hexdigest()[:12]
    view=view.replace('./preview/api.js', './preview/api.js?v='+api_hash)
    (ROOT / 'admin.html').write_text(view)
    login = (ROOT / 'navhead/admin/login-view.php').read_text()
    login = login[login.index('<!doctype html>'):]
    login = login.replace('../fonts/', './navhead/fonts/').replace('./admin.css', './navhead/admin/admin.css')
    login = login.replace('{{CSRF}}','preview').replace('{{ERROR}}','')
    login = login.replace('action="./login.php"','action="./admin.html"')
    login = login.replace('</head>', '<script type="module" src="./preview/login.js"></script></head>')
    login_hash=hashlib.sha256((ROOT/'preview/login.js').read_bytes()).hexdigest()[:12]
    login=login.replace('./preview/login.js', './preview/login.js?v='+login_hash)
    (ROOT / 'login.html').write_text(login)


if __name__ == '__main__':
    build()
