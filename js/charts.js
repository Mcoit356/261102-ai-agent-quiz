/* =========================================================
   charts.js
   AI Agent Quiz Dashboard
   Chart.js 4.4.7
========================================================= */

(function () {
    "use strict";

    /* =====================================================
       Chart.js CDN
    ===================================================== */

    const CHART_JS_URL =
        "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";

    let chartJsPromise = null;

    function loadChartJS() {
        // 已經載入
        if (window.Chart) {
            return Promise.resolve(window.Chart);
        }

        // 正在載入
        if (chartJsPromise) {
            return chartJsPromise;
        }

        chartJsPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector(
                'script[src*="chart.js"]'
            );

            if (existingScript) {
                existingScript.addEventListener("load", () => {
                    if (window.Chart) {
                        resolve(window.Chart);
                    } else {
                        reject(new Error("Chart.js 載入後找不到 Chart。"));
                    }
                });

                existingScript.addEventListener("error", () => {
                    reject(new Error("Chart.js 載入失敗。"));
                });

                return;
            }

            const script = document.createElement("script");

            script.src = CHART_JS_URL;
            script.async = true;

            script.onload = () => {
                if (window.Chart) {
                    resolve(window.Chart);
                } else {
                    reject(new Error("Chart.js 載入後找不到 Chart。"));
                }
            };

            script.onerror = () => {
                reject(new Error("Chart.js CDN 載入失敗。"));
            };

            document.head.appendChild(script);
        });

        return chartJsPromise;
    }


    /* =====================================================
       Chart Registry
       避免同一個 canvas 重複建立 Chart
    ===================================================== */

    const chartRegistry = new Map();


    function destroyChart(canvasId) {
        const oldChart = chartRegistry.get(canvasId);

        if (oldChart) {
            try {
                oldChart.destroy();
            } catch (error) {
                console.warn("Chart destroy error:", error);
            }

            chartRegistry.delete(canvasId);
        }

        // 如果 Chart.js 有自己的 registry，也同步處理
        const canvas = document.getElementById(canvasId);

        if (canvas && window.Chart) {
            const existingChart = window.Chart.getChart(canvas);

            if (existingChart) {
                try {
                    existingChart.destroy();
                } catch (error) {
                    console.warn("Existing Chart destroy error:", error);
                }
            }
        }
    }


    /* =====================================================
       共用設定
    ===================================================== */

    const FONT_FAMILY =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", Arial, sans-serif';


    const COLORS = {
        A: "#3B82F6", // 藍
        B: "#22C55E", // 綠
        C: "#F59E0B", // 橘
        D: "#8B5CF6"  // 紫
    };


    const CLASS_COLORS = [
        "#3B82F6",
        "#22C55E",
        "#F59E0B",
        "#8B5CF6",
        "#EF4444",
        "#06B6D4",
        "#EC4899",
        "#84CC16",
        "#F97316",
        "#14B8A6",
        "#6366F1"
    ];


    /* =====================================================
       數值處理
    ===================================================== */

    function normalizeNumber(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return 0;
        }

        return number;
    }


    function normalizeCounts(counts) {
        if (!counts) {
            return {
                A: 0,
                B: 0,
                C: 0,
                D: 0
            };
        }

        // 支援：
        // { A: 3, B: 4, C: 2, D: 2 }
        return {
            A: normalizeNumber(counts.A),
            B: normalizeNumber(counts.B),
            C: normalizeNumber(counts.C),
            D: normalizeNumber(counts.D)
        };
    }


    /* =====================================================
       Tooltip 共用設定
    ===================================================== */

    function getTooltipConfig() {
        return {
            enabled: true,

            backgroundColor: "rgba(17, 24, 39, 0.94)",

            titleColor: "#FFFFFF",
            bodyColor: "#FFFFFF",

            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,

            padding: 10,

            titleFont: {
                family: FONT_FAMILY,
                size: 12,
                weight: "700"
            },

            bodyFont: {
                family: FONT_FAMILY,
                size: 12,
                weight: "500"
            },

            displayColors: true,

            callbacks: {
                label: function (context) {
                    const value = context.parsed.y ?? context.parsed;

                    return ` ${value} 人`;
                }
            }
        };
    }


    /* =====================================================
       建立班級甜甜圈圖
       
       dashboard.js:
       renderClassDoughnutChart(labels, values)
    ===================================================== */

    async function renderClassDoughnutChart(labels, values) {
        const canvas = document.getElementById("classDoughnutChart");

        if (!canvas) {
            console.warn(
                '找不到 canvas：#classDoughnutChart'
            );

            return null;
        }

        try {
            const Chart = await loadChartJS();

            destroyChart("classDoughnutChart");

            const safeLabels = Array.isArray(labels)
                ? labels
                : [];

            const safeValues = Array.isArray(values)
                ? values.map(normalizeNumber)
                : [];

            const ctx = canvas.getContext("2d");

            if (!ctx) {
                console.warn("無法取得 classDoughnutChart canvas context。");
                return null;
            }

            const chart = new Chart(ctx, {
                type: "doughnut",

                data: {
                    labels: safeLabels,

                    datasets: [
                        {
                            data: safeValues,

                            backgroundColor: safeLabels.map(
                                (_, index) =>
                                    CLASS_COLORS[
                                        index % CLASS_COLORS.length
                                    ]
                            ),

                            borderColor: "#FFFFFF",

                            borderWidth: 2,

                            hoverOffset: 8
                        }
                    ]
                },

                options: {
                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "62%",

                    layout: {
                        padding: 8
                    },

                    plugins: {
                        legend: {
                            display: true,

                            position: "right",

                            labels: {
                                usePointStyle: true,

                                pointStyle: "circle",

                                padding: 12,

                                color: "#374151",

                                font: {
                                    family: FONT_FAMILY,
                                    size: 11,
                                    weight: "500"
                                }
                            }
                        },

                        tooltip: {
                            enabled: true,

                            backgroundColor: "rgba(17, 24, 39, 0.94)",

                            titleColor: "#FFFFFF",

                            bodyColor: "#FFFFFF",

                            padding: 10,

                            callbacks: {
                                label: function (context) {
                                    const label =
                                        context.label || "";

                                    const value =
                                        normalizeNumber(
                                            context.raw
                                        );

                                    return ` ${label}：${value} 人`;
                                }
                            }
                        }
                    }
                }
            });

            chartRegistry.set(
                "classDoughnutChart",
                chart
            );

            return chart;

        } catch (error) {
            console.error(
                "班級甜甜圈圖建立失敗：",
                error
            );

            return null;
        }
    }


    /* =====================================================
       建立每題 A/B/C/D 直式長條圖

       dashboard.js:
       renderQuestionBarChart(canvasId, counts)

       counts:
       {
           A: 3,
           B: 5,
           C: 2,
           D: 1
       }
    ===================================================== */

    async function renderQuestionBarChart(canvasId, counts) {
        const canvas = document.getElementById(canvasId);

        if (!canvas) {
            console.warn(
                `找不到題目圖表 canvas：#${canvasId}`
            );

            return null;
        }

        try {
            const Chart = await loadChartJS();

            destroyChart(canvasId);

            const normalized = normalizeCounts(counts);

            const labels = ["A", "B", "C", "D"];

            const data = [
                normalized.A,
                normalized.B,
                normalized.C,
                normalized.D
            ];

            const ctx = canvas.getContext("2d");

            if (!ctx) {
                console.warn(
                    `無法取得 ${canvasId} canvas context。`
                );

                return null;
            }

            const chart = new Chart(ctx, {
                type: "bar",

                data: {
                    labels: labels,

                    datasets: [
                        {
                            label: "作答人數",

                            data: data,

                            backgroundColor: [
                                COLORS.A,
                                COLORS.B,
                                COLORS.C,
                                COLORS.D
                            ],

                            borderColor: [
                                COLORS.A,
                                COLORS.B,
                                COLORS.C,
                                COLORS.D
                            ],

                            borderWidth: 1,

                            borderRadius: 7,

                            borderSkipped: false,

                            maxBarThickness: 70
                        }
                    ]
                },

                options: {
                    responsive: true,

                    maintainAspectRatio: false,

                    animation: {
                        duration: 500
                    },

                    interaction: {
                        intersect: false,

                        mode: "index"
                    },

                    scales: {
                        x: {
                            beginAtZero: true,

                            grid: {
                                display: false
                            },

                            border: {
                                display: false
                            },

                            ticks: {
                                color: "#374151",

                                font: {
                                    family: FONT_FAMILY,
                                    size: 13,
                                    weight: "700"
                                }
                            },

                            title: {
                                display: false
                            }
                        },

                        y: {
                            beginAtZero: true,

                            min: 0,

                            ticks: {
                                precision: 0,

                                stepSize: 1,

                                color: "#6B7280",

                                font: {
                                    family: FONT_FAMILY,
                                    size: 11,
                                    weight: "500"
                                }
                            },

                            grid: {
                                color: "rgba(107, 114, 128, 0.12)",

                                drawBorder: false
                            },

                            border: {
                                display: false
                            },

                            title: {
    display: true,

    text: "人數",

    color: "#374151",

    font: {
        family: FONT_FAMILY,
        size: 12,
        weight: "700"
    },

    padding: {
        bottom: 8
    },

    // 強制 Y 軸標題保持水平
    rotation: 0
}
                        }
                    },

                    plugins: {
                        legend: {
                            display: false
                        },

                        tooltip: getTooltipConfig()
                    }
                }
            });

            chartRegistry.set(
                canvasId,
                chart
            );

            return chart;

        } catch (error) {
            console.error(
                `題目圖表 ${canvasId} 建立失敗：`,
                error
            );

            return null;
        }
    }


    /* =====================================================
       更新既有題目圖表
       如果之後 dashboard.js 需要動態更新，可以使用
    ===================================================== */

    function updateQuestionBarChart(canvasId, counts) {
        const chart = chartRegistry.get(canvasId);

        if (!chart) {
            return renderQuestionBarChart(
                canvasId,
                counts
            );
        }

        const normalized = normalizeCounts(counts);

        chart.data.datasets[0].data = [
            normalized.A,
            normalized.B,
            normalized.C,
            normalized.D
        ];

        chart.update();

        return chart;
    }


    /* =====================================================
       清除全部圖表
    ===================================================== */

    function destroyAllCharts() {
        chartRegistry.forEach((chart, canvasId) => {
            try {
                chart.destroy();
            } catch (error) {
                console.warn(
                    `清除 ${canvasId} 圖表失敗：`,
                    error
                );
            }
        });

        chartRegistry.clear();
    }


    /* =====================================================
       重新調整所有圖表
    ===================================================== */

    function resizeAllCharts() {
        chartRegistry.forEach((chart) => {
            try {
                chart.resize();
            } catch (error) {
                console.warn(
                    "Chart resize error:",
                    error
                );
            }
        });
    }


    /* =====================================================
       視窗尺寸改變
    ===================================================== */

    let resizeTimer = null;

    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            resizeAllCharts();
        }, 150);
    });


    /* =====================================================
       對外公開
       
       dashboard.js 可以直接呼叫：
       
       renderClassDoughnutChart(...)
       renderQuestionBarChart(...)
    ===================================================== */

    window.renderClassDoughnutChart =
        renderClassDoughnutChart;

    window.renderQuestionBarChart =
        renderQuestionBarChart;

    window.updateQuestionBarChart =
        updateQuestionBarChart;

    window.destroyAllCharts =
        destroyAllCharts;

    window.loadChartJS =
        loadChartJS;

})();
