class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.state = {
      moveSpeed: PLAYER_BASE_SPEED,
      fireDelay: PLAYER_BASE_FIRE_DELAY,
      bulletSpeed: PLAYER_BASE_BULLET_SPEED,
      damage: PLAYER_BASE_DAMAGE,
      hp: PLAYER_BASE_MAX_HP,
      maxHp: PLAYER_BASE_MAX_HP
    };

    this.sprite = scene.physics.add.rectangle(x, y, 26, 26, 0x00ff55);
    this.sprite.setOrigin(0.5);
    this.sprite.setCollideWorldBounds(true);

    this.lastShotAt = 0;
  }

  handleMovement(cursors, dt) {
    const body = this.sprite.body;
    body.setVelocity(0, 0);

    const speed = this.state.moveSpeed;
    if (cursors.left.isDown || cursors.a?.isDown) {
      body.setVelocityX(-speed);
    } else if (cursors.right.isDown || cursors.d?.isDown) {
      body.setVelocityX(speed);
    }

    if (cursors.up.isDown || cursors.w?.isDown) {
      body.setVelocityY(-speed);
    } else if (cursors.down.isDown || cursors.s?.isDown) {
      body.setVelocityY(speed);
    }

    if (body.velocity.length() > 0) {
      body.velocity.normalize().scale(speed);
    }
  }

  tryAutoShoot(target, bullets, time) {
    if (!target) return;
    if (time - this.lastShotAt < this.state.fireDelay) return;

    const sx = this.sprite.x;
    const sy = this.sprite.y;
    const dx = target.x - sx;
    const dy = target.y - sy;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const vx = (dx / len) * this.state.bulletSpeed;
    const vy = (dy / len) * this.state.bulletSpeed;

    const bullet = bullets.get(sx, sy);
    if (!bullet) return;
    bullet.fire(vx, vy, this.state.damage);

    this.lastShotAt = time;
  }

  takeDamage(amount) {
    this.state.hp -= amount;
    if (this.state.hp < 0) this.state.hp = 0;
  }

  isDead() {
    return this.state.hp <= 0;
  }
}
