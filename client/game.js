// Основной игровой файл
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
        
        if (this.currentScene) {
            this.currentScene.resize(width, height);
        }
    }
    
    loadScenes() {
        // Загрузка и регистрация сцен
        // В реальном проекте здесь будет динамическая загрузка
        console.log('Загрузка сцен...');
    }
    
    setScene(sceneName) {
        if (this.currentScene) {
            this.currentScene.destroy();
        }
        
        this.currentScene = this.scenes[sceneName];
        if (this.currentScene) {
            this.currentScene.init();
            this.ui.classList.remove('hidden');
        }
    }
    
    gameLoop() {
        // Очистка холста
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Обновление и отрисовка текущей сцены
        if (this.currentScene) {
            this.currentScene.update();
            this.currentScene.render(this.ctx);
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
    }
}

// Запуск игры при загрузке страницы
window.addEventListener('load', () => {
    window.game = new Game();
});
