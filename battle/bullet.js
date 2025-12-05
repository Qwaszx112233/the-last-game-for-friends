class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, null);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCircle(3);
    this.setTint(0xffffff);
    this.speed = PLAYER_BASE_BULLET_SPEED;
    this.damage = PLAYER_BASE_DAMAGE;
    this.lifespan = 1200; // ms
    this.spawnTime = 0;
  }

  fire(vx, vy, damage) {
    this.body.reset(this.x, this.y);
    this.setActive(true);
    this.setVisible(true);
    this.body.setVelocity(vx, vy);
    this.damage = damage;
    this.spawnTime = this.scene.time.now;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (time - this.spawnTime > this.lifespan) {
      this.setActive(false);
      this.setVisible(false);
      this.body.stop();
    }
  }
}

function createBulletGroup(scene) {
  const group = scene.physics.add.group({
    classType: Bullet,
    maxSize: 120,
    runChildUpdate: true
  });
  return group;
}
