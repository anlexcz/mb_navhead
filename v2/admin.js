import './metrobus-nav.js?v=20261018-admin';

const storageKey = 'metrobus-navhead-draft-v2';
const $ = selector => document.querySelector(selector);
const live = $('#live');
let draft, dirty = false, dragPath = null, toastTimer;
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const uid = prefix => `${prefix}_${crypto.randomUUID()}`;
const plain = html => { const node = document.createElement('template'); node.innerHTML = String(html).replace(/<br\s*\/?\s*>/gi, ' / '); return node.content.textContent || ''; };
function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').hidden = true, 3000); }
function updatePreview() {
  live.setConfig(structuredClone(draft));
  $('#navCount').textContent = draft.navigation.length;
  $('#annCount').textContent = draft.announcements.length;
}
function changed() { dirty = true; $('#draftStatus').textContent = 'Neuložené změny'; updatePreview(); }
function at(path) { return path.split('.').reduce((node, index, depth) => depth ? node.children[Number(index)] : draft.navigation[Number(index)], null); }
function collection(path) { const indices = path.split('.').map(Number); return { array: indices.length === 1 ? draft.navigation : draft.navigation[indices[0]].children, index: indices.at(-1) }; }
function checked(value) { return value ? ' checked' : ''; }
function navEntry(item, path, index, length) {
  const group = item.type === 'group';
  return `<details class="entry" data-path="${path}"><summary class="entry-summary" draggable="true"><span class="grip" aria-hidden="true">≡</span><span class="entry-copy"><span class="entry-title"><span data-title>${esc(item.label)}</span>${group ? '<span class="badge">Skupina</span>' : ''}<span data-disabled class="badge off"${item.enabled === false ? '' : ' hidden'}>Vypnuto</span></span><span class="entry-url" data-description>${group ? `${(item.children || []).length} odkazů` : esc(item.url)}</span></span><span class="entry-cue">Upravit</span></summary><div class="entry-body"><div class="form-grid"><label class="field${group ? ' full' : ''}">Název<input data-field="label" value="${esc(item.label)}" autocomplete="off" required></label>${group ? '' : `<label class="field">Adresa odkazu<input data-field="url" value="${esc(item.url)}" type="url" placeholder="https://" autocomplete="off"></label>`}</div><div class="editor-options"><label class="check"><input data-field="enabled" type="checkbox"${checked(item.enabled !== false)}>Zobrazovat v navigaci</label>${group ? '' : `<label class="check"><input data-field="target" type="checkbox"${checked(item.target !== '_self')}>Otevřít v novém tabu</label>`}</div><div class="editor-footer"><button class="button" type="button" data-move="-1" aria-label="Posunout ${esc(item.label)} nahoru"${index === 0 ? ' disabled' : ''}>↑ Nahoru</button><button class="button" type="button" data-move="1" aria-label="Posunout ${esc(item.label)} dolů"${index === length - 1 ? ' disabled' : ''}>↓ Dolů</button><button class="button quiet" type="button" data-close>Hotovo</button><button class="button danger" type="button" data-delete>${group ? 'Smazat skupinu' : 'Smazat odkaz'}</button></div></div>${group ? `<div class="children">${(item.children || []).map((child, n, children) => navEntry(child, `${path}.${n}`, n, children.length)).join('')}</div><div class="child-actions"><button class="button" type="button" data-add-child="${path}">+ Odkaz do skupiny</button></div>` : ''}</details>`;
}
function renderMenu(openPath) {
  $('#menu').innerHTML = draft.navigation.map((item, n, items) => navEntry(item, String(n), n, items.length)).join('') || '<div class="empty">Navigace je prázdná. Přidej první odkaz.</div>';
  if (openPath != null) {
    const entry = $('#menu').querySelector(`[data-path="${openPath}"]`);
    if (entry) { entry.open = true; entry.closest('.children')?.parentElement.setAttribute('open', ''); entry.querySelector('input')?.focus(); }
  }
}
function newLink() { return { key: uid('link'), type: 'link', label: 'Nový odkaz', url: 'https://', target: '_blank', enabled: true }; }
$('#menu').addEventListener('input', event => {
  const input = event.target.closest('[data-field]'); if (!input) return;
  const entry = input.closest('[data-path]'), item = at(entry.dataset.path), field = input.dataset.field;
  item[field] = field === 'enabled' ? input.checked : field === 'target' ? (input.checked ? '_blank' : '_self') : input.value;
  entry.querySelector('[data-title]').textContent = item.label;
  entry.querySelector('[data-disabled]').hidden = item.enabled !== false;
  if (item.type !== 'group') entry.querySelector('[data-description]').textContent = item.url;
  changed();
});
$('#menu').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  const entry = button.closest('[data-path]'), path = entry.dataset.path;
  if (button.hasAttribute('data-close')) { entry.open = false; entry.querySelector('summary').focus(); return; }
  if (button.hasAttribute('data-add-child')) { const group = at(path); group.children ||= []; group.children.push(newLink()); changed(); renderMenu(`${path}.${group.children.length - 1}`); return; }
  const {array, index} = collection(path);
  if (button.hasAttribute('data-delete')) { array.splice(index, 1); changed(); renderMenu(); return; }
  if (button.hasAttribute('data-move')) { const next = index + Number(button.dataset.move); if (next < 0 || next >= array.length) return; [array[index], array[next]] = [array[next], array[index]]; changed(); const parts = path.split('.'); parts[parts.length - 1] = next; renderMenu(parts.join('.')); }
});
$('#menu').addEventListener('dragstart', event => { const summary = event.target.closest('summary'); if (!summary) return; const entry = summary.closest('[data-path]'); dragPath = entry.dataset.path; event.dataTransfer.setData('text/plain', dragPath); event.dataTransfer.effectAllowed = 'move'; entry.classList.add('dragging'); event.stopPropagation(); });
$('#menu').addEventListener('dragend', () => { document.querySelectorAll('.dragging').forEach(node => node.classList.remove('dragging')); dragPath = null; });
$('#menu').addEventListener('dragover', event => { if (dragPath != null && event.target.closest('summary')) event.preventDefault(); });
$('#menu').addEventListener('drop', event => { event.preventDefault(); const target = event.target.closest('summary')?.closest('[data-path]')?.dataset.path; if (dragPath == null || !target || dragPath === target) return; const sourceParent = dragPath.split('.').slice(0, -1).join('.'), targetParent = target.split('.').slice(0, -1).join('.'); if (sourceParent !== targetParent) { toast('Přesouvat lze položky uvnitř stejné skupiny.'); return; } const {array, index} = collection(dragPath), next = collection(target).index; const [item] = array.splice(index, 1); array.splice(next, 0, item); dragPath = null; changed(); renderMenu(); });
$('#addLink').onclick = () => { draft.navigation.push(newLink()); changed(); renderMenu(String(draft.navigation.length - 1)); };
$('#addGroup').onclick = () => { draft.navigation.push({key: uid('group'), type: 'group', label: 'Nová skupina', enabled: true, children: []}); changed(); renderMenu(String(draft.navigation.length - 1)); };
function announcementEntry(item, index) {
  return `<details class="entry" data-ann="${index}"><summary class="entry-summary"><span class="entry-copy"><span class="entry-title" data-ann-title>${esc(plain(item.html) || 'Nové oznámení')}</span><span class="entry-url" data-ann-status>${item.enabled === false ? 'Vypnuté' : 'Aktivní'}</span></span><span class="entry-cue">Upravit</span></summary><div class="entry-body"><label class="field">Obsah</label><div class="formatbar"><button class="button" type="button" data-format="strong" aria-label="Tučné písmo"><strong>B</strong></button><button class="button" type="button" data-format="em" aria-label="Kurzíva"><em>I</em></button><button class="button" type="button" data-format="link">Odkaz</button><button class="button" type="button" data-format="br">Nový úsek</button><label class="url-label" for="link_${index}">Adresa</label><input id="link_${index}" type="url" data-link-url placeholder="https://" aria-label="Adresa odkazu pro vložení do oznámení"></div><label class="field"><span class="sr-only">Text oznámení</span><textarea data-ann-field="html" aria-label="Text oznámení">${esc(item.html)}</textarea><span class="hint">Vyber text a použij formátování. Nový úsek oddělí další střídající se část oznámení.</span></label><div class="editor-options"><label class="check"><input type="checkbox" data-ann-field="enabled"${checked(item.enabled !== false)}>Zobrazovat oznámení</label></div><div class="editor-footer"><button class="button quiet" type="button" data-ann-close>Hotovo</button><button class="button danger" type="button" data-ann-delete>Smazat oznámení</button></div></div></details>`;
}
function renderAnnouncements(openIndex) { $('#announcementsList').innerHTML = draft.announcements.map(announcementEntry).join('') || '<div class="empty">Žádná oznámení. Lišta se zobrazí bez horního proužku.</div>'; if (openIndex != null) { const entry = $('#announcementsList').querySelector(`[data-ann="${openIndex}"]`); entry.open = true; entry.querySelector('textarea').focus(); } }
function updateAnnouncement(entry) { const item = draft.announcements[Number(entry.dataset.ann)]; item.html = entry.querySelector('textarea').value; item.enabled = entry.querySelector('[data-ann-field="enabled"]').checked; entry.querySelector('[data-ann-title]').textContent = plain(item.html) || 'Nové oznámení'; entry.querySelector('[data-ann-status]').textContent = item.enabled ? 'Aktivní' : 'Vypnuté'; changed(); }
$('#announcementsList').addEventListener('input', event => { if (event.target.hasAttribute('data-ann-field')) updateAnnouncement(event.target.closest('[data-ann]')); });
$('#announcementsList').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return; const entry = button.closest('[data-ann]');
  if (button.hasAttribute('data-ann-close')) { entry.open = false; entry.querySelector('summary').focus(); return; }
  if (button.hasAttribute('data-ann-delete')) { draft.announcements.splice(Number(entry.dataset.ann), 1); changed(); renderAnnouncements(); return; }
  if (!button.dataset.format) return;
  const textarea = entry.querySelector('textarea'), kind = button.dataset.format, selected = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
  let insert;
  if (kind === 'br') insert = '<br>';
  else if (kind === 'link') { const url = entry.querySelector('[data-link-url]').value.trim(); if (!/^https?:\/\//i.test(url)) { toast('Vyplň adresu odkazu začínající https:// nebo http://.'); entry.querySelector('[data-link-url]').focus(); return; } insert = `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${selected || 'text odkazu'}</a>`; }
  else insert = `<${kind}>${selected || 'text'}</${kind}>`;
  textarea.setRangeText(insert, textarea.selectionStart, textarea.selectionEnd, 'end'); textarea.focus(); updateAnnouncement(entry);
});
$('#addAnnouncement').onclick = () => { draft.announcements.push({id: uid('ann'), html: '', enabled: true}); changed(); renderAnnouncements(draft.announcements.length - 1); };
document.querySelectorAll('[data-tab]').forEach(button => button.onclick = () => { document.querySelectorAll('[data-tab]').forEach(tab => tab.removeAttribute('aria-current')); button.setAttribute('aria-current', 'page'); document.querySelectorAll('.tab-panel').forEach(panel => panel.hidden = panel.id !== button.dataset.tab); });
const phone = matchMedia('(max-width:700px)'), preview = $('#preview');
function showPreview(show) { preview.hidden = !show; $('#togglePreview').textContent = show ? 'Skrýt' : 'Zobrazit'; $('#togglePreview').setAttribute('aria-expanded', String(show)); }
showPreview(!phone.matches);
$('#togglePreview').onclick = () => showPreview(preview.hidden);
document.querySelectorAll('[data-size]').forEach(button => button.onclick = () => { if (phone.matches) return; document.querySelectorAll('[data-size]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); preview.className = `preview-stage ${button.dataset.size}`; });
function validConfig(config) { return config && Array.isArray(config.navigation) && Array.isArray(config.announcements); }
function save() { try { localStorage.setItem(storageKey, JSON.stringify(draft)); dirty = false; $('#draftStatus').textContent = `Uloženo ${new Date().toLocaleTimeString('cs-CZ', {hour:'2-digit', minute:'2-digit'})}`; toast('Draft uložen v tomto prohlížeči.'); } catch { toast('Draft se nepodařilo uložit. Stáhni konfiguraci.'); } }
$('#saveDraft').onclick = save;
$('#exportConfig').onclick = () => { const data = JSON.stringify(draft, null, 2) + '\n', url = URL.createObjectURL(new Blob([data], {type: 'application/json'})), link = document.createElement('a'); link.href = url; link.download = 'config.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Konfigurace stažena. Změny se na web projeví až po jejím nahrání.'); };
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
try {
  const response = await fetch(new URL('./config.json', import.meta.url), {cache: 'no-cache'}); if (!response.ok) throw new Error('Konfiguraci nelze načíst.'); const published = await response.json(); if (!validConfig(published)) throw new Error('Neplatný formát konfigurace.');
  let stored; try { stored = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { /* Use published config when storage is unavailable or invalid. */ }
  draft = validConfig(stored) ? stored : published;
  function defaults(items) { for (const item of items) { if (item.type === 'link') item.target ??= '_blank'; if (item.children) defaults(item.children); } }
  defaults(draft.navigation); updatePreview(); renderMenu(); renderAnnouncements(); $('#draftStatus').textContent = validConfig(stored) ? 'Obnoven uložený draft' : 'Načtena konfigurace webu';
} catch (error) { $('#draftStatus').textContent = 'Chyba načítání'; $('#menu').textContent = error.message; document.querySelectorAll('#saveDraft,#exportConfig,#addLink,#addGroup,#addAnnouncement').forEach(button => button.disabled = true); }
