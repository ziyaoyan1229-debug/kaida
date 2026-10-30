# 開達 Kaida 原型

給台灣 vibe coding 創作者的「點子 → 封測 → 發布 → 商店／募資」平台原型。純前端、單一檔案，所有作品、人物與金額都是假資料，不會實際收款。

- `index.html`：整個網站（樣式、假資料、中英文、程式都在裡面）
- `render.yaml`：Render 靜態網站設定

## 部署到 Render
1. 在 Render 選 New → Blueprint，連到這個儲存庫（會讀 `render.yaml`）
2. 或選 New → Static Site，Build Command 留空，Publish directory 填 `.`

## 加到 iPhone 主畫面
用 Safari 打開網址 → 分享 → 加入主畫面。

## 封測作品（真的可以用）
放在 `apps/` 底下，每個都是純前端、資料只存在使用者的瀏覽器：

- `apps/pomodoro/`：番茄讀書會，照整點同步的讀書房、專注紀錄
- `apps/islelight/`：漂流燈島，沿用番茄讀書會的小人與寵物做的 3D 守夜小遊戲（光影、日夜循環）
- `apps/meds/`：吃藥了沒，用藥提醒、逾時一鍵通知家人、匯出到手機行事曆
- `apps/shared/`：兩個作品共用的米色／Cyber 樣式和中英文切換
