
The Last Game For Friends — Stage 1.4 FULL

Что входит:
  battle.html   → /battle/battle.html
  game.js       → /battle/game.js
  player.js     → /battle/player.js
  baseScene.js  → /base/baseScene.js
  resources.js  → /base/resources.js
  phaser.min.js → /battle/phaser.min.js
  STAGE1_4_README.txt

Основные изменения:

1) Исправлен Player (player.js)
   - Больше не используется scene.physics.add.rectangle (этого метода нет в Phaser 3).
   - Теперь:
        this.sprite = scene.add.rectangle(...)
        scene.physics.add.existing(this.sprite)
        this.sprite.body.setCollideWorldBounds(true)
   - Движение, автострельба и урон работают как раньше, но без ошибок.

2) Battle logic (game.js)
   - В состояние добавлено totalXP:
        xp, totalXP, xpToNext, level, wave, kills...
   - addXP(amount):
        добавляет и в xp, и в totalXP.
   - При убийстве зомби:
        kills += 1; addXP(1);
   - В endGame():
        вызывается saveBattleResult("death"), который сохраняет:
           { reason, xp: totalXP, kills, wave, savedAt }
        в localStorage под ключом "tlgf_lastBattle_v1",
        затем показывается твой Game Over UI.

3) База (baseScene.js + resources.js)
   - baseScene.js при загрузке:
        loadResources();
        applyLastBattleResult();
        loadBuildingsState();
        initBaseUI();
   - В resources.js добавлена функция applyLastBattleResult():
        - читает "tlgf_lastBattle_v1";
        - считает награду:
             tokens = max(1, floor(xp / 5)) если xp > 0
             steel  = kills
             energy = floor(wave * 0.5)
             tech   = floor(wave / 5)
        - вызывает addResources({ steel, energy, tech, tokens });
        - удаляет ключ, чтобы награда выдавалась один раз.

4) Phaser / CSP (battle.html + phaser.min.js)
   - battle.html больше не грузит Phaser с CDN.
   - теперь:
        <script src="phaser.min.js"></script>
   - phaser.min.js лежит рядом с battle.html.
   - Это избавляет от ошибки CSP "blocks the use of eval".

Как установить:

  1) В своём проекте замени:
        /battle/battle.html   ← battle.html из ZIP
        /battle/game.js       ← game.js из ZIP
        /battle/player.js     ← player.js из ZIP
        /base/baseScene.js    ← baseScene.js из ZIP
        /base/resources.js    ← resources.js из ZIP

  2) Добавь:
        /battle/phaser.min.js ← phaser.min.js из ZIP

  3) (опционально)
        /docs/STAGE1_4_README.txt ← просто документация.

Потом:
  - Запусти battle.html.
  - Убедись, что ошибок в консоли нет.
  - Сыграй бой, умри.
  - Зайди на base.html → ресурсы и tokens должны увеличиться.
