window.addEventListener("DOMContentLoaded", () => {
  loadResources();
  if (typeof applyLastBattleResult === "function") {
    applyLastBattleResult();
  } else {
    try {
      // fallback: call if defined globally
      applyLastBattleResult && applyLastBattleResult();
    } catch (e) {
      console.warn("applyLastBattleResult error:", e);
    }
  }
  loadBuildingsState();
  initBaseUI();
});
