// The Last Game For Friends — game.js (Stage 2.0 Last War Edition)

class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: "BattleScene" });

        this.state = {
            xp: 0,
            totalXP: 0,
            xpToNext: 5,
            level: 1,
            wave: 1,
            kills: 0,
            isPaused: false
        };

        this.spawnTimer = 0;
        this.spawnInterval = 1100; // ms dynamic
        this.waveActive = true;
        this.waveEnemyCount = 0;
        this.waveKilled = 0;
    }

    preload() {}

    create() {
        this.player = new Player(this, 400, 300);
        this.zombies = createZombieGroup(this);

        this.time.addEvent({
            delay: 1000,
            callback: () => this.startWave(),
            loop: false
        });

        this.physics.add.collider(this.player.sprite, this.zombies, (p, z) => {
            this.player.hit(1);
        });

        this.ui = new BattleUI(this);
    }

    startWave() {
        this.waveActive = true;
        this.waveKilled = 0;

        const wave = this.state.wave;

        // Dynamic spawn interval
        if (wave < 4) this.spawnInterval = 1100;
        else if (wave < 7) this.spawnInterval = 900;
        else if (wave < 10) this.spawnInterval = 750;
        else this.spawnInterval = 600;

        // Enemy count
        this.waveEnemyCount = 20 + wave * 3;

        // Add miniboss every 5 waves
        if (wave % 5 === 0) {
            this.spawnZombie("miniboss");
        }
    }

    spawnZombie(typeOverride = null) {
        const wave = this.state.wave;

        let t = "walker";
        if (!typeOverride) {
            const r = Math.random();

            if (wave < 4) {
                if (r < 0.9) t = "walker";
                else t = "runner";
            } else if (wave < 7) {
                if (r < 0.7) t = "walker";
                else if (r < 0.9) t = "runner";
                else t = "brute";
            } else if (wave < 10) {
                if (r < 0.55) t = "walker";
                else if (r < 0.8) t = "runner";
                else if (r < 0.95) t = "brute";
                else t = "toxic";
            } else {
                if (r < 0.45) t = "walker";
                else if (r < 0.7) t = "runner";
                else if (r < 0.85) t = "brute";
                else t = "toxic";
            }
        } else {
            t = typeOverride;
        }

        const x = Math.random() < 0.5 ? -20 : 820;
        const y = Math.random() * 600;

        const z = this.zombies.get(x, y, t);
        if (!z) return;

        z.type = t;
        z.setActive(true);
        z.setVisible(true);
    }

    update(time, delta) {
        if (this.state.isPaused) return;

        if (this.player) this.player.update();

        if (this.waveActive) {
            this.spawnTimer += delta;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer = 0;

                if (this.waveEnemyCount > 0) {
                    this.spawnZombie();
                    this.waveEnemyCount--;
                }
            }
        }

        this.zombies.children.each(z => {
            if (!z.active) return;
            this.physics.moveToObject(z, this.player.sprite, z.speed);
        });
    }

    killZombie(z) {
        this.state.kills++;
        this.state.totalXP += z.xp;
        this.addXP(z.xp);
        this.waveKilled++;

        if (this.waveKilled >= (20 + this.state.wave * 3)) {
            this.nextWave();
        }
    }

    nextWave() {
        this.waveActive = false;
        this.state.wave++;
        this.time.addEvent({
            delay: 2000,
            callback: () => this.startWave(),
            loop: false
        });
    }

    addXP(amount) {
        this.state.xp += amount;
        if (this.state.xp >= this.state.xpToNext) {
            this.state.xp -= this.state.xpToNext;
            this.levelUp();
        }
    }

    levelUp() {
        this.state.level++;
        this.state.xpToNext = Math.floor(this.state.xpToNext * 1.35);
        this.state.isPaused = true;
        this.ui.showUpgrade();
    }

    endGame() {
        this.state.isPaused = true;
        this.ui.showGameOver(this.state);
    }
}

