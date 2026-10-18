#!/usr/bin/env python3
"""Package the production source and generate a private one-time install code."""
import argparse
from pathlib import Path
import secrets
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_FILES = (
    '.htaccess', 'index.php', 'metrobus-nav.js', 'config.json',
    'fonts/montserrat.css', 'fonts/montserrat.js',
    'fonts/montserrat-latin-ext.woff2', 'fonts/OFL.txt',
    'admin/index.php', 'admin/view.php', 'admin/bootstrap.php',
    'admin/login.php', 'admin/login-view.php', 'admin/logout.php', 'admin/session.mjs',
    'admin/api.php', 'admin/setup.php', 'admin/admin.js',
    'admin/admin.css', 'admin/admin-navigation.mjs', 'private/.htaccess',
)


def build(output):
    token = secrets.token_urlsafe(24)
    guide = (ROOT / 'INSTALL.template.txt').read_text()
    if guide.count('{{INSTALL_TOKEN}}') != 1:
        raise ValueError('Missing install code placeholder in guide')
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name in PUBLIC_FILES:
            archive.write(ROOT / 'navhead' / name, 'navhead/' + name)
        # Never copy a deployed password, draft, or installation code.
        archive.writestr('navhead/private/settings.php', "<?php\nreturn ['install_token' => '" + token + "', 'password_hash' => ''];\n")
        archive.writestr('CTI-ME.txt', guide.replace('{{INSTALL_TOKEN}}', token))
    return output.resolve()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('output', type=Path)
    print(build(parser.parse_args().output))
