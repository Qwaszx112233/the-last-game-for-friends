// Точка входу базової сцени
window.addEventListener("DOMContentLoaded", () => {
    console.log("Base scene init...");

    // Завантажуємо ресурси гравця
    loadResources();

    // Завантажуємо стан будівель
    loadBuildingsState();

    // Ініціалізуємо UI бази
    initBaseUI();

    console.log("Base fully loaded.");
});
