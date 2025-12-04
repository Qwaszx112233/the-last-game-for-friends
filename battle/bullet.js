// Куля, летить по прямій до цілі
class Bullet {
    constructor(scene, x, y, targetX, targetY, speed, damage) {
        this.scene = scene;
        this.damage = damage;

        this.sprite = scene.add.circle(x, y, 5, 0xffffff);
        scene.physics.add.existing(this.sprite);

        this.speed = speed;

        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
        this.isDestroyed = false;
    }

    update() {
        if (this.isDestroyed) return;

        this.sprite.x += this.vx;
        this.sprite.y += this.vy;

        if (
            this.sprite.x < -50 ||
            this.sprite.x > window.innerWidth + 50 ||
            this.sprite.y < -50 ||
            this.sprite.y > window.innerHeight + 50
        ) {
            this.destroy();
        }
    }

    destroy() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        this.sprite.destroy();
    }
}
