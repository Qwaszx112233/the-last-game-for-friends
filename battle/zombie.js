class Zombie extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, null);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(24, 24);
    this.setTint(0xff3333);
    this.speed = ZOMBIE_BASE_SPEED;
    this.hp = ZOMBIE_HP;
  }

  hit(dmg) {
    this.hp -= dmg;
    if (this.hp <= 0) {
      this.setActive(false);
      this.setVisible(false);
      this.body.stop();
      return true;
    }
    return false;
  }
}

function createZombieGroup(scene) {
  const group = scene.physics.add.group({
    classType: Zombie,
    maxSize: 80,
    runChildUpdate: false
  });
  return group;
}
