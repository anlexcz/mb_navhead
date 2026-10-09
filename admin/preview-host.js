// Admin preview host: never implement a second navhead renderer here.
// Preview must mount the same production metrobus-nav component as published sites.
// Only the configuration source differs: draft in admin, published data in production.
// Accent: #87CEFA.

export function applyDraftToProductionNav(navElement, draft) {
  if (!navElement) throw new Error('Production metrobus-nav element is required');
  navElement.draftConfig = structuredClone(draft);
  navElement.dispatchEvent(new CustomEvent('metrobus-nav:draft-change', {
    detail: navElement.draftConfig
  }));
}
