# 交接：開發組_漂流燈島

你接手的是《漂流燈島》這款 Three.js 3D 小島守夜遊戲（單人版已可玩，多人叛徒模式在設計中）。請先讀完本文再動手，回覆一律用繁體中文。

## 一、專案在哪

- GitHub：`ziyaoyan1229-debug/kaida`，分支 `islelight-prototype`，草稿 PR #156（所有進度都在這條分支，直接推上去即可）。
- 遊戲目錄：`apps/islelight/`（純靜態網頁，ES module + importmap，沒有 build 步驟）。
- 本機：`D:\claude專案\kaida`（Windows，MSI 筆電，git 2.55／Python 3.13／Node 24）。桌面有「漂流燈島.bat」：雙擊會在 kaida 根目錄跑 `python -m http.server 8765` 並打開 http://localhost:8765/apps/islelight/ 。伺服器根目錄必須是 kaida 根目錄，因為 importmap 引用 `../pomodoro/vendor/three.module.min.js`。
- 線上可玩版（Claude Artifact，私人連結）：https://claude.ai/artifact/T4R4nkkYJUpRvpU9v5Rizh 。發佈方式：把 `apps/islelight/` 複製到一個資料夾，index.html 的 importmap 改成 `./vendor/three.module.min.js`、`game.js?v=` 去掉，再用 Artifact 工具以 root + files 發佈；模型要用 `.json` 版 glTF（Artifact 不收 .glb/.gltf/.bin）。
- 使用者習慣：先在本機改、本機看（他會自己打開 localhost 確認），改完再推分支；截圖放 `/mnt/project-files/islelight/`。

## 二、玩法（單人版）

白天撿漂流木、蓋路燈／探照燈／篝火、進店鋪買藍圖升級燈塔、出海打撈；晚上黑影從海霧爬上岸，被光照到會消散，摸到燈塔扣血；黎明清場、每天黑影變多。燈塔門口可「登上燈塔」看全島黑影；人物手持探照燈；手機有虛擬搖桿，電腦 WASD＋滑鼠。

## 三、程式結構（apps/islelight/）

| 檔案 | 內容 |
|---|---|
| `index.html` | UI（小地圖 `#map`、搖桿 `#stick`、建造列、畫質／視角按鈕）、importmap |
| `game.js` | 主程式：渲染與後製、地形 `hill()/groundY()`、燈塔、海、天空日夜、玩家與鏡頭、黑影 AI、建造、商店、小地圖、瞭望台、搖桿、自動畫質 `adapt()`、最後 `bakeStatic()` |
| `town.js` | 小鎮：道路、平台 `terrace()`、各店鋪（`KIND`，現在全用 KayKit 建築模型）、池塘／農田／風車 |
| `models.js` | KayKit 場景模型載入（共用材質、`placeModel()`） |
| `rig.js` | KayKit 人物載入與動畫（`makeRig()`，子網格合併） |
| `art.js` / `foliage.js` / `chars.js` / `interior.js` / `bake.js` | 手做零件、草木雲山、舊版小人（寵物還在用）、室內場景、靜態合併 |
| `assets/` | CC0 模型（內嵌 buffer 的 JSON glTF）：`chars/`（Knight、Barbarian、Mage、Rogue、Rogue_Hooded）、`foes/`（4 種骷髏）、`hex/`（建築、樹石、道具、圍欄）＋ LICENSE |
| `models.html` | 模型試裝頁（`?row=chars|foes|buildings|nature`） |
| `mp/` | 多人模式預覽頁（見第六節） |

重要慣例：建築門在模型 +z；`groundY(x,z)` 含 `terraces` 平台；`userData.noBake` 的物件不會被 bake；`window.__islelight` 是除錯 API（setHour、spawnFoe、climbTower、camS…）。

## 四、已做決定

- 美術：全部換成 KayKit CC0 模型（Adventurers／Skeletons／Medieval Hexagon Pack），原本手做人物（第五人格風等樣板在 `charstyles*.js`、`lab.html`）保留但不用。
- 玩家預設騎士（Knight），可換成其他冒險者。
- 地形全圖起伏，建築坐在草皮平台上；小地圖、瞭望台、搖桿、探照燈皆已完成。
- 畫質：高／中／省電三級；手機預設中；每次開啟量 3 秒幀率並當場降載（不重新載入）；遊戲中幀率 <24 會逐步關 AO、降解析度、關聚光燈陰影；分頁在背景時不計。

## 五、目前問題與下一步

1. **效能（最優先）**：使用者筆電（i7-10870H、GTX 1650 Ti＋Intel UHD、1080p）跑起來「非常卡」。主因是 Chrome 用了 Intel 內顯（已請他在 Windows 圖形設定把 Chrome 指到高效能 GPU）。程式面每幀仍約 500～600 次繪製、40～65 萬三角形；可減的：燈塔與路燈零件改成可 bake、路燈光暈地面圓盤合併、村民帽子披風併進骨架網格、省電畫質再砍（光源、草、陰影、半解析度光暈）。
2. 載入量：人物 JSON 約 8.5 MB、場景模型 2.4 MB，手機網路會慢；可用 gltf-transform 量化壓縮。
3. 室內場景、碼頭船、寵物仍是舊手做風格，可視需要換模型。

## 六、多人叛徒模式（另一個入口，單人版不動）

- 設計文件：https://claude.ai/artifact/EvUXceU42sXwqQybjYRq5Z （規則、職業表、連線方案、分階段）
- 程式：同 repo／分支，`apps/islelight/mp/` 下三個預覽頁：`roles-preview.html`（`?mode=day|night|self|ghost`，`&me=6` 看叛徒視角）、`shadows-preview.html`（黑影怪物）、`villagers-preview.html`（居民外觀）。目前只有預覽頁，還沒寫遊戲邏輯和伺服器。
- 預覽圖：`/mnt/project-files/islelight/multi/`（roles-day、roles-night、roles-self、roles-self-traitor、ghosts、shadows、villagers .png）

已定規則：
- 5 回合（白天準備 3 分 → 夜晚 3 分 → 黎明討論 90 秒＋投票 30 秒），第一個白天就是等人大廳。
- 叛徒不殺人，負責熄燈、偷油、叫更多黑影，讓黑影攻破燈塔；燈塔破了叛徒贏。投掉叛徒不會提早結束，還是要守到第 5 夜打完。出局只能靠投票，出局者變幽光（半透明淡青光，活人看不到，還能做任務）。
- 晚上所有人變成同一個體型的黑影，只剩座位號碼和提燈光；只有自己看得到自己的造型和職業。伺服器晚上不傳別人的造型和職業，防偷看。
- 職業：平民（無技能，拿手電筒照黑影、躲黑影，被抓昏倒 20 秒）、守塔人（照一人看陣營）、護燈人（保護一盞燈不被熄）、修燈匠（秒修一盞燈、天亮看熄燈旁最後經過的號碼）、獵人（被放逐時帶走一人）、漂流者（中立，7 人以上，被放逐獨贏）、叛徒（刺客造型，7 人以上兩個）。
- 任務就是點燈和蓋燈，不另做進度條；從太空狼人殺只借「緊急鐘」（每人每局敲一次立刻開會）。
- 居民外觀 8 套自選（漁夫、麵包師、花農、燈塔學徒、船匠、書店老闆、畫家、旅人），跟職業無關。

待決定：
- 怎麼湊人：建議「朋友開房（4 位房號）＋公開房間列表」，人不夠用 NPC 補到 5 人；使用者還沒選。
- 連線：建議 Node + WebSocket 小伺服器放 Render（伺服器判定、防作弊），尚未確認。
- 是否加巡夜人／領航員／偽裝者三個新職業：使用者還沒回。
- 下一步：使用者回「好」就做 2D 規則試玩版，再接 3D 小島（要先把 game.js 的蓋島部分抽成共用模組）。

## 七、工作方式

- 改完先在本機 http://localhost:8765/apps/islelight/ 確認，再 commit 推 `islelight-prototype`；需要時更新線上 Artifact。
- 用 Playwright 無頭瀏覽器截圖時，先在 localStorage 設 `kaida-islelight-v1` 為 `{"manualQ":true,"quality":"high"}` 以免自動降畫質。
- 每次給使用者看成果都附截圖；回覆簡短、用繁體中文。
