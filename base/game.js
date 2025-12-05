class BattleScene extends Phaser.Scene {
  constructor() {
    super("battle");
  }

  preload() {}

  create() {
    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(GAME_WIDTH/2, GAME_HEIGHT/2, GAME_WIDTH, GAME_HEIGHT, 0x050812);

    this.player = new Player(this, GAME_WIDTH/2, GAME_HEIGHT/2);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors.w = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.cursors.a = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.cursors.s = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.cursors.d = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.bullets = createBulletGroup(this);
    this.zombies = createZombieGroup(this);

    this.state = {
      hp: this.player.state.hp,
      maxHp: this.player.state.maxHp,
      xp: 0,
      totalXP: 0,
      xpToNext: 5,
      level: 1,
      wave: 1,
      kills: 0,
      takenUpgrades: new Set()
    };

    this.ui = new BattleUI();
    this.ui.updateStats(this.state);

    this.lastSpawnAt = 0;
    this.isPausedForLevel = false;
    this.isGameOver = false;

    this.physics.add.overlap(this.bullets, this.zombies, (bullet, zombie) => {
      bullet.setActive(false);
      bullet.setVisible(false);
      bullet.body.stop();
      if (zombie.hit(bullet.damage)) {
        this.state.kills += 1;
        const gainedXP = typeof zombie.xp === "number" ? zombie.xp : 1;
        this.addXP(gainedXP);
      }
      this.ui.updateStats(this.state);
    });

    this.physics.add.overlap(this.player.sprite, this.zombies, () => {
      if (this.isGameOver || this.isPausedForLevel) return;
      this.player.takeDamage(1);
      this.state.hp = this.player.state.hp;
      this.ui.updateStats(this.state);
      if (this.player.isDead()) {
        this.endGame();
      }
    });
  }

  addXP(amount) {
    this.state.xp += amount;
    this.state.totalXP += amount;
    if (this.state.xp >= this.state.xpToNext) {
      this.state.level += 1;
      this.state.xp -= this.state.xpToNext;
      this.state.xpToNext = Math.round(this.state.xpToNext * 1.4 + 2);
      this.levelUp();
    }
  }

  levelUp() {
    this.isPausedForLevel = true;
    this.physics.world.isPaused = true;

    const choices = pickRandomUpgrades(3, this.state.takenUpgrades);

    this.ui.showLevelUp(choices, (picked) => {
      picked.apply(this.player.state);
      this.player.state.hp = Math.min(this.player.state.hp, this.player.state.maxHp);
      this.state.hp = this.player.state.hp;
      this.state.maxHp = this.player.state.maxHp;
      this.state.takenUpgrades.add(picked.id);
      this.ui.updateStats(this.state);

      this.isPausedForLevel = false;
      this.physics.world.isPaused = false;
    });
  }

  spawnZombie() {
    const margin = 20;
    const side = Math.floor(Math.random() * 4);
    let x, y;
    if (side === 0) { // top
      x = Math.random() * GAME_WIDTH;
      y = -margin;
    } else if (side === 1) { // bottom
      x = Math.random() * GAME_WIDTH;
      y = GAME_HEIGHT + margin;
    } else if (side === 2) { // left
      x = -margin;
      y = Math.random() * GAME_HEIGHT;
    } else { // right
      x = GAME_WIDTH + margin;
      y = Math.random() * GAME_HEIGHT;
    }

    const z = this.zombies.get(x, y);
    if (!z) return;
    z.setActive(true);
    z.setVisible(true);
    z.hp = ZOMBIE_HP + (this.state.wave - 1);
  }

  update(time, delta) {
    if (this.isGameOver) return;
    const dt = delta / 1000;

    this.player.handleMovement(this.cursors, dt);

    // Move zombies toward player
    this.zombies.children.iterate((z) => {
      if (!z.active) return;
      const dx = this.player.sprite.x - z.x;
      const dy = this.player.sprite.y - z.y;
      const len = Math.hypot(dx, dy) || 1;
      const speed = ZOMBIE_BASE_SPEED + (this.state.wave - 1) * 4;
      z.body.setVelocity((dx/len)*speed, (dy/len)*speed);
    });

    // Spawn zombies
    if (!this.isPausedForLevel && time - this.lastSpawnAt > ZOMBIE_SPAWN_INTERVAL) {
      this.lastSpawnAt = time;
      for (let i = 0; i < this.state.wave; i++) {
        this.spawnZombie();
      }
      this.state.wave += 1;
      this.ui.updateStats(this.state);
    }

    // Find nearest zombie
    let nearest = null;
    let bestDist = Infinity;
    this.zombies.children.iterate((z) => {
      if (!z.active) return;
      const dx = z.x - this.player.sprite.x;
      const dy = z.y - this.player.sprite.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < bestDist) {
        bestDist = d2;
        nearest = z;
      }
    });

    this.player.tryAutoShoot(nearest, this.bullets, time);
  }

  saveBattleResult(reason = "death") {
    try {
      const xp = this.state.totalXP || 0;
      const data = {
        reason,
        xp,
        kills: this.state.kills,
        wave: this.state.wave,
        savedAt: Date.now()
      };
      localStorage.setItem("tlgf_lastBattle_v1", JSON.stringify(data));
    } catch (e) {
      console.warn("Cannot save battle result:", e);
    }
  }

  endGame() {
    this.isGameOver = true;
    this.physics.world.isPaused = true;
    this.saveBattleResult("death");
    this.ui.showGameOver(this.state);
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#05060b",
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [BattleScene]
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});
