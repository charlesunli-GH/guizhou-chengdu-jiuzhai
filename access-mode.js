(() => {
  "use strict";

  const meta = document.querySelector('meta[name="trip-access-mode"]');
  const mode = meta?.content === "read" ? "read" : "edit";

  function canEdit() {
    return mode === "edit";
  }

  function applyBadge() {
    document.documentElement.dataset.accessMode = mode;
    const choices = document.querySelectorAll("#access-switch .access-choice");
    const next = `${location.pathname}${location.search}${location.hash}`;
    choices.forEach((choice) => {
      const selected = choice.dataset.mode === mode;
      choice.classList.toggle("is-current", selected);
      if (selected) choice.setAttribute("aria-current", "page");
      else choice.removeAttribute("aria-current");
      const target = `/__switch?mode=${encodeURIComponent(choice.dataset.mode)}&next=${encodeURIComponent(next)}`;
      choice.href = target;
      choice.title = selected ? `当前是${choice.textContent}` : `输入密码后进入${choice.textContent}`;
    });
  }

  globalThis.tripAccess = { mode, canEdit, applyBadge };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyBadge);
  else applyBadge();
})();
