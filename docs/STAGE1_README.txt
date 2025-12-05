The Last Game For Friends — Stage 1 (Battle ↔ Base integration, flat package)

Files in this ZIP:
  - game.js        → place into /battle/game.js
  - baseScene.js   → place into /base/baseScene.js
  - resources.js   → place into /base/resources.js
  - STAGE1_README.txt → optional, e.g. /docs/STAGE1_README.txt

Summary of behaviour:

1) battle/game.js
   - Tracks totalXP during the run.
   - On each zombie kill: +1 XP, +1 kill counter.
   - On player death:
       - Saves object to localStorage under key "tlgf_lastBattle_v1":
             { reason: "death", xp, kills, wave, savedAt }
       - Shows existing Game Over UI.

2) base/resources.js
   - Adds function applyLastBattleResult().
   - When called, it:
       - Reads "tlgf_lastBattle_v1" from localStorage.
       - Computes rewards:
             tokens: at least 1, or floor(xp / 5)
             steel:  +1 per kill
             energy: ~half of final wave
             tech:   +1 per 5 waves
       - Calls addResources(...) to merge these into playerResources.
       - Removes the key from localStorage so rewards are applied only once.

3) base/baseScene.js
   - On DOMContentLoaded:
       - Calls loadResources().
       - Calls applyLastBattleResult() to apply the last battle's rewards.
       - Calls loadBuildingsState().
       - Calls initBaseUI() as before.

This package is designed to be dropped into your existing project
without breaking layouts or other logic.
