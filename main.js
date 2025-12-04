// ==== Початковий стан гри ====
const gameState = {
    timeSeconds: 0,
    day: 1,

    resources: {
        food: 100,
        fuel: 50,
        steel: 40,
        people: 10
    },

    // Базові будівлі
    buildings: [
        {
            id: "hq",
            name: "Штаб бази",
            level: 1,
            type: "hq",
            description: "Відкриває нові рівні доступу та збільшує ліміт будівель."
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
            description: "Дає додаткових виживших (люди)."
        }
    ],

    // Прості герої (поки без складної механіки)
    heroes: [
        {
            id: "hero_1",
            name: "Капітан Олена",
            role: "Командир",
            power: 120,
            bonus: "Бонус до оборони бази"
        },
        {
            id: "hero_2",
            name: "Доктор Ігор",
            role: "Медик",
            power: 80,
            bonus: "Бонус до виживших (люди)"
        }
    ]
};

// ==== УТИЛІТИ РЕНДЕРИНГУ ====
function $(selector) {
    return document.querySelector(selector);
}

function log(message) {
    const logContainer = $("#log");
    if (!logContainer) return;

    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.textContent = message;

    logContainer.prepend(entry);

    // обмежуємо лог останніми 50 рядками
    while (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// ==== РЕНДЕР РЕСУРСІВ ====
function renderResources() {
    const container = $("#resources");
    if (!container) return;

    container.innerHTML = "";

    const res = gameState.resources;

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

// ==== РЕНДЕР БУДІВЕЛЬ ====
function renderBuildings() {
    const container = $("#base-layout");
    if (!container) return;

    container.innerHTML = "";

    gameState.buildings.forEach(b => {
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

// ==== РЕНДЕР ГЕРОЇВ ====
function renderHeroes() {
    const container = $("#heroes");
    if (!container) return;

    container.innerHTML = "";

    gameState.heroes.forEach(h => {
        const div = document.createElement("div");
        div.className = "hero";

        const name = document.createElement("div");
        name.textContent = `${h.name} — ${h.role}`;

        const power = document.createElement("div");
        power.textContent = `Сила: ${h.power}`;

        const bonus = document.createElement("div");
        bonus.textContent = `Ефект: ${h.bonus}`;

        div.appendChild(name);
        div.appendChild(power);
        div.appendChild(bonus);

        container.appendChild(div);
    });
}

// ==== РЕНДЕР ЧАСУ ====
function renderTime() {
    const timeEl = $("#time");
    const dayEl = $("#day");

    if (timeEl) timeEl.textContent = gameState.timeSeconds;
    if (dayEl) dayEl.textContent = gameState.day;
}

// ==== ЛОГІКА ТІКА (кожну секунду) ====
function gameTick() {
    gameState.timeSeconds++;

    // Кожні 60 секунд — новий день
    if (gameState.timeSeconds % 60 === 0) {
        gameState.day++;
        log(`Минає день ${gameState.day}.`);
    }

    // Виробництво від будівель
    gameState.buildings.forEach(b => {
        if (b.type === "farm") {
            gameState.resources.food += 1 * b.level;
        }
        if (b.type === "oil") {
            gameState.resources.fuel += 1 * b.level;
        }
        if (b.type === "barracks") {
            // раз на 10 сек — +1 людина на рівень
            if (gameState.timeSeconds % 10 === 0) {
                gameState.resources.people += 1 * b.level;
            }
        }
    });

    renderResources();
    renderTime();
}

// ==== ОБРОБКА ДІЙ КНОПОК ====
function handleAction(action) {
    switch (action) {
        case "upgrade_hq":
            upgradeBuilding("hq", {
                food: 50,
                steel: 30
            });
            break;

        case "upgrade_farm":
            upgradeBuilding("farm", {
                food: 20,
                steel: 10
            });
            break;

        case "upgrade_oil":
            upgradeBuilding("oil", {
                food: 10,
                steel: 20
            });
            break;

        case "upgrade_barracks":
            upgradeBuilding("barracks", {
                food: 30,
                steel: 20
            });
            break;
    }
}

// Покращення будівлі з витратою ресурсів
function upgradeBuilding(buildingId, cost) {
    const building = gameState.buildings.find(b => b.id === buildingId);
    if (!building) return;

    const res = gameState.resources;

    // Перевірка ресурсів
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
}

// ==== ІНІЦІАЛІЗАЦІЯ ГРИ ====
function initGame() {
    // Початковий рендер
    renderResources();
    renderBuildings();
    renderHeroes();
    renderTime();
    log("Гра запущена. База виживших чекає на твій наказ, командире!");

    // Обробка натискання кнопок
    const actionsContainer = document.querySelector("#actions");
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

    // Запуск тіка кожну секунду
    setInterval(gameTick, 1000);
}

// Запускаємо гру, коли DOM готовий
document.addEventListener("DOMContentLoaded", initGame);
