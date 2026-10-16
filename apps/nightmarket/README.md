# 台灣夜市地圖

開達 Kaida 第一批封測作品之一。手機打開就能用的純前端網頁：

- 30 個台灣主要夜市（13 縣市），地圖＋清單
- 依縣市篩選、搜尋夜市或小吃、「今天有開」（依台北時間與營業日判斷）、「離我最近」
- 想去清單、分享連結（`#夜市id` 直接打開該夜市）、Google 地圖導航
- 4 個封測任務會自動打勾，回饋存在瀏覽器並複製，方便貼到開達或 Threads
- 繁中／英文、米色／Cyber 兩種風格（跟開達主站共用設定）
- 可加到手機主畫面（manifest＋圖示）

## Google 地圖版（夜市範圍、店家、評論）
在 `config.js` 填入 `googleMapsKey` 後，地圖改用 Google 地圖：點夜市會放大到夜市範圍（用 Google 上這個夜市裡的小吃店位置畫出外框），列出店家，點店家可以看 Google 上的評分和評論（Google 每家最多提供 5 則）。
金鑰留空或無效時，自動改回 OpenStreetMap，不顯示店家和評論。

申請金鑰：Google Cloud Console → 建立專案並綁定帳單 → 啟用「Maps JavaScript API」和「Places API (New)」→ 憑證 → 建立 API 金鑰 →
應用程式限制選「網站」，加入 `https://ziyaoyan1229-debug.github.io/*`；API 限制只勾這兩個 API。

## 檔案
- `index.html`、`style.css`、`app.js`：介面與功能
- `map-leaflet.js`、`map-google.js`：兩種地圖（OpenStreetMap／Google）
- `config.js`：Google 金鑰設定
- `data.js`：夜市資料，要新增或修正夜市改這裡
- `icons/`：夜市地圖 logo（`icon.svg` 米色、`icon-cyber.svg` Cyber）與主畫面圖示
- `vendor/`：Leaflet 1.9.4（BSD-2，授權見 `LEAFLET-LICENSE`）

## 資料來源與注意
夜市資料由開達整理自公開資訊，未逐一實地查證，座標為大致位置；營業時間與攤位以現場為準。
地圖圖磚來自 OpenStreetMap（需標示出處，已放在頁面上）。不需要任何 API 金鑰。
