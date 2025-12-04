class Zombie {
    constructor(scene, x, y) {
        this.scene = scene;

        // Червоний зомбі-прямокутник
        this.sprite = scene.add.rectangle(x, y, 40, 40, 0xff0000);
        scene.physics.add.existing(this.sprite);

        this.speed = 1.5; // швидкість зомбі
    }

    update(player) {
        if (!player) return;

        const px = player.x;
        const py = player.y;

        const z = this.sprite;

        // Напрямок руху на гравця
        const dx = px - z.x;
        const dy = py - z.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            z.x += (dx / dist) * this.speed;
            z.y += (dy / dist) * this.speed;
        }
    }
}
