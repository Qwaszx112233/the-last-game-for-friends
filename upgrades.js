
const UPGRADE_STATE = {
    fireRateMultiplier: 1,   // множник швидкості стрільби (чим більше, тим швидше)
    bulletSpeedMultiplier: 1, // множник швидкості кулі
    damage: 1                // базовий урон кулі
};

class UpgradeManager {
    constructor(scene) {
        this.scene = scene;
        this.isVisible = false;
        this.currentUpgrades = [];

        const w = scene.game.config.width;
        const h = scene.game.config.height;

        // Фон панелі внизу
        this.panelBg = scene.add
            .rectangle(w / 2, h - 90, w, 180, 0x000000, 0.7)
            .setDepth(100)
            .setVisible(false);

        // Три варіанти апгрейдів
        this.optionRects = [];
        this.optionTexts = [];

        const optionWidth = 220;
        const optionHeight = 120;
        const spacing = 40;

        const totalWidth = optionWidth * 3 + spacing * 2;
        let startX = w / 2 - totalWidth / 2 + optionWidth / 2;

        for (let i = 0; i < 3; i++) {
            const rect = scene.add
                .rectangle(startX + i * (optionWidth + spacing), h - 90, optionWidth, optionHeight, 0x1a1a1a, 0.9)
                .setStrokeStyle(2, 0xffffff)
                .setInteractive()
                .setDepth(101)
                .setVisible(false);

            rect.upgradeIndex = i;

            const text = scene.add
                .text(rect.x - optionWidth / 2 + 10, rect.y - optionHeight / 2 + 10, "", {
                    font: "16px Arial",
                    fill: "#ffffff",
                    wordWrap: { width: optionWidth - 20 }
                })
                .setDepth(102)
                .setVisible(false);

            this.optionRects.push(rect);
            this.optionTexts.push(text);
        }

        // Обробка кліку по варіантах
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
                desc: "Стріляєш швидше",
                apply: () => {
                    UPGRADE_STATE.fireRateMultiplier *= 1.2;
                }
            },
            {
                id: "bulletSpeed_1",
                title: "Швидкість кулі +20%",
                desc: "Кулі летять швидше",
                apply: () => {
                    UPGRADE_STATE.bulletSpeedMultiplier *= 1.2;
                }
            },
            {
                id: "damage_1",
                title: "Урон +1",
                desc: "Кулі завдають більше шкоди",
                apply: () => {
                    UPGRADE_STATE.damage += 1;
                }
            }
        ];
    }

    show() {
        this.isVisible = true;
        this.panelBg.setVisible(true);

        // Поки що завжди показуємо ті самі 3 апгрейди
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
