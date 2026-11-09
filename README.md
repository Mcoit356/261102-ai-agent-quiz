# 261102-ai-agent-quiz

> 26/11/02 － 人工智慧演進與代理應用，表單資料分析網頁

一個用來分析「AI 演進與代理應用」課堂測驗結果的資料可視化儀表板。
資料來自 Google 表單，經 Google Apps Script 轉成 JSON，再由純前端網頁（HTML / CSS / JavaScript）呈現成圖表與報告。

🔗 **線上展示**：<https://mcoit356.github.io/261102-ai-agent-quiz/index.html>

---

## ✨ 主要功能

- **概述**：回應人數、平均／最高／最低分等 KPI 卡片，以及參與班級的圓環圖與班級統計
- **分析**：15 題逐題分析，查看各選項的作答分布與正確答案
- **測驗者**：填寫時間線圖、測驗者列表（可搜尋、依班級篩選），點選可查看個人作答詳情
- **報告**：依小組／班級篩選，產出分數折線圖、小組人數長條圖、表單滿意度、最喜愛的 AI 與題目分析，並可匯出 PDF
- **深色／淺色模式**：第一次進站跟隨系統設定，之後記住使用者選擇
- **響應式設計**：支援桌機、平板與手機
- **測試資料模式**：網址加上 `?data=test` 即可改讀本機的 `data_test.json`

---

## 📁 檔案結構

```
261102-ai-agent-quiz/
│
├── index.html
│
├── data_test.json
│
├── css/
│   ├── style.css
│   ├── dashboard.css
│   └── responsive.css
│
├── js/
│   ├── config.js
│   ├── api.js
│   ├── charts.js
│   ├── dashboard.js
│   ├── reports.js
│   ├── theme.js
│   └── main.js
│
├── LICENSE
│
└── README.md
```

---

## 📄 各檔案功能說明

### 根目錄

| 檔案 | 功能 |
|------|------|
| `index.html` | 網站唯一的頁面，包含概述、分析、測驗者、報告四個分頁的版面，並載入所有 CSS 與 JS。 |
| `data_test.json` | 測試用假資料（60 筆回應、15 題），在不連線 API 時用來開發與展示。 |
| `LICENSE` | MIT 授權條款。 |
| `README.md` | 專案說明文件。 |

### `css/` 樣式

| 檔案 | 功能 |
|------|------|
| `style.css` | 預留的全站基礎樣式檔，目前為空白。 |
| `dashboard.css` | 儀表板主要樣式：側邊欄、KPI 卡片、圖表區塊、表格、彈出視窗、深淺色主題與列印樣式。 |
| `responsive.css` | 響應式規則，依螢幕寬度（1200 / 900 / 700 / 420 px）調整排版。 |

### `js/` 程式邏輯

| 檔案 | 功能 |
|------|------|
| `config.js` | 存放 Google Apps Script 的 API 網址。 |
| `api.js` | 向 API（或 `data_test.json`）取得資料、檢查 JSON 格式，並提供統一的取資料函式。 |
| `charts.js` | 載入 Chart.js 並負責繪製圓環圖、時間線等圖表。 |
| `dashboard.js` | 儀表板核心：頁面切換、KPI 卡片、班級統計、題目分析、測驗者列表與個人詳情。內含 15 題的題目選項文字。 |
| `reports.js` | 報告頁：小組／班級篩選、分數折線圖、人數長條圖、滿意度與最喜愛 AI 統計，以及匯出 PDF（瀏覽器列印）。 |
| `theme.js` | 深色／淺色模式切換，並用 localStorage 記住選擇。 |
| `main.js` | 預留的進入點檔案，目前為空白。 |

---

## 🔄 資料流程

```
Google 表單 ──► Google Apps Script（API）──► JSON ──► api.js ──► dashboard.js / reports.js ──► 圖表與報告
```

API 回傳的 JSON 主要欄位：`totalResponses`、`averageScore`、`highestScore`、`lowestScore`、`classCounts`、`scoreCounts`、`dailyCounts`、`questions`、`students`。

---

## 🛠️ 使用的工具與網頁

### 前端技術
- **HTML5 / CSS3 / JavaScript（原生）**：網頁結構、樣式與互動
- **[Chart.js 4.4.7](https://www.chartjs.org/)**：圖表繪製，透過 jsDelivr CDN 載入

### 資料來源與後端
- **Google 表單**：收集測驗作答、AI 偏好與滿意度
- **Google Apps Script**：將表單資料以 Web App 形式輸出成 JSON API

### AI 輔助開發
本專案由 AI 協助製作，使用比例如下：

| AI 工具 | 使用比例 |
|---------|----------|
| ChatGPT | 約 70% |
| Claude | 約 30% |

### 平台
- **GitHub**：原始碼託管與版本管理
- **GitHub Pages**：網站部署與線上展示

---

## 🚀 如何使用

1. 下載或 clone 本專案
   ```bash
   git clone https://github.com/Mcoit356/261102-ai-agent-quiz.git
   ```
2. 用瀏覽器開啟 `index.html`
   - 預設會讀取 `config.js` 中設定的 Apps Script API
   - 想用測試資料，請在網址後加上 `?data=test`（例如 `index.html?data=test`）
3. 若要改用自己的資料，將 `js/config.js` 的 `API_URL` 換成你自己的 Apps Script Web App 網址

> 💡 因為 `?data=test` 是用 `fetch` 讀取 JSON，直接雙擊開啟檔案可能被瀏覽器擋下，建議用 VS Code 的 Live Server 或部署到 GitHub Pages 後瀏覽。

---

## 📜 授權

本專案採用 [MIT License](LICENSE)。
