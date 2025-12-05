// ui.js — Полный рабочий файл UI без модулей

class BattleUI {
    constructor() {
        this.levelUpText = document.getElementById("levelUpText");

        if (!this.levelUpText) {
            this.levelUpText = document.createElement("div");
            this.levelUpText.id = "levelUpText";
            this.levelUpText.style.position = "absolute";
            this.levelUpText.style.top = "20px";
            this.levelUpText.style.left = "20px";
            this.levelUpText.style.color = "#00ff00";
            this.levelUpText.style.fontSize = "24px";
            this.levelUpText.style.fontFamily = "Arial";
            this.levelUpText.style.pointerEvents = "none";
            this.levelUpText.style.zIndex = "9999";
            this.levelUpText.style.opacity = "0";
            this.levelUpText.style.transition = "opacity 0.5s";

            document.body.appendChild(this.levelUpText);
        }

        this.hideLevelUp();
    }

    showLevelUp(level) {
        this.levelUpText.innerHTML = "LEVEL UP! → " + level;
        this.levelUpText.style.opacity = "1";

        setTimeout(() => {
            this.hideLevelUp();
        }, 1500);
    }

    hideLevelUp() {
        this.levelUpText.style.opacity = "0";
    }
}

// Делаем глобальным
window.BattleUI = BattleUI;
