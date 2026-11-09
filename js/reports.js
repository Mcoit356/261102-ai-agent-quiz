/* =========================================================
   REPORTS（報告頁）
   - 篩選：小組 / 班級（各自獨立，預設全部）
   - 卡片：人數、平均分
   - 圖表：分數折線圖、小組人數長條圖（班級為折線）
   - 題目分析（依篩選結果重新統計）
========================================================= */

const Reports = {

    state: {
        students: [],
        questions: [],
        group: "all",
        className: "all"
    },

    charts: {},

    PALETTE: [
        "#ef4444", "#f97316", "#eab308", "#22c55e",
        "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6",
        "#d946ef", "#ec4899", "#84cc16", "#78716c"
    ],


    /* ---------------------------------------------
       INIT
    --------------------------------------------- */

    init(students, questions) {

        this.state.students = Array.isArray(students) ? students : [];
        this.state.questions = Array.isArray(questions) ? questions : [];
        this.state.group = "all";
        this.state.className = "all";

        this.buildFilters();
        this.bindEvents();
        this.render();
    },


    /* ---------------------------------------------
       FILTERS
    --------------------------------------------- */

    naturalGroupSort(a, b) {

        const num = text => {
            const match = String(text).match(/\d+/);
            return match ? Number(match[0]) : Infinity;
        };

        const diff = num(a) - num(b);

        if (diff !== 0 && !Number.isNaN(diff)) return diff;

        return String(a).localeCompare(String(b), "zh-Hant");
    },

    buildFilters() {

        const groupSelect = document.getElementById("report-group-filter");
        const classSelect = document.getElementById("report-class-filter");

        if (!groupSelect || !classSelect) return;

        const groups = [
            ...new Set(
                this.state.students.map(s => s.group || "未分組")
            )
        ].sort(this.naturalGroupSort);

        const classes = [
            ...new Set(
                this.state.students.map(s => s.class || "未填班級")
            )
        ].sort((a, b) => String(a).localeCompare(String(b), "zh-Hant"));

        const esc = value => Dashboard.escapeHTML(value);

        groupSelect.innerHTML =
            `<option value="all">所有小組</option>` +
            groups.map(
                g => `<option value="${esc(g)}">${esc(g)}</option>`
            ).join("");

        classSelect.innerHTML =
            `<option value="all">所有班級</option>` +
            classes.map(
                c => `<option value="${esc(c)}">${esc(c)}</option>`
            ).join("");

        groupSelect.value = "all";
        classSelect.value = "all";
    },

    bindEvents() {

        if (this.bound) return;
        this.bound = true;

        const groupSelect = document.getElementById("report-group-filter");
        const classSelect = document.getElementById("report-class-filter");
        const resetButton = document.getElementById("report-filter-reset");

        if (groupSelect) {
            groupSelect.addEventListener("change", () => {
                this.state.group = groupSelect.value;
                this.render();
            });
        }

        if (classSelect) {
            classSelect.addEventListener("change", () => {
                this.state.className = classSelect.value;
                this.render();
            });
        }

        if (resetButton) {
            resetButton.addEventListener("click", () => {
                this.state.group = "all";
                this.state.className = "all";
                if (groupSelect) groupSelect.value = "all";
                if (classSelect) classSelect.value = "all";
                this.render();
            });
        }
    },

    getFilteredStudents() {

        return this.state.students.filter(student => {

            const group = student.group || "未分組";
            const className = student.class || "未填班級";

            return (
                (this.state.group === "all" ||
                    group === this.state.group) &&
                (this.state.className === "all" ||
                    className === this.state.className)
            );
        });
    },


    /* ---------------------------------------------
       RENDER
    --------------------------------------------- */

    render() {

        const filtered = this.getFilteredStudents();

        this.renderKpi(filtered);
        this.renderScoreChart(filtered);
        this.renderGroupChart(filtered);
        this.renderQuestions(filtered);
    },

    average(students) {

        const scores = students
            .map(s => Number(s.score))
            .filter(n => !Number.isNaN(n));

        if (!scores.length) return null;

        return scores.reduce((a, b) => a + b, 0) / scores.length;
    },

    setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    renderKpi(filtered) {

        const total = this.state.students.length;

        this.setText(
            "report-kpi-count",
            `${filtered.length}/${total}`
        );

        const avg = this.average(filtered);
        const overallAvg = this.average(this.state.students);

        this.setText(
            "report-kpi-average",
            avg === null ? "-" : avg.toFixed(2)
        );

        this.setText(
            "report-kpi-average-note",
            overallAvg === null
                ? "平均分數"
                : `全體平均 ${overallAvg.toFixed(2)}`
        );
    },


    /* ---------------------------------------------
       CHART HELPERS
    --------------------------------------------- */

    themeColors() {

        const css = getComputedStyle(document.documentElement);

        return {
            text: css.getPropertyValue("--text-main").trim() || "#374151",
            muted: css.getPropertyValue("--text-muted").trim() || "#6B7280",
            grid: css.getPropertyValue("--border").trim() || "#e5e7eb"
        };
    },

    destroyChart(key) {
        if (this.charts[key]) {
            this.charts[key].destroy();
            this.charts[key] = null;
        }
    },

    toggleEmpty(canvasId, isEmpty) {

        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const wrapper = canvas.parentElement;
        const empty = wrapper.querySelector(".report-chart-empty");

        canvas.style.visibility = isEmpty ? "hidden" : "visible";
        if (empty) empty.hidden = !isEmpty;
    },


    /* ---------------------------------------------
       分數折線圖（x：分數每 2 分一格，y：人數）
    --------------------------------------------- */

    async renderScoreChart(filtered) {

        const canvasId = "reportScoreChart";
        const canvas = document.getElementById(canvasId);

        if (!canvas || typeof window.loadChartJS !== "function") return;

        this.toggleEmpty(canvasId, !filtered.length);

        const Chart = await window.loadChartJS();

        this.destroyChart(canvasId);

        if (!filtered.length) return;

        const MAX = 36, STEP = 2;
        const binCount = Math.floor(MAX / STEP) + 1;

        const labels = Array.from(
            { length: binCount }, (_, i) => String(i * STEP)
        );
        const counts = new Array(binCount).fill(0);

        filtered.forEach(student => {
            const score = Number(student.score);
            if (Number.isNaN(score)) return;

            const bin = Math.min(
                Math.max(Math.floor(score / STEP), 0),
                binCount - 1
            );
            counts[bin] += 1;
        });

        const colors = this.themeColors();

        const rangeText = index => {
            const start = index * STEP;
            return index === binCount - 1
                ? `${start} 分`
                : `${start}–${start + STEP - 1} 分`;
        };

        this.charts[canvasId] = new Chart(canvas.getContext("2d"), {
            type: "line",

            data: {
                labels,
                datasets: [{
                    label: "人數",
                    data: counts,
                    borderColor: "#4f46e5",
                    backgroundColor: "rgba(79, 70, 229, 0.10)",
                    borderWidth: 2.5,
                    tension: 0,           /* 直線連接 */
                    fill: true,
                    pointRadius: 3.5,
                    pointHoverRadius: 5,
                    pointBackgroundColor: "#4f46e5"
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: items => rangeText(items[0].dataIndex),
                            label: item => `人數：${item.parsed.y} 人`
                        }
                    }
                },

                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.text, maxRotation: 0 },
                        title: {
                            display: true,
                            text: "分數（每 2 分一格）",
                            color: colors.muted
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: colors.grid },
                        ticks: {
                            color: colors.text,
                            precision: 0,
                            stepSize: 1
                        },
                        title: {
                            display: true,
                            text: "人數",
                            color: colors.muted
                        }
                    }
                }
            }
        });
    },


    /* ---------------------------------------------
       組成人數長條圖
       x：小組　y：人數
       長條 = 各小組總人數；每個班級 = 一條折線（點）
    --------------------------------------------- */

    async renderGroupChart(filtered) {

        const canvasId = "reportGroupChart";
        const canvas = document.getElementById(canvasId);

        if (!canvas || typeof window.loadChartJS !== "function") return;

        this.toggleEmpty(canvasId, !filtered.length);

        const Chart = await window.loadChartJS();

        this.destroyChart(canvasId);

        if (!filtered.length) return;

        const groups = [
            ...new Set(filtered.map(s => s.group || "未分組"))
        ].sort(this.naturalGroupSort);

        const classes = [
            ...new Set(filtered.map(s => s.class || "未填班級"))
        ].sort((a, b) => String(a).localeCompare(String(b), "zh-Hant"));

        const groupTotals = groups.map(group =>
            filtered.filter(s => (s.group || "未分組") === group).length
        );

        const classDatasets = classes.map((className, index) => {

            const color = this.PALETTE[index % this.PALETTE.length];

            return {
                type: "line",
                label: className,
                order: 1,

                data: groups.map(group =>
                    filtered.filter(s =>
                        (s.group || "未分組") === group &&
                        (s.class || "未填班級") === className
                    ).length
                ),

                borderColor: color,
                backgroundColor: color,
                borderWidth: 1.5,
                tension: 0,
                spanGaps: false,

                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: color
            };
        });

        const colors = this.themeColors();

        this.charts[canvasId] = new Chart(canvas.getContext("2d"), {
            type: "bar",

            data: {
                labels: groups,
                datasets: [
                    {
                        type: "bar",
                        label: "小組總人數",
                        order: 2,
                        data: groupTotals,
                        backgroundColor: "rgba(79, 70, 229, 0.28)",
                        borderColor: "#4f46e5",
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    ...classDatasets
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                interaction: { mode: "index", intersect: false },

                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: colors.text,
                            boxWidth: 12,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        filter: item => item.parsed.y > 0,
                        callbacks: {
                            label: item =>
                                `${item.dataset.label}：${item.parsed.y} 人`
                        }
                    }
                },

                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.text },
                        title: {
                            display: true,
                            text: "小組",
                            color: colors.muted
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: colors.grid },
                        ticks: {
                            color: colors.text,
                            precision: 0,
                            stepSize: 1
                        },
                        title: {
                            display: true,
                            text: "人數",
                            color: colors.muted
                        }
                    }
                }
            }
        });
    },


    /* ---------------------------------------------
       題目分析（依篩選結果）
    --------------------------------------------- */

    renderQuestions(filtered) {

        const container = document.getElementById("report-question-analysis");
        if (!container) return;

        const esc = value => Dashboard.escapeHTML(value);

        container.innerHTML = "";

        if (!this.state.questions.length) {
            container.innerHTML =
                '<div class="empty-state">尚無題目資料</div>';
            return;
        }

        if (!filtered.length) {
            container.innerHTML =
                '<div class="empty-state">沒有符合條件的測驗者</div>';
            return;
        }

        this.state.questions.forEach((question, index) => {

            const number = index + 1;
            const choices = QUESTION_CHOICES[index] || [];

            const counts =
                Dashboard.calculateQuestionCounts(index, filtered);

            const total = Object.values(counts)
                .reduce((sum, value) => sum + value, 0);

            const correct = String(question.answer || "")
                .trim().toUpperCase();

            const correctCount = counts[correct] || 0;

            const percent = value =>
                total ? Math.round((value / total) * 100) : 0;

            const card = document.createElement("article");
            card.className = "question-analysis-card";

            card.innerHTML = `

                <div class="question-analysis-header">

                    <div class="question-heading">
                        <div class="question-number">Q${number}</div>
                        <h3>${esc(question.title || "")}</h3>
                    </div>

                    <div class="question-answer">
                        正確答案：
                        <strong>${esc(question.answer || "-")}</strong>
                        <small class="question-rate">
                            答對率: ${correctCount}/${total} 人
                            (${percent(correctCount)}%)
                        </small>
                    </div>

                </div>

                <div class="question-analysis-body">

                    <div class="question-chart-wrapper">
                        <canvas id="reportQuestionChart-${number}"></canvas>
                    </div>

                    <div class="question-options">

                        <div class="options-title">選項內容</div>

                        ${choices.map((choice, choiceIndex) => {

                            const letter =
                                String.fromCharCode(65 + choiceIndex);

                            return `
                                <div class="option-description ${
                                    letter === correct ? "correct-option" : ""
                                }">
                                    <span class="option-letter">${letter}</span>
                                    <div class="option-body">
                                        <span class="option-text">
                                            ${esc(choice)}
                                        </span>
                                        <div class="option-stat">
                                            選擇 ${counts[letter] || 0} 人
                                            (${percent(counts[letter] || 0)}%)
                                        </div>
                                    </div>
                                </div>
                            `;

                        }).join("")}

                    </div>

                </div>
            `;

            container.appendChild(card);

            if (typeof window.renderQuestionBarChart === "function") {
                window.renderQuestionBarChart(
                    `reportQuestionChart-${number}`,
                    counts
                );
            }
        });
    }
};

window.Reports = Reports;
                                 
