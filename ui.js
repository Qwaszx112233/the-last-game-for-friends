class UI {
    constructor(scene) {
        this.scene = scene;

        this.xp = 0;
        this.level = 1;
        this.xpToNext = 5;

        // XP бар
        this.barBg = scene.add.rectangle(20, 20, 200, 20, 0x333333).setOrigin(0, 0);
        this.barFill = scene.add.rectangle(20, 20, 0, 20, 0x00aaff).setOrigin(0, 0);

        // Текст рівня
        this.levelText = scene.add.text(230, 16, "Lv: 1", {
            font: "20px Arial",
            fill: "#ffffff"
        });
    }

    addXP(amount) {
        this.xp += amount;

        // Level up
        if (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.floor(this.xpToNext * 1.3 + 1);

            this.levelText.setText("Lv: " + this.level);
        }

        this.updateBar();
    }

    updateBar() {
        const ratio = this.xp / this.xpToNext;
        const width = 200 * ratio;

        this.barFill.width = width;
    }
}
