// client/game.js

const keys = {};
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

const socket = io();

class MainScene {
    constructor(game) {
        this.game = game;

        this.players = {};
        this.renderPlayers = {};

        this.zombies = {};
        this.renderZombies = {};

        this.playerId = null;
        this.speed = 4;
    }

    init() {
        socket.on('connect', () => {
            this.playerId = socket.id;
            console.log("Мой ID:", this.playerId);
        });

        socket.on('game_state', (state) => {
            const serverPlayers = state.players || {};

            for (const id in serverPlayers) {
                const sp = serverPlayers[id];
                if (!this.renderPlayers[id]) {
                    this.renderPlayers[id] = {
                        renderX: sp.x,
                        renderY: sp.y,
                        serverX: sp.x,
                        serverY: sp.y
                    };
                }
                this.renderPlayers[id].serverX = sp.x;
                this.renderPlayers[id].serverY = sp.y;
            }

            for (const id in this.renderPlayers) {
                if (!serverPlayers[id]) delete this.renderPlayers[id];
            }

            this.players = serverPlayers;
            document.getElementById("online-count").textContent = Object.keys(this.players).length;
        });

        socket.on("zombie_state", (state) => {
            const serverZombies = state.zombies || {};

            serverZombies.forEach(z => {
                if (!this.renderZombies[z.id]) {
                    this.renderZombies[z.id] = {
                        renderX: z.x,
                        renderY: z.y,
                        serverX: z.x,
                        serverY: z.y
                    };
                }
                this.renderZombies[z.id].serverX = z.x;
                this.renderZombies[z.id].serverY = z.y;
            });

            this.zombies = serverZombies;

            document.getElementById("zombie-count").textContent = serverZombies.length;
        });
    }

    update() {
        if (!this.playerId) return;

        const me = this.players[this.playerId];
        if (!me) return;

        let moved = false;

        if (keys['w'] || keys['arrowup']) { me.y -= this.speed; moved = true; }
        if (keys['s'] || keys['arrowdown']) { me.y += this.speed; moved = true; }
        if (keys['a'] || keys['arrowleft']) { me.x -= this.speed; moved = true; }
        if (keys['d'] || keys['arrowright']) { me.x += this.speed; moved = true; }

        if (moved) socket.emit("player_move", { x: me.x, y: me.y });

        // Интерполяция игроков
        for (const id in this.renderPlayers) {
            const rp = this.renderPlayers[id];
            rp.renderX += (rp.serverX - rp.renderX) * 0.2;
            rp.renderY += (rp.serverY - rp.renderY) * 0.2;
        }

        // Интерполяция зомби
        for (const id in this.renderZombies) {
            const rz = this.renderZombies[id];
            rz.renderX += (rz.serverX - rz.renderX) * 0.2;
            rz.renderY += (rz.serverY - rz.renderY) * 0.2;
        }
    }

    render(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // Игроки
        for (const id in this.renderPlayers) {
            const p = this.renderPlayers[id];
            ctx.fillStyle = id === this.playerId ? "lime" : "red";
            ctx.fillRect(p.renderX, p.renderY, 20, 20);
        }

        // Зомби
        for (const id in this.renderZombies) {
            const z = this.renderZombies[id];
            ctx.fillStyle = "orange";
            ctx.fillRect(z.renderX, z.renderY, 20, 20);
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById("game-canvas");
        this.ctx = this.canvas.getContext("2d");

        this.scenes = {};
        this.currentScene = null;

        this.resize();
        window.addEventListener("resize", () => this.resize());

        this.loadScenes();
        this.gameLoop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    loadScenes() {
        this.scenes["main"] = new MainScene(this);
        this.setScene("main");
    }

    setScene(name) {
        this.currentScene = this.scenes[name];
        this.currentScene.init();
    }

    gameLoop() {
        if (this.currentScene) {
            this.currentScene.update();
            this.currentScene.render(this.ctx);
        }
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener("load", () => {
    window.game = new Game();
});
