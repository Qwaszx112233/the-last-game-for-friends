// client/game.js

// Глобальный объект для клавиш
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Инициализируем Socket.IO-клиент
const socket = io();

// Простая основная сцена
class MainScene {
    constructor(game) {
        this.game = game;
        this.players = {};
        this.playerId = null;
        this.speed = 4;
        this.onlineCounter = document.getElementById('online-count');
    }

    init() {
        // Подключение к серверу
        socket.on('connect', () => {
            console.log('Подключено к серверу, мой ID:', socket.id);
            this.playerId = socket.id;
        });

        // Получение состояния игры
        socket.on('game_state', (state) => {
            this.players = state.players || {};
            this.updateUi();
        });

        // Игрок присоединился
        socket.on('player_joined', (player) => {
            console.log('Игрок вошёл:', player.id);
            // Можно добавить анимацию появления и т.п.
        });

        // Игрок вышел
        socket.on('player_left', (id) => {
            console.log('Игрок вышел:', id);
        });
    }

    resize(width, height) {
        // Пока ничего не делаем — можно добавить камеру/масштабирование
    }

    destroy() {
        // Если нужно, можно отписаться от событий socket.off(...)
    }

    update() {
        if (!this.playerId) return;
        const me = this.players[this.playerId];
        if (!me) return;

        let moved = false;

        if (keys['w'] || keys['arrowup']) {
            me.y -= this.speed;
            moved = true;
        }
        if (keys['s'] || keys['arrowdown']) {
            me.y += this.speed;
            moved = true;
        }
        if (keys['a'] || keys['arrowleft']) {
            me.x -= this.speed;
            moved = true;
        }
        if (keys['d'] || keys['arrowright']) {
            me.x += this.speed;
            moved = true;
        }

        if (moved) {
            socket.emit('player_move', { x: me.x, y: me.y });
        }
    }

    render(ctx) {
        for (const id in this.players) {
            const p = this.players[id];

            // Цвет: зелёный — ты, красный — другие
            ctx.fillStyle = id === this.playerId ? 'lime' : 'red';
            ctx.fillRect(p.x, p.y, 20, 20);
        }
    }

    updateUi() {
        if (this.onlineCounter) {
            this.onlineCounter.textContent = Object.keys(this.players).length.toString();
        }
    }
}

// Класс Game — твой основной менеджер
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
        
        // Загрузка сцен
        this.loadScenes();
        
        // Начало игрового цикла
        this.gameLoop();
        
        console.log('Игра инициализирована');
    }
    
    resize() {
        const width = this.gameContainer.clientWidth;
        const height = this.gameContainer.clientHeight;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        if (this.currentScene && this.currentScene.resize) {
            this.currentScene.resize(width, height);
        }
    }
    
    loadScenes() {
        console.log('Загрузка сцен...');

        // Регистрируем основную сцену
        this.scenes['main'] = new MainScene(this);

        // Активируем её
        this.setScene('main');

        // Прячем экран загрузки, показываем канвас
        this.hideLoadingScreen();
    }
    
    setScene(sceneName) {
        if (this.currentScene && this.currentScene.destroy) {
            this.currentScene.destroy();
        }
        
        this.currentScene = this.scenes[sceneName];
        if (this.currentScene && this.currentScene.init) {
            this.currentScene.init();
            this.ui.classList.remove('hidden');
        }
    }
    
    gameLoop() {
        // Очистка холста
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Обновление и отрисовка текущей сцены
        if (this.currentScene) {
            if (this.currentScene.update) this.currentScene.update();
            if (this.currentScene.render) this.currentScene.render(this.ctx);
        }
        
        // Следующий кадр
        requestAnimationFrame(() => this.gameLoop());
    }
    
    showLoadingScreen() {
        this.loadingScreen.classList.remove('hidden');
        this.canvas.classList.add('hidden');
        this.ui.classList.add('hidden');
    }
    
    hideLoadingScreen() {
        this.loadingScreen.classList.add('hidden');
        this.canvas.classList.remove('hidden');
        // UI показываем при активации сцены (в setScene)
    }
}

// Запуск игры при загрузке страницы
window.addEventListener('load', () => {
    window.game = new Game();
});
