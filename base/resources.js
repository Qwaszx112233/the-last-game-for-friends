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

function formatNumberShort(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
