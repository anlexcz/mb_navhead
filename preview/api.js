// GitHub Pages preview only: emulate persistence locally, never contact PHP.
(() => {
  const scriptURL = document.currentScript.src;
  const configURL = new URL('../navhead/config.json', scriptURL);
  const apiURL = new URL('./preview-api', document.baseURI);
  const logoutURL = new URL('./logout.php', document.baseURI);
  const authKey='navhead-preview-auth:'+new URL('../',scriptURL).pathname;
  function auth(touch=false) {
    let value;try {value=JSON.parse(sessionStorage.getItem(authKey));}catch {return 0;}
    if (!value || Date.now()-value.last_activity>=1800000) {sessionStorage.removeItem(authKey);return 0;}
    if (touch) {value.last_activity=Date.now();sessionStorage.setItem(authKey,JSON.stringify(value));}
    return Math.max(0,Math.ceil((1800000-(Date.now()-value.last_activity))/1000));
  }
  const storageKey = `navhead-preview:${new URL('../', scriptURL).pathname}`;
  const nativeFetch = window.fetch.bind(window);
  let memory;
  async function read() {
    let stored;
    try { stored = JSON.parse(localStorage.getItem(storageKey)); } catch { /* Fresh preview. */ }
    if (stored?.config && stored?.published) return stored;
    if (memory) return memory;
    const response = await nativeFetch(configURL, {cache:'no-cache'});
    if (!response.ok) throw new Error('Náhled nelze načíst.');
    const config = await response.json();
    return memory = {config, published:structuredClone(config), draft_version:'0', published_version:'0'};
  }
  const state = value => ({config:structuredClone(value.config),draft_version:value.draft_version,published_version:value.published_version,csrf:'local-preview',expires_in:auth()});
  window.NavheadPreview = {readPublished:async () => structuredClone((await read()).published)};
  window.fetch = async (input, options = {}) => {
    const url = new URL(input instanceof Request ? input.url : input, document.baseURI);
    if (url.pathname !== apiURL.pathname && url.pathname !== logoutURL.pathname) return nativeFetch(input, options);
    const reply = (body, status=200) => new Response(JSON.stringify(body), {status,headers:{'Content-Type':'application/json'}});
    if (url.pathname===logoutURL.pathname) {sessionStorage.removeItem(authKey);return reply({logged_out:true});}
    if (!auth()) return reply({error:'Přihlášení vypršelo.'},401);
    if (url.searchParams.has('session')) return reply({expires_in:auth(options.method==='POST')});
    auth(true);
    try {
      const value = await read();
      if (!options.method || options.method === 'GET') return reply(state(value));
      const data = JSON.parse(options.body);
      if (data.draft_version !== value.draft_version || data.published_version !== value.published_version) return reply({error:'Náhled se změnil v jiném okně. Stáhni zálohu a obnov stránku.'},409);
      if (data.action === 'save') {
        if (!Array.isArray(data.config?.navigation) || !Array.isArray(data.config?.announcements)) return reply({error:'Neplatná konfigurace.'},422);
        value.config = structuredClone(data.config); value.draft_version = crypto.randomUUID();
      } else if (data.action === 'publish') {
        value.published = structuredClone(value.config); value.published_version = crypto.randomUUID();
      } else return reply({error:'Neznámá akce.'},400);
      localStorage.setItem(storageKey, JSON.stringify(value));
      memory = value;
      return reply(state(value));
    } catch (error) { return reply({error:error.message || 'Náhled nelze uložit v prohlížeči.'},500); }
  };
})();
