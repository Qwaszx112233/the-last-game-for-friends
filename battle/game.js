
class Game {
    endBattle() {
        const result = {
            xp: this.player.totalXP,
            resources: {
                steel: this.collectedSteel,
                energy: this.collectedEnergy,
                tech: this.collectedTech || 0
            }
        };
        localStorage.setItem("lastBattleResult", JSON.stringify(result));
        window.location.href = "../base/base.html";
    }
}
