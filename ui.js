// Інтерфейс: XP, Level, HP, Game Over
class UI {
    constructor(scene) {
        this.scene = scene;

        this.xp = 0;
        this.level = 1;
        this.xpToNext = CONFIG.xp.baseToNext;

        this.kills = 0;
        this.wave = 1;

        const w = scene.game.config.width;

        // XP бар
        this.barBg = scene.add.rectangle(20, 20, 220, 18, 0x222222).setOrigin(0, 0);
        this.barFill = scene.add.rectangle(20, 20, 0, 18, 0x00aaff).setOrigin(0, 0);

        // Level текст
        this.levelText = scene.add.text(250, 16, "Lv: 1", {
            font: "18px Arial",
            fill: "#ffffff"
        });

        // HP текст
        this.hpText = scene.add.text(20, 44, "HP: 0/0", {
            font: "18px Arial",
            fill: "#ff6666"
        });

        // Wave / kills
        this.waveText = scene.add.text(w - 180, 16, "Wave: 1", {
            font: "18px Arial",
            fill: "#ffffff"
        }).setOrigin(0, 0);

        this.killText = scene.add.text(w - 180, 40, "Kills: 0", {
            font: "18px Arial",
            fill: "#ffffff"
        }).setOrigin(0, 0);

        // Game Over елементи (поки приховані)
        this.gameOverGroup = [];
        this.isGameOverShown = false;
    }

    setHP(current, max) {
        this.hpText.setText("HP: " + current + "/" + max);
    }

    setWave(num) {
        this.wave = num;
        this.waveText.setText("Wave: " + num);
    }

    addKill() {
        this.kills++;
        this.killText.setText("Kills: " + this.kills);
    }

    addXP(amount, upgradeManager) {
        this.xp += amount;

        if (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.floor(this.xpToNext * CONFIG.xp.scale + 1);

            this.levelText.setText("Lv: " + this.level);

            if (upgradeManager && !upgradeManager.isVisible) {
                upgradeManager.show();
            }
        }

        this.updateBar();
    }

    updateBar() {
        const ratio = this.xp / this.xpToNext;
        const width = 220 * Math.max(0, Math.min(1, ratio));
        this.barFill.width = width;
    }

    showGameOver(onRestart) {
        if (this.isGameOverShown) return;
        this.isGameOverShown = true;

        const scene = this.scene;
        const w = scene.game.config.width;
        const h = scene.game.config.height;

        const overlay = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.8)
            .setDepth(200);

        const panel = scene.add.rectangle(w / 2, h / 2, 360, 220, 0x18161a, 0.95)
            .setStrokeStyle(3, 0xff4a4a)
            .setDepth(201);

        const title = scene.add.text(w / 2, h / 2 - 70, "DEFEAT", {
            font: "40px Arial",
            fill: "#ff4444"
        }).setOrigin(0.5).setDepth(202);

        const stats = scene.add.text(
            w / 2,
            h / 2 - 10,
            "Wave: " + this.wave + "\nLevel: " + this.level + "\nKills: " + this.kills,
            { font: "20px Arial", fill: "#ffffff", align: "center" }
        ).setOrigin(0.5).setDepth(202);

        const btn = scene.add.rectangle(w / 2, h / 2 + 70, 180, 50, 0xffd34f)
            .setStrokeStyle(2, 0x8a5c00)
            .setDepth(203)
            .setInteractive({ useHandCursor: true });

        const btnText = scene.add.text(w / 2, h / 2 + 70, "RETRY", {
            font: "22px Arial",
            fill: "#3b2600"
        }).setOrigin(0.5).setDepth(204);

        btn.on("pointerdown", () => {
            if (typeof onRestart === "function") onRestart();
        });

        this.gameOverGroup.push(overlay, panel, title, stats, btn, btnText);
    }
}
