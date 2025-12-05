
class BaseScene {
    constructor() {
        this.hero = { tokens: 0, xpBank: 0 };
        this.resources = { steel: 0, energy: 0, tech: 0 };
        this.buildings = {};
        this.loadBaseState();
        this.loadBattleRewards();
    }

    loadBattleRewards() {
        const raw = localStorage.getItem("lastBattleResult");
        if (!raw) return;

        const data = JSON.parse(raw);

        const tokensFromXP = Math.floor(data.xp / 25);
        this.hero.tokens += tokensFromXP;

        const leftoverXP = data.xp % 25;
        this.hero.xpBank = (this.hero.xpBank || 0) + leftoverXP;

        this.resources.steel += data.resources.steel || 0;
        this.resources.energy += data.resources.energy || 0;
        this.resources.tech += data.resources.tech || 0;

        this.saveBaseState();
        localStorage.removeItem("lastBattleResult");
    }

    saveBaseState() {
        const state = {
            hero: this.hero,
            resources: this.resources,
            buildings: this.buildings
        };
        localStorage.setItem("baseState", JSON.stringify(state));
    }

    loadBaseState() {
        const raw = localStorage.getItem("baseState");
        if (!raw) return;
        const data = JSON.parse(raw);
        this.hero = data.hero;
        this.resources = data.resources;
        this.buildings = data.buildings;
    }
}
