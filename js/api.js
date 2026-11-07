/**
 * ============================================================
 * api.js
 * AI Agent Quiz Dashboard
 *
 * 功能：
 * 1. 從 config.js 取得 Apps Script API URL
 * 2. 請求 JSON 資料
 * 3. 檢查 API 回傳格式
 * 4. 提供統一的 API 函式給 dashboard.js 使用
 * ============================================================
 */


/**
 * 取得 API URL
 *
 * config.js 應該提供：
 *
 * const CONFIG = {
 *   API_URL: "你的 Apps Script Web App URL"
 * };
 */
function getApiUrl() {

  if (
    typeof CONFIG === "undefined" ||
    !CONFIG.API_URL
  ) {
    throw new Error(
      "找不到 CONFIG.API_URL，請確認 config/config.js 是否正確載入。"
    );
  }

  if (
    CONFIG.API_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL"
  ) {
    throw new Error(
      "尚未設定 Apps Script API URL，請修改 config/config.js。"
    );
  }

  return CONFIG.API_URL;

}


/**
 * ============================================================
 * 取得完整 JSON
 * ============================================================
 *
 * 回傳格式：
 *
 * {
 *   totalResponses,
 *   averageScore,
 *   highestScore,
 *   lowestScore,
 *   classCounts,
 *   scoreCounts,
 *   dailyCounts,
 *   questions,
 *   students
 * }
 *
 */
async function fetchQuizData() {

  const apiUrl = getApiUrl();

  try {

    const response = await fetch(apiUrl, {
      method: "GET",
      cache: "no-store",
      redirect: "follow"
    });


    if (!response.ok) {

      throw new Error(
        `API 請求失敗：HTTP ${response.status}`
      );

    }


    const data = await response.json();


    /*
     * Apps Script 如果發生錯誤，
     * api.gs 會回傳：
     *
     * {
     *   error: true,
     *   message: "..."
     * }
     */

    if (data.error) {

      throw new Error(
        data.message || "Apps Script API 發生錯誤。"
      );

    }


    /*
     * 檢查基本 JSON 結構
     */

    validateQuizData(data);


    return data;

  } catch (error) {

    console.error(
      "取得測驗資料失敗：",
      error
    );

    throw error;

  }

}


/**
 * ============================================================
 * 驗證 API JSON
 * ============================================================
 */
function validateQuizData(data) {

  if (
    !data ||
    typeof data !== "object"
  ) {

    throw new Error(
      "API 回傳的資料不是有效 JSON。"
    );

  }


  /*
   * 基本統計欄位
   */

  const requiredFields = [
    "totalResponses",
    "averageScore",
    "highestScore",
    "lowestScore",
    "classCounts",
    "scoreCounts",
    "dailyCounts",
    "questions",
    "students"
  ];


  const missingFields = requiredFields.filter(
    function(field) {
      return !(field in data);
    }
  );


  if (missingFields.length > 0) {

    throw new Error(
      "API JSON 缺少欄位：" +
      missingFields.join(", ")
    );

  }


  /*
   * questions 必須是陣列
   */

  if (!Array.isArray(data.questions)) {

    throw new Error(
      "API 的 questions 必須是陣列。"
    );

  }


  /*
   * 預期 Q1～Q15
   */

  if (data.questions.length !== 15) {

    console.warn(
      `目前 questions 有 ${data.questions.length} 題，預期為 15 題。`
    );

  }


  /*
   * students 必須是陣列
   */

  if (!Array.isArray(data.students)) {

    throw new Error(
      "API 的 students 必須是陣列。"
    );

  }


  /*
   * 檢查每一題的格式
   */

  data.questions.forEach(
    function(question, index) {

      if (!question.id) {

        console.warn(
          `questions[${index}] 缺少 id`
        );

      }

      if (!question.title) {

        console.warn(
          `questions[${index}] 缺少 title`
        );

      }

      if (!question.answer) {

        console.warn(
          `questions[${index}] 缺少 answer`
        );

      }

    }
  );


  /*
   * 檢查學生資料
   */

  data.students.forEach(
    function(student, index) {

      if (!Array.isArray(student.answers)) {

        console.warn(
          `students[${index}] 的 answers 不是陣列`
        );

      }

    }
  );

}


/**
 * ============================================================
 * 取得學生列表
 * ============================================================
 *
 * 這個函式方便 dashboard.js 使用。
 *
 * 例如：
 *
 * const students = await getStudents();
 *
 */
async function getStudents() {

  const data = await fetchQuizData();

  return data.students;

}


/**
 * ============================================================
 * 取得題目列表
 * ============================================================
 *
 * Q1～Q15：
 *
 * [
 *   {
 *     id: "Q1",
 *     title: "...",
 *     answer: "A"
 *   },
 *   ...
 * ]
 *
 */
async function getQuestions() {

  const data = await fetchQuizData();

  return data.questions;

}


/**
 * ============================================================
 * 取得統計資料
 * ============================================================
 */
async function getSummary() {

  const data = await fetchQuizData();


  return {

    totalResponses: data.totalResponses,

    averageScore: data.averageScore,

    highestScore: data.highestScore,

    lowestScore: data.lowestScore,

    classCounts: data.classCounts,

    scoreCounts: data.scoreCounts,

    dailyCounts: data.dailyCounts

  };

}


/**
 * ============================================================
 * 依座號尋找學生
 * ============================================================
 *
 * 例如：
 *
 * const student = await getStudentBySeat("09");
 *
 */
async function getStudentBySeat(seat) {

  const data = await fetchQuizData();


  const targetSeat =
    String(seat)
      .trim()
      .padStart(2, "0");


  return data.students.find(
    function(student) {

      return String(student.seat)
        .trim()
        .padStart(2, "0") === targetSeat;

    }
  ) || null;

}


/**
 * ============================================================
 * 依姓名尋找學生
 * ============================================================
 *
 * 例如：
 *
 * const student = await getStudentByName("*旻*");
 *
 */
async function getStudentByName(name) {

  const data = await fetchQuizData();


  const targetName =
    String(name).trim();


  return data.students.find(
    function(student) {

      return String(student.name).trim()
        === targetName;

    }
  ) || null;

}


/**
 * ============================================================
 * 依班級取得學生
 * ============================================================
 *
 * 例如：
 *
 * const students =
 *   await getStudentsByClass("進四資一A");
 *
 */
async function getStudentsByClass(className) {

  const data = await fetchQuizData();


  const targetClass =
    String(className).trim();


  return data.students.filter(
    function(student) {

      return String(student.class).trim()
        === targetClass;

    }
  );

}


/**
 * ============================================================
 * 依分數排序學生
 * ============================================================
 *
 * 預設由高到低
 *
 */
function sortStudentsByScore(
  students,
  descending = true
) {

  return [...students].sort(
    function(a, b) {

      const scoreA =
        Number(a.score) || 0;

      const scoreB =
        Number(b.score) || 0;


      if (descending) {

        return scoreB - scoreA;

      }

      return scoreA - scoreB;

    }
  );

}


/**
 * ============================================================
 * 計算單一學生答對題數
 *
 * 注意：
 * questions.answer = 正確答案
 * students.answers = 學生答案
 *
 * 兩者按照 Q1～Q15 順序對應。
 * ============================================================
 */
function calculateCorrectCount(
  student,
  questions
) {

  if (
    !student ||
    !Array.isArray(student.answers) ||
    !Array.isArray(questions)
  ) {

    return 0;

  }


  let correctCount = 0;


  for (
    let i = 0;
    i < questions.length;
    i++
  ) {

    const correct =
      String(
        questions[i].answer || ""
      )
      .trim()
      .toUpperCase();


    const studentAnswer =
      String(
        student.answers[i] || ""
      )
      .trim()
      .toUpperCase();


    if (
      correct &&
      studentAnswer &&
      correct === studentAnswer
    ) {

      correctCount++;

    }

  }


  return correctCount;

}


/**
 * ============================================================
 * 計算單一學生答錯題數
 * ============================================================
 */
function calculateWrongCount(
  student,
  questions
) {

  if (
    !student ||
    !Array.isArray(questions)
  ) {

    return 0;

  }


  return Math.max(
    questions.length -
    calculateCorrectCount(
      student,
      questions
    ),
    0
  );

}


/**
 * ============================================================
 * 取得學生完整分析資料
 *
 * 不修改 API 原始 JSON。
 *
 * 額外產生：
 *
 * correctCount
 * wrongCount
 * accuracy
 *
 * 這些是「前端計算資料」，
 * 不會寫回 Google Sheet，
 * 也不會修改 API。
 * ============================================================
 */
function enrichStudentData(
  student,
  questions
) {

  const correctCount =
    calculateCorrectCount(
      student,
      questions
    );


  const totalQuestions =
    questions.length;


  const wrongCount =
    Math.max(
      totalQuestions -
      correctCount,
      0
    );


  const accuracy =
    totalQuestions > 0
      ? Number(
          (
            correctCount /
            totalQuestions *
            100
          ).toFixed(2)
        )
      : 0;


  return {

    ...student,

    correctCount: correctCount,

    wrongCount: wrongCount,

    accuracy: accuracy

  };

}


/**
 * ============================================================
 * 建立前端使用的完整資料
 * ============================================================
 *
 * API 原始 JSON 不會被修改。
 *
 */
async function getDashboardData() {

  const data =
    await fetchQuizData();


  const students =
    data.students.map(
      function(student) {

        return enrichStudentData(
          student,
          data.questions
        );

      }
    );


  return {

    ...data,

    students: students

  };

}


/**
 * ============================================================
 * API 健康檢查
 * ============================================================
 *
 * 可在 Console 執行：
 *
 * checkApi()
 *
 * ============================================================
 */
async function checkApi() {

  try {

    const data =
      await fetchQuizData();


    console.log(
      "API 正常運作"
    );


    console.log(
      "總人數：",
      data.totalResponses
    );


    console.log(
      "題目數：",
      data.questions.length
    );


    console.log(
      "學生資料數：",
      data.students.length
    );


    return true;

  } catch (error) {

    console.error(
      "API 檢查失敗：",
      error
    );


    return false;

  }

}
