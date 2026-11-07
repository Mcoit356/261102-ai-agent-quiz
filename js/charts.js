/* =========================================================
   charts.js
   AI Agent Quiz Dashboard
   Chart.js chart functions
========================================================= */


/* =========================================================
   Chart instances
========================================================= */

const DashboardCharts = {
    classChart: null,
    questionCharts: {}
};


/* =========================================================
   Load Chart.js
========================================================= */

function loadChartJS() {

    return new Promise((resolve, reject) => {

        if (typeof Chart !== "undefined") {
            resolve();
            return;
        }


        const existing =
            document.querySelector(
                'script[data-chartjs="true"]'
            );


        if (existing) {

            existing.addEventListener(
                "load",
                resolve
            );

            existing.addEventListener(
                "error",
                reject
            );

            return;
        }


        const script =
            document.createElement("script");


        script.src =
            "https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js";

        script.async = true;

        script.dataset.chartjs = "true";


        script.onload = () => {
            resolve();
        };


        script.onerror = () => {

            reject(
                new Error(
                    "Chart.js 載入失敗"
                )
            );

        };


        document.head.appendChild(script);

    });
}


/* =========================================================
   Class Doughnut Chart
========================================================= */

async function renderClassDoughnutChart(
    labels,
    values
) {

    try {

        await loadChartJS();

    } catch (error) {

        console.error(
            "Chart.js 載入失敗：",
            error
        );

        return;
    }


    const canvas =
        document.getElementById(
            "classDoughnutChart"
        );


    const empty =
        document.getElementById(
            "class-chart-empty"
        );


    if (!canvas) return;


    if (
        DashboardCharts.classChart
    ) {

        DashboardCharts.classChart.destroy();

        DashboardCharts.classChart =
            null;
    }


    /*
     * 沒有資料
     */

    if (
        !labels.length ||
        !values.length
    ) {

        if (empty) {
            empty.classList.add(
                "visible"
            );
        }

        return;
    }


    if (empty) {

        empty.classList.remove(
            "visible"
        );
    }


    const ctx =
        canvas.getContext("2d");


    DashboardCharts.classChart =
        new Chart(
            ctx,
            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [
                        {

                            data: values,

                            borderWidth: 2,

                            borderColor: "#ffffff"

                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "62%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                padding: 16,

                                usePointStyle: true,

                                font: {
                                    size: 11
                                }

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label: function(
                                    context
                                ) {

                                    const value =
                                        context.raw;

                                    const total =
                                        context.dataset.data
                                            .reduce(
                                                (
                                                    sum,
                                                    current
                                                ) =>
                                                    sum +
                                                    current,
                                                0
                                            );


                                    const percentage =
                                        total > 0
                                            ? (
                                                value /
                                                total *
                                                100
                                            ).toFixed(1)
                                            : 0;


                                    return (
                                        `${context.label}：` +
                                        `${value} 人 ` +
                                        `(${percentage}%)`
                                    );

                                }

                            }

                        }

                    }

                }

            }
        );
}


/* =========================================================
   Question Bar Chart
========================================================= */

async function renderQuestionBarChart(
    canvasId,
    counts,
    options = {}
) {

    try {

        await loadChartJS();

    } catch (error) {

        console.error(
            "Chart.js 載入失敗：",
            error
        );

        return;
    }


    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) return;


    /*
     * 如果同一張圖已經存在
     * 先刪除
     */

    if (
        DashboardCharts.questionCharts[
            canvasId
        ]
    ) {

        DashboardCharts.questionCharts[
            canvasId
        ].destroy();

    }


    const ctx =
        canvas.getContext("2d");


    const maxValue =
        Math.max(
            counts.A || 0,
            counts.B || 0,
            counts.C || 0,
            counts.D || 0
        );


    /*
     * Y 軸上限
     */

    const yMax =
        Math.max(
            1,
            maxValue + 1
        );


    DashboardCharts.questionCharts[
        canvasId
    ] = new Chart(
        ctx,
        {

            type: "bar",

            data: {

                labels: [
                    "A",
                    "B",
                    "C",
                    "D"
                ],

                datasets: [
                    {

                        label: "人數",

                        data: [

                            Number(
                                counts.A || 0
                            ),

                            Number(
                                counts.B || 0
                            ),

                            Number(
                                counts.C || 0
                            ),

                            Number(
                                counts.D || 0
                            )

                        ],

                        borderRadius: 8,

                        borderSkipped: false

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {
                        display: false
                    },

                    tooltip: {

                        callbacks: {

                            label: function(
                                context
                            ) {

                                return (
                                    ` ${context.raw} 人`
                                );

                            }

                        }

                    }

                },

                scales: {

                    x: {

                        title: {

                            display: true,

                            text: "選項"

                        },

                        grid: {
                            display: false
                        }

                    },

                    y: {

                        beginAtZero: true,

                        suggestedMax: yMax,

                        title: {

                            display: true,

                            text: "人數"

                        },

                        ticks: {

                            precision: 0,

                            stepSize: 1

                        }

                    }

                }

            }

        }
    );
}
