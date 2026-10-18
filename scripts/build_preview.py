#!/usr/bin/env python3
"""Render a static Pages entry point using the real production admin assets."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]


def build():
    view = (ROOT / 'navhead/admin/view.php').read_text()
    view = view[view.index('<!doctype html>'):]
    view = view.replace('../fonts/', './navhead/fonts/')
    view = view.replace('./admin.css', './navhead/admin/admin.css')
    view = view.replace('<script type="module" src="./admin.js', '<script src="./preview/api.js"></script>\n<script type="module" src="./navhead/admin/admin.js')
    view = view.replace('content="./api.php"', 'content="./preview-api"')
    view = view.replace('>Publikovat</button>', '>Publikovat v náhledu</button>')
    view = view.replace('<body>', '<body>\n<div class="preview-tools" role="note">Zkušební náhled · změny se ukládají jen v tomto prohlížeči. <a href="./">Zobrazit hlavičku</a></div>')
    (ROOT / 'admin.html').write_text(view)


if __name__ == '__main__':
    build()
