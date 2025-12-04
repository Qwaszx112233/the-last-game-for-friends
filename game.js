function initGame() {
  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#000000",
    scene: {
      create: create,
      update: update
    }
  };

  new Phaser.Game(config);
}

let player, cursors;

function create() {
  this.add.text(20, 20, "Game Loaded ✔", {
    font: "32px Arial",
    fill: "#ffffff"
  });

  player = this.add.rectangle(300, 300, 50, 50, 0x00ff00);
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  if (!player) return;

  const speed = 6;

  if (cursors.left.isDown) player.x -= speed;
  if (cursors.right.isDown) player.x += speed;
  if (cursors.up.isDown) player.y -= speed;
  if (cursors.down.isDown) player.y += speed;
}

window.onload = initGame;
