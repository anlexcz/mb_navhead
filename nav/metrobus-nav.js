const FALLBACK_CONFIG = {
  announcements: [
    { text: '2023 – V autobusech DPP začal hlásit Jan Vondráček' },
    { text: '1938 – Zastaven provoz Štramberk–Veřovice' }
  ],
  main: [
    { id: 'metrobus', label: 'Metrobus', url: 'https://metrobus.cz/' },
    { id: 'videa', label: 'Videa', url: 'https://metrobus.cz/' },
    { id: 'studio', label: 'Studio', url: 'https://metrobus.cz/studio' },
    { id: 'forendors', label: 'Forendors', url: 'https://www.forendors.cz/metrobus', priority: true },
    { id: 'apps', label: 'Aplikace', type: 'apps' },
    { id: 'odkazy', label: 'Odkazy', url: 'https://metrobus.cz/odkazy' }
  ],
  apps: [
    { id: 'vyroci', label: 'Dopravní výročí', url: '#' },
    { id: 'kalendar', label: 'Šotoušův kalendář', url: '#' },
    { id: 'sotofoto', label: 'Šotofoto', url: '#' }
  ]
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap');

  :host {
    --mb-nav-bg: #25282d;
    --mb-nav-blue: #1fa8e8;
    --mb-nav-text: #ffffff;
    --mb-nav-active-text: #25282d;
    --mb-nav-border: rgba(255,255,255,.12);
    --mb-nav-height: 38px;
    --mb-announcement-height: 34px;
    display: block;
    position: relative;
    z-index: 10000;
    width: 100%;
    font-family: 'Montserrat', Arial, sans-serif;
  }

  * { box-sizing: border-box; }

  .announcement-bar {
    position: relative;
    height: var(--mb-announcement-height);
    overflow: hidden;
    background: var(--mb-nav-bg);
    color: var(--mb-nav-text);
    border-bottom: 1px solid var(--mb-nav-border);
  }

  .announcement-inner {
    position: relative;
    width: min(100%, 1180px);
    height: 100%;
    margin: 0 auto;
    padding: 0 14px;
    overflow: hidden;
  }

  .announcement-item {
    position: absolute;
    inset: 0 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.15;
    opacity: 0;
    transform: translateY(72%) scale(.94);
    filter: blur(.2px);
    transition:
      transform .34s cubic-bezier(.22,.8,.24,1),
      opacity .26s ease,
      filter .26s ease;
    pointer-events: none;
  }

  .announcement-item.current {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }

  .announcement-item.leaving {
    opacity: 0;
    transform: translateY(-72%) scale(.94);
    filter: blur(.35px);
  }

  .bar {
    position: relative;
    min-height: var(--mb-nav-height);
    background: var(--mb-nav-bg);
    border-bottom: 3px solid var(--mb-nav-blue);
    color: var(--mb-nav-text);
  }

  .inner {
    width: min(100%, 1180px);
    min-height: calc(var(--mb-nav-height) - 3px);
    margin: 0 auto;
    padding: 0 14px;
    display: flex;
    align-items: stretch;
    justify-content: center;
  }

  a, button {
    font: inherit;
    font-weight: 700;
    letter-spacing: -0.025em;
  }

  .item,
  .apps-trigger,
  .more-toggle {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--mb-nav-text);
    min-height: calc(var(--mb-nav-height) - 3px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    cursor: pointer;
    white-space: nowrap;
    transition: color .14s ease, background-color .14s ease;
  }

  .item:hover,
  .item:focus-visible,
  .apps-trigger:hover,
  .apps-trigger:focus-visible,
  .more-toggle:hover,
  .more-toggle:focus-visible {
    color: var(--mb-nav-blue);
    outline: none;
  }

  .item.active,
  .apps-trigger.active {
    background: var(--mb-nav-blue);
    color: var(--mb-nav-active-text);
  }

  .item.active:hover,
  .item.active:focus-visible,
  .apps-trigger.active:hover,
  .apps-trigger.active:focus-visible {
    color: var(--mb-nav-active-text);
  }

  .desktop-nav {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 2px;
    width: 100%;
  }

  .desktop-nav .item,
  .desktop-nav .apps-trigger {
    padding: 0 20px;
  }

  .apps-wrap {
    position: relative;
    display: flex;
  }

  .apps-trigger::after,
  .more-toggle::after {
    content: '';
    width: 6px;
    height: 6px;
    border-right: 1.5px solid currentColor;
    border-bottom: 1.5px solid currentColor;
    transform: rotate(45deg) translateY(-1px);
    transform-origin: 65% 65%;
    margin-left: 7px;
    flex: 0 0 auto;
    transition: transform .16s ease;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 230px;
    padding: 5px;
    background: var(--mb-nav-bg);
    border: 1px solid var(--mb-nav-border);
    box-shadow: 0 10px 28px rgba(0,0,0,.24);
    display: none;
  }

  .apps-wrap.open .dropdown,
  .apps-wrap:hover .dropdown,
  .apps-wrap:focus-within .dropdown {
    display: block;
  }

  .dropdown .item {
    width: 100%;
    min-height: 38px;
    padding: 0 12px;
    justify-content: flex-start;
  }

  .mobile-nav {
    display: none;
    width: 100%;
    min-width: 0;
    align-items: stretch;
    justify-content: center;
  }

  .mobile-inline {
    display: flex;
    min-width: 0;
    align-items: stretch;
    justify-content: center;
  }

  .mobile-inline .item {
    padding: 0 9px;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: -0.035em;
  }

  .mobile-inline .item[data-id='forendors'] {
    font-weight: 600;
  }

  .mobile-inline .item[data-compact-hidden='true'] {
    display: none;
  }

  .more-wrap {
    display: flex;
    border-left: 1px solid var(--mb-nav-border);
    flex: 0 0 auto;
  }

  .more-toggle {
    padding: 0 10px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.035em;
  }

  .more-wrap.open .more-toggle {
    color: var(--mb-nav-blue);
  }

  .more-wrap.open .more-toggle::after {
    transform: rotate(225deg) translate(-1px, -1px);
  }

  .more-panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    width: 100%;
    background: var(--mb-nav-bg);
    border-top: 1px solid var(--mb-nav-border);
    border-bottom: 3px solid var(--mb-nav-blue);
    box-shadow: 0 12px 28px rgba(0,0,0,.24);
    padding: 3px 6px 5px;
    z-index: 2;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-5px);
    clip-path: inset(0 0 100% 0);
    transition:
      opacity .12s ease-out,
      transform .16s ease-out,
      clip-path .16s ease-out,
      visibility 0s linear .16s;
  }

  .bar.more-open .more-panel {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
    clip-path: inset(0 0 0 0);
    transition:
      opacity .12s ease-out,
      transform .16s ease-out,
      clip-path .16s ease-out,
      visibility 0s;
  }

  .more-panel .item {
    width: 100%;
    min-height: 29px;
    padding: 0 8px;
    justify-content: flex-start;
    font-size: 12.5px;
    font-weight: 500;
    letter-spacing: -0.025em;
  }

  .more-panel .item[data-overflow-visible='false'] {
    display: none;
  }

  .more-section-title {
    min-height: 23px;
    padding: 5px 8px 2px;
    display: flex;
    align-items: center;
    color: rgba(255,255,255,.52);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    border-top: 1px solid var(--mb-nav-border);
    margin-top: 2px;
  }

  @media (max-width: 720px) {
    :host {
      --mb-nav-height: 35px;
      --mb-announcement-height: 32px;
    }

    .announcement-inner { padding-inline: 8px; }

    .announcement-item {
      inset-inline: 8px;
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: -0.03em;
    }

    .inner { padding: 0 4px; }
    .desktop-nav { display: none; }
    .mobile-nav { display: flex; }
  }

  @media (max-width: 360px) {
    .mobile-inline .item,
    .more-toggle {
      padding-inline: 7px;
      font-size: 12.5px;
    }

    .announcement-item { font-size: 11px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition: none !important;
      animation: none !important;
    }
  }
`;

class MetrobusNav extends HTMLElement {
  static observedAttributes = ['active'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = FALLBACK_CONFIG;
    this.moreOpen = false;
    this.appsOpen = false;
    this.hiddenCompactIds = new Set();
    this.resizeObserver = null;
    this.announcementIndex = 0;
    this.announcementTimer = null;
  }

  connectedCallback() {
    this.render();
    this.loadConfig();
    document.addEventListener('click', this.handleOutsideClick);

    this.resizeObserver = new ResizeObserver(() => this.scheduleCompactLayout());
    this.resizeObserver.observe(this);

    document.fonts?.ready.then(() => this.scheduleCompactLayout());
    this.startAnnouncementRotation();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick);
    this.resizeObserver?.disconnect();
    clearInterval(this.announcementTimer);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  handleOutsideClick = (event) => {
    if (!event.composedPath().includes(this) && this.moreOpen) {
      this.moreOpen = false;
      this.syncMoreState();
    }
  };

  get active() {
    return this.getAttribute('active') || '';
  }

  get appsActive() {
    return this.active === 'apps' || this.config.apps.some(item => item.id === this.active);
  }

  async loadConfig() {
    try {
      const configUrl = new URL('./config.json', import.meta.url);
      const response = await fetch(configUrl, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const config = await response.json();
      if (!Array.isArray(config.main) || !Array.isArray(config.apps)) throw new Error('Invalid config');
      this.config = { ...FALLBACK_CONFIG, ...config };
      this.announcementIndex = 0;
      this.render();
      this.startAnnouncementRotation();
    } catch (error) {
      console.warn('[metrobus-nav] config.json se nepodařilo načíst, používám fallback.', error);
    }
  }

  link(item, className = 'item', extraAttributes = '') {
    const active = this.active === item.id ? ' active' : '';
    return `<a class="${className}${active}" href="${item.url || '#'}" data-id="${item.id}" ${extraAttributes}>${item.label}</a>`;
  }

  renderDesktop() {
    return this.config.main.map(item => {
      if (item.type !== 'apps') return this.link(item);

      return `
        <div class="apps-wrap${this.appsOpen ? ' open' : ''}">
          <button class="apps-trigger${this.appsActive ? ' active' : ''}" type="button" aria-expanded="${this.appsOpen}" aria-haspopup="true" data-action="apps">
            ${item.label}
          </button>
          <div class="dropdown" role="menu">
            ${this.config.apps.map(app => this.link(app)).join('')}
          </div>
        </div>`;
    }).join('');
  }

  renderAnnouncementBar() {
    const items = Array.isArray(this.config.announcements) ? this.config.announcements : [];
    if (!items.length) return '';

    return `
      <div class="announcement-bar" aria-live="polite" aria-label="Aktuální informace Metrobusu">
        <div class="announcement-inner">
          ${items.map((item, index) => `
            <div class="announcement-item${index === this.announcementIndex ? ' current' : ''}" data-announcement-index="${index}">
              ${item.text || ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  startAnnouncementRotation() {
    clearInterval(this.announcementTimer);
    const items = Array.isArray(this.config.announcements) ? this.config.announcements : [];
    if (items.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.announcementTimer = setInterval(() => this.rotateAnnouncement(), 4200);
  }

  rotateAnnouncement() {
    const items = [...this.shadowRoot.querySelectorAll('.announcement-item')];
    if (items.length < 2) return;

    const current = items[this.announcementIndex];
    const nextIndex = (this.announcementIndex + 1) % items.length;
    const next = items[nextIndex];

    current?.classList.remove('current');
    current?.classList.add('leaving');
    next?.classList.remove('leaving');

    requestAnimationFrame(() => next?.classList.add('current'));

    window.setTimeout(() => current?.classList.remove('leaving'), 380);
    this.announcementIndex = nextIndex;
  }

  renderMobileInline() {
    const ids = ['metrobus', 'videa', 'studio', 'forendors', 'odkazy'];
    return ids
      .map(id => this.config.main.find(item => item.id === id))
      .filter(Boolean)
      .map(item => this.link(item, 'item compact-item', `data-compact-id="${item.id}" data-compact-hidden="false"`))
      .join('');
  }

  renderMorePanel() {
    const ids = ['metrobus', 'videa', 'studio', 'odkazy'];
    const mainById = Object.fromEntries(this.config.main.map(item => [item.id, item]));
    const overflowMain = ids
      .map(id => mainById[id])
      .filter(Boolean)
      .map(item => this.link(item, 'item', `data-overflow-id="${item.id}" data-overflow-visible="false"`))
      .join('');

    return `
      ${overflowMain}
      <div class="more-section-title">Aplikace</div>
      ${this.config.apps.map(app => this.link(app)).join('')}
    `;
  }

  scheduleCompactLayout() {
    cancelAnimationFrame(this._layoutFrame);
    this._layoutFrame = requestAnimationFrame(() => this.layoutCompactNav());
  }

  layoutCompactNav() {
    const nav = this.shadowRoot.querySelector('.mobile-nav');
    if (!nav || getComputedStyle(nav).display === 'none') return;

    const inline = this.shadowRoot.querySelector('.mobile-inline');
    const moreWrap = this.shadowRoot.querySelector('.more-wrap');
    const items = [...this.shadowRoot.querySelectorAll('.compact-item')];
    if (!inline || !moreWrap || !items.length) return;

    items.forEach(item => item.dataset.compactHidden = 'false');

    const available = nav.clientWidth - moreWrap.offsetWidth;
    const hideOrder = ['odkazy', 'studio', 'metrobus', 'videa'];
    const hidden = new Set();
    const currentWidth = () => inline.scrollWidth;

    for (const id of hideOrder) {
      if (currentWidth() <= available) break;
      const item = items.find(candidate => candidate.dataset.compactId === id);
      if (!item) continue;
      item.dataset.compactHidden = 'true';
      hidden.add(id);
    }

    this.hiddenCompactIds = hidden;

    this.shadowRoot.querySelectorAll('[data-overflow-id]').forEach(item => {
      item.dataset.overflowVisible = hidden.has(item.dataset.overflowId) ? 'true' : 'false';
    });
  }

  syncMoreState() {
    const bar = this.shadowRoot.querySelector('.bar');
    const wrap = this.shadowRoot.querySelector('.more-wrap');
    const toggle = this.shadowRoot.querySelector('[data-action="more"]');
    bar?.classList.toggle('more-open', this.moreOpen);
    wrap?.classList.toggle('open', this.moreOpen);
    toggle?.setAttribute('aria-expanded', String(this.moreOpen));
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      ${this.renderAnnouncementBar()}
      <nav class="bar${this.moreOpen ? ' more-open' : ''}" aria-label="Metrobus – globální navigace">
        <div class="inner">
          <div class="desktop-nav">
            ${this.renderDesktop()}
          </div>

          <div class="mobile-nav">
            <div class="mobile-inline">
              ${this.renderMobileInline()}
            </div>

            <div class="more-wrap${this.moreOpen ? ' open' : ''}">
              <button class="more-toggle" type="button" aria-label="Zobrazit další odkazy Metrobusu" aria-expanded="${this.moreOpen}" data-action="more">
                Další
              </button>
            </div>
          </div>
        </div>

        <div class="more-panel">
          ${this.renderMorePanel()}
        </div>
      </nav>
    `;

    this.shadowRoot.querySelector('[data-action="apps"]')?.addEventListener('click', () => {
      this.appsOpen = !this.appsOpen;
      this.render();
    });

    this.shadowRoot.querySelector('[data-action="more"]')?.addEventListener('click', () => {
      this.moreOpen = !this.moreOpen;
      this.syncMoreState();
    });

    this.scheduleCompactLayout();
  }
}

if (!customElements.get('metrobus-nav')) {
  customElements.define('metrobus-nav', MetrobusNav);
}
