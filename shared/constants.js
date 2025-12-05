// Общие константы игры

module.exports = {
    // Настройки игры
    GAME_NAME: 'The Last Game For Friends',
    VERSION: '1.0.0',
    
    // Размеры и лимиты
    MAX_PLAYERS: 10,
    MAX_ZOMBIES: 50,
    WORLD_WIDTH: 2000,
    WORLD_HEIGHT: 2000,
    
    // Игровые константы
    PLAYER_SPEED: 5,
    ZOMBIE_SPEED: 2,
    PLAYER_HEALTH: 100,
    ZOMBIE_HEALTH: 50,
    
    // Типы объектов
    OBJECT_TYPES: {
        PLAYER: 'player',
        ZOMBIE: 'zombie',
        BUILDING: 'building',
        ITEM: 'item',
        BULLET: 'bullet'
    },
    
    // События WebSocket
    SOCKET_EVENTS: {
        // Клиент -> Сервер
        PLAYER_JOIN: 'player_join',
        PLAYER_MOVE: 'player_move',
        PLAYER_ATTACK: 'player_attack',
        PLAYER_BUILD: 'player_build',
        
        // Сервер -> Клиент
        GAME_STATE: 'game_state',
        PLAYER_JOINED: 'player_joined',
        PLAYER_LEFT: 'player_left',
        ZOMBIE_SPAWNED: 'zombie_spawned',
        PLAYER_DIED: 'player_died'
    },
    
    // Настройки строительства
    BUILDING_TYPES: {
        WALL: 'wall',
        TOWER: 'tower',
        STORAGE: 'storage',
        WORKBENCH: 'workbench'
    }
};
