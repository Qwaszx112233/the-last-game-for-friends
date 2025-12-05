The Last Game For Friends — Stage 1.3 (MAX integration)

This package contains fully integrated progression sync + CSP-safe Phaser:

  battle.html      → use in /battle/battle.html (local Phaser, no CDN)
  game.js          → use in /battle/game.js (saves XP/kills/wave on death)
  baseScene.js     → use in /base/baseScene.js (applies last battle rewards)
  resources.js     → use in /base/resources.js (adds applyLastBattleResult())
  phaser.min.js    → use in /battle/phaser.min.js (local Phaser 3 runtime)
  STAGE1_3_README.txt → optional doc

Behaviour (high level):

- During battle:
    • State now tracks totalXP in addition to current XP.
    • On each zombie kill: +1 XP, +1 kill, +1 totalXP.
    • When the player dies, endGame():
        - pauses physics
        - saves { reason: "death", xp: totalXP, kills, wave, savedAt } into
          localStorage key "tlgf_lastBattle_v1"
        - shows existing Game Over UI (no redirect).

- On base load (baseScene.js):
    • loadResources()
    • applyLastBattleResult()  ← NEW
    • loadBuildingsState()
    • initBaseUI()

- In resources.js:
    • applyLastBattleResult():
        - reads "tlgf_lastBattle_v1"
        - calculates rewards:
            tokens:  max(1, floor(xp / 5)) if xp > 0
            steel:   +1 per kill
            energy:  floor(wave * 0.5)
            tech:    floor(wave / 5)
        - calls addResources(...) to merge these into playerResources
        - deletes the key so rewards apply only once.

- Phaser:
    • battle.html no longer loads Phaser from CDN.
    • It uses local "phaser.min.js" instead (placed next to battle.html).
    • This avoids CSP eval-block problems on GitHub Pages.

Install order:

  1) Replace:
        /battle/battle.html   ← battle.html from this ZIP
        /battle/game.js       ← game.js from this ZIP
        /base/baseScene.js    ← baseScene.js from this ZIP
        /base/resources.js    ← resources.js from this ZIP

  2) Add:
        /battle/phaser.min.js ← from this ZIP

  3) Optionally:
        /docs/STAGE1_3_README.txt

After that:
  - Run a battle, die once.
  - Go back to base scene.
  - You should see your resources and tokens increased according to XP/kills/wave.
