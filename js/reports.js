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

        const pdfButton = document.getElementById("report-pdf-btn");

        if (pdfButton) {
            pdfButton.addEventListener("click", () => this.downloadPDF());
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
        this.renderSummary(filtered);
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
       題目統計（難度、鑑別度、迷思選項）
    --------------------------------------------- */

    difficultyLabel(rate) {

        if (rate >= 80) return { text: "容易", cls: "easy" };
        if (rate >= 50) return { text: "中等", cls: "medium" };
        if (rate >= 30) return { text: "偏難", cls: "hard" };
        return { text: "困難", cls: "hard" };
    },

    discriminationLabel(d) {

        if (d >= 0.4) return "優良";
        if (d >= 0.3) return "良好";
        if (d >= 0.2) return "尚可";
        if (d >= 0) return "待改進";
        return "需檢討";
    },

    questionStats(index, filtered) {

        const question = this.state.questions[index];

        const correct = String(question.answer || "")
            .trim().toUpperCase();

        const counts = Dashboard.calculateQuestionCounts(index, filtered);

        const total = Object.values(counts)
            .reduce((sum, value) => sum + value, 0);

        const correctCount = counts[correct] || 0;

        const rate = total ? (correctCount / total) * 100 : 0;

        /* 最常見的錯誤選項 */
        let wrongLetter = null;
        let wrongCount = 0;

        Object.keys(counts).forEach(letter => {
            if (letter !== correct && counts[letter] > wrongCount) {
                wrongLetter = letter;
                wrongCount = counts[letter];
            }
        });

        /* 高分組 / 低分組（各取前後 27%，至少 6 人才計算） */
        let high = null, low = null, discrimination = null;

        if (filtered.length >= 6) {

            const sorted = [...filtered].sort(
                (a, b) => Number(b.score) - Number(a.score)
            );

            const k = Math.max(1, Math.round(sorted.length * 0.27));

            const rateOf = group => {
                const hit = group.filter(student =>
                    String(
                        (student.answers || [])[index] || ""
                    ).trim().toUpperCase() === correct
                ).length;
                return hit / group.length;
            };

            high = { rate: rateOf(sorted.slice(0, k)), n: k };
            low = { rate: rateOf(sorted.slice(-k)), n: k };
            discrimination = high.rate - low.rate;
        }

        return {
            number: index + 1,
            title: question.title || "",
            correct,
            counts,
            total,
            unanswered: filtered.length - total,
            correctCount,
            rate,
            wrongLetter,
            wrongCount,
            high,
            low,
            discrimination
        };
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

            const st = this.questionStats(index, filtered);
            const choices = QUESTION_CHOICES[index] || [];

            const percent = value =>
                st.total ? Math.round((value / st.total) * 100) : 0;

            const diff = this.difficultyLabel(st.rate);

            const chips = [
                `<span class="detail-chip difficulty-${diff.cls}">
                    難度：${diff.text}
                </span>`
            ];

            if (st.discrimination === null) {
                chips.push(`<span class="detail-chip">
                    高低分組分析：人數不足（需至少 6 人）
                </span>`);
            } else {
                chips.push(`
                    <span class="detail-chip">
                        高分組答對率
                        ${Math.round(st.high.rate * 100)}%
                        （${st.high.n} 人）
                    </span>
                    <span class="detail-chip">
                        低分組答對率
                        ${Math.round(st.low.rate * 100)}%
                        （${st.low.n} 人）
                    </span>
                    <span class="detail-chip">
                        鑑別度 ${st.discrimination.toFixed(2)}
                        （${this.discriminationLabel(st.discrimination)}）
                    </span>
                `);
            }

            chips.push(
                st.wrongLetter
                    ? `<span class="detail-chip">
                        最常見錯誤選項：${st.wrongLetter}
                        （${st.wrongCount} 人）
                    </span>`
                    : `<span class="detail-chip">最常見錯誤選項：無</span>`
            );

            chips.push(
                `<span class="detail-chip">未作答 ${st.unanswered} 人</span>`
            );

            const card = document.createElement("article");
            card.className = "question-analysis-card";

            card.innerHTML = `

                <div class="question-analysis-header">

                    <div class="question-heading">
                        <div class="question-number">Q${st.number}</div>
                        <h3>${esc(st.title)}</h3>
                    </div>

                    <div class="question-answer">
                        正確答案：
                        <strong>${esc(st.correct || "-")}</strong>
                        <small class="question-rate">
                            答對率: ${st.correctCount}/${st.total} 人
                            (${percent(st.correctCount)}%)
                        </small>
                    </div>

                </div>

                <div class="question-detail-strip">
                    ${chips.join("")}
                </div>

                <div class="question-analysis-body">

                    <div class="question-chart-wrapper">
                        <canvas id="reportQuestionChart-${st.number}"></canvas>
                    </div>

                    <div class="question-options">

                        <div class="options-title">選項內容</div>

                        ${choices.map((choice, choiceIndex) => {

                            const letter =
                                String.fromCharCode(65 + choiceIndex);

                            return `
                                <div class="option-description ${
                                    letter === st.correct
                                        ? "correct-option" : ""
                                }">
                                    <span class="option-letter">${letter}</span>
                                    <div class="option-body">
                                        <span class="option-text">
                                            ${esc(choice)}
                                        </span>
                                        <div class="option-stat">
                                            選擇 ${st.counts[letter] || 0} 人
                                            (${percent(st.counts[letter] || 0)}%)
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
                    `reportQuestionChart-${st.number}`,
                    st.counts
                );
            }
        });
    },


    /* ---------------------------------------------
       總結
    --------------------------------------------- */

    median(values) {

        if (!values.length) return null;

        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);

        return sorted.length % 2
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    },

    stdDev(values) {

        if (values.length < 2) return null;

        const mean = values.reduce((a, b) => a + b, 0) / values.length;

        const variance = values.reduce(
            (sum, v) => sum + (v - mean) ** 2, 0
        ) / values.length;

        return Math.sqrt(variance);
    },

    /* 依欄位（小組 / 班級）算各組平均，回傳由高到低排序 */
    averageBy(filtered, field, fallback) {

        const map = new Map();

        filtered.forEach(student => {
            const key = student[field] || fallback;
            const score = Number(student.score);
            if (Number.isNaN(score)) return;

            if (!map.has(key)) map.set(key, []);
            map.get(key).push(score);
        });

        return [...map.entries()]
            .map(([name, scores]) => ({
                name,
                n: scores.length,
                avg: scores.reduce((a, b) => a + b, 0) / scores.length
            }))
            .sort((a, b) => b.avg - a.avg);
    },

    renderSummary(filtered) {

        const container = document.getElementById("report-summary");
        if (!container) return;

        const esc = value => Dashboard.escapeHTML(value);

        if (!filtered.length) {
            container.innerHTML =
                '<div class="empty-state">沒有符合條件的測驗者</div>';
            return;
        }

        const scores = filtered
            .map(s => Number(s.score))
            .filter(n => !Number.isNaN(n));

        const avg = this.average(filtered);
        const med = this.median(scores);
        const sd = this.stdDev(scores);
        const max = Math.max(...scores);
        const min = Math.min(...scores);

        const scope =
            (this.state.group === "all" ? "所有小組" : this.state.group) +
            " / " +
            (this.state.className === "all" ? "所有班級" : this.state.className);

        const stats = this.state.questions.map(
            (_, index) => this.questionStats(index, filtered)
        );

        const byRate = [...stats].sort((a, b) => a.rate - b.rate);
        const hardest = byRate.slice(0, 3);
        const easiest = [...byRate].reverse().slice(0, 3);

        const qText = list => list.map(
            q => `Q${q.number}（${Math.round(q.rate)}%）`
        ).join("、");

        const lowRate = stats
            .filter(q => q.rate < 50)
            .map(q => `Q${q.number}`);

        const lowDisc = stats
            .filter(q => q.discrimination !== null && q.discrimination < 0.2)
            .map(q => `Q${q.number}`);

        /* 最常見迷思：錯誤選項被選最多的題目 */
        const trap = [...stats]
            .filter(q => q.wrongLetter)
            .sort((a, b) => b.wrongCount - a.wrongCount)[0];

        const items = [];

        items.push(`
            <li>
                <strong>整體表現：</strong>
                統計範圍為「${esc(scope)}」，共 ${filtered.length} 人，
                平均 ${avg.toFixed(2)} 分，中位數 ${med} 分，
                ${sd === null ? "" : `標準差 ${sd.toFixed(2)}，`}
                最高 ${max} 分、最低 ${min} 分。
            </li>
        `);

        if (hardest.length) {
            items.push(`
                <li>
                    <strong>最需加強的題目：</strong>
                    ${qText(hardest)}。
                </li>
                <li>
                    <strong>表現最好的題目：</strong>
                    ${qText(easiest)}。
                </li>
            `);
        }

        items.push(`
            <li>
                <strong>答對率低於 50% 的題目：</strong>
                ${lowRate.length
                    ? `${lowRate.join("、")}，建議優先複習。`
                    : "沒有，各題答對率都在 50% 以上。"}
            </li>
        `);

        if (filtered.length >= 6) {
            items.push(`
                <li>
                    <strong>鑑別度偏低（低於 0.20）的題目：</strong>
                    ${lowDisc.length
                        ? `${lowDisc.join("、")}，高低分組差異不大，可檢視題目或選項是否需要調整。`
                        : "沒有，各題都能區分高低分組。"}
                </li>
            `);
        }

        if (trap) {
            items.push(`
                <li>
                    <strong>最明顯的迷思：</strong>
                    Q${trap.number} 有 ${trap.wrongCount} 人選了錯誤選項
                    ${trap.wrongLetter}（正確答案為 ${esc(trap.correct)}）。
                </li>
            `);
        }

        const groupRank = this.averageBy(filtered, "group", "未分組");
        const classRank = this.averageBy(filtered, "class", "未填班級");

        const rankText = (rank, label) => {

            if (rank.length < 2) return "";

            const top = rank[0];
            const bottom = rank[rank.length - 1];

            return `
                <li>
                    <strong>${label}比較：</strong>
                    平均最高為 ${esc(top.name)}
                    （${top.avg.toFixed(2)} 分，${top.n} 人），
                    最低為 ${esc(bottom.name)}
                    （${bottom.avg.toFixed(2)} 分，${bottom.n} 人），
                    相差 ${(top.avg - bottom.avg).toFixed(2)} 分。
                </li>
            `;
        };

        items.push(rankText(groupRank, "小組"));
        items.push(rankText(classRank, "班級"));

        container.innerHTML = `
            <article class="dashboard-card report-summary-card">
                <ul class="report-summary-list">
                    ${items.join("")}
                </ul>
                <p class="report-summary-note">
                    難度：答對率 80% 以上為容易、50–79% 為中等、
                    30–49% 為偏難、30% 以下為困難。
                    鑑別度＝高分組（前 27%）答對率 − 低分組（後 27%）答對率。
                </p>
            </article>
        `;
    },


    /* ---------------------------------------------
       下載 PDF（開啟列印視窗，目的地選「另存為 PDF」）
    --------------------------------------------- */

    downloadPDF() {

        const originalTitle = document.title;

        const group =
            this.state.group === "all" ? "所有小組" : this.state.group;
        const className =
            this.state.className === "all" ? "所有班級" : this.state.className;

        document.title = `測驗報告_${group}_${className}`;

        document.body.classList.add("printing-report");

        const restore = () => {
            document.body.classList.remove("printing-report");
            document.title = originalTitle;
            window.removeEventListener("afterprint", restore);
        };

        window.addEventListener("afterprint", restore);

        /* 等圖表依列印寬度重畫完再開列印視窗 */
        setTimeout(() => window.print(), 500);
    }
};

window.Reports = Reports;
