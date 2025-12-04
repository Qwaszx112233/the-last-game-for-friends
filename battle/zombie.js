// Два типи зомбі: звичайний та товстий
class Zombie {
    constructor(scene, x, y, type, difficultyMultiplier) {
        this.scene = scene;
        this.type = type;

        let size = 40;
        let color = 0xff0000;
        let baseHp = 1;
        let baseSpeed = CONFIG.zombies.baseSpeed;
        let xp = CONFIG.xp.basePerZombie;

        if (type === "fat") {
            size = 52;
            color = 0xffbb33;
            baseHp = 3;
            baseSpeed = CONFIG.zombies.fatSpeed;
            xp = CONFIG.xp.basePerZombie * 3;
        }

        this.sprite = scene.add.rectangle(x, y, size, size, color);
        scene.physics.add.existing(this.sprite);

        this.hp = Math.round(baseHp * (1 + difficultyMultiplier * 0.5));
        this.speed = baseSpeed * (1 + difficultyMultiplier * 0.4);
        this.xpValue = xp;
        this.isDead = false;
    }

    update(player) {
        if (!player || this.isDead) return;

        const px = player.x;
        const py = player.y;

        const z = this.sprite;

        const dx = px - z.x;
        const dy = py - z.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            z.x += (dx / dist) * this.speed;
            z.y += (dy / dist) * this.speed;
        }
    }

    hit(damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.isDead = true;
            this.sprite.destroy();
            return true;
        }
        // невеликий відкіт назад
        this.sprite.x += (Math.random() - 0.5) * 10;
        this.sprite.y += (Math.random() - 0.5) * 10;
        return false;
    }
}
