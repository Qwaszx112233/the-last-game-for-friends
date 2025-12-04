class Bullet {
    constructor(scene, x, y, targetX, targetY) {
        this.scene = scene;

        // Створюємо кулю — маленьке біле коло
        this.sprite = scene.add.circle(x, y, 6, 0xffffff);
        scene.physics.add.existing(this.sprite);

        // Швидкість кулі
        this.speed = 8;

        // Розрахунок напрямку
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.velocityX = (dx / dist) * this.speed;
        this.velocityY = (dy / dist) * this.speed;
    }

    update() {
        this.sprite.x += this.velocityX;
        this.sprite.y += this.velocityY;

        // Видалити кулю, якщо вона вилетіла за межі
        if (
            this.sprite.x < 0 ||
            this.sprite.x > window.innerWidth ||
            this.sprite.y < 0 ||
            this.sprite.y > window.innerHeight
        ) {
            this.destroy();
        }
    }

    destroy() {
        this.sprite.destroy();
        this.isDestroyed = true;
    }
}
