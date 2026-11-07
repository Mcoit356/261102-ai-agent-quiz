/* =========================================================
   dashboard.js
   AI Agent Quiz Dashboard
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    Dashboard.init();
});


const Dashboard = {

    /* =====================================================
       STATE
    ===================================================== */

    state: {
        data: null,
        students: [],
        questions: [],
        filteredStudents: [],
        selectedStudent: null,
        currentPage: "overview"
    },


    /* =====================================================
       INIT
    ===================================================== */

    async init() {

        this.bindNavigation();
        this.bindMobileMenu();
        this.bindStudentSearch();
        this.bindStudentFilter();
        this.bindStudentDetail();

        await this.loadData();
    },


    /* =====================================================
       LOAD DATA
    ===================================================== */

    async loadData() {

        try {

            this.showLoadingState();

            /*
             * 使用 api.js 提供的 getDashboardData()
             */
            const data = await getDashboardData();

            if (!data) {
                throw new Error("API 沒有回傳資料");
            }

            this.state.data = data;

            this.state.students = Array.isArray(data.students)
                ? data.students
                : [];

            this.state.questions = Array.isArray(data.questions)
                ? data.questions
                : [];

            this.state.filteredStudents = [
                ...this.state.students
            ];


            /* ---------------------------------------------
               Render
            --------------------------------------------- */

            this.renderOverview();

            this.renderClassChart();

            this.renderAnalysis();

            this.renderStudentClassFilter();

            this.renderStudents();


            this.hideLoadingState();

        } catch (error) {

    console.error("Dashboard 載入失敗：", error);

    const message =
        error && error.message
            ? error.message
            : "未知錯誤";

    this.showErrorState(
        `資料載入失敗：${message}`
    );
}
    },


    /* =====================================================
       NAVIGATION
    ===================================================== */

    bindNavigation() {

        const buttons = document.querySelectorAll(
            ".sidebar-nav button[data-page]"
        );

        buttons.forEach(button => {

            button.addEventListener("click", () => {

                const page = button.dataset.page;

                this.switchPage(page);

            });

        });
    },


    switchPage(page) {

        const pages = document.querySelectorAll(
            ".page-section"
        );

        const buttons = document.querySelectorAll(
            ".sidebar-nav button[data-page]"
        );


        /* ---------------------------------------------
           隱藏所有頁面
        --------------------------------------------- */

        pages.forEach(section => {

            section.classList.remove("active");

            section.style.display = "none";

        });


        /* ---------------------------------------------
           顯示指定頁面
        --------------------------------------------- */

        const target = document.getElementById(
            `page-${page}`
        );

        if (target) {

            target.classList.add("active");

            target.style.display = "block";

        }


        /* ---------------------------------------------
           更新 Sidebar active
        --------------------------------------------- */

        buttons.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


        this.state.currentPage = page;


        /* ---------------------------------------------
           手機版切換後關閉 Sidebar
        --------------------------------------------- */

        document.body.classList.remove(
            "sidebar-open"
        );
    },


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    bindMobileMenu() {

        const menuButton =
            document.querySelector(".mobile-menu-button");

        const overlay =
            document.querySelector(".sidebar-overlay");


        if (menuButton) {

            menuButton.addEventListener("click", () => {

                document.body.classList.toggle(
                    "sidebar-open"
                );

            });
        }


        if (overlay) {

            overlay.addEventListener("click", () => {

                document.body.classList.remove(
                    "sidebar-open"
                );

            });
        }
    },


    /* =====================================================
       OVERVIEW
    ===================================================== */

    renderOverview() {

        const data = this.state.data;

        if (!data) return;


        /* ---------------------------------------------
           KPI
        --------------------------------------------- */

        this.setText(
            "kpi-total",
            this.formatNumber(data.totalResponses)
        );


        const classCounts =
            data.classCounts || {};

        const participatedClasses =
            Object.values(classCounts)
                .filter(value => Number(value) > 0)
                .length;


        this.setText(
            "kpi-classes",
            participatedClasses
        );


        this.setText(
            "kpi-highest",
            this.formatScore(data.highestScore)
        );


        this.setText(
            "kpi-lowest",
            this.formatScore(data.lowestScore)
        );


        this.setText(
            "kpi-average",
            this.formatAverage(data.averageScore)
        );


        /* ---------------------------------------------
           Class list
        --------------------------------------------- */

        this.renderClassList();
    },


    /* =====================================================
       CLASS LIST
    ===================================================== */

    renderClassList() {

        const container =
            document.getElementById("class-list");

        if (!container) return;


        container.innerHTML = "";


        const classCounts =
            this.state.data.classCounts || {};


        const classList = [

            "進四企一A",
            "進四數商一A",
            "進四財一A",
            "進四資一A",
            "進四企二A",
            "進四資二A",
            "進四數商三A",
            "進四企四A",
            "進四文四A",
            "進四管四A",
            "四技資管四B"

        ];


        classList.forEach(className => {

            const count =
                Number(classCounts[className] || 0);


            /*
             * 沒有填答的人數也可以顯示，
             * 讓固定班級清單完整。
             */

            const item =
                document.createElement("div");

            item.className = "class-list-item";


            item.innerHTML = `
                <span class="class-name">
                    ${this.escapeHTML(className)}
                </span>

                <span class="class-count">
                    ${count}
                </span>
            `;


            container.appendChild(item);

        });
    },


    /* =====================================================
       CLASS DOUGHNUT
    ===================================================== */

    renderClassChart() {

        const data =
            this.state.data;

        if (!data) return;


        const classCounts =
            data.classCounts || {};


        const labels = [];
        const values = [];


        Object.entries(classCounts)
            .forEach(([className, count]) => {

                const value = Number(count) || 0;

                if (value > 0) {

                    labels.push(className);

                    values.push(value);

                }

            });


        /*
         * charts.js 如果有提供 class doughnut
         * 就交給 charts.js 處理。
         */

        if (
            typeof renderClassDoughnutChart === "function"
        ) {

            renderClassDoughnutChart(
                labels,
                values
            );

            return;
        }


        /*
         * 若 charts.js 沒有該函式，
         * dashboard 不會因此整頁壞掉。
         */

        console.warn(
            "renderClassDoughnutChart() 尚未存在於 charts.js"
        );
    },


    /* =====================================================
       ANALYSIS
    ===================================================== */

    renderAnalysis() {

        const container =
            document.getElementById("question-analysis");

        if (!container) return;


        container.innerHTML = "";


        const questions =
            this.state.questions;

        if (!questions.length) {

            container.innerHTML = `
                <div class="empty-state">
                    尚無題目資料
                </div>
            `;

            return;
        }


        questions.forEach((question, index) => {

            const questionNumber =
                index + 1;

            const card =
                document.createElement("div");

            card.className =
                "question-analysis-card";


            card.innerHTML = `

                <div class="question-analysis-header">

                    <div>

                        <div class="question-number">
                            Q${questionNumber}
                        </div>

                        <h3>
                            ${this.escapeHTML(
                                question.title || ""
                            )}
                        </h3>

                    </div>

                    <div class="question-answer">

                        正確答案：
                        <strong>
                            ${this.escapeHTML(
                                question.answer || "-"
                            )}
                        </strong>

                    </div>

                </div>


                <div class="question-chart-wrapper">

                    <canvas
                        id="questionChart-${questionNumber}">
                    </canvas>

                </div>

            `;


            container.appendChild(card);


            /*
             * 取得此題答案統計
             */

            const counts =
                this.calculateQuestionCounts(
                    questionNumber - 1
                );


            /*
             * 建立長條圖
             */

            this.renderQuestionChart(
                `questionChart-${questionNumber}`,
                counts
            );

        });
    },


    /* =====================================================
       QUESTION ANSWER COUNT
    ===================================================== */

    calculateQuestionCounts(questionIndex) {

        const counts = {
            A: 0,
            B: 0,
            C: 0,
            D: 0
        };


        this.state.students.forEach(student => {

            if (
                !Array.isArray(student.answers)
            ) {
                return;
            }


            const answer =
                String(
                    student.answers[questionIndex] || ""
                )
                    .trim()
                    .toUpperCase();


            if (
                Object.prototype.hasOwnProperty.call(
                    counts,
                    answer
                )
            ) {

                counts[answer]++;

            }

        });


        return counts;
    },


    /* =====================================================
       QUESTION BAR CHART
    ===================================================== */

    renderQuestionChart(canvasId, counts) {

        /*
         * 優先使用 charts.js
         */

        if (
            typeof renderQuestionBarChart === "function"
        ) {

            renderQuestionBarChart(
                canvasId,
                counts
            );

            return;
        }


        /*
         * 若 charts.js 尚未提供，
         * 使用 Chart.js fallback。
         */

        const canvas =
            document.getElementById(canvasId);

        if (
            !canvas ||
            typeof Chart === "undefined"
        ) {
            return;
        }


        /*
         * 避免重複建立 chart
         */

        if (canvas._chartInstance) {

            canvas._chartInstance.destroy();

        }


        canvas._chartInstance =
            new Chart(
                canvas.getContext("2d"),
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

                                label: "作答人數",

                                data: [
                                    counts.A,
                                    counts.B,
                                    counts.C,
                                    counts.D
                                ]

                            }
                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        plugins: {

                            legend: {
                                display: false
                            }

                        },

                        scales: {

                            y: {

                                beginAtZero: true,

                                ticks: {
                                    precision: 0
                                }

                            }

                        }

                    }

                }
            );
    },


    /* =====================================================
       STUDENTS
    ===================================================== */

    renderStudents() {

        const tbody =
            document.getElementById(
                "student-table-body"
            );

        if (!tbody) return;


        tbody.innerHTML = "";


        const students =
            this.state.filteredStudents;


        this.setText(
            "student-count",
            `${students.length} 人`
        );


        if (!students.length) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="empty-table"
                    >
                        找不到符合條件的測驗者
                    </td>

                </tr>

            `;

            return;
        }


        students.forEach((student, index) => {

            const tr =
                document.createElement("tr");


            tr.dataset.index = index;


            tr.innerHTML = `

                <td>
                    ${this.escapeHTML(
                        student.seat || "-"
                    )}
                </td>

                <td>
                    ${this.escapeHTML(
                        student.name || "未提供"
                    )}
                </td>

                <td>
                    ${this.escapeHTML(
                        student.class || "-"
                    )}
                </td>

                <td>
                    ${this.escapeHTML(
                        student.group || "-"
                    )}
                </td>

                <td>
                    <strong>
                        ${this.formatScore(
                            student.score
                        )}
                    </strong>
                    <span class="score-total">
                        /36
                    </span>
                </td>

                <td>
                    ${this.escapeHTML(
                        student.aiSpecial || "-"
                    )}
                </td>

                <td>
                    ${this.escapeHTML(
                        student.satisfaction || "-"
                    )}
                </td>

            `;


            tr.addEventListener(
                "click",
                () => {

                    this.showStudentDetail(
                        student
                    );

                }
            );


            tbody.appendChild(tr);

        });
    },


    /* =====================================================
       STUDENT SEARCH
    ===================================================== */

    bindStudentSearch() {

        const input =
            document.getElementById(
                "student-search"
            );

        if (!input) return;


        input.addEventListener(
            "input",
            () => {

                this.filterStudents();

            }
        );
    },


    /* =====================================================
       STUDENT CLASS FILTER
    ===================================================== */

    bindStudentFilter() {

        const select =
            document.getElementById(
                "student-class-filter"
            );

        if (!select) return;


        select.addEventListener(
            "change",
            () => {

                this.filterStudents();

            }
        );
    },


    /* =====================================================
       FILTER STUDENTS
    ===================================================== */

    filterStudents() {

        const searchInput =
            document.getElementById(
                "student-search"
            );

        const classSelect =
            document.getElementById(
                "student-class-filter"
            );


        const keyword =
            searchInput
                ? searchInput.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedClass =
            classSelect
                ? classSelect.value
                : "";


        this.state.filteredStudents =
            this.state.students.filter(
                student => {

                    const name =
                        String(
                            student.name || ""
                        )
                            .toLowerCase();


                    const seat =
                        String(
                            student.seat || ""
                        )
                            .toLowerCase();


                    const className =
                        String(
                            student.class || ""
                        )
                            .toLowerCase();


                    const matchesSearch =
                        !keyword ||
                        name.includes(keyword) ||
                        seat.includes(keyword) ||
                        className.includes(keyword);


                    const matchesClass =
                        !selectedClass ||
                        student.class === selectedClass;


                    return (
                        matchesSearch &&
                        matchesClass
                    );

                }
            );


        this.renderStudents();
    },


    /* =====================================================
       CLASS FILTER OPTIONS
    ===================================================== */

    renderStudentClassFilter() {

        const select =
            document.getElementById(
                "student-class-filter"
            );

        if (!select) return;


        const currentValue =
            select.value;


        const classSet =
            new Set();


        this.state.students.forEach(student => {

            if (student.class) {

                classSet.add(
                    student.class
                );

            }

        });


        const classList = [

            "進四企一A",
            "進四數商一A",
            "進四財一A",
            "進四資一A",
            "進四企二A",
            "進四資二A",
            "進四數商三A",
            "進四企四A",
            "進四文四A",
            "進四管四A",
            "四技資管四B"

        ];


        select.innerHTML = `

            <option value="">
                全部班級
            </option>

        `;


        classList.forEach(className => {

            /*
             * 只有有資料的班級才加入篩選器
             */

            if (!classSet.has(className)) {
                return;
            }


            const option =
                document.createElement("option");


            option.value =
                className;


            option.textContent =
                className;


            select.appendChild(option);

        });


        /*
         * 保留之前的選擇
         */

        if (
            classSet.has(currentValue)
        ) {

            select.value =
                currentValue;

        }
    },


    /* =====================================================
       STUDENT DETAIL
    ===================================================== */

    bindStudentDetail() {

        const closeButtons =
            document.querySelectorAll(
                "[data-close-student]"
            );


        closeButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    this.closeStudentDetail();

                }
            );

        });


        const modal =
            document.getElementById(
                "student-modal"
            );


        if (modal) {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        this.closeStudentDetail();

                    }

                }
            );

        }
    },


    showStudentDetail(student) {

        this.state.selectedStudent =
            student;


        const profile =
            document.getElementById(
                "student-profile"
            );


        const answers =
            document.getElementById(
                "student-answers"
            );


        if (profile) {

            profile.innerHTML = `

                <div class="student-profile-header">

                    <div class="student-profile-name">

                        ${this.escapeHTML(
                            student.name || "未提供"
                        )}

                    </div>

                    <div class="student-profile-score">

                        ${this.formatScore(
                            student.score
                        )}
                        <span>/36</span>

                    </div>

                </div>


                <div class="student-profile-grid">

                    <div>

                        <span>班級</span>

                        <strong>
                            ${this.escapeHTML(
                                student.class || "-"
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>座號</span>

                        <strong>
                            ${this.escapeHTML(
                                student.seat || "-"
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>組別</span>

                        <strong>
                            ${this.escapeHTML(
                                student.group || "-"
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>AI 特別題</span>

                        <strong>
                            ${this.escapeHTML(
                                student.aiSpecial || "-"
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>滿意度</span>

                        <strong>
                            ${this.escapeHTML(
                                student.satisfaction || "-"
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>填寫時間</span>

                        <strong>
                            ${this.escapeHTML(
                                student.time || "-"
                            )}
                        </strong>

                    </div>

                </div>

            `;
        }


        if (answers) {

            answers.innerHTML =
                this.buildStudentAnswerHTML(
                    student
                );

        }


        /*
         * 若 HTML 有獨立 detail 區塊，
         * 同時顯示。
         */

        const detail =
            document.getElementById(
                "student-detail"
            );


        if (detail) {

            detail.classList.add("active");

        }


        /*
         * 如果有 modal，開啟 modal
         */

        const modal =
            document.getElementById(
                "student-modal"
            );


        if (modal) {

            modal.classList.add("active");

            document.body.classList.add(
                "modal-open"
            );

        }
    },


    /* =====================================================
       BUILD STUDENT ANSWERS
    ===================================================== */

    buildStudentAnswerHTML(student) {

        const answers =
            Array.isArray(student.answers)
                ? student.answers
                : [];


        const questions =
            this.state.questions;


        if (!answers.length) {

            return `
                <div class="empty-state">
                    尚無作答資料
                </div>
            `;

        }


        let html = `

            <div class="student-answer-grid">

        `;


        questions.forEach(
            (question, index) => {

                const userAnswer =
                    String(
                        answers[index] || "-"
                    )
                        .trim()
                        .toUpperCase();


                const correctAnswer =
                    String(
                        question.answer || ""
                    )
                        .trim()
                        .toUpperCase();


                const isCorrect =
                    userAnswer === correctAnswer;


                html += `

                    <div class="
                        student-answer-item
                        ${isCorrect
                            ? "correct"
                            : "wrong"}
                    ">

                        <div class="
                            student-answer-question
                        ">

                            Q${index + 1}

                        </div>


                        <div class="
                            student-answer-value
                        ">

                            ${this.escapeHTML(
                                userAnswer
                            )}

                        </div>


                        <div class="
                            student-answer-status
                        ">

                            ${
                                isCorrect
                                    ? "正確"
                                    : "錯誤"
                            }

                        </div>

                    </div>

                `;
            }
        );


        html += `

            </div>

        `;


        return html;
    },


    /* =====================================================
       CLOSE STUDENT DETAIL
    ===================================================== */

    closeStudentDetail() {

        const modal =
            document.getElementById(
                "student-modal"
            );


        if (modal) {

            modal.classList.remove(
                "active"
            );

        }


        const detail =
            document.getElementById(
                "student-detail"
            );


        if (detail) {

            detail.classList.remove(
                "active"
            );

        }


        document.body.classList.remove(
            "modal-open"
        );


        this.state.selectedStudent =
            null;
    },


    /* =====================================================
       LOADING
    ===================================================== */

    showLoadingState() {

        const loading =
            document.getElementById(
                "dashboard-loading"
            );


        if (loading) {

            loading.style.display =
                "flex";

        }
    },


    hideLoadingState() {

        const loading =
            document.getElementById(
                "dashboard-loading"
            );


        if (loading) {

            loading.style.display =
                "none";

        }
    },


    /* =====================================================
       ERROR
    ===================================================== */

    showErrorState(message) {

        this.hideLoadingState();


        const container =
            document.querySelector(
                ".main-content"
            );


        if (!container) return;


        const error =
            document.createElement("div");


        error.className =
            "dashboard-error";


        error.innerHTML = `

            <div class="error-icon">
                ⚠
            </div>

            <div class="error-title">
                資料載入失敗
            </div>

            <div class="error-message">
                ${this.escapeHTML(message)}
            </div>

            <button
                class="error-retry"
                onclick="location.reload()"
            >
                重新載入
            </button>

        `;


        container.prepend(error);
    },


    /* =====================================================
       HELPERS
    ===================================================== */

    setText(id, value) {

        const element =
            document.getElementById(id);

        if (!element) return;

        element.textContent =
            value ?? "-";
    },


    formatNumber(value) {

        const number =
            Number(value);

        if (Number.isNaN(number)) {
            return "0";
        }

        return number.toLocaleString("zh-TW");
    },


    formatAverage(value) {

        const number =
            Number(value);

        if (Number.isNaN(number)) {
            return "0.00";
        }

        return number.toFixed(2);
    },


    formatScore(value) {

        const number =
            Number(value);

        if (Number.isNaN(number)) {
            return "0";
        }

        return Math.round(number);
    },


    escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

};
