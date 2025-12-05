// ui.js — Полностью рабочий UI для Battle Scene

export class BattleUI {
    constructor() {
        // ищем элементы
        this.levelUpText = document.getElementById("levelUpText");

        // если элемента нет — создаём автоматически
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
            document.body.appendChild(this.levelUpText);
        }

        // скрываем по умолчанию
        this.hideLevelUp();
    }

    showLevelUp(level) {
        if (!this.levelUpText) return;

        this.levelUpText.innerHTML = "LEVEL UP! → " + level;
        this.levelUpText.style.opacity = "1";

        // мягкое исчезновение
        setTimeout(() => {
            this.hideLevelUp();
        }, 1500);
    }

    hideLevelUp() {
        if (this.levelUpText) {
            this.levelUpText.style.opacity = "0";
        }
    }
}
