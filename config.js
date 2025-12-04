// Базові налаштування балансу гри
const CONFIG = {
    player: {
        speed: 5,
        maxHp: 5,
        invulnMs: 800
    },
    shoot: {
        baseInterval: 650,      // базовий інтервал автострільби (мс)
        bulletSpeed: 8          // базова швидкість кулі
    },
    zombies: {
        baseSpeed: 1.4,
        fatSpeed: 0.9,
        spawnInterval: 1400,    // базовий інтервал спавну (мс)
        fatChanceStart: 0.25,   // шанс товстого зомбі на 1-й хвилі
        fatChancePerWave: 0.05  // додатковий шанс за хвилю
    },
    waves: {
        durationMs: 30000,      // тривалість хвилі в мс (30 секунд)
        difficultyPerWave: 0.18 // множник складності за хвилю
    },
    xp: {
        basePerZombie: 1,
        baseToNext: 5,
        scale: 1.3
    }
};
