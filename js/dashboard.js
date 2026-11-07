/* =========================================================
   dashboard.js
   AI Agent Quiz Dashboard
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
    Dashboard.init();
});


/* =========================================================
   GOOGLE FORM 題目選項
   Q1 ～ Q15
========================================================= */

const QUESTION_CHOICES = [

    // Q1
    [
        "規則式 AI 依規則判斷；機器學習從資料找規律；深度學習使用多層神經網路；生成式 AI 產生新內容；代理式 AI 依目標規劃與行動。",
        "規則式 AI 從資料找規律；機器學習依規則判斷；深度學習產生新內容；生成式 AI 使用多層神經網路；代理式 AI 只分類或估計機率。",
        "規則式 AI 依目標規劃與行動；機器學習產生新內容；深度學習依規則判斷；生成式 AI 從資料找規律；代理式 AI 使用多層神經網路。",
        "五種技術必須依序取代前一種，不能並存或搭配。"
    ],

    // Q2
    [
        "預測－整理會議紀錄草稿－輸出文字與圖片。",
        "行動－建立後續工作項目－造成系統狀態改變，並需事前授權與事後追蹤。",
        "生成－估計議題延誤風險－輸出分類或機率。",
        "行動－整理會議紀錄草稿－只需人員解讀。"
    ],

    // Q3
    [
        "組織層－資料來源與版本管理；運行層－任務交辦與輸出格式；執行層－狀態保存與持續監控；知識層－角色分工與決策責任；互動層－流程安排與工具權限。",
        "組織層－流程安排與工具權限；運行層－角色分工與決策責任；執行層－任務交辦與輸出格式；知識層－狀態保存與持續監控；互動層－資料來源與版本管理。",
        "組織層－角色分工與決策責任；運行層－狀態保存與持續監控；執行層－流程安排與工具權限；知識層－資料來源與版本管理；互動層－任務交辦與輸出格式。",
        "五層只負責模型能力，不涉及管理責任或任務交辦。"
    ],

    // Q4
    [
        "DL 包含 ML，ML 包含 AI；這代表 DL 的能力排名最高。",
        "AI、ML、DL 是彼此無關的三種技術。",
        "ML 是 AI 的同義詞，DL 則是生成式 AI 的另一個名稱。",
        "AI 範疇包含 ML，ML 範疇包含 DL；這是範圍包含關係，不是能力排名。"
    ],

    // Q5
    [
        "生成式 AI 依輸入生成文字或圖像等內容；LLM 是處理與生成語言的模型；代理式 AI 依目標規劃並使用工具。",
        "生成式 AI 是工具連接標準；LLM 是代理執行環境；代理式 AI 是單次處理可容納的資訊範圍。",
        "生成式 AI 只負責核對來源；LLM 負責管理工具權限；代理式 AI 只產生文字。",
        "三者都是同一種模型的不同名稱。"
    ],

    // Q6
    [
        "詞元是保留供後續使用的任務狀態；上下文視窗是用來連接外部工具的標準。",
        "詞元是模型處理文字的基本單位；上下文視窗是單次處理可容納的資訊範圍。",
        "詞元是任務方法與操作規範；上下文視窗是系統交換資料的介面。",
        "詞元是每次互動的狀態；上下文視窗是代理執行支援與控制框架。"
    ],

    // Q7
    [
        "提示詞保存歷次會議文件；上下文負責指定最大輪次與停止條件。",
        "提示詞是系統交換資料的介面；上下文是具體操作文件的能力。",
        "提示詞交代目標、指定格式與界定限制；上下文提供逐字稿、議程、背景與資料版本等資訊。",
        "提示詞與上下文都只代表模型處理文字的基本單位。"
    ],

    // Q8
    [
        "知識庫負責逐步生成文字；RAG 保存所有當次記憶；記憶負責連接外部工具與資料。",
        "知識庫是代理執行循環；RAG 是任務觸發條件；記憶是工具操作權限。",
        "三者都是單次處理可容納的資訊範圍。",
        "知識庫保存相關依據；RAG 取回相關資料再生成回答；記憶保留可供後續使用的資訊或狀態，且需經選取才進入當次上下文。"
    ],

    // Q9
    [
        "工作流程預先安排處理順序與分支；代理依目標與狀態決定下一步，並可透過觀察、規劃、行動與驗證的循環運作。",
        "工作流程依目標與狀態自主決定下一步；代理只能依預先安排的固定順序執行。",
        "工作流程與代理都只指模型處理文字的基本單位。",
        "代理執行不需要驗證、完成條件或停止條件。"
    ],

    // Q10
    [
        "Skill 是任務方法與操作規範；Tool 是執行具體操作的能力；API 是系統交換資料或呼叫功能的介面；MCP 標準化工具與資源的連接方式；Gateway 管理入口、路由或連接。",
        "Skill 是外部工具入口；Tool 是任務交辦格式；API 是代理記憶；MCP 是工作階段；Gateway 是模型處理文字的基本單位。",
        "Skill 是系統狀態保存；Tool 是資料版本管理；API 是任務觸發；MCP 是會議摘要；Gateway 是成果驗收。",
        "Skill、Tool、API、MCP 與 Gateway 都是大型語言模型的不同名稱。"
    ],

    // Q11
    [
        "Runtime 是代理執行支援與控制框架；Agent Harness 整合工具、狀態、驗證與限制；Session 組織一次互動或任務的狀態。",
        "Runtime 是單次處理可容納的資訊範圍；Agent Harness 是任務觸發條件；Session 是系統交換資料的介面。",
        "Runtime 是外部資料來源；Agent Harness 是一頁式摘要圖片；Session 是多代理協作編排。",
        "三者都指預先安排的處理順序與分支。"
    ],

    // Q12
    [
        "MAS 由多個代理分工完成任務；協作編排安排任務、交接與成果整合；本課程的 AI OS 指企業 AI 整合運作概念。",
        "MAS 是單次處理可容納的資訊範圍；協作編排是資料版本管理；AI OS 是生成式 AI 的模型名稱。",
        "MAS 只負責保存記憶；協作編排負責核對電子郵件；AI OS 是會議逐字稿格式。",
        "MAS 由多個代理分工；協作編排負責設定詞元；AI OS 只負責產生文字與圖片。"
    ],

    // Q13
    [
        "Trigger 在條件成立時啟動任務；Hooks 在指定事件接入處理邏輯；Heartbeat 週期性喚起或檢查。",
        "Trigger 保留處理版本；Hooks 管理工具權限；Heartbeat 取回相關資料再生成回答。",
        "Trigger 安排多代理交接；Hooks 指定輸出格式；Heartbeat 是模型處理文字的基本單位。",
        "三者都是代理執行支援與控制框架的別稱。"
    ],

    // Q14
    [
        "先依議程直接製作摘要圖片，再補寫會議紀錄；若資料未提及負責人或期限，依情況推測補上。",
        "先依逐字稿、筆記、議程與背景資料整理並核對正式會議紀錄，區分討論與決議、整理待辦；未提及的人名、負責人或期限標示待確認；再依已核對紀錄製作摘要圖片，保留決議與行動且不新增原文沒有的結論。",
        "以摘要圖片取代完整會議紀錄；只需保留會議主題，不必核對決議與行動是否一致。",
        "先把逐字稿改寫成決議，再製作圖片；驗收時只檢查圖片比例，不必確認來源或待確認事項。"
    ],

    // Q15
    [
        "只提供工作目標即可；代理可以自行擴大資料與工具權限，完成後不必核對來源或保留紀錄。",
        "先授予所有工具權限，再讓代理自行決定是否需要停止；只要產出文件，就不必驗證內容。",
        "明確交代工作目標與資料版本，界定可讀、可寫及可執行範圍和停止條件；安排工具操作與成果驗證，保留處理步驟、版本及結果，敏感操作由權責人確認。",
        "只要設定心跳機制，就可取代工作目標、權限、成果驗證與執行追蹤。"
    ]

];


/* =========================================================
   DASHBOARD
========================================================= */

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
        document.getElementById(
            "question-analysis"
        );

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


        const choices =
            QUESTION_CHOICES[index] || [];


        const card =
            document.createElement("article");


        card.className =
            "question-analysis-card";


        card.innerHTML = `

            <div class="question-analysis-header">

                <div class="question-heading">

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


            <div class="question-analysis-body">

                <div class="question-chart-wrapper">

                    <canvas
                        id="questionChart-${questionNumber}">
                    </canvas>

                </div>


                <div class="question-options">

                    <div class="options-title">
                        選項內容
                    </div>

                    ${choices.map(
                        (choice, choiceIndex) => {

                            const letter =
                                String.fromCharCode(
                                    65 + choiceIndex
                                );


                            return `

                                <div class="
                                    option-description
                                    ${
                                        letter ===
                                        question.answer
                                            ? "correct-option"
                                            : ""
                                    }
                                ">

                                    <span
                                        class="option-letter"
                                    >
                                        ${letter}
                                    </span>

                                    <span
                                        class="option-text"
                                    >
                                        ${this.escapeHTML(
                                            choice
                                        )}
                                    </span>

                                </div>

                            `;

                        }
                    ).join("")}

                </div>

            </div>

        `;


        container.appendChild(card);


        const counts =
            this.calculateQuestionCounts(
                index
            );


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
