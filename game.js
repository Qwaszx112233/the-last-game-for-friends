let player;
let cursors;
let zombies = [];
let spawnTimer = 0;

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
    // Тестовий текст
    this.add.text(20, 20, "Game Loaded ✔ + Zombies Active", {
        font: "28px Arial",
        fill: "#ffffff"
    });

    // Гравець
    player = this.add.rectangle(400, 300, 50, 50, 0x00ff00);
    this.physics.add.existing(player);

    cursors = this.input.keyboard.createCursorKeys();
}

function update(time) {
    if (!player) return;

    const speed = 5;

    // Рух гравця
    if (cursors.left.isDown) player.x -= speed;
    if (cursors.right.isDown) player.x += speed;
    if (cursors.up.isDown) player.y -= speed;
    if (cursors.down.isDown) player.y += speed;

    // Спавн зомбі кожні 1500 мс
    if (time > spawnTimer) {
        spawnTimer = time + 1500;

        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;

        zombies.push(new Zombie(this, x, y));
    }

    // Оновлення всіх зомбі
    for (let z of zombies) {
        z.update(player);
    }
}

window.onload = initGame;
