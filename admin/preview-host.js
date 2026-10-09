// Admin preview host.
// IMPORTANT: this file must never implement its own navhead renderer.
// The live preview must mount the same production metrobus-nav component
// used by published sites and feed it draft configuration only.
// Accent: #87CEFA.

export function applyDraftToProductionNav(navElement, draft) {
  if (!navElement) throw new Error('Production metrobus-nav element is required');
  navElement.draftConfig = structuredClone(draft);
  navElement.dispatchEvent(new CustomEvent('metrobus-nav:draft-change', {
    detail: navElement.draftConfig
  }));
}
