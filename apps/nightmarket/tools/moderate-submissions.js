/*
 * AI 審核網友投稿（GitHub Actions 每 15 分鐘執行）。
 * 讀 Supabase 裡「待審核」的投稿，先用程式檢查位置，再請 Claude 看文字和照片，決定通過、退回或留給人工。
 * 需要環境變數：NM_SUPABASE_URL、NM_SUPABASE_SERVICE_KEY（service_role，只放在 GitHub secret）、ANTHROPIC_API_KEY。
 * 用法：node apps/nightmarket/tools/moderate-submissions.js
 */
"use strict";
const path = require("path");

const SB = String(process.env.NM_SUPABASE_URL || "").replace(/\/+$/, "");
const SKEY = process.env.NM_SUPABASE_SERVICE_KEY;
const AKEY = process.env.ANTHROPIC_API_KEY;
if (!SB || !SKEY || !AKEY) { console.error("缺少 NM_SUPABASE_URL / NM_SUPABASE_SERVICE_KEY / ANTHROPIC_API_KEY"); process.exit(1); }
const MODEL = process.env.NM_MOD_MODEL || "claude-haiku-5-5";
const MAX_KM = 1.2; // 標的位置離夜市中心超過這個距離就退回

global.window = {};
require(path.join(__dirname, "..", "data.js"));
const MARKETS = {};
for (const m of global.window.NM_MARKETS) MARKETS[m.id] = m;

const sbHeaders = { apikey: SKEY, Authorization: "Bearer " + SKEY, "Content-Type": "application/json" };

function km(a, b, c, d) {
  const r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) / 2 * r), y = (c - a) * r;
  return Math.sqrt(x * x + y * y) * 6371;
}

async function pending() {
  const r = await fetch(SB + "/rest/v1/nm_submissions?status=eq.pending&order=created_at.asc&limit=30&select=*", { headers: sbHeaders });
  if (!r.ok) throw new Error("讀取投稿失敗 HTTP " + r.status + " " + await r.text());
  return r.json();
}

async function decide(row, status, note) {
  const r = await fetch(SB + "/rest/v1/nm_submissions?id=eq." + row.id, {
    method: "PATCH", headers: Object.assign({ Prefer: "return=minimal" }, sbHeaders),
    body: JSON.stringify({ status, mod_note: String(note || "").slice(0, 300) })
  });
  if (!r.ok) throw new Error("更新投稿失敗 HTTP " + r.status + " " + await r.text());
}

const RULES = `你是台灣夜市地圖的投稿審核員。判斷這篇網友投稿能不能公開。
通過條件：
- 內容跟這個夜市的攤位、小吃有關；攤位名稱看起來是真的店名或小吃攤。
- 文字沒有髒話、人身攻擊、歧視、廣告、聯絡方式、網址或別人的個資。負評可以，只要是在評論食物或服務。
- 照片是食物、攤位、招牌或夜市街景；不能是色情、暴力、跟夜市無關的圖，也不能以拍某個路人的臉為主。
- 各項分數 0–10 都是合理的。
看不出來、需要查證才能判斷的，回 human。
只回一行 JSON：{"decision":"approve"|"reject"|"human","reason":"一句繁體中文理由"}`;

async function ask(row, m) {
  const content = [];
  for (const u of (row.photos || []).slice(0, 4)) if (/^https:\/\//.test(u)) content.push({ type: "image", source: { type: "url", url: u } });
  content.push({ type: "text", text: JSON.stringify({
    夜市: m ? m.zh + "（" + m.city + "）" : row.market, 攤位: row.stall, 招牌小吃: row.foods, 價格: row.price, 位置說明: row.where_hint,
    心得: row.review, 暱稱: row.nickname, 分數: { 味蕾度: row.taste, 香氣: row.aroma, 態度: row.attitude, CP值: row.cp, 視覺: row.visual, 氛圍: row.vibe }, 照片張數: (row.photos || []).length
  }) });
  const r = await fetch((process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com") + "/v1/messages", {
    method: "POST",
    headers: { "x-api-key": AKEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: 200, system: RULES, messages: [{ role: "user", content }] })
  });
  if (!r.ok) throw new Error("Claude HTTP " + r.status + " " + await r.text());
  const j = await r.json();
  const text = (j.content || []).map((c) => c.text || "").join("");
  const out = JSON.parse((text.match(/\{[\s\S]*\}/) || ["{}"])[0]);
  if (!["approve", "reject", "human"].includes(out.decision)) return { decision: "human", reason: "AI 回覆看不懂" };
  return out;
}

(async () => {
  const rows = await pending();
  let a = 0, x = 0, h = 0;
  for (const row of rows) {
    if (row.mod_note && /^人工/.test(row.mod_note)) continue; // 已經交給人工的不再重跑
    const m = MARKETS[row.market];
    try {
      if (!m) { await decide(row, "rejected", "找不到這個夜市"); x++; continue; }
      if (row.lat != null && km(m.lat, m.lng, row.lat, row.lng) > MAX_KM) { await decide(row, "rejected", "標的位置離夜市太遠"); x++; continue; }
      const out = await ask(row, m);
      if (out.decision === "approve") { await decide(row, "approved", "AI：" + out.reason); a++; }
      else if (out.decision === "reject") { await decide(row, "rejected", "AI：" + out.reason); x++; }
      else { await decide(row, "pending", "人工：" + out.reason); h++; }
    } catch (e) {
      console.error(row.id, e.message);
    }
  }
  console.log(`審核 ${rows.length} 篇：通過 ${a}、退回 ${x}、留給人工 ${h}`);
})().catch((e) => { console.error(e); process.exit(1); });
