let player;
let cursors;
let zombies = [];
let bullets = [];

let spawnTimer = 0;
let shootTimer = 0;

let ui;

function initGame() {
    const config = {
        type: Phaser.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: "#000000",
        physics: {
            default: "arcade",
            arcade: { debug: false }
        },
        scene: { create, update }
    };

    new Phaser.Game(config);
}

function create() {
    this.add.text(20, 50, "Auto Shoot + XP Active ✔", {
        font: "24px Arial",
        fill: "#ffffff"
    });

    // Гравець
    player = this.add.rectangle(400, 300, 50, 50, 0x00ff00);
    this.physics.add.existing(player);

    cursors = this.input.keyboard.createCursorKeys();

    // XP + Level UI
    ui = new UI(this);
}

function update(time) {
    if (!player) return;

    // --- Рух гравця ---
    const speed = 5;
    if (cursors.left.isDown) player.x -= speed;
    if (cursors.right.isDown) player.x += speed;
    if (cursors.up.isDown) player.y -= speed;
    if (cursors.down.isDown) player.y += speed;

    // --- Спавн зомбі ---
    if (time > spawnTimer) {
        spawnTimer = time + 1500;

        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        zombies.push(new Zombie(this, x, y));
    }

    // --- Автострільба ---
    if (time > shootTimer && zombies.length > 0) {
        shootTimer = time + 600;

        const nearest = findNearestZombie();

        if (nearest) {
            bullets.push(new Bullet(
                this,
                player.x,
                player.y,
                nearest.sprite.x,
                nearest.sprite.y
            ));
        }
    }

    // --- Оновлення куль ---
    bullets.forEach((b) => b.update());
    bullets = bullets.filter((b) => !b.isDestroyed);

    // --- Оновлення зомбі ---
    zombies.forEach((z) => z.update(player));
    zombies = zombies.filter((z) => !z.isDead);

    // --- Колізії ---
    checkBulletZombieCollision();
}

function findNearestZombie() {
    let nearest = null;
    let nearestDist = Infinity;

    zombies.forEach((z) => {
        const dx = z.sprite.x - player.x;
        const dy = z.sprite.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = z;
        }
    });

    return nearest;
}

function checkBulletZombieCollision() {
    bullets.forEach((bullet) => {
        zombies.forEach((zombie) => {
            const dx = bullet.sprite.x - zombie.sprite.x;
            const dy = bullet.sprite.y - zombie.sprite.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 30) {
                bullet.destroy();

                const killed = zombie.hit();
                if (killed) ui.addXP(zombie.xpValue);
            }
        });
    });
}

window.onload = initGame;
