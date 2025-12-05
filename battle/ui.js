class BattleUI {
  constructor() {
    this.hpText = document.getElementById("hp-text");
    this.levelText = document.getElementById("level-text");
    this.waveText = document.getElementById("wave-text");
    this.killsText = document.getElementById("kills-text");
    this.xpBar = document.getElementById("xp-bar");

    this.levelupOverlay = document.getElementById("levelup-overlay");
    this.levelupCards = document.getElementById("levelup-cards");

    this.gameoverOverlay = document.getElementById("gameover-overlay");
    this.goWave = document.getElementById("go-wave");
    this.goKills = document.getElementById("go-kills");
    this.goLevel = document.getElementById("go-level");
  }

  updateStats(state) {
    if (this.hpText) {
      this.hpText.textContent = `${Math.max(0, Math.round(state.hp))} / ${state.maxHp}`;
    }
    if (this.levelText) this.levelText.textContent = state.level;
    if (this.waveText) this.waveText.textContent = state.wave;
    if (this.killsText) this.killsText.textContent = state.kills;
    if (this.xpBar) {
      const frac = Math.max(0, Math.min(1, state.xp / state.xpToNext));
      this.xpBar.style.width = (frac * 100).toFixed(1) + "%";
    }
  }

  showLevelUp(choices, onPick) {
    this.levelupCards.innerHTML = "";
    choices.forEach(up => {
      const card = document.createElement("div");
      card.className = "levelup-card";
      card.innerHTML = `
        <div class="levelup-card-title">${up.title}</div>
        <div class="levelup-card-desc">${up.desc}</div>
      `;
      card.addEventListener("click", () => {
        this.hideLevelUp();
        onPick(up);
      });
      this.levelupCards.appendChild(card);
    });
    this.levelupOverlay.style.display = "flex";
  }

  hideLevelUp() {
    this.levelupOverlay.style.display = "none";
  }

  showGameOver(state) {
    this.goWave.textContent = state.wave;
    this.goKills.textContent = state.kills;
    this.goLevel.textContent = state.level;
    this.gameoverOverlay.style.display = "flex";
  }
}
