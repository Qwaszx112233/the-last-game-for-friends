The Last Game For Friends — Stage 1 (ONLY sync battle ↔ base)

Этот ZIP содержит только файлы для ЭТАПА 1:

  /battle/game.js    ← сохранение результата боя (XP, kills, wave) в localStorage
  /base/resources.js ← конвертация XP → Tokens + выдача ресурсов на базе
  /base/baseScene.js ← применение награды при загрузке базы

Что делает Stage 1:

1. В бою (game.js)
   - В состояние добавлено поле totalXP.
   - При каждом получении XP:
        addXP(amount):
          this.state.xp += amount;
          this.state.totalXP += amount;
   - При убийстве зомби:
        this.state.kills += 1;
        const gainedXP = typeof zombie.xp === "number" ? zombie.xp : 1;
        this.addXP(gainedXP);

   - При завершении боя (endGame()):
        saveBattleResult("death") сохраняет в localStorage:
           key: "tlgf_lastBattle_v1"
           value: { reason, xp: totalXP, kills, wave, savedAt }

2. На базе (resources.js)
   - Добавлена функция applyLastBattleResult():
       - читает "tlgf_lastBattle_v1"
       - вычисляет награду:
            tokens = max(1, floor(xp / 5)) если xp > 0
            steel  = kills
            energy = floor(wave * 0.5)
            tech   = floor(wave / 5)
       - добавляет ресурсы через addResources({ ... })
       - удаляет ключ, чтобы награда не дублировалась.

3. На базе (baseScene.js)
   - При загрузке:
        loadResources();
        applyLastBattleResult();
        loadBuildingsState();
        initBaseUI();

Как установить:

  1) В папке /battle ЗАМЕНИ:
        game.js    ← на тот, что из ZIP

  2) В папке /base ЗАМЕНИ:
        resources.js ← на тот, что из ZIP
        baseScene.js ← на тот, что из ZIP

  3) Обнови игру в браузере (Ctrl+F5).

Проверка:

  - Запусти бой, убей несколько зомби, затем проиграй.
  - Зайди на базу (base.html).
  - При загрузке базы ресурсы (steel/energy/tech/tokens) должны увеличиться.
