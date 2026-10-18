// Optional self-hosted server. GitHub Pages cannot enforce a password.
// Put this behind HTTPS in production. No password is bundled with the client.
import http from 'node:http';
import {createHash, timingSafeEqual} from 'node:crypto';
import {readFile, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, sep, extname, posix} from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const password = process.env.NAVHEAD_ADMIN_PASSWORD;
if (!password) throw new Error('Set NAVHEAD_ADMIN_PASSWORD before starting the server.');
const passwordHash = createHash('sha256').update(password).digest();
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
function authorized(header = '') {
  if (!header.startsWith('Basic ')) return false;
  const value = Buffer.from(header.slice(6), 'base64').toString('utf8'), colon = value.indexOf(':');
  if (colon < 0 || value.slice(0, colon) !== 'admin') return false;
  return timingSafeEqual(createHash('sha256').update(value.slice(colon + 1)).digest(), passwordHash);
}
const server = http.createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'same-origin');
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, {'Allow':'GET, HEAD'}); response.end(); return; }
    const path = posix.normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/\/+/g, '/'));
    const admin = path === '/admin' || path.startsWith('/admin/') || path === '/v2/admin.html' || path === '/admin-prototype.html' || path === '/admin/legacy-prototype.html';
    if (admin) {
      response.setHeader('Cache-Control', 'no-store');
      if (!authorized(request.headers.authorization)) { response.writeHead(401, {'WWW-Authenticate':'Basic realm="Metrobus admin", charset="UTF-8"','Content-Type':'text/plain; charset=utf-8'}); response.end('Přihlášení: admin a nastavené heslo.'); return; }
    }
    if (path === '/admin') { response.writeHead(302, {'Location':'/admin/'}); response.end(); return; }
    let relative = path.startsWith('/admin/') ? '/v2/' + path.slice('/admin/'.length) : path;
    if (relative.endsWith('/')) relative += 'index.html';
    if (path === '/admin/') relative = '/v2/admin.html';
    const file = resolve(root, '.' + relative);
    // Serve only the public project files; never expose dotfiles or server source.
    const publicFile = /^\/(?:v2|nav|assets)\//.test(relative) || ['/index.html','/admin-live-preview.html','/admin-prototype.html'].includes(relative);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep) || !publicFile || relative.split('/').some(segment => segment.startsWith('.'))) { response.writeHead(404); response.end(); return; }
    if (!admin) response.setHeader('Access-Control-Allow-Origin', '*');
    const info = await stat(file); if (!info.isFile()) throw new Error('Not a file');
    response.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream'});
    response.end(request.method === 'HEAD' ? undefined : await readFile(file));
  } catch { if (!response.headersSent) response.writeHead(404); response.end('Nenalezeno'); }
});
const port = Number(process.env.PORT || 3000), host = process.env.HOST || '127.0.0.1';
server.listen(port, host, () => console.log(`Metrobus navhead: http://${host}:${port}/admin/ (user: admin)`));
