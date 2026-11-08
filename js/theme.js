/* =========================================================
   theme.js
   深色 / 淺色模式切換
   - 記住使用者選擇 (localStorage)
   - 第一次進站時跟隨系統設定
========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "quiz-dashboard-theme";
    const root = document.documentElement;

    function getSavedTheme() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved === "dark" || saved === "light") {
                return saved;
            }
        } catch (error) {
            /* 隱私模式等情況下 localStorage 可能無法使用 */
        }

        return null;
    }

    function getSystemTheme() {
        return window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    function updateButton(theme) {
        const button = document.getElementById("themeToggle");

        if (!button) {
            return;
        }

        const label =
            theme === "dark" ? "切換為淺色模式" : "切換為深色模式";

        button.setAttribute("aria-label", label);
        button.setAttribute("title", label);
        button.setAttribute("aria-pressed", String(theme === "dark"));
    }

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);

        const meta = document.querySelector('meta[name="theme-color"]');

        if (meta) {
            meta.setAttribute(
                "content",
                theme === "dark" ? "#0f172a" : "#f6f7fb"
            );
        }

        updateButton(theme);

        /* 讓已經畫好的圖表同步換色 */
        if (typeof window.refreshChartTheme === "function") {
            window.refreshChartTheme();
        }
    }

    /* 先套用,避免畫面閃一下白色 */
    root.setAttribute(
        "data-theme",
        getSavedTheme() || getSystemTheme()
    );

    function toggleTheme() {
        const next =
            root.getAttribute("data-theme") === "dark"
                ? "light"
                : "dark";

        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch (error) {
            /* 忽略 */
        }

        applyTheme(next);
    }

    document.addEventListener("DOMContentLoaded", function () {
        const button = document.getElementById("themeToggle");

        if (button) {
            button.addEventListener("click", toggleTheme);
        }

        applyTheme(root.getAttribute("data-theme"));
    });

    /* 使用者沒手動選過時,跟著系統變動 */
    if (window.matchMedia) {
        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", function (event) {
                if (!getSavedTheme()) {
                    applyTheme(event.matches ? "dark" : "light");
                }
            });
    }

    window.toggleTheme = toggleTheme;
})();
