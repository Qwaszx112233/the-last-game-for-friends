class BattleScene extends Phaser.Scene {
    constructor() {
        super("BattleScene");

        this.xp = 0;
        this.level = 1;
        this.nextLevelXP = 10;
    }

    preload() {
    }

    create() {
        this.ui = new BattleUI();

        this.player = this.add.rectangle(400, 300, 40, 40, 0x00ff00);

        this.enemy = this.add.rectangle(200, 300, 40, 40);
        this.enemy.setStrokeStyle(2, 0x00ff00);

        this.physics.add.existing(this.player);
        this.physics.add.existing(this.enemy);

        this.physics.add.collider(this.player, this.enemy, () => {
            this.addXP(5);
        });

        this.input.on("pointermove", (p) => {
            this.player.x = p.x;
            this.player.y = p.y;
        });
    }

    addXP(amount) {
        this.xp += amount;

        if (this.xp >= this.nextLevelXP) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.xp = 0;
        this.nextLevelXP += 10;

        this.ui.showLevelUp(this.level);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    backgroundColor: "#0d0d0d",
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scene: [BattleScene]
};

new Phaser.Game(config);
