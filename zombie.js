class Zombie {
    constructor(scene, x, y) {
        this.scene = scene;

        this.sprite = scene.add.rectangle(x, y, 40, 40, 0xff0000);
        scene.physics.add.existing(this.sprite);

        this.speed = 1.5;
        this.hp = 1;   // Зомбі вмирає від 1 кулі
        this.xpValue = 1; // Зомбі дає 1 XP
    }

    update(player) {
        if (!player) return;

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

    hit() {
        this.hp -= 1;
        if (this.hp <= 0) {
            this.sprite.destroy();
            this.isDead = true;
            return true;    // повертаємо сигнал що зомбі вбитий
        }
        return false;
    }
}
