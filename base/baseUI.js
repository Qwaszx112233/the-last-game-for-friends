let selectedBuildingId = null;

let resSteelEl, resEnergyEl, resTechEl, resTokensEl;
let panelTitleEl, panelBodyEl;
let buildingSlotsEls = [];
let productionTimer = 0;

function initBaseUI() {
  resSteelEl = document.getElementById("res-steel");
  resEnergyEl = document.getElementById("res-energy");
  resTechEl = document.getElementById("res-tech");
  resTokensEl = document.getElementById("res-tokens");

  panelTitleEl = document.getElementById("panel-title");
  panelBodyEl = document.getElementById("panel-body");

  document.querySelectorAll(".building-slot").forEach(el => {
    const id = el.getAttribute("data-building-id");
    buildingSlotsEls.push({ el, id });
    el.addEventListener("click", () => onBuildingClick(id));
  });

  const startBtn = document.getElementById("start-mission-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      window.location.href = "../battle/battle.html";
    });
  }

  renderResources();
  renderBuildingSlots();
  renderPanel(null);

  setInterval(onBaseTick, 1000);
}

function onBaseTick() {
  const now = Date.now();
  const changed = updateBuildingUpgrades(now);
  const upgrading = buildingSlotsEls.some(({ id }) => isBuildingUpgrading(id));

  if (changed) {
    renderResources();
  }

  if (changed || upgrading) {
    renderBuildingSlots();
    if (selectedBuildingId) renderPanel(selectedBuildingId);
  }

  productionTimer += 1;
  if (productionTimer >= 2) {
    productionTimer = 0;
    const steelLvl = getBuildingLevel("steelFactory");
    const energyLvl = getBuildingLevel("energyGen");

    if (steelLvl > 0 || energyLvl > 0) {
      addResources({
        steel: steelLvl,
        energy: energyLvl
      });
      renderResources();
    }
  }
}

function renderResources() {
  if (!resSteelEl) return;
  resSteelEl.textContent = formatNumberShort(playerResources.steel);
  resEnergyEl.textContent = formatNumberShort(playerResources.energy);
  resTechEl.textContent = formatNumberShort(playerResources.tech);
  resTokensEl.textContent = formatNumberShort(playerResources.tokens);
}

function renderBuildingSlots() {
  buildingSlotsEls.forEach(({ el, id }) => {
    const def = BUILDING_DEFS[id];
    if (!def) return;
    const lvl = getBuildingLevel(id);
    const upgrading = isBuildingUpgrading(id);

    el.innerHTML = "";
    const card = document.createElement("div");
    card.className = "building-card";

    const nameDiv = document.createElement("div");
    nameDiv.className = "building-name";
    nameDiv.textContent = def.name;

    const lvlDiv = document.createElement("div");
    lvlDiv.className = "building-level";
    lvlDiv.textContent = "Lv. " + lvl;

    card.appendChild(nameDiv);
    card.appendChild(lvlDiv);

    if (upgrading) {
      const st = buildingState[id];
      const statusDiv = document.createElement("div");
      statusDiv.className = "building-status";
      if (st && st.finishAt) {
        const remainSec = Math.max(0, Math.ceil((st.finishAt - Date.now()) / 1000));
        statusDiv.textContent = "Upgrade… " + remainSec + "s";
      } else {
        statusDiv.textContent = "Upgrade…";
      }
      card.appendChild(statusDiv);
    }

    el.appendChild(card);
  });
}

function onBuildingClick(id) {
  selectedBuildingId = id;
  renderPanel(id);
}

function renderPanel(id) {
  if (!panelTitleEl || !panelBodyEl) return;

  if (!id) {
    panelTitleEl.textContent = "База";
    panelBodyEl.innerHTML = "<p>Натисни на будівлю, щоб побачити інформацію та покращити її.</p>";
    return;
  }

  const def = BUILDING_DEFS[id];
  if (!def) return;
  const lvl = getBuildingLevel(id);
  const upgrading = isBuildingUpgrading(id);
  const cost = calcUpgradeCost(id);
  const timeSec = calcUpgradeTimeSec(id);

  panelTitleEl.textContent = def.name;

  let html = "";
  html += `<div class="panel-meta">Рівень: <b>${lvl}</b> / ${def.maxLevel}</div>`;
  html += `<div class="panel-meta">${def.desc}</div>`;

  if (lvl >= def.maxLevel) {
    html += `<p class="panel-section-title">Покращення</p>`;
    html += `<p>Досягнуто максимального рівня.</p>`;
  } else {
    html += `<p class="panel-section-title">Наступний рівень</p>`;
    if (cost) {
      html += `<ul class="cost-list">`;
      if (cost.steel) html += `<li>Steel: <span>${cost.steel}</span></li>`;
      if (cost.energy) html += `<li>Energy: <span>${cost.energy}</span></li>`;
      if (cost.tech) html += `<li>Tech: <span>${cost.tech}</span></li>`;
      html += `</ul>`;
    }
    html += `<div class="panel-meta">Час побудови: <b>${timeSec}s</b></div>`;
  }

  if (upgrading) {
    const st = buildingState[id];
    let remain = "";
    if (st && st.finishAt) {
      const sec = Math.max(0, Math.ceil((st.finishAt - Date.now()) / 1000));
      remain = sec + "s";
    }
    html += `<p class="panel-section-title">Статус</p>`;
    html += `<p>Upgrade в процесі… ${remain}</p>`;
  }

  panelBodyEl.innerHTML = html;

  if (lvl < def.maxLevel && !upgrading) {
    const btn = document.createElement("button");
    btn.className = "btn-primary";
    btn.textContent = "UPGRADE";

    const enough = haveEnoughResources(cost);
    if (!enough) {
      btn.disabled = true;
      btn.title = "Недостатньо ресурсів";
    }

    btn.addEventListener("click", () => {
      if (startBuildingUpgrade(id)) {
        renderResources();
        renderBuildingSlots();
        renderPanel(id);
      }
    });

    panelBodyEl.appendChild(btn);
  }
}
