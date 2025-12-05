window.addEventListener("DOMContentLoaded", () => {
  loadResources();
  if (typeof applyLastBattleResult === "function") {
    applyLastBattleResult();
  }
  loadBuildingsState();
  initBaseUI();
});
