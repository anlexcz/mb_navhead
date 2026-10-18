import '../navhead/metrobus-nav.js';
try {
  document.querySelector('metrobus-nav').setConfig(await window.NavheadPreview.readPublished());
} catch (error) { document.querySelector('[role=status]').textContent = error.message; }
