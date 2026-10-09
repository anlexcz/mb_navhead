const FALLBACK_CONFIG = {
  main: [
    { id: 'videa', label: 'Videa', url: 'https://metrobus.cz/' },
    { id: 'studio', label: 'Studio', url: '#' },
    { id: 'apps', label: 'Aplikace', type: 'apps' },
    { id: 'forendors', label: 'Forendors', url: '#', priority: true },
    { id: 'odkazy', label: 'Odkazy', url: 'https://metrobus.cz/odkazy' }
  ],
  apps: [
    { id: 'vyroci', label: 'Dopravní výročí', url: '#' },
    { id: 'kalendar', label: 'Šotoušův kalendář', url: '#' },
    { id: 'sotofoto', label: 'Šotofoto', url: '#' }
  ]
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap');

  :host {
    --mb-nav-bg: #25282d;
    --mb-nav-blue: #1fa8e8;
    --mb-nav-text: #ffffff;
    --mb-nav-active-text: #25282d;
    --mb-nav-border: rgba(255,255,255,.12);
    --mb-nav-height: 38px;
    display: block;
    position: relative;
    z-index: 10000;
    width: 100%;
    font-family: 'Montserrat', Arial, sans-serif;
  }

  * { box-sizing: border-box; }

  .bar {
    position: relative;
    background: var(--mb-nav-bg);
    min-height: var(--mb-nav-height);
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

  .desktop-nav {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 2px;
    width: 100%;
  }

  a,
  button {
    font: inherit;
    font-weight: 700;
    letter-spacing: -0.025em;
  }

  .item,
  .apps-trigger {
    appearance: none;
    border: 0;
    background: transparent;
    color: var(--mb-nav-text);
    min-height: calc(var(--mb-nav-height) - 3px);
    padding: 0 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    cursor: pointer;
    transition: color .14s ease, background-color .14s ease;
    white-space: nowrap;
  }

  .item:hover,
  .item:focus-visible,
  .apps-trigger:hover,
  .apps-trigger:focus-visible {
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

  .apps-wrap {
    position: relative;
    display: flex;
  }

  .apps-trigger::after {
    content: '';
    width: 7px;
    height: 7px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg) translateY(-2px);
    margin-left: 8px;
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
    align-items: stretch;
    justify-content: center;
  }

  .mobile-inline {
    display: flex;
    align-items: stretch;
    justify-content: center;
    min-width: 0;
  }

  .mobile-inline .item {
    min-height: calc(var(--mb-nav-height) - 3px);
    padding: 0 12px;
    font-size: 14px;
  }

  .mobile-inline .item[data-id='forendors'] {
    font-weight: 700;
  }

  .menu-toggle {
    min-width: 46px;
    min-height: calc(var(--mb-nav-height) - 3px);
    padding: 0 12px;
    border: 0;
    border-left: 1px solid var(--mb-nav-border);
    background: transparent;
    color: var(--mb-nav-text);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    cursor: pointer;
    white-space: nowrap;
  }

  .menu-toggle:hover,
  .menu-toggle:focus-visible {
    color: var(--mb-nav-blue);
    outline: none;
  }

  .menu-label {
    display: none;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: -0.025em;
  }

  .burger,
  .burger::before,
  .burger::after {
    width: 18px;
    height: 2px;
    border-radius: 2px;
    background: currentColor;
    display: block;
    content: '';
    transition: transform .14s ease, opacity .14s ease;
  }

  .burger { position: relative; flex: 0 0 auto; }
  .burger::before { position: absolute; top: -6px; }
  .burger::after { position: absolute; top: 6px; }

  .menu-toggle[aria-expanded='true'] .burger { background: transparent; }
  .menu-toggle[aria-expanded='true'] .burger::before { transform: translateY(6px) rotate(45deg); }
  .menu-toggle[aria-expanded='true'] .burger::after { transform: translateY(-6px) rotate(-45deg); }

  .mobile-panel {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--mb-nav-bg);
    border-bottom: 3px solid var(--mb-nav-blue);
    box-shadow: 0 12px 28px rgba(0,0,0,.28);
    padding: 6px 12px 10px;
  }

  .mobile-panel.open { display: block; }

  .mobile-panel .item,
  .mobile-section-title {
    width: 100%;
    min-height: 42px;
    justify-content: flex-start;
    padding: 0 12px;
  }

  .mobile-section-title {
    display: flex;
    align-items: center;
    color: rgba(255,255,255,.58);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    border-top: 1px solid var(--mb-nav-border);
    margin-top: 4px;
  }

  @media (max-width: 720px) {
    :host { --mb-nav-height: 38px; }
    .inner { padding: 0; }
    .desktop-nav { display: none; }
    .mobile-nav { display: flex; }
  }

  /* Na běžném telefonu využijeme šířku naplno: tři hlavní cíle + menu. */
  @media (min-width: 421px) and (max-width: 720px) {
    .mobile-nav { justify-content: center; }
    .mobile-inline .item { padding-inline: clamp(8px, 2.2vw, 16px); }
  }

  /* Na užším telefonu necháme obchodní cíl a zbytek pojmenujeme jako Metrobus menu. */
  @media (max-width: 420px) {
    .mobile-nav {
      justify-content: flex-end;
    }

    .mobile-inline .item:not([data-id='forendors']) {
      display: none;
    }

    .mobile-inline .item[data-id='forendors'] {
      padding: 0 14px;
    }

    .menu-toggle {
      padding: 0 13px;
      min-width: auto;
    }

    .menu-label { display: inline; }
  }

  @media (max-width: 340px) {
    .mobile-inline .item[data-id='forendors'] {
      padding-inline: 10px;
      font-size: 13px;
    }

    .menu-toggle {
      padding-inline: 10px;
      gap: 7px;
    }

    .menu-label { font-size: 12px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { transition: none !important; }
  }
`;

class MetrobusNav extends HTMLElement {
  static observedAttributes = ['active'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = FALLBACK_CONFIG;
    this.mobileOpen = false;
    this.appsOpen = false;
  }

  connectedCallback() {
    this.render();
    this.loadConfig();
    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  handleOutsideClick = (event) => {
    if (!event.composedPath().includes(this)) {
      this.mobileOpen = false;
      this.appsOpen = false;
      this.render();
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
      this.config = config;
      this.render();
    } catch (error) {
      console.warn('[metrobus-nav] config.json se nepodařilo načíst, používám fallback.', error);
    }
  }

  link(item, className = 'item') {
    const active = this.active === item.id ? ' active' : '';
    return `<a class="${className}${active}" href="${item.url || '#'}" data-id="${item.id}">${item.label}</a>`;
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

  renderMobileInline() {
    const preferredIds = ['videa', 'studio', 'forendors'];
    return preferredIds
      .map(id => this.config.main.find(item => item.id === id))
      .filter(Boolean)
      .map(item => this.link(item))
      .join('');
  }

  renderMobilePanel() {
    const regular = this.config.main.filter(item => item.type !== 'apps');
    return `
      ${regular.map(item => this.link(item)).join('')}
      <div class="mobile-section-title">Aplikace</div>
      ${this.config.apps.map(app => this.link(app)).join('')}
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <nav class="bar" aria-label="Metrobus – globální navigace">
        <div class="inner">
          <div class="desktop-nav">
            ${this.renderDesktop()}
          </div>

          <div class="mobile-nav">
            <div class="mobile-inline">
              ${this.renderMobileInline()}
            </div>
            <button class="menu-toggle" type="button" aria-label="Otevřít Metrobus menu" aria-expanded="${this.mobileOpen}" data-action="mobile-menu">
              <span class="menu-label">Metrobus menu</span>
              <span class="burger" aria-hidden="true"></span>
            </button>
          </div>
        </div>

        <div class="mobile-panel${this.mobileOpen ? ' open' : ''}">
          ${this.renderMobilePanel()}
        </div>
      </nav>
    `;

    this.shadowRoot.querySelector('[data-action="apps"]')?.addEventListener('click', () => {
      this.appsOpen = !this.appsOpen;
      this.render();
    });

    this.shadowRoot.querySelector('[data-action="mobile-menu"]')?.addEventListener('click', () => {
      this.mobileOpen = !this.mobileOpen;
      this.render();
    });
  }
}

if (!customElements.get('metrobus-nav')) {
  customElements.define('metrobus-nav', MetrobusNav);
}
