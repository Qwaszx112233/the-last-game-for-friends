const BUILDINGS_KEY = "tlgf_buildings_v1";

const BUILDING_DEFS = {
  hq: {
    id: "hq",
    name: "Headquarters",
    desc: "Головна будівля бази. Відкриває нові рівні та покращення.",
    maxLevel: 10,
    baseCost: { steel: 0, energy: 0, tech: 0 },
    costGrowth: 2.0,
    baseTime: 5,
    timeGrowth: 1.4
  },
  steelFactory: {
    id: "steelFactory",
    name: "Steel Factory",
    desc: "Виробляє сталь з часом. Чим вищий рівень, тим більше сталі.",
    maxLevel: 10,
    baseCost: { steel: 40, energy: 10, tech: 0 },
    costGrowth: 1.8,
    baseTime: 10,
    timeGrowth: 1.3
  },
  energyGen: {
    id: "energyGen",
    name: "Energy Generator",
    desc: "Генерує енергію для роботи інших будівель.",
    maxLevel: 10,
    baseCost: { steel: 60, energy: 0, tech: 0 },
    costGrowth: 1.85,
    baseTime: 12,
    timeGrowth: 1.32
  },
  heroCenter: {
    id: "heroCenter",
    name: "Hero Training",
    desc: "Підготовка героя. Дає додаткові токени для покращень у битві.",
    maxLevel: 10,
    baseCost: { steel: 50, energy: 25, tech: 2 },
    costGrowth: 1.9,
    baseTime: 15,
    timeGrowth: 1.35
  },
  turret: {
    id: "turret",
    name: "Defense Turret",
    desc: "Захисна вежа. У майбутньому впливатиме на бої проти зомбі.",
    maxLevel: 5,
    baseCost: { steel: 80, energy: 40, tech: 4 },
    costGrowth: 2.0,
    baseTime: 20,
    timeGrowth: 1.4
  },
  warehouse: {
    id: "warehouse",
    name: "Warehouse",
    desc: "Склад. Збільшує ліміт зберігання ресурсів (пізніше).",
    maxLevel: 5,
    baseCost: { steel: 70, energy: 20, tech: 2 },
    costGrowth: 1.9,
    baseTime: 18,
    timeGrowth: 1.35
  }
};

let buildingState = {};

function createDefaultBuildingsState() {
  return {
    hq: { level: 1, upgrading: false, finishAt: null },
    steelFactory: { level: 0, upgrading: false, finishAt: null },
    energyGen: { level: 0, upgrading: false, finishAt: null },
    heroCenter: { level: 0, upgrading: false, finishAt: null },
    turret: { level: 0, upgrading: false, finishAt: null },
    warehouse: { level: 0, upgrading: false, finishAt: null }
  };
}

function loadBuildingsState() {
  try {
    const raw = localStorage.getItem(BUILDINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      buildingState = Object.assign(createDefaultBuildingsState(), parsed);
    } else {
      buildingState = createDefaultBuildingsState();
    }
  } catch (e) {
    console.warn("Cannot load buildings:", e);
    buildingState = createDefaultBuildingsState();
  }
}

function saveBuildingsState() {
  try {
    localStorage.setItem(BUILDINGS_KEY, JSON.stringify(buildingState));
  } catch (e) {
    console.warn("Cannot save buildings:", e);
  }
}

function getBuildingLevel(id) {
  const st = buildingState[id];
  return st ? st.level : 0;
}

function isBuildingUpgrading(id) {
  const st = buildingState[id];
  return !!(st && st.upgrading);
}

function calcUpgradeCost(id) {
  const def = BUILDING_DEFS[id];
  if (!def) return null;
  const lvl = getBuildingLevel(id);
  if (lvl >= def.maxLevel) return null;
  const factor = Math.pow(def.costGrowth, lvl);
  const cost = {};
  if (def.baseCost.steel) cost.steel = Math.round(def.baseCost.steel * factor);
  if (def.baseCost.energy) cost.energy = Math.round(def.baseCost.energy * factor);
  if (def.baseCost.tech) cost.tech = Math.round(def.baseCost.tech * factor);
  return cost;
}

function calcUpgradeTimeSec(id) {
  const def = BUILDING_DEFS[id];
  if (!def) return 0;
  const lvl = getBuildingLevel(id);
  const factor = Math.pow(def.timeGrowth, lvl);
  return Math.round(def.baseTime * factor);
}

function startBuildingUpgrade(id) {
  const def = BUILDING_DEFS[id];
  if (!def) return false;
  const st = buildingState[id];
  if (!st || st.level >= def.maxLevel) return false;
  if (st.upgrading) return false;

  const cost = calcUpgradeCost(id);
  if (!spendResources(cost)) return false;

  const now = Date.now();
  const sec = calcUpgradeTimeSec(id);
  st.upgrading = true;
  st.finishAt = now + sec * 1000;
  saveBuildingsState();
  return true;
}

function updateBuildingUpgrades(now) {
  let changed = false;
  Object.keys(buildingState).forEach(id => {
    const st = buildingState[id];
    const def = BUILDING_DEFS[id];
    if (!st || !def) return;
    if (st.upgrading && st.finishAt && now >= st.finishAt) {
      st.upgrading = false;
      st.finishAt = null;
      if (st.level < def.maxLevel) {
        st.level += 1;
      }
      if (id === "heroCenter") {
        addResources({ tokens: 1 });
      }
      saveBuildingsState();
      changed = true;
    }
  });
  return changed;
}
