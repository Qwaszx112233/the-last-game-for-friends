const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Статика для клиента
app.use(express.static('../client'));

// Основной маршрут
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../client' });
});

// Подключение WebSocket
io.on('connection', (socket) => {
    console.log('Новый игрок подключился:', socket.id);

    socket.on('player_join', (playerData) => {
        console.log('Игрок присоединился:', playerData);
        // Логика присоединения игрока
    });

    socket.on('player_move', (movement) => {
        // Логика движения игрока
        io.emit('player_moved', {
            playerId: socket.id,
            movement
        });
    });

    socket.on('disconnect', () => {
        console.log('Игрок отключился:', socket.id);
        // Логика удаления игрока
    });
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Откройте http://localhost:${PORT} в браузере`);
});
