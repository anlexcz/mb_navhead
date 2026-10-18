import importlib.util
from pathlib import Path
import re
import tempfile
import unittest
import zipfile

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('package_php', root / 'scripts/package_php.py')
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)


class PackageTest(unittest.TestCase):
    def test_runtime_is_copied_without_edits_and_secrets_are_generated(self):
        with tempfile.TemporaryDirectory() as tmp:
            archives = [package.build(Path(tmp) / f'build-{n}.zip') for n in range(2)]
            codes = []
            for path in archives:
                with zipfile.ZipFile(path) as archive:
                    self.assertEqual(len(archive.namelist()), 19)
                    for name in package.PUBLIC_FILES:
                        self.assertEqual(archive.read('navhead/' + name), (root / 'navhead' / name).read_bytes())
                    settings = archive.read('navhead/private/settings.php').decode()
                    code = re.search(r"'install_token' => '([^']+)'", settings)[1]
                    codes.append(code)
                    self.assertIn(code, archive.read('CTI-ME.txt').decode())
                    self.assertIn("'password_hash' => ''", settings)
                    self.assertNotIn('navhead/private/settings.example.php', archive.namelist())
                    self.assertNotIn('navhead/private/draft.php', archive.namelist())
            self.assertNotEqual(codes[0], codes[1])


if __name__ == '__main__':
    unittest.main()
