// server/server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Порт сервера
const PORT = process.env.PORT || 3000;

// Простые константы (чтобы не тянуть shared/constants на этом этапе)
const PLAYER_HEALTH = 100;
const SOCKET_EVENTS = {
    PLAYER_MOVE: 'player_move',
    GAME_STATE: 'game_state',
    PLAYER_JOINED: 'player_joined',
    PLAYER_LEFT: 'player_left'
};

// Раздаём клиентские файлы из папки client
app.use(express.static(path.join(__dirname, '../client')));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Список игроков в памяти сервера
const players = {};

// Подключение нового клиента
io.on('connection', (socket) => {
    console.log('Игрок подключился:', socket.id);

    // Создаём запись о новом игроке
    players[socket.id] = {
        id: socket.id,
        x: 200,
        y: 200,
        hp: PLAYER_HEALTH
    };

    // Сообщаем всем, что игрок присоединился
    io.emit(SOCKET_EVENTS.PLAYER_JOINED, players[socket.id]);

    // Обработка движения игрока
    socket.on(SOCKET_EVENTS.PLAYER_MOVE, (data) => {
        const player = players[socket.id];
        if (!player) return;

        if (typeof data.x === 'number') player.x = data.x;
        if (typeof data.y === 'number') player.y = data.y;
    });

    // Отключение игрока
    socket.on('disconnect', () => {
        console.log('Игрок вышел:', socket.id);
        delete players[socket.id];

        io.emit(SOCKET_EVENTS.PLAYER_LEFT, socket.id);
    });
});

// Периодическая рассылка общего состояния игры (10 раз в секунду)
setInterval(() => {
    io.emit(SOCKET_EVENTS.GAME_STATE, {
        players
    });
}, 100);

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
