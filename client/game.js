// client/game.js

const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

const socket = io();

class MainScene {
    constructor(game) {
        this.game = game;

        this.players = {};     // данные от сервера
        this.renderPlayers = {}; // данные для отображения (интерполяция)

        this.playerId = null;
        this.speed = 4;

        this.onlineCounter = document.getElementById('online-count');
    }

    init() {
        socket.on('connect', () => {
            this.playerId = socket.id;
            console.log("Мой ID:", this.playerId);
        });

        socket.on('game_state', (state) => {
            const serverPlayers = state.players || {};

            // Обновляем список игроков
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

                // Обновляем серверные координаты
                this.renderPlayers[id].serverX = sp.x;
                this.renderPlayers[id].serverY = sp.y;
            }

            // Удаляем игроков, которые вышли
            for (const id in this.renderPlayers) {
                if (!serverPlayers[id]) delete this.renderPlayers[id];
            }

            this.players = serverPlayers;
            this.updateUi();
        });
    }

    resize() {}

    destroy() {}

    update() {
        if (!this.playerId) return;

        const me = this.players[this.playerId];
        if (!me) return;

        let moved = false;

        if (keys['w'] || keys['arrowup']) { me.y -= this.speed; moved = true; }
        if (keys['s'] || keys['arrowdown']) { me.y += this.speed; moved = true; }
        if (keys['a'] || keys['arrowleft']) { me.x -= this.speed; moved = true; }
        if (keys['d'] || keys['arrowright']) { me.x += this.speed; moved = true; }

        if (moved) {
            socket.emit('player_move', { x: me.x, y: me.y });
        }

        // Интерполяция всех игроков для гладкости
        for (const id in this.renderPlayers) {
            const rp = this.renderPlayers[id];

            rp.renderX += (rp.serverX - rp.renderX) * 0.2;
            rp.renderY += (rp.serverY - rp.renderY) * 0.2;
        }
    }

    render(ctx) {
        ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        for (const id in this.renderPlayers) {
            const p = this.renderPlayers[id];

            ctx.fillStyle = id === this.playerId ? "lime" : "red";
            ctx.fillRect(p.renderX, p.renderY, 20, 20);
        }
    }

    updateUi() {
        this.onlineCounter.textContent = Object.keys(this.players).length;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.loadingScreen = document.getElementById('loading-screen');
        this.gameContainer = document.getElementById('game-container');
        this.ui = document.getElementById('ui');

        this.scenes = {};
        this.currentScene = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.loadScenes();
        this.gameLoop();
    }

    resize() {
        this.canvas.width = this.gameContainer.clientWidth;
        this.canvas.height = this.gameContainer.clientHeight;
    }

    loadScenes() {
        this.scenes["main"] = new MainScene(this);
        this.setScene("main");
        this.hideLoadingScreen();
    }

    setScene(name) {
        if (this.currentScene?.destroy) this.currentScene.destroy();

        this.currentScene = this.scenes[name];
        this.currentScene.init();

        this.ui.classList.remove("hidden");
    }

    gameLoop() {
        this.currentScene.update();
        this.currentScene.render(this.ctx);

        requestAnimationFrame(() => this.gameLoop());
    }

    hideLoadingScreen() {
        this.loadingScreen.classList.add("hidden");
        this.canvas.classList.remove("hidden");
    }
}

window.addEventListener("load", () => {
    window.game = new Game();
});
