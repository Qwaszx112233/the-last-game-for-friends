// Глобальний стан апгрейдів
const UPGRADE_STATE = {
    fireRateMultiplier: 1,    // множник швидкості стрільби
    bulletSpeedMultiplier: 1, // множник швидкості кулі
    damage: 1,                // базовий урон кулі
    maxHpBonus: 0             // додаткове HP до базового
};

class UpgradeManager {
    constructor(scene) {
        this.scene = scene;
        this.isVisible = false;
        this.currentUpgrades = [];

        const w = scene.game.config.width;
        const h = scene.game.config.height;

        // Затемнення фону
        this.overlay = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.55)
            .setDepth(90)
            .setVisible(false);

        // Панель внизу (фон)
        this.panelBg = scene.add
            .rectangle(w / 2, h - 110, w, 200, 0x000000, 0.82)
            .setDepth(91)
            .setVisible(false);

        // Три варіанти апгрейдів
        this.optionRects = [];
        this.optionTexts = [];

        const optionWidth = 230;
        const optionHeight = 120;
        const spacing = 35;

        const totalWidth = optionWidth * 3 + spacing * 2;
        let startX = w / 2 - totalWidth / 2 + optionWidth / 2;

        for (let i = 0; i < 3; i++) {
            const rect = scene.add
                .rectangle(startX + i * (optionWidth + spacing), h - 110, optionWidth, optionHeight, 0x1b1b1f, 0.92)
                .setStrokeStyle(2, 0xffd34f)
                .setInteractive({ useHandCursor: true })
                .setDepth(92)
                .setVisible(false);

            rect.upgradeIndex = i;

            const text = scene.add
                .text(rect.x - optionWidth / 2 + 12, rect.y - optionHeight / 2 + 12, "", {
                    font: "15px Arial",
                    fill: "#ffffff",
                    wordWrap: { width: optionWidth - 24 }
                })
                .setDepth(93)
                .setVisible(false);

            this.optionRects.push(rect);
            this.optionTexts.push(text);
        }

        // Слухач кліків по варіантах
        scene.input.on("gameobjectdown", (pointer, gameObject) => {
            if (!this.isVisible) return;
            if (this.optionRects.includes(gameObject)) {
                const idx = gameObject.upgradeIndex;
                const chosen = this.currentUpgrades[idx];
                if (chosen) {
                    this.applyUpgrade(chosen.id);
                    this.hide();
                }
            }
        });

        // Список можливих апгрейдів
        this.allUpgrades = [
            {
                id: "fireRate_1",
                title: "Швидкість атаки +20%",
                desc: "Стріляєш помітно швидше.",
                apply: () => {
                    UPGRADE_STATE.fireRateMultiplier *= 1.2;
                }
            },
            {
                id: "bulletSpeed_1",
                title: "Швидкість кулі +25%",
                desc: "Кулі летять швидше та влучають надійніше.",
                apply: () => {
                    UPGRADE_STATE.bulletSpeedMultiplier *= 1.25;
                }
            },
            {
                id: "damage_1",
                title: "Урон +1",
                desc: "Кулі завдають додаткову шкоду.",
                apply: () => {
                    UPGRADE_STATE.damage += 1;
                }
            },
            {
                id: "maxHp_1",
                title: "Макс. HP +1",
                desc: "Стаєш трохи живучішим.",
                apply: () => {
                    UPGRADE_STATE.maxHpBonus += 1;
                }
            }
        ];
    }

    show() {
        this.isVisible = true;
        this.overlay.setVisible(true);
        this.panelBg.setVisible(true);

        // Поки що просто беремо перші 3 апгрейди
        this.currentUpgrades = this.allUpgrades.slice(0, 3);

        for (let i = 0; i < 3; i++) {
            const rect = this.optionRects[i];
            const text = this.optionTexts[i];
            const upg = this.currentUpgrades[i];

            rect.setVisible(true);
            text.setVisible(true);
            text.setText(upg.title + "\n\n" + upg.desc);
        }
    }

    hide() {
        this.isVisible = false;
        this.overlay.setVisible(false);
        this.panelBg.setVisible(false);

        for (let i = 0; i < 3; i++) {
            this.optionRects[i].setVisible(false);
            this.optionTexts[i].setVisible(false);
        }
    }

    applyUpgrade(id) {
        const upg = this.allUpgrades.find(u => u.id === id);
        if (upg && upg.apply) {
            upg.apply();
        }
    }
}
