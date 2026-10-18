// Font faces belong to the document so both Shadow DOM navs and admin can use them.
const url = new URL('./montserrat.css', import.meta.url).href;
let link = [...document.querySelectorAll('link[rel="stylesheet"]')].find(el => el.href === url);
const stylesheetReady = new Promise((resolve, reject) => {
  if (link?.sheet) return resolve();
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', reject, { once: true });
    document.head.appendChild(link);
  } else {
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', reject, { once: true });
  }
});

export const montserratReady = stylesheetReady
  .then(() => Promise.all([500, 600, 700].map(weight => document.fonts.load(`${weight} 13px Montserrat`))))
  .catch(error => console.warn('[metrobus-nav] Montserrat unavailable; using fallback font.', error));
