// ==== КОНСТАНТИ ДЛЯ ЗБЕРЕЖЕННЯ ====
const STORAGE_PREFIX = "lw_player_";

// ==== ПОТОЧНИЙ СТАН ====
let currentPlayerName = null;
let currentPlayerState = null;
let tickIntervalId = null;

// ==== УТИЛІТИ ====
function $(selector) {
    return document.querySelector(selector);
}

function log(message) {
    const logContainer = $("#log");
    if (!logContainer) return;

    const entry = document.createElement("div");
    entry.className = "log-entry";
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;

    logContainer.prepend(entry);

    while (logContainer.children.length > 80) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// ==== РОБОТА З "СЕРВЕРОМ" (ПОКИ ЩО localStorage) ====

// Отримати список всіх гравців, що збережені на цьому пристрої
function getAllSavedPlayers() {
    const players = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
            const name = key.substring(STORAGE_PREFIX.length);
            players.push(name);
        }
    }
    return players;
}

// Завантажити стан гравця або створити новий
function loadPlayerState(playerName) {
    const key = STORAGE_PREFIX + playerName;
    const raw = localStorage.getItem(key);
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("Помилка парсингу стану гравця, створюємо новий:", e);
        }
    }
    // Новий гравець
    return createNewPlayerState(playerName);
}

// Зберегти стан гравця
function savePlayerState(playerName, state) {
    const key = STORAGE_PREFIX + playerName;
    localStorage.setItem(key, JSON.stringify(state));
}

// ==== ЛОГІКА ГРИ ====

// Створення нового гравця
function createNewPlayerState(playerName) {
    return {
        playerName,
        createdAt: Date.now(),
        timeSeconds: 0,
        day: 1,
        resources: {
            food: 100,
            fuel: 50,
            steel: 40,
            people: 10
        },
        buildings: [
            {
                id: "hq",
                name: "Штаб бази",
                level: 1,
                type: "hq",
                description: "Відкриває нові можливості розвитку бази."
            },
            {
                id: "farm",
                name: "Ферма",
                level: 1,
                type: "farm",
                description: "Виробляє їжу щосекунди."
            },
            {
                id: "oil",
                name: "Нафтова вишка",
                level: 1,
                type: "oil",
                description: "Виробляє паливо."
            },
            {
                id: "barracks",
                name: "Барак",
                level: 1,
                type: "barracks",
                description: "Дає нових виживших з часом."
            }
        ]
    };
}

// ==== РЕНДЕРИНГ ====

// Список гравців на екрані логіну
function renderSavedPlayers() {
    const container = $("#saved-players");
    if (!container) return;

    container.innerHTML = "";

    const players = getAllSavedPlayers();
    if (players.length === 0) {
        container.textContent = "Поки що немає збережених гравців.";
        return;
    }

    players.forEach(name => {
        const btn = document.createElement("button");
        btn.className = "saved-player-btn";
        btn.textContent = name;
        btn.addEventListener("click", () => {
            loginAsPlayer(name);
        });
        container.appendChild(btn);
    });
}

// Ресурси
function renderResources() {
    const container = $("#resources");
    if (!container || !currentPlayerState) return;

    container.innerHTML = "";

    const res = currentPlayerState.resources;
    const rows = [
        { name: "Їжа", key: "food" },
        { name: "Паливо", key: "fuel" },
        { name: "Метал", key: "steel" },
        { name: "Виживші (люди)", key: "people" }
    ];

    rows.forEach(row => {
        const div = document.createElement("div");
        div.className = "resource-row";

        const nameSpan = document.createElement("span");
        nameSpan.className = "resource-name";
        nameSpan.textContent = row.name;

        const valueSpan = document.createElement("span");
        valueSpan.className = "resource-value";
        valueSpan.textContent = res[row.key];

        div.appendChild(nameSpan);
        div.appendChild(valueSpan);
        container.appendChild(div);
    });
}

// Будівлі
function renderBuildings() {
    const container = $("#base-layout");
    if (!container || !currentPlayerState) return;

    container.innerHTML = "";

    currentPlayerState.buildings.forEach(b => {
        const div = document.createElement("div");
        div.className = "building";

        const header = document.createElement("div");
        header.className = "building-header";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = b.name;

        const levelSpan = document.createElement("span");
        levelSpan.className = "building-level";
        levelSpan.textContent = `Рівень ${b.level}`;

        header.appendChild(nameSpan);
        header.appendChild(levelSpan);

        const effect = document.createElement("div");
        effect.className = "building-effect";
        effect.textContent = b.description;

        div.appendChild(header);
        div.appendChild(effect);

        container.appendChild(div);
    });
}

// Статус бази
function renderBaseStatus() {
    const el = $("#base-status");
    if (!el || !currentPlayerState) return;

    const hq = currentPlayerState.buildings.find(b => b.id === "hq");
    const totalLevel = currentPlayerState.buildings.reduce((sum, b) => sum + b.level, 0);

    el.innerHTML = `
        Рівень штабу: <b>${hq ? hq.level : 1}</b><br>
        Загальний рівень розвитку бази: <b>${totalLevel}</b>
    `;
}

// Час
function renderTime() {
    if (!currentPlayerState) return;

    const timeEl = $("#time");
    const dayEl = $("#day");

    if (timeEl) timeEl.textContent = currentPlayerState.timeSeconds;
    if (dayEl) dayEl.textContent = currentPlayerState.day;
}

// Інші гравці
function renderOtherPlayers() {
    const container = $("#other-players");
    if (!container || !currentPlayerState) return;

    container.innerHTML = "";

    const allPlayers = getAllSavedPlayers().filter(name => name !== currentPlayerName);

    if (allPlayers.length === 0) {
        container.textContent = "Поки що інших гравців немає. Додай друзів, хай зайдуть під своїми нікнеймами.";
        return;
    }

    allPlayers.forEach(name => {
        const div = document.createElement("div");
        div.className = "other-player";
        div.textContent = `Гравець: ${name}`;
        container.appendChild(div);
    });
}

// ==== ТІК ГРИ (кожну секунду) ====
function gameTick() {
    if (!currentPlayerState) return;

    currentPlayerState.timeSeconds++;

    if (currentPlayerState.timeSeconds % 60 === 0) {
        currentPlayerState.day++;
        log(`Минає день ${currentPlayerState.day} для гравця ${currentPlayerName}.`);
    }

    currentPlayerState.buildings.forEach(b => {
        if (b.type === "farm") {
            currentPlayerState.resources.food += 1 * b.level;
        }
        if (b.type === "oil") {
            currentPlayerState.resources.fuel += 1 * b.level;
        }
        if (b.type === "barracks") {
            if (currentPlayerState.timeSeconds % 10 === 0) {
                currentPlayerState.resources.people += 1 * b.level;
            }
        }
    });

    renderResources();
    renderTime();

    savePlayerState(currentPlayerName, currentPlayerState);
}

// ==== ДІЇ ====
function handleAction(action) {
    switch (action) {
        case "upgrade_hq":
            upgradeBuilding("hq", { food: 50, steel: 30 });
            break;
        case "upgrade_farm":
            upgradeBuilding("farm", { food: 20, steel: 10 });
            break;
        case "upgrade_oil":
            upgradeBuilding("oil", { food: 10, steel: 20 });
            break;
        case "upgrade_barracks":
            upgradeBuilding("barracks", { food: 30, steel: 20 });
            break;
    }
}

function upgradeBuilding(buildingId, cost) {
    if (!currentPlayerState) return;

    const building = currentPlayerState.buildings.find(b => b.id === buildingId);
    const res = currentPlayerState.resources;

    if (!building) return;

    if (res.food < cost.food || res.steel < cost.steel) {
        log(`Недостатньо ресурсів, щоб покращити ${building.name}.`);
        return;
    }

    res.food -= cost.food;
    res.steel -= cost.steel;
    building.level++;

    log(`Будівля "${building.name}" покращена до рівня ${building.level}.`);

    renderResources();
    renderBuildings();
    renderBaseStatus();
    savePlayerState(currentPlayerName, currentPlayerState);
}

// ==== ВХІД/ВИХІД ГРАВЦЯ ====
function loginAsPlayer(playerName) {
    if (!playerName) return;
    currentPlayerName = playerName;
    currentPlayerState = loadPlayerState(playerName);

    $("#current-player-name").textContent = playerName;

    $("#login-screen").classList.add("screen--hidden");
    $("#game-screen").classList.remove("screen--hidden");

    renderResources();
    renderBuildings();
    renderBaseStatus();
    renderTime();
    renderOtherPlayers();

    log(`Гравець ${playerName} увійшов у гру. База готова до розвитку.`);

    if (tickIntervalId) clearInterval(tickIntervalId);
    tickIntervalId = setInterval(gameTick, 1000);
}

function logoutPlayer() {
    if (tickIntervalId) {
        clearInterval(tickIntervalId);
        tickIntervalId = null;
    }

    currentPlayerName = null;
    currentPlayerState = null;

    $("#game-screen").classList.add("screen--hidden");
    $("#login-screen").classList.remove("screen--hidden");

    renderSavedPlayers();
}

// ==== ІНІЦІАЛІЗАЦІЯ ====
function init() {
    renderSavedPlayers();

    const loginBtn = $("#login-button");
    const nameInput = $("#player-name-input");
    const logoutBtn = $("#logout-button");

    if (loginBtn && nameInput) {
        loginBtn.addEventListener("click", () => {
            const name = nameInput.value.trim();
            if (!name) {
                alert("Введи нікнейм.");
                return;
            }
            loginAsPlayer(name);
        });

        nameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                loginBtn.click();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            logoutPlayer();
        });
    }

    const actionsContainer = $("#actions");
    if (actionsContainer) {
        actionsContainer.addEventListener("click", (e) => {
            const target = e.target;
            if (target instanceof HTMLButtonElement) {
                const action = target.getAttribute("data-action");
                if (action) {
                    handleAction(action);
                }
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", init);
