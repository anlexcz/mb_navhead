"""Check deployable paths and production-only behavior in the real ZIP output."""
import importlib.util
from pathlib import Path
import posixpath
import re
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('package_php', Path(__file__).resolve().parents[1] / 'scripts/package_php.py')
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)


class ProductionPackageTest(unittest.TestCase):
    def test_archive_is_self_contained_and_server_only(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = package.build(Path(tmp) / 'navhead.zip')
            with zipfile.ZipFile(output) as archive:
                names = set(archive.namelist())
                self.assertEqual(len(names), 19)
                self.assertIn('CTI-ME.txt', names)
                self.assertIn('navhead/private/.htaccess', names)
                self.assertNotIn('navhead/admin.html', names)
                for name in names:
                    self.assertNotRegex(name, r'/v\d+/|prototype|server\.mjs|settings\.example')
                    if not name.endswith(('.js', '.mjs', '.css', '.php')):
                        continue
                    text = archive.read(name).decode()
                    self.assertNotRegex(text, r'localStorage|metrobus-nav-v2|/v2/|20261018-')
                    # Every relative browser asset resolves to a deployed file.
                    refs = re.findall(r'''(?:from\s+|import\s*|(?:src|href)=|url\()\s*['"](\.[^'"\s]+)''', text)
                    for ref in refs:
                        target = posixpath.normpath(posixpath.join(posixpath.dirname(name), ref.split('?')[0]))
                        self.assertIn(target, names, (name, ref))
                view = archive.read('navhead/admin/view.php').decode()
                self.assertIn("!defined('NH_ROOT')", view)
                self.assertIn('id="publishConfig"', view)
                js = archive.read('navhead/admin/admin.js').decode()
                self.assertIn("serverState=await serverRequest();draft=serverState.config", js)
                self.assertNotIn("new URL('./config.json'", js)
                self.assertIn('<metrobus-nav active=', archive.read('CTI-ME.txt').decode())
                self.assertNotIn('<metrobus-nav-v2', view)


if __name__ == '__main__':
    unittest.main()
