// List of possible upgrades
const ALL_UPGRADES = [
  {
    id: "attack_speed_1",
    group: "attack_speed",
    title: "Attack Speed +20%",
    desc: "You shoot faster.",
    apply: (state) => { state.fireDelay *= 0.8; }
  },
  {
    id: "bullet_speed_1",
    group: "bullet_speed",
    title: "Bullet Speed +25%",
    desc: "Bullets travel faster and hit more reliably.",
    apply: (state) => { state.bulletSpeed *= 1.25; }
  },
  {
    id: "damage_1",
    group: "damage",
    title: "Damage +1",
    desc: "Bullets deal additional damage.",
    apply: (state) => { state.damage += 1; }
  },
  {
    id: "hp_1",
    group: "hp",
    title: "Max HP +1",
    desc: "You feel tougher.",
    apply: (state) => { state.maxHp += 1; state.hp += 1; }
  },
  {
    id: "move_1",
    group: "move",
    title: "Move Speed +15%",
    desc: "Run faster from zombies.",
    apply: (state) => { state.moveSpeed *= 1.15; }
  }
];

function pickRandomUpgrades(count, takenIds) {
  const pool = ALL_UPGRADES.filter(u => !takenIds.has(u.id));
  const result = [];
  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}
