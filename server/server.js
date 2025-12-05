// server/server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

const PLAYER_HEALTH = 100;
const ZOMBIE_HEALTH = 40;
const ZOMBIE_SPEED = 1.2;

const SOCKET_EVENTS = {
    PLAYER_MOVE: 'player_move',
    GAME_STATE: 'game_state',
    ZOMBIE_STATE: 'zombie_state'
};

// ===== PLAYERS =====
const players = {};

// ===== ZOMBIES =====
let zombies = [];
let nextZombieId = 1;

// Создаём одного зомби
function spawnZombie() {
    zombies.push({
        id: nextZombieId++,
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 2000 - 1000,
        hp: ZOMBIE_HEALTH
    });
}

// Двигаем каждого зомби к ближайшему игроку
function updateZombies() {
    zombies.forEach(z => {
        let nearest = null;
        let nearestDist = Infinity;

        for (const id in players) {
            const p = players[id];
            const dx = p.x - z.x;
            const dy = p.y - z.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = p;
            }
        }

        if (nearest) {
            const dx = nearest.x - z.x;
            const dy = nearest.y - z.y;
            const len = Math.sqrt(dx * dx + dy * dy);

            z.x += (dx / len) * ZOMBIE_SPEED;
            z.y += (dy / len) * ZOMBIE_SPEED;
        }
    });
}

// ===== SOCKET =====

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

io.on('connection', (socket) => {
    console.log('Игрок подключился:', socket.id);

    players[socket.id] = {
        id: socket.id,
        x: 200,
        y: 200,
        hp: PLAYER_HEALTH
    };

    socket.on(SOCKET_EVENTS.PLAYER_MOVE, (data) => {
        const p = players[socket.id];
        if (!p) return;

        if (typeof data.x === 'number') p.x = data.x;
        if (typeof data.y === 'number') p.y = data.y;
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        console.log("Игрок отключился:", socket.id);
    });
});

// ===== GAME LOOP =====

setInterval(() => {
    updateZombies();

    io.emit(SOCKET_EVENTS.GAME_STATE, { players });
    io.emit(SOCKET_EVENTS.ZOMBIE_STATE, { zombies });
}, 100);

// Спавн зомби каждые 3 секунды
setInterval(() => spawnZombie(), 3000);

server.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});
