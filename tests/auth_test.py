"""Real PHP integration checks for cookie authentication and idle expiration.

Run with PHP available, or set NAVHEAD_TEST_PHP and NAVHEAD_TEST_DOM.
"""
import base64
import http.cookiejar
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import socket
import subprocess
import tempfile
import time
import unittest
import urllib.error
import urllib.parse
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PHP = os.environ.get('NAVHEAD_TEST_PHP') or shutil.which('php')
DOM = os.environ.get('NAVHEAD_TEST_DOM')


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


@unittest.skipUnless(PHP, 'PHP required for authentication integration test')
class AuthTest(unittest.TestCase):
    def test_login_logout_expiration_and_migration(self):
        php = [PHP, '-n'] + (['-d', 'extension='+DOM] if DOM else [])
        with tempfile.TemporaryDirectory() as directory:
            stage = Path(directory)
            spec = importlib.util.spec_from_file_location('package_php', ROOT/'scripts/package_php.py')
            package = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(package)
            with zipfile.ZipFile(package.build(stage/'install.zip')) as archive:
                archive.extractall(stage)
            for path in stage.rglob('*.php'):
                subprocess.run(php+['-l',str(path)],check=True,capture_output=True)
            # Existing installation: keep its password hash and published data.
            password_hash = subprocess.check_output(php+['-r',"echo password_hash('Test-only-Password-42', PASSWORD_DEFAULT);"],text=True)
            settings = stage/'navhead/private/settings.php'
            settings.write_text("<?php return ['install_token'=>'','password_hash'=>'"+password_hash+"'];")
            original_settings = settings.read_bytes()
            with socket.socket() as sock:
                sock.bind(('127.0.0.1',0))
                port = sock.getsockname()[1]
            proc = subprocess.Popen(php+['-d','session.save_path='+directory,'-d','session.gc_probability=0','-S',f'127.0.0.1:{port}','-t',directory],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            jar = http.cookiejar.CookieJar()
            opener = urllib.request.build_opener(NoRedirect(),urllib.request.HTTPCookieProcessor(jar))
            base = f'http://127.0.0.1:{port}/navhead/admin/'
            def request(path, data=None, headers=None):
                encoded = urllib.parse.urlencode(data).encode() if isinstance(data,dict) else data
                req = urllib.request.Request(base+path,data=encoded,headers=headers or {})
                try: response = opener.open(req)
                except urllib.error.HTTPError as error: response = error
                return response.status,response.read().decode(),response.headers
            def login():
                status,html,_ = request('login.php')
                self.assertEqual(status,200)
                csrf = re.search('name="csrf" value="([^"]+)"',html)[1]
                before = next(iter(jar)).value
                status,_,_ = request('login.php',{'username':'admin','password':'Test-only-Password-42','csrf':csrf})
                self.assertEqual(status,303)
                self.assertNotEqual(before,next(iter(jar)).value)
                return json.loads(request('api.php')[1])
            try:
                for _ in range(50):
                    try: request('login.php');break
                    except urllib.error.URLError: time.sleep(.1)
                self.assertEqual(request('')[0],303)
                self.assertEqual(request('api.php')[0],401)
                basic='Basic '+base64.b64encode(b'admin:Test-only-Password-42').decode()
                self.assertEqual(request('api.php',headers={'Authorization':basic})[0],401)
                _,html,_=request('login.php')
                csrf=re.search('name="csrf" value="([^"]+)"',html)[1]
                self.assertEqual(request('login.php',{'username':'admin','password':'wrong','csrf':csrf})[0],401)
                self.assertEqual(request('login.php',{'username':'admin','password':'Test-only-Password-42','csrf':'wrong'})[0],403)
                state=login()
                self.assertGreater(state['expires_in'],1790)
                cookie=next(iter(jar));old_cookie=cookie.name+'='+cookie.value
                session=stage/('sess_'+cookie.value)
                old=int(time.time())-120
                session.write_text(re.sub(r'last_activity\|i:\d+;',f'last_activity|i:{old};',session.read_text()))
                status,body,_=request('api.php?session=1')
                self.assertEqual(status,200)
                self.assertLess(json.loads(body)['expires_in'],1700)
                self.assertIn(f'last_activity|i:{old};',session.read_text())
                self.assertEqual(request('api.php?session=1',b'',{'X-Navhead-CSRF':'wrong'})[0],403)
                status,body,_=request('api.php?session=1',b'',{'X-Navhead-CSRF':state['csrf']})
                self.assertEqual(status,200)
                self.assertGreater(json.loads(body)['expires_in'],1790)
                session.write_text(re.sub(r'last_activity\|i:\d+;',f'last_activity|i:{int(time.time())-1801};',session.read_text()))
                self.assertEqual(request('api.php?session=1')[0],401)
                self.assertEqual(request('api.php')[0],401)
                self.assertEqual(request('')[0],303)
                state=login()
                cookie=next(iter(jar));old_cookie=cookie.name+'='+cookie.value
                self.assertEqual(request('logout.php')[0],405)
                self.assertEqual(request('logout.php',b'',{'X-Navhead-CSRF':'wrong'})[0],403)
                status,_,headers=request('logout.php',b'',{'X-Navhead-CSRF':state['csrf']})
                self.assertEqual(status,200)
                self.assertIn('Max-Age=0',headers.get('Set-Cookie',''))
                self.assertEqual(request('api.php',headers={'Cookie':old_cookie})[0],401)
                self.assertEqual(settings.read_bytes(),original_settings)
                self.assertEqual(request('view.php')[0],404)
                self.assertEqual(request('login-view.php')[0],404)
            finally:
                proc.terminate();proc.wait()


if __name__=='__main__':
    unittest.main()
