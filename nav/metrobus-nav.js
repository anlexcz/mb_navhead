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
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap');

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

  /* desktop */
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
    margin-left: 7px;
    flex: 0 0 auto;
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

  /* mobile / compact */
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
    padding: 0 10px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.03em;
  }

  .mobile-inline .item[data-id='forendors'] {
    font-weight: 700;
  }

  .more-wrap {
    position: relative;
    display: flex;
    border-left: 1px solid var(--mb-nav-border);
  }

  .more-toggle {
    padding: 0 11px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.03em;
  }

  .more-wrap.open .more-toggle {
    color: var(--mb-nav-blue);
  }

  .more-panel {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    width: min(280px, calc(100vw - 16px));
    background: var(--mb-nav-bg);
    border: 1px solid var(--mb-nav-border);
    border-top: 0;
    box-shadow: 0 12px 28px rgba(0,0,0,.28);
    padding: 6px;
  }

  .more-wrap.open .more-panel { display: block; }

  .more-panel .item {
    width: 100%;
    min-height: 40px;
    padding: 0 12px;
    justify-content: flex-start;
    font-size: 13px;
    font-weight: 600;
  }

  .more-section-title {
    min-height: 32px;
    padding: 8px 12px 4px;
    display: flex;
    align-items: center;
    color: rgba(255,255,255,.52);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .035em;
    text-transform: uppercase;
    border-top: 1px solid var(--mb-nav-border);
    margin-top: 4px;
  }

  /* Každý řádek v panelu dostane datovou třídu, abychom mohli schovat položky,
     které jsou na dané šířce už viditelné přímo v proužku. */
  .more-item-videa,
  .more-item-studio,
  .more-item-forendors { display: none !important; }

  @media (max-width: 720px) {
    :host { --mb-nav-height: 36px; }
    .inner { padding: 0; }
    .desktop-nav { display: none; }
    .mobile-nav { display: flex; }
  }

  /* širší mobil: Videa + Studio + Forendors + Další */
  @media (min-width: 560px) and (max-width: 720px) {
    .mobile-inline .item { padding-inline: 11px; }
  }

  /* střední mobil: Videa + Forendors + Další */
  @media (min-width: 430px) and (max-width: 559px) {
    .mobile-inline .item[data-id='studio'] { display: none; }
    .more-item-studio { display: flex !important; }
  }

  /* užší mobil: Forendors + Další */
  @media (max-width: 429px) {
    .mobile-inline .item[data-id='videa'],
    .mobile-inline .item[data-id='studio'] { display: none; }

    .more-item-videa,
    .more-item-studio { display: flex !important; }

    .mobile-inline .item[data-id='forendors'],
    .more-toggle {
      padding-inline: 10px;
    }
  }

  @media (max-width: 340px) {
    .mobile-inline .item[data-id='forendors'],
    .more-toggle {
      padding-inline: 8px;
      font-size: 12px;
    }
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
    this.moreOpen = false;
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
      this.moreOpen = false;
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
    const ids = ['videa', 'studio', 'forendors'];
    return ids
      .map(id => this.config.main.find(item => item.id === id))
      .filter(Boolean)
      .map(item => this.link(item))
      .join('');
  }

  renderMorePanel() {
    const mainById = Object.fromEntries(this.config.main.map(item => [item.id, item]));
    const extraMain = ['videa', 'studio', 'odkazy']
      .map(id => mainById[id])
      .filter(Boolean)
      .map(item => this.link(item, `item more-item-${item.id}`))
      .join('');

    return `
      ${extraMain}
      <div class="more-section-title">Aplikace</div>
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

            <div class="more-wrap${this.moreOpen ? ' open' : ''}">
              <button class="more-toggle" type="button" aria-label="Zobrazit další odkazy Metrobusu" aria-expanded="${this.moreOpen}" data-action="more">
                Další
              </button>
              <div class="more-panel">
                ${this.renderMorePanel()}
              </div>
            </div>
          </div>
        </div>
      </nav>
    `;

    this.shadowRoot.querySelector('[data-action="apps"]')?.addEventListener('click', () => {
      this.appsOpen = !this.appsOpen;
      this.render();
    });

    this.shadowRoot.querySelector('[data-action="more"]')?.addEventListener('click', () => {
      this.moreOpen = !this.moreOpen;
      this.render();
    });
  }
}

if (!customElements.get('metrobus-nav')) {
  customElements.define('metrobus-nav', MetrobusNav);
}
