import {monitorSession} from './session.mjs?v=cd97e32cf7ab';
import '../metrobus-nav.js';
import {locate, moveItem, keyError, renameItem} from './admin-navigation.mjs?v=0ad20181e91a';

const $ = selector => document.querySelector(selector);
const live = $('#live');
const apiMeta = document.querySelector('meta[name="navhead-api"]');
let serverState = null, sessionMonitor, leaving=false;
const apiURL = new URL(apiMeta.content,location.href);
const loginURL = new URL(document.querySelector('meta[name="navhead-login"]').content,location.href);
const recoveryKey = 'navhead-recovery:'+apiURL.href;
function expiredSession() {
  if (leaving) return;
  leaving=true;sessionMonitor?.stop();
  if (dirty && draft) {
    try {sessionStorage.setItem(recoveryKey,JSON.stringify({config:draft,draft_version:serverState?.draft_version,published_version:serverState?.published_version}));}
    catch {leaving=false;toast('Přihlášení vypršelo. Stáhni zálohu před obnovením stránky.');return;}
  }
  dirty=false;loginURL.searchParams.set('expired','1');location.replace(loginURL.href);
}
async function checkSession(touch=false) {
  const url=new URL(apiURL);url.searchParams.set('session','1');
  const options={credentials:'same-origin',cache:'no-store'};
  if (touch) {options.method='POST';options.headers={'X-Navhead-CSRF':serverState.csrf};}
  const response=await fetch(url,options);
  if (!response.ok) {const error=new Error('Přihlášení vypršelo.');error.status=response.status;throw error;}
  return response.json();
}
async function serverRequest(action, config) {
  const options = {credentials:'same-origin',cache:'no-store'};
  if (action) {options.method='POST';options.headers={'Content-Type':'application/json','X-Navhead-CSRF':serverState.csrf};options.body=JSON.stringify({action,config,draft_version:serverState.draft_version,published_version:serverState.published_version});}
  const response=await fetch(new URL(apiMeta.content,location.href),options);
  let result;try {result=await response.json();}catch {throw new Error('Server nevrátil platnou odpověď.');}
  if (response.status===401) expiredSession();
  if (!response.ok) throw new Error(result.error||'Serverová chyba.');
  return result;
}
let draft, dirty = false, dragKey = null, toastTimer;
const esc = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const uid = prefix => `${prefix}_${crypto.randomUUID()}`;
const plain = html => { const node = document.createElement('template'); node.innerHTML = String(html).replace(/<br\s*\/?\s*>/gi, ' / '); return node.content.textContent || ''; };
function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').hidden = true, 3000); }
function updatePreview() { live.setConfig(structuredClone(draft)); }
function changed() { dirty = true; $('#draftStatus').textContent = 'Neuložené změny'; updatePreview(); }
function checked(value) { return value ? ' checked' : ''; }
function card(key) { return [...$('#menu').querySelectorAll('[data-key]')].find(node => node.dataset.key === key); }
function dropSlot(parentKey = '', beforeKey = '') { return `<div class="drop-slot" data-drop-parent="${esc(parentKey)}" data-drop-before="${esc(beforeKey)}" aria-hidden="true"></div>`; }
function itemEditor(item, parentKey) {
  const group = item.type === 'group';
  const id = `<label class="field key-field">ID<input data-key-input value="${esc(item.key)}" required maxlength="100" autocomplete="off" spellcheck="false" aria-describedby="hint_${esc(item.key)}" title="Změnu ID přenes také do atributu active na webu."><small id="hint_${esc(item.key)}"><code data-active-example>active="${esc(item.key)}"</code></small></label>`;
  const location = group ? '' : `<label class="field location-field">Umístění<select data-parent><option value=""${parentKey == null ? ' selected' : ''}>Hlavní lišta</option>${draft.navigation.filter(group => group.type === 'group').map(group => `<option value="${esc(group.key)}"${parentKey === group.key ? ' selected' : ''}>${esc(group.label)}</option>`).join('')}</select></label>`;
  return `<div class="item-editor${group ? ' group-editor' : ''}" id="editor_${esc(item.key)}" hidden><div class="form-grid"><label class="field name-field">Název<input data-field="label" value="${esc(item.label)}" autocomplete="off" required></label>${group ? '' : `<label class="field url-field">Adresa<input data-field="url" value="${esc(item.url)}" type="url" placeholder="https://" autocomplete="off"></label>`}${id}${location}</div><div class="editor-toolbar"><div class="editor-options"><label class="check"><input data-field="enabled" type="checkbox"${checked(item.enabled !== false)}>Zobrazovat</label>${group ? '' : `<label class="check"><input data-field="target" type="checkbox"${checked(item.target !== '_self')}>Nový tab</label>`}</div><div class="editor-footer"><button class="button quiet" type="button" data-close>Zavřít</button><button class="button danger" type="button" data-delete>Smazat</button></div></div></div>`;
}
function navEntry(item, index, length, parentKey = null) {
  const group = item.type === 'group', name = esc(item.label);
  const row = `<div class="nav-row"><button class="drag-handle" type="button" draggable="true" title="Přetáhnout" aria-label="Přetáhnout ${name}">⠿</button><button class="row-title" type="button" data-edit aria-expanded="false" aria-controls="editor_${esc(item.key)}"><span class="entry-copy"><span class="entry-title"><span data-title>${name}</span><span data-disabled class="badge off"${item.enabled === false ? '' : ' hidden'}>Vypnuto</span></span>${group ? '' : `<span class="entry-url" data-description>${esc(item.url)}</span>`}</span><span class="row-chevron" aria-hidden="true">⌄</span></button><div class="row-actions"><button class="icon-button" type="button" data-move="-1" title="Nahoru" aria-label="Posunout ${name} nahoru"${index === 0 ? ' disabled' : ''}>↑</button><button class="icon-button" type="button" data-move="1" title="Dolů" aria-label="Posunout ${name} dolů"${index === length - 1 ? ' disabled' : ''}>↓</button></div></div>`;
  return `<${group ? 'section' : 'article'} class="nav-entry${group ? ' group-card' : ''}" data-key="${esc(item.key)}">${row}${itemEditor(item, parentKey)}${group ? `<div class="children" data-children="${esc(item.key)}">${(item.children || []).map((child, n, children) => dropSlot(item.key, child.key) + navEntry(child, n, children.length, item.key)).join('')}${dropSlot(item.key)}</div><div class="child-actions"><button class="button" type="button" data-add-child aria-label="Přidat odkaz do ${name}">+ Odkaz</button></div>` : ''}</${group ? 'section' : 'article'}>`;
}
function toggleEditor(entry, open) {
  entry.querySelector(':scope > .item-editor').hidden = !open;
  entry.classList.toggle('editor-open', open);
  entry.querySelector(':scope > .nav-row [data-edit]').setAttribute('aria-expanded', String(open));
}
function renderMenu(openKey, focusKey) {
  const openKeys = new Set([...$('#menu').querySelectorAll('.editor-open')].map(node => node.dataset.key));
  if (openKey) openKeys.add(openKey);
  $('#menu').innerHTML = draft.navigation.map((item, n, items) => dropSlot('', item.key) + navEntry(item, n, items.length)).join('') + dropSlot();
  if (!draft.navigation.length) $('#menu').insertAdjacentHTML('beforeend', '<div class="empty">Žádné odkazy.</div>');
  for (const key of openKeys) { const entry = card(key); if (entry) toggleEditor(entry, true); }
  if (openKey) card(openKey)?.querySelector(':scope > .item-editor input')?.focus();
  else if (focusKey) card(focusKey)?.querySelector(':scope > .nav-row [data-edit]')?.focus();
}
function newLink() { return {key: uid('link'), type: 'link', label: 'Nový odkaz', url: 'https://', target: '_blank', enabled: true}; }
function validateKey(input) {
  const entry = input.closest('[data-key]');
  const message = keyError(draft.navigation, entry.dataset.key, input.value);
  input.setCustomValidity(message);
  input.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}
function applyKey(input) {
  if (!validateKey(input)) return false;
  const entry = input.closest('[data-key]'), oldKey = entry.dataset.key, newKey = input.value;
  if (oldKey === newKey) return true;
  renameItem(draft.navigation, oldKey, newKey);
  entry.dataset.key = newKey;
  entry.querySelector(':scope > .item-editor').id = `editor_${newKey}`;
  entry.querySelector(':scope > .nav-row [data-edit]').setAttribute('aria-controls', `editor_${newKey}`);
  const hint = input.nextElementSibling;
  hint.id = `hint_${newKey}`;
  input.setAttribute('aria-describedby', hint.id);
  hint.querySelector('[data-active-example]').textContent = `active="${newKey}"`;
  for (const attribute of ['data-drop-parent', 'data-drop-before', 'data-children']) {
    $('#menu').querySelectorAll(`[${attribute}]`).forEach(node => { if (node.getAttribute(attribute) === oldKey) node.setAttribute(attribute, newKey); });
  }
  $('#menu').querySelectorAll('[data-parent] option').forEach(option => { if (option.value === oldKey) option.value = newKey; });
  if (live.getAttribute('active') === oldKey) live.setAttribute('active', newKey);
  if (dragKey === oldKey) dragKey = newKey;
  changed();
  toast('ID změněno. Uprav active i na webu.');
  return true;
}
$('#menu').addEventListener('input', event => {
  if (!event.target.matches('[data-key-input]')) return;
  validateKey(event.target);
  changed();
});
$('#menu').addEventListener('change', event => {
  if (event.target.matches('[data-key-input]') && !applyKey(event.target)) event.target.reportValidity();
});
$('#menu').addEventListener('input', event => {
  const input = event.target.closest('[data-field]'); if (!input) return;
  const entry = input.closest('[data-key]'), item = locate(draft.navigation, entry.dataset.key)?.item; if (!item) return;
  const field = input.dataset.field;
  item[field] = field === 'enabled' ? input.checked : field === 'target' ? (input.checked ? '_blank' : '_self') : input.value;
  entry.querySelector(':scope > .nav-row [data-title]').textContent = item.label;
  entry.querySelector(':scope > .nav-row [data-disabled]').hidden = item.enabled !== false;
  if (item.type !== 'group') entry.querySelector(':scope > .nav-row [data-description]').textContent = item.url;
  // Keep destination names current without redrawing the focused input.
  if (item.type === 'group') $('#menu').querySelectorAll('[data-parent] option').forEach(option => { if (option.value === item.key) option.textContent = item.label; });
  changed();
});
$('#menu').addEventListener('change', event => {
  if (!event.target.matches('[data-parent]')) return;
  const key = event.target.closest('[data-key]').dataset.key;
  if (moveItem(draft.navigation, key, event.target.value || null)) { changed(); renderMenu(key); }
});
$('#menu').addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  const entry = button.closest('[data-key]'); if (!entry) return;
  const key = entry.dataset.key, source = locate(draft.navigation, key); if (!source) return;
  if (button.hasAttribute('data-edit')) { toggleEditor(entry, entry.querySelector(':scope > .item-editor').hidden); return; }
  if (button.hasAttribute('data-close')) { toggleEditor(entry, false); entry.querySelector(':scope > .nav-row [data-edit]').focus(); return; }
  if (button.hasAttribute('data-add-child')) { const item = newLink(); source.item.children ||= []; source.item.children.push(item); changed(); renderMenu(item.key); return; }
  if (button.hasAttribute('data-delete')) { source.array.splice(source.index, 1); changed(); renderMenu(); return; }
  if (button.hasAttribute('data-move')) {
    const delta = Number(button.dataset.move), next = source.index + delta;
    if (next < 0 || next >= source.array.length) return;
    const before = source.array[delta < 0 ? next : next + 1]?.key || null;
    if (moveItem(draft.navigation, key, source.parent?.key || null, before)) { changed(); renderMenu(null, key); }
  }
});
function clearIndicator() { $('#menu').querySelectorAll('.drop-active,.drop-before,.drop-after,.drop-inside').forEach(node => node.classList.remove('drop-active','drop-before','drop-after','drop-inside')); }
function finishDrag() { clearIndicator(); $('#menu').classList.remove('is-dragging'); $('#menu').querySelectorAll('.dragging').forEach(node => node.classList.remove('dragging')); dragKey = null; }
function destination(event) {
  const source = locate(draft.navigation, dragKey); if (!source) return null;
  const slot = event.target.closest('[data-drop-parent]');
  let result;
  if (slot) result = {parentKey: slot.dataset.dropParent || null, beforeKey: slot.dataset.dropBefore || null, element: slot, style: 'drop-active'};
  else {
    const row = event.target.closest('.nav-row');
    if (row) {
      const entry = row.closest('[data-key]'), target = locate(draft.navigation, entry.dataset.key); if (!target || target.item.key === dragKey) return null;
      const bounds = row.getBoundingClientRect(), ratio = (event.clientY - bounds.top) / bounds.height;
      if (target.item.type === 'group' && source.item.type !== 'group' && ratio > .25 && ratio < .75) result = {parentKey: target.item.key, beforeKey: null, element: entry, style: 'drop-inside'};
      else { const after = ratio >= .5; result = {parentKey: target.parent?.key || null, beforeKey: after ? (target.array[target.index + 1]?.key || null) : target.item.key, element: entry, style: after ? 'drop-after' : 'drop-before'}; }
    } else {
      const children = event.target.closest('[data-children]');
      if (children) result = {parentKey: children.dataset.children, beforeKey: null, element: children.parentElement, style: 'drop-inside'};
      else if (event.target === $('#menu')) result = {parentKey: null, beforeKey: null, element: [...$('#menu').children].filter(node => node.classList.contains('drop-slot')).at(-1), style: 'drop-active'};
    }
  }
  if (!result || (source.item.type === 'group' && result.parentKey != null)) return null;
  return result;
}
$('#menu').addEventListener('dragstart', event => {
  const handle = event.target.closest('.drag-handle'); if (!handle) { event.preventDefault(); return; }
  const entry = handle.closest('[data-key]'); dragKey = entry.dataset.key;
  event.dataTransfer.setData('text/plain', dragKey); event.dataTransfer.effectAllowed = 'move';
  $('#menu').classList.add('is-dragging'); entry.classList.add('dragging'); event.stopPropagation();
});
$('#menu').addEventListener('dragover', event => {
  if (!dragKey) return;
  const target = destination(event); clearIndicator();
  if (!target) { event.dataTransfer.dropEffect = 'none'; return; }
  event.preventDefault(); event.dataTransfer.dropEffect = 'move'; target.element.classList.add(target.style);
});
$('#menu').addEventListener('dragleave', event => { if (!$('#menu').contains(event.relatedTarget)) clearIndicator(); });
$('#menu').addEventListener('drop', event => {
  if (!dragKey) return;
  event.preventDefault(); const target = destination(event), key = dragKey;
  const moved = target && moveItem(draft.navigation, key, target.parentKey, target.beforeKey);
  finishDrag(); if (moved) { changed(); renderMenu(null, key); }
});
$('#menu').addEventListener('dragend', finishDrag);
$('#addLink').onclick = () => { const item = newLink(); draft.navigation.push(item); changed(); renderMenu(item.key); };
$('#addGroup').onclick = () => { const item = {key: uid('group'), type:'group', label:'Nová skupina', enabled:true, children:[]}; draft.navigation.push(item); changed(); renderMenu(item.key); };
function announcementEntry(item, index) {
  return `<details class="entry" data-ann="${index}"><summary class="entry-summary"><span class="entry-copy"><span class="entry-title" data-ann-title>${esc(plain(item.html) || 'Nové oznámení')}</span><span class="entry-url" data-ann-status>${item.enabled === false ? 'Vypnuté' : 'Aktivní'}</span></span><span class="entry-cue" aria-hidden="true"></span></summary><div class="entry-body"><div class="formatbar"><button class="button" type="button" data-format="strong" aria-label="Tučné písmo"><strong>B</strong></button><button class="button" type="button" data-format="em" aria-label="Kurzíva"><em>I</em></button><button class="button" type="button" data-format="link">Odkaz</button><button class="button" type="button" data-format="br">Nový úsek</button><label class="url-label" for="link_${index}">Adresa</label><input id="link_${index}" type="url" data-link-url placeholder="https://" aria-label="Adresa odkazu pro vložení do oznámení"></div><label class="field"><span class="sr-only">Text oznámení</span><textarea data-ann-field="html" aria-label="Text oznámení">${esc(item.html)}</textarea></label><div class="editor-options"><label class="check"><input type="checkbox" data-ann-field="enabled"${checked(item.enabled !== false)}>Zobrazovat</label></div><div class="editor-footer"><button class="button quiet" type="button" data-ann-close>Zavřít</button><button class="button danger" type="button" data-ann-delete>Smazat</button></div></div></details>`;
}
function renderAnnouncements(openIndex) { $('#announcementsList').innerHTML = draft.announcements.map(announcementEntry).join('') || '<div class="empty">Žádná oznámení.</div>'; if (openIndex != null) { const entry = $('#announcementsList').querySelector(`[data-ann="${openIndex}"]`); entry.open = true; entry.querySelector('textarea').focus(); } }
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
async function save() {
  for (const input of $('#menu').querySelectorAll('[data-key-input]')) {
    if (!applyKey(input)) {
      toggleEditor(input.closest('[data-key]'), true);
      input.reportValidity(); input.focus(); return false;
    }
  }
  try {
    serverState=await serverRequest('save',draft);draft=serverState.config;updatePreview();
    dirty=false;$('#draftStatus').textContent='Uloženo';toast('Draft uložen.');return true;
  } catch(error) {toast(error.message);return false;}
}
$('#saveDraft').onclick = save;
if ($('#publishConfig')) $('#publishConfig').onclick = async () => {
  const button=$('#publishConfig');button.disabled=true;
  try {if (!await save()) return;serverState=await serverRequest('publish');dirty=false;$('#draftStatus').textContent='Publikováno';toast('Publikováno.');}
  catch(error) {toast(error.message);}
  finally {button.disabled=false;}
};
$('#exportConfig').onclick = () => { const data = JSON.stringify(draft, null, 2) + '\n', url = URL.createObjectURL(new Blob([data], {type: 'application/json'})), link = document.createElement('a'); link.href = url; link.download = 'config.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Záloha stažena.'); };
$('#logout').onclick = async () => {
  if (dirty && !window.confirm('Odhlásit a zahodit neuložené změny?')) return;
  const button=$('#logout');button.disabled=true;
  try {
    const response=await fetch(new URL('./logout.php',apiURL),{method:'POST',credentials:'same-origin',headers:{'X-Navhead-CSRF':serverState.csrf}});
    if (!response.ok) throw new Error('Odhlášení se nezdařilo. Zkus to znovu.');
    sessionMonitor?.stop();sessionStorage.removeItem(recoveryKey);dirty=false;location.replace(loginURL.href);
  } catch(error) {toast(error.message);button.disabled=false;}
};
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
try {
  serverState=await serverRequest();draft=serverState.config;
  if (!validConfig(draft)) throw new Error('Neplatná konfigurace.');
  function defaults(items) { for (const item of items) { if (item.type === 'link') item.target ??= '_blank'; if (item.children) defaults(item.children); } }
  let recovered=false;
  try {
    const stored=JSON.parse(sessionStorage.getItem(recoveryKey)||'null');
    if (validConfig(stored?.config)) {
      if (stored.draft_version===serverState.draft_version && stored.published_version===serverState.published_version) {
        draft=stored.config;recovered=true;sessionStorage.removeItem(recoveryKey);
      } else {
        const button=document.createElement('button');button.className='button';button.textContent='Stáhnout rozpracovanou zálohu';
        button.onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(stored.config,null,2)],{type:'application/json'}));a.href=url;a.download='rozpracovana-konfigurace.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
        $('.head-actions>div').append(button);toast('Na serveru jsou novější změny. Rozpracovanou verzi můžeš stáhnout jako zálohu.');
      }
    }
  } catch { /* A closed tab or unavailable storage simply has no recovery. */ }
  defaults(draft.navigation); updatePreview(); renderMenu(); renderAnnouncements(); $('#draftStatus').textContent = recovered ? 'Neuložené změny' : 'Uloženo';
  dirty=recovered;if (recovered) toast('Neuložené změny obnoveny.');
  $('#logout').disabled=false;
  sessionMonitor=monitorSession({check:()=>checkSession(),touch:()=>checkSession(true),expire:expiredSession,expiresIn:serverState.expires_in});
} catch (error) { $('#draftStatus').textContent = 'Chyba načítání'; $('#menu').textContent = error.message; document.querySelectorAll('#saveDraft,#exportConfig,#addLink,#addGroup,#addAnnouncement,#publishConfig').forEach(button => button.disabled = true); }
