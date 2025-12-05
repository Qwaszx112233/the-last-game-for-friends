const RESOURCES_KEY = "tlgf_resources_v1";

let playerResources = {
  steel: 100,
  energy: 50,
  tech: 5,
  tokens: 0
};

function loadResources() {
  try {
    const raw = localStorage.getItem(RESOURCES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      playerResources = Object.assign(playerResources, parsed);
    }
  } catch (e) {
    console.warn("Cannot load resources:", e);
  }
}

function saveResources() {
  try {
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(playerResources));
  } catch (e) {
    console.warn("Cannot save resources:", e);
  }
}

function addResources(delta) {
  if (!delta) return;
  if (typeof delta.steel === "number") playerResources.steel += delta.steel;
  if (typeof delta.energy === "number") playerResources.energy += delta.energy;
  if (typeof delta.tech === "number") playerResources.tech += delta.tech;
  if (typeof delta.tokens === "number") playerResources.tokens += delta.tokens;
  saveResources();
}

function haveEnoughResources(cost) {
  if (!cost) return true;
  if (cost.steel && playerResources.steel < cost.steel) return false;
  if (cost.energy && playerResources.energy < cost.energy) return false;
  if (cost.tech && playerResources.tech < cost.tech) return false;
  return true;
}

function spendResources(cost) {
  if (!haveEnoughResources(cost)) return false;
  if (cost.steel) playerResources.steel -= cost.steel;
  if (cost.energy) playerResources.energy -= cost.energy;
  if (cost.tech) playerResources.tech -= cost.tech;
  saveResources();
  return true;
}

const LAST_BATTLE_KEY = "tlgf_lastBattle_v1";

function applyLastBattleResult() {
  try {
    const raw = localStorage.getItem(LAST_BATTLE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    const xp = Number(data.xp) || 0;
    const kills = Number(data.kills) || 0;
    const wave = Number(data.wave) || 1;

    let tokensGain = 0;
    if (xp > 0) {
      tokensGain = Math.floor(xp / 5);
      if (tokensGain < 1) tokensGain = 1;
    }

    const steelGain = kills;
    const energyGain = Math.max(0, Math.floor(wave * 0.5));
    const techGain = Math.max(0, Math.floor(wave / 5));

    addResources({
      steel: steelGain,
      energy: energyGain,
      tech: techGain,
      tokens: tokensGain
    });

    localStorage.removeItem(LAST_BATTLE_KEY);
  } catch (e) {
    console.warn("applyLastBattleResult failed:", e);
  }
}

function formatNumberShort(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
