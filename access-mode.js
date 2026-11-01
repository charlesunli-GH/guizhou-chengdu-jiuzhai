(() => {
  "use strict";

  const meta = document.querySelector('meta[name="trip-access-mode"]');
  const mode = meta?.content === "read" ? "read" : "edit";

  function canEdit() {
    return mode === "edit";
  }

  function applyBadge() {
    document.documentElement.dataset.accessMode = mode;
    const badge = document.querySelector("#access-mode");
    if (!badge) return;
    badge.hidden = false;
    badge.dataset.mode = mode;
    badge.textContent = mode === "read" ? "只读" : "可编辑";
  }

  globalThis.tripAccess = { mode, canEdit, applyBadge };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyBadge);
  else applyBadge();
})();
