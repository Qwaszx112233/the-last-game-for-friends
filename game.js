let player;
let cursors;
let zombies = [];
let bullets = [];

let spawnTimer = 0;
let shootTimer = 0;
let waveTimer = 0;
let waveNumber = 1;

let ui;
let upgradeManager;

let gameOver = false;

// Для розрахунку складності
function getDifficultyMultiplier() {
    return 1 + (waveNumber - 1) * CONFIG.waves.difficultyPerWave;
}

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
    const scene = this;
    const w = scene.game.config.width;

    scene.add.text(w / 2, 10, "The Last Game For Friends", {
        font: "20px Arial",
        fill: "#ffffff"
    }).setOrigin(0.5, 0);

    // Гравець
    player = scene.add.rectangle(w / 2, scene.game.config.height / 2, 50, 50, 0x00ff66);
    scene.physics.add.existing(player);
    player.maxHp = CONFIG.player.maxHp + UPGRADE_STATE.maxHpBonus;
    player.hp = player.maxHp;
    player.invulnUntil = 0;
    player.isDead = false;

    cursors = scene.input.keyboard.createCursorKeys();

    // UI + апгрейди
    ui = new UI(scene);
    ui.setHP(player.hp, player.maxHp);
    ui.setWave(waveNumber);

    upgradeManager = new UpgradeManager(scene);

    const time = 0;
    waveTimer = CONFIG.waves.durationMs;
    spawnTimer = 0;
    shootTimer = 0;

    gameOver = false;
    zombies = [];
    bullets = [];
}

function update(time, delta) {
    const scene = this;
    if (!player || gameOver) {
        // Оновлюємо кулі, щоб вони могли догоріти навіть після смерті
        bullets.forEach(b => b.update());
        bullets = bullets.filter(b => !b.isDestroyed);
        return;
    }

    const now = time;

    // --- Рух гравця (блокується, якщо панель апгрейдів відкрита) ---
    if (!upgradeManager.isVisible) {
        const speed = CONFIG.player.speed;
        if (cursors.left.isDown) player.x -= speed;
        if (cursors.right.isDown) player.x += speed;
        if (cursors.up.isDown) player.y -= speed;
        if (cursors.down.isDown) player.y += speed;

        // Обмеження екраном
        const w = scene.game.config.width;
        const h = scene.game.config.height;
        player.x = Phaser.Math.Clamp(player.x, 20, w - 20);
        player.y = Phaser.Math.Clamp(player.y, 40, h - 20);
    }

    // --- Хвилі ---
    if (now > waveTimer) {
        waveNumber++;
        ui.setWave(waveNumber);
        waveTimer = now + CONFIG.waves.durationMs;
    }

    const difficulty = getDifficultyMultiplier();

    // --- Спавн зомбі ---
    const spawnInterval = CONFIG.zombies.spawnInterval / difficulty;
    if (now > spawnTimer) {
        spawnTimer = now + spawnInterval;

        const side = Math.floor(Math.random() * 4);
        let x, y;
        const w = scene.game.config.width;
        const h = scene.game.config.height;

        if (side === 0) { // зверху
            x = Math.random() * w;
            y = -40;
        } else if (side === 1) { // знизу
            x = Math.random() * w;
            y = h + 40;
        } else if (side === 2) { // зліва
            x = -40;
            y = Math.random() * h;
        } else { // справа
            x = w + 40;
            y = Math.random() * h;
        }

        const fatChance = CONFIG.zombies.fatChanceStart + (waveNumber - 1) * CONFIG.zombies.fatChancePerWave;
        const type = Math.random() < fatChance ? "fat" : "normal";

        zombies.push(new Zombie(scene, x, y, type, difficulty));
    }

    // --- Автострільба ---
    if (zombies.length > 0 && !player.isDead) {
        const interval = CONFIG.shoot.baseInterval / UPGRADE_STATE.fireRateMultiplier;
        if (now > shootTimer) {
            shootTimer = now + interval;

            const target = findNearestZombie();
            if (target) {
                const bulletSpeed = CONFIG.shoot.bulletSpeed * UPGRADE_STATE.bulletSpeedMultiplier;
                bullets.push(new Bullet(
                    scene,
                    player.x,
                    player.y,
                    target.sprite.x,
                    target.sprite.y,
                    bulletSpeed,
                    UPGRADE_STATE.damage
                ));
            }
        }
    }

    // --- Оновлення куль ---
    bullets.forEach(b => b.update());
    bullets = bullets.filter(b => !b.isDestroyed);

    // --- Оновлення зомбі ---
    zombies.forEach(z => z.update(player));
    zombies = zombies.filter(z => !z.isDead);

    // --- Колізія куля ↔ зомбі ---
    checkBulletZombieCollision();

    // --- Шкода гравцю від зомбі ---
    checkPlayerDamage(scene, now);
}

function findNearestZombie() {
    let nearest = null;
    let nearestDist = Infinity;

    zombies.forEach((z) => {
        if (z.isDead) return;
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
        if (bullet.isDestroyed) return;

        zombies.forEach((zombie) => {
            if (zombie.isDead) return;

            const dx = bullet.sprite.x - zombie.sprite.x;
            const dy = bullet.sprite.y - zombie.sprite.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 30) {
                bullet.destroy();
                const killed = zombie.hit(bullet.damage);
                if (killed) {
                    ui.addKill();
                    ui.addXP(zombie.xpValue, upgradeManager);
                }
            }
        });
    });
}

function checkPlayerDamage(scene, now) {
    if (player.isDead) return;

    for (const z of zombies) {
        if (z.isDead) continue;

        const dx = z.sprite.x - player.x;
        const dy = z.sprite.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 36) {
            if (now < player.invulnUntil) continue;

            player.hp -= 1;
            player.invulnUntil = now + CONFIG.player.invulnMs;
            ui.setHP(player.hp, player.maxHp);

            // блимання
            scene.tweens.add({
                targets: player,
                alpha: 0.3,
                yoyo: true,
                repeat: 3,
                duration: 80
            });

            if (player.hp <= 0) {
                handleGameOver(scene);
                break;
            }
        }
    }
}

function handleGameOver(scene) {
    if (gameOver) return;
    gameOver = true;
    player.isDead = true;

    ui.showGameOver(() => {
        // Перезапуск сцени
        waveNumber = 1;
        zombies = [];
        bullets = [];
        gameOver = false;
        scene.scene.restart();
    });
}

window.onload = initGame;
