/* 番茄讀書會：溫馨小房間與角色（純 SVG，不用圖片檔） */
(function () {
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* 外觀選項（免費） */
  var SKINS = ["#f6d7bd", "#e9b994", "#c98e64"];
  var HAIRS = ["#3b2a20", "#7a4a2a", "#c58b4c", "#2c2c34"];

  /* 商店：用小木頭買。slot 相同的一次只能穿一件 */
  var ITEMS = [
    { id: "tee-blue", slot: "top", price: 0, zh: "藍色 T 恤", en: "Blue tee", color: "#7fa6c9" },
    { id: "tee-pink", slot: "top", price: 0, zh: "粉色 T 恤", en: "Pink tee", color: "#e7a6a8" },
    { id: "stripe", slot: "top", price: 4, zh: "條紋衫", en: "Striped shirt", color: "#f3efe6", stripe: "#5d7fa8" },
    { id: "hoodie", slot: "top", price: 5, zh: "抹茶帽 T", en: "Matcha hoodie", color: "#8fae7a", hood: true },
    { id: "sweater", slot: "top", price: 6, zh: "黃色毛衣", en: "Mustard sweater", color: "#e0b04f", knit: true },
    { id: "beanie", slot: "hat", price: 3, zh: "毛帽", en: "Beanie", color: "#c8574a" },
    { id: "straw", slot: "hat", price: 5, zh: "草帽", en: "Straw hat", color: "#e6c27a" },
    { id: "beret", slot: "hat", price: 6, zh: "貝雷帽", en: "Beret", color: "#3d3a4a" },
    { id: "crown", slot: "hat", price: 20, zh: "小皇冠", en: "Little crown", color: "#e8b93a" },
    { id: "glasses", slot: "face", price: 4, zh: "圓框眼鏡", en: "Round glasses", color: "#4a3a2c" },
    { id: "scarf", slot: "neck", price: 4, zh: "紅圍巾", en: "Red scarf", color: "#c2453b" },
    { id: "phones", slot: "ears", price: 6, zh: "耳機", en: "Headphones", color: "#5a6b7a" },
    { id: "cat", slot: "pet", price: 12, zh: "小貓夥伴", en: "Kitten buddy", color: "#e3a35b" },
    // 上衣
    { id: "cardigan", slot: "top", price: 5, zh: "米色開襟衫", en: "Oat cardigan", color: "#e6d3b3", open: "#f8f4ec" },
    { id: "plaid", slot: "top", price: 6, zh: "格紋襯衫", en: "Plaid shirt", color: "#c8574a", plaid: "#8a3a32" },
    { id: "sport", slot: "top", price: 6, zh: "運動外套", en: "Track jacket", color: "#3f6f6a", zip: "#f3efe6" },
    { id: "overalls", slot: "top", price: 7, zh: "吊帶褲", en: "Overalls", color: "#f3efe6", bib: "#5d7fa8" },
    // 髮型
    { id: "bob", slot: "style", price: 3, zh: "妹妹頭", en: "Bob cut" },
    { id: "spiky", slot: "style", price: 4, zh: "刺刺頭", en: "Spiky hair" },
    { id: "pony", slot: "style", price: 4, zh: "馬尾", en: "Ponytail" },
    { id: "long", slot: "style", price: 4, zh: "長直髮", en: "Long hair" },
    { id: "buns", slot: "style", price: 5, zh: "雙丸子頭", en: "Space buns" },
    { id: "curly", slot: "style", price: 5, zh: "捲捲頭", en: "Curly hair" },
    // 帽子與頭飾
    { id: "flower", slot: "hat", price: 3, zh: "小花髮夾", en: "Flower clip", color: "#e7a6a8" },
    { id: "cap", slot: "hat", price: 4, zh: "棒球帽", en: "Baseball cap", color: "#5d7fa8" },
    { id: "bunnyband", slot: "hat", price: 7, zh: "兔耳髮箍", en: "Bunny ears", color: "#f8f4ec" },
    // 配飾
    { id: "star", slot: "face", price: 3, zh: "星星貼紙", en: "Star sticker", color: "#e8b93a" },
    { id: "shades", slot: "face", price: 5, zh: "墨鏡", en: "Sunglasses", color: "#2a2620" },
    { id: "bowtie", slot: "neck", price: 4, zh: "蝴蝶結", en: "Bow tie", color: "#c2453b" },
    { id: "pearls", slot: "neck", price: 6, zh: "珍珠項鍊", en: "Pearl necklace", color: "#f8f4ec" },
    { id: "muffs", slot: "ears", price: 5, zh: "毛毛耳罩", en: "Earmuffs", color: "#e7a6a8" },
    { id: "backpack", slot: "back", price: 6, zh: "小背包", en: "Little backpack", color: "#e0b04f" },
    { id: "wings", slot: "back", price: 15, zh: "天使翅膀", en: "Angel wings", color: "#ffffff" },
    // 寵物
    { id: "chick", slot: "pet", price: 8, zh: "小雞", en: "Chick", color: "#f2cc4a" },
    { id: "shiba", slot: "pet", price: 12, zh: "柴犬", en: "Shiba", color: "#d9914a" },
    { id: "bunny", slot: "pet", price: 12, zh: "小白兔", en: "Bunny", color: "#f8f4ec" },
    { id: "panda", slot: "pet", price: 18, zh: "熊貓寶寶", en: "Baby panda", color: "#f8f4ec" }
  ];
  // 商店分類
  var CATS = [
    { id: "top", slots: ["top"] }, { id: "style", slots: ["style"] }, { id: "hat", slots: ["hat"] },
    { id: "acc", slots: ["face", "neck", "ears", "back"] }, { id: "pet", slots: ["pet"] }
  ];
  function item(id) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i]; return null; }

  var ACTS = ["read", "novel", "homework", "research", "report", "code", "pc", "draw", "vocab", "journal", "calligraphy", "lesson"];
  // 平面畫面只有四種桌面道具，其他活動借用最像的那一種
  var BASE = { read: "read", novel: "read", research: "read", homework: "homework", report: "homework", vocab: "homework", journal: "homework", code: "pc", pc: "pc", lesson: "pc", draw: "draw", calligraphy: "draw" };

  /* 預設角色 */
  function defaultLook() { return { g: "girl", skin: 0, hair: 0, top: "tee-blue", style: "", hat: "", face: "", neck: "", ears: "", back: "", pet: "" }; }

  /* ===== 角色 ===== */
  // 以腳底中心為原點，大約 60 高。pose: desk / stand / sofa / mug / snack
  function character(look, pose, opt) {
    opt = opt || {};
    look = look || defaultLook();
    var skin = SKINS[look.skin] || SKINS[0], hair = HAIRS[look.hair] || HAIRS[0];
    var top = item(look.top) || item("tee-blue");
    var girl = look.g === "girl";
    var s = '<g class="ch' + (opt.focus ? " focus" : "") + '">';
    s += '<ellipse cx="0" cy="0" rx="15" ry="3.5" fill="rgba(60,40,20,.18)"/>';
    // 腿
    if (pose !== "desk" && pose !== "sofa") {
      s += '<rect x="-8" y="-12" width="6.5" height="12" rx="3" fill="#5b5f7a"/><rect x="1.5" y="-12" width="6.5" height="12" rx="3" fill="#5b5f7a"/>';
      s += '<ellipse cx="-4.8" cy="-0.5" rx="4.5" ry="2.4" fill="#4a3a30"/><ellipse cx="4.8" cy="-0.5" rx="4.5" ry="2.4" fill="#4a3a30"/>';
    }
    var style = look.style || "";
    // 背上的東西（在身體後面）
    if (look.back === "wings") s += '<g fill="#fffdf8" stroke="#d9cbb5" stroke-width=".7"><path d="M-9 -26 C-24 -38 -32 -26 -27 -16 C-22 -12 -14 -16 -9 -20 Z"/><path d="M9 -26 C24 -38 32 -26 27 -16 C22 -12 14 -16 9 -20 Z"/></g>';
    if (look.back === "backpack") s += '<rect x="-15" y="-27" width="30" height="16" rx="5" fill="#e0b04f"/>';
    // 長髮（在頭後面）
    if (style === "long") s += '<path d="M-17 -44 C-19 -26 -17 -16 -12 -14 L12 -14 C17 -16 19 -26 17 -44 Z" fill="' + hair + '"/>';
    else if (style === "bob") s += '<path d="M-17.5 -46 C-19 -36 -18 -31 -15 -30 L15 -30 C18 -31 19 -36 17.5 -46 Z" fill="' + hair + '"/>';
    else if (style === "pony") s += '<path d="M14 -52 C24 -50 25 -36 19 -28 C17 -34 17 -42 12 -48 Z" fill="' + hair + '"/>';
    else if (girl && !style) s += '<path d="M-17 -44 C-19 -30 -16 -22 -11 -20 L11 -20 C16 -22 19 -30 17 -44 Z" fill="' + hair + '"/>';
    // 身體
    s += '<path d="M-12 -12 C-13 -22 -11 -29 0 -29 C11 -29 13 -22 12 -12 Z" fill="' + top.color + '"/>';
    if (top.stripe) s += '<g fill="' + top.stripe + '"><rect x="-12.5" y="-25" width="25" height="2.2"/><rect x="-12.8" y="-20" width="25.6" height="2.2"/><rect x="-12.8" y="-15" width="25.6" height="2.2"/></g>';
    if (top.hood) s += '<path d="M-9 -29 C-6 -24 6 -24 9 -29" fill="none" stroke="#6f8f5c" stroke-width="2.4" stroke-linecap="round"/><path d="M-2 -25 L-2.5 -19 M2 -25 L2.5 -19" stroke="#f3efe6" stroke-width="1.2"/>';
    if (top.open) s += '<path d="M-3.5 -29 L-2 -12 L2 -12 L3.5 -29 Z" fill="' + top.open + '"/><circle cx="-4.5" cy="-22" r=".9" fill="#a08a6a"/><circle cx="-4.5" cy="-17" r=".9" fill="#a08a6a"/>';
    if (top.plaid) s += '<g stroke="' + top.plaid + '" stroke-width="1.2" opacity=".75"><path d="M-12 -24 H12 M-12.6 -18 H12.6 M-6 -29 V-12 M0 -29 V-12 M6 -29 V-12"/></g>';
    if (top.zip) s += '<path d="M0 -28 V-12" stroke="' + top.zip + '" stroke-width="1.2"/><path d="M-12 -21 h4 M8 -21 h4" stroke="' + top.zip + '" stroke-width="1.6"/>';
    if (top.bib) s += '<path d="M-8 -22 H8 V-12 H-8 Z" fill="' + top.bib + '"/><path d="M-7 -29 L-6 -22 M7 -29 L6 -22" stroke="' + top.bib + '" stroke-width="2.2"/><circle cx="-6" cy="-21" r="1" fill="#e8b93a"/><circle cx="6" cy="-21" r="1" fill="#e8b93a"/>';
    if (look.back === "backpack") s += '<path d="M-9 -29 L-10 -15 M9 -29 L10 -15" stroke="#b98a30" stroke-width="2.2" stroke-linecap="round"/>';
    if (top.knit) s += '<path d="M-11 -14 H11" stroke="#c99a3e" stroke-width="2"/><path d="M-4 -27 L0 -23 L4 -27" fill="none" stroke="#c99a3e" stroke-width="1.6"/>';
    // 手臂
    var arm = top.color;
    if (pose === "desk") {
      s += '<path d="M-11 -24 C-15 -18 -12 -13 -6 -12" fill="none" stroke="' + arm + '" stroke-width="5.5" stroke-linecap="round"/>';
      s += '<path d="M11 -24 C15 -18 12 -13 6 -12" fill="none" stroke="' + arm + '" stroke-width="5.5" stroke-linecap="round"/>';
      s += '<circle cx="-5.5" cy="-12" r="2.6" fill="' + skin + '"/><g class="' + (opt.hand || "") + '"><circle cx="5.5" cy="-12" r="2.6" fill="' + skin + '"/></g>';
    } else if (pose === "mug" || pose === "snack" || pose === "book") {
      s += '<path d="M-11 -24 C-14 -18 -13 -14 -12 -12" fill="none" stroke="' + arm + '" stroke-width="5.5" stroke-linecap="round"/>';
      s += '<path d="M11 -24 C14 -20 10 -17 6 -18" fill="none" stroke="' + arm + '" stroke-width="5.5" stroke-linecap="round"/>';
      s += '<circle cx="-12" cy="-11" r="2.6" fill="' + skin + '"/>';
      if (pose === "mug") s += '<g><rect x="2" y="-23" width="8" height="8" rx="1.5" fill="#f3efe6" stroke="#b9a58a" stroke-width=".8"/><path d="M10 -21 q3 1.5 0 3.5" fill="none" stroke="#b9a58a" stroke-width="1"/><path class="steam" d="M5 -26 q-2 -3 0 -6 q2 -3 0 -6" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="1.2" stroke-linecap="round"/></g>';
      else if (pose === "book") s += '<rect x="-1" y="-25" width="13" height="9" rx="1" fill="#5d7fa8"/><rect x="0" y="-24" width="11" height="7" fill="#f8f4ec"/><path d="M5.5 -24 V-17" stroke="#c8b89c" stroke-width=".6"/>';
      else s += '<circle cx="6" cy="-19" r="4.2" fill="#c98f52"/><circle cx="4.6" cy="-20" r=".9" fill="#5a3a22"/><circle cx="7.2" cy="-18.4" r=".9" fill="#5a3a22"/>';
      s += '<circle cx="5" cy="-18" r="2.6" fill="' + skin + '"/>';
    } else {
      s += '<path d="M-11 -24 C-14 -18 -13 -14 -12 -12" fill="none" stroke="' + arm + '" stroke-width="5.5" stroke-linecap="round"/>';
      s += '<path d="M11 -24 C14 -18 13 -14 12 -12" fill="none" stroke="' + arm + '" stroke-width="5.5" stroke-linecap="round"/>';
      s += '<circle cx="-12" cy="-11" r="2.6" fill="' + skin + '"/><circle cx="12" cy="-11" r="2.6" fill="' + skin + '"/>';
    }
    // 圍巾
    if (look.neck === "scarf") s += '<path d="M-9 -29.5 C-4 -26 4 -26 9 -29.5 L9 -27 C4 -23.5 -4 -23.5 -9 -27 Z" fill="#c2453b"/><rect x="3" y="-27" width="4" height="9" rx="1.5" fill="#c2453b"/>';
    if (look.neck === "bowtie") s += '<path d="M0 -28 L-6 -31 L-6 -25 Z M0 -28 L6 -31 L6 -25 Z" fill="#c2453b"/><circle cx="0" cy="-28" r="1.6" fill="#a9363a"/>';
    if (look.neck === "pearls") s += '<g fill="#fffdf8" stroke="#d9cbb5" stroke-width=".4">' + [-7, -4.5, -1.5, 1.5, 4.5, 7].map(function (x) { return '<circle cx="' + x + '" cy="' + (-27.5 + Math.abs(x) * -0.25 + 2.2) + '" r="1.3"/>'; }).join("") + '</g>';
    // 頭
    var hy = -43;
    s += '<g class="head">';
    s += '<circle cx="0" cy="' + hy + '" r="15" fill="' + skin + '"/>';
    // 頭髮
    if (style === "spiky") {
      s += '<path d="M-15.5 ' + (hy + 2) + ' L-17 ' + (hy - 10) + ' L-11 ' + (hy - 13) + ' L-10 ' + (hy - 22) + ' L-4 ' + (hy - 16) + ' L0 ' + (hy - 25) + ' L4 ' + (hy - 16) + ' L10 ' + (hy - 22) + ' L11 ' + (hy - 13) + ' L17 ' + (hy - 10) + ' L15.5 ' + (hy + 2) + ' C12 ' + (hy - 5) + ' 4 ' + (hy - 7) + ' 0 ' + (hy - 5) + ' C-4 ' + (hy - 7) + ' -12 ' + (hy - 5) + ' -15.5 ' + (hy + 2) + ' Z" fill="' + hair + '"/>';
    } else if (style === "curly") {
      s += '<path d="M-15.5 ' + (hy + 2) + ' C-17 ' + (hy - 21) + ' 17 ' + (hy - 21) + ' 15.5 ' + (hy + 2) + ' C12 ' + (hy - 5) + ' -12 ' + (hy - 5) + ' -15.5 ' + (hy + 2) + ' Z" fill="' + hair + '"/>';
      [[-14, -6], [-9, -13], [-2, -16], [5, -15], [11, -11], [15, -5], [-16, 1], [16, 1], [-6, -6], [3, -7]].forEach(function (c) { s += '<circle cx="' + c[0] + '" cy="' + (hy + c[1]) + '" r="4.6" fill="' + hair + '"/>'; });
    } else if (style === "bob" || style === "long" || style === "buns" || style === "pony") {
      s += '<path d="M-16 ' + (hy + 3) + ' C-17.5 ' + (hy - 21.5) + ' 17.5 ' + (hy - 21.5) + ' 16 ' + (hy + 3) + ' L13 ' + (hy - 4) + ' L-13 ' + (hy - 4) + ' Z" fill="' + hair + '"/>';
      if (style === "buns") s += '<circle cx="-11" cy="' + (hy - 15) + '" r="5.5" fill="' + hair + '"/><circle cx="11" cy="' + (hy - 15) + '" r="5.5" fill="' + hair + '"/>';
      if (style === "pony") s += '<circle cx="13" cy="' + (hy - 9) + '" r="2.2" fill="#e7a6a8"/>';
    } else if (girl) {
      s += '<path d="M-15.5 ' + (hy + 1) + ' C-17 ' + (hy - 21) + ' 17 ' + (hy - 21) + ' 15.5 ' + (hy + 1) + ' C12 ' + (hy - 6) + ' 4 ' + (hy - 8) + ' 0 ' + (hy - 5) + ' C-4 ' + (hy - 8) + ' -12 ' + (hy - 6) + ' -15.5 ' + (hy + 1) + ' Z" fill="' + hair + '"/>';
      s += '<circle cx="13" cy="' + (hy - 9) + '" r="3" fill="#e7a6a8"/>';
    } else {
      s += '<path d="M-15.5 ' + (hy + 2) + ' C-17.5 ' + (hy - 21.5) + ' 17.5 ' + (hy - 21.5) + ' 15.5 ' + (hy + 2) + ' C13 ' + (hy - 4) + ' 9 ' + (hy - 7) + ' 2 ' + (hy - 6) + ' C-4 ' + (hy - 9) + ' -12 ' + (hy - 5) + ' -15.5 ' + (hy + 2) + ' Z" fill="' + hair + '"/>';
    }
    // 臉
    var ey = opt.lookDown ? hy + 3 : hy + 1;
    s += '<g class="eyes"><ellipse cx="-5.5" cy="' + ey + '" rx="1.8" ry="2.3" fill="#2f2622"/><ellipse cx="5.5" cy="' + ey + '" rx="1.8" ry="2.3" fill="#2f2622"/></g>';
    s += '<ellipse cx="-9" cy="' + (hy + 5.5) + '" rx="2.6" ry="1.6" fill="#f0a0a0" opacity=".6"/><ellipse cx="9" cy="' + (hy + 5.5) + '" rx="2.6" ry="1.6" fill="#f0a0a0" opacity=".6"/>';
    s += opt.smile ? '<path d="M-2.2 ' + (hy + 6) + ' q2.2 2.4 4.4 0" fill="none" stroke="#7a4a3a" stroke-width="1.1" stroke-linecap="round"/>'
                   : '<path d="M-1.5 ' + (hy + 6.5) + ' h3" stroke="#7a4a3a" stroke-width="1.1" stroke-linecap="round"/>';
    if (opt.glow) s += '<ellipse cx="0" cy="' + (hy + 3) + '" rx="13" ry="9" fill="#bfe3ff" opacity=".22"/>';
    // 配件
    if (look.face === "shades") s += '<g fill="#2a2620"><rect x="-10" y="' + (hy - 2) + '" width="8.5" height="5.5" rx="2"/><rect x="1.5" y="' + (hy - 2) + '" width="8.5" height="5.5" rx="2"/><path d="M-1.5 ' + hy + ' h3" stroke="#2a2620" stroke-width="1"/></g>';
    if (look.face === "star") s += '<path d="M9 ' + (hy + 2) + ' l1.2 2.5 2.7 .3 -2 1.8 .6 2.7 -2.5 -1.4 -2.5 1.4 .6 -2.7 -2 -1.8 2.7 -.3 Z" fill="#e8b93a"/>';
    if (look.ears === "muffs") s += '<path d="M-15 ' + (hy - 2) + ' C-15 ' + (hy - 20) + ' 15 ' + (hy - 20) + ' 15 ' + (hy - 2) + '" fill="none" stroke="#c98e9a" stroke-width="2.4"/><circle cx="-15.5" cy="' + hy + '" r="5.5" fill="#f2c4c8"/><circle cx="15.5" cy="' + hy + '" r="5.5" fill="#f2c4c8"/>';
    if (look.hat === "cap") s += '<path d="M-15 ' + (hy - 6) + ' C-15 ' + (hy - 21) + ' 15 ' + (hy - 21) + ' 15 ' + (hy - 6) + ' Z" fill="#5d7fa8"/><path d="M-2 ' + (hy - 6) + ' Q12 ' + (hy - 9) + ' 22 ' + (hy - 5) + ' L14 ' + (hy - 3) + ' Z" fill="#4a6a90"/><circle cx="0" cy="' + (hy - 19) + '" r="1.5" fill="#4a6a90"/>';
    if (look.hat === "bunnyband") s += '<path d="M-14 ' + (hy - 10) + ' C-14 ' + (hy - 18) + ' 14 ' + (hy - 18) + ' 14 ' + (hy - 10) + '" fill="none" stroke="#e7a6a8" stroke-width="2"/><ellipse cx="-6" cy="' + (hy - 26) + '" rx="3.6" ry="10" fill="#f8f4ec" stroke="#e0d0c0" stroke-width=".6" transform="rotate(-12 -6 ' + (hy - 26) + ')"/><ellipse cx="6" cy="' + (hy - 26) + '" rx="3.6" ry="10" fill="#f8f4ec" stroke="#e0d0c0" stroke-width=".6" transform="rotate(12 6 ' + (hy - 26) + ')"/><ellipse cx="-6" cy="' + (hy - 25) + '" rx="1.6" ry="7" fill="#f2c4c8" transform="rotate(-12 -6 ' + (hy - 25) + ')"/><ellipse cx="6" cy="' + (hy - 25) + '" rx="1.6" ry="7" fill="#f2c4c8" transform="rotate(12 6 ' + (hy - 25) + ')"/>';
    if (look.hat === "flower") s += '<g transform="translate(-11 ' + (hy - 11) + ')">' + [0, 72, 144, 216, 288].map(function (a) { return '<circle cx="' + (Math.cos(a * Math.PI / 180) * 3).toFixed(2) + '" cy="' + (Math.sin(a * Math.PI / 180) * 3).toFixed(2) + '" r="2.4" fill="#e7a6a8"/>'; }).join("") + '<circle r="1.8" fill="#f2cc4a"/></g>';
    if (look.face === "glasses") s += '<g fill="none" stroke="#4a3a2c" stroke-width="1.1"><circle cx="-5.5" cy="' + (hy + 1) + '" r="3.6"/><circle cx="5.5" cy="' + (hy + 1) + '" r="3.6"/><path d="M-1.9 ' + (hy + 1) + ' h3.8"/></g>';
    if (look.ears === "phones") s += '<path d="M-15 ' + (hy - 2) + ' C-15 ' + (hy - 20) + ' 15 ' + (hy - 20) + ' 15 ' + (hy - 2) + '" fill="none" stroke="#5a6b7a" stroke-width="2.4"/><rect x="-18" y="' + (hy - 4) + '" width="5.5" height="9" rx="2.5" fill="#5a6b7a"/><rect x="12.5" y="' + (hy - 4) + '" width="5.5" height="9" rx="2.5" fill="#5a6b7a"/>';
    if (look.hat === "beanie") s += '<path d="M-15 ' + (hy - 5) + ' C-15 ' + (hy - 20) + ' 15 ' + (hy - 20) + ' 15 ' + (hy - 5) + ' Z" fill="#c8574a"/><rect x="-16" y="' + (hy - 7) + '" width="32" height="5" rx="2.5" fill="#a9463c"/><circle cx="0" cy="' + (hy - 19) + '" r="3.2" fill="#f3efe6"/>';
    if (look.hat === "straw") s += '<ellipse cx="0" cy="' + (hy - 8) + '" rx="23" ry="5" fill="#e6c27a"/><path d="M-11 ' + (hy - 8) + ' C-11 ' + (hy - 20) + ' 11 ' + (hy - 20) + ' 11 ' + (hy - 8) + ' Z" fill="#e6c27a"/><rect x="-11" y="' + (hy - 11) + '" width="22" height="3" fill="#c2453b"/>';
    if (look.hat === "beret") s += '<ellipse cx="2" cy="' + (hy - 12) + '" rx="15" ry="6" fill="#3d3a4a"/><circle cx="2" cy="' + (hy - 18) + '" r="1.5" fill="#3d3a4a"/>';
    if (look.hat === "crown") s += '<path d="M-9 ' + (hy - 12) + ' L-9 ' + (hy - 21) + ' L-4.5 ' + (hy - 16) + ' L0 ' + (hy - 23) + ' L4.5 ' + (hy - 16) + ' L9 ' + (hy - 21) + ' L9 ' + (hy - 12) + ' Z" fill="#e8b93a" stroke="#c99a2a" stroke-width=".8"/><circle cx="0" cy="' + (hy - 15) + '" r="1.6" fill="#c2453b"/>';
    s += '</g>';
    s += '</g>';
    // 小貓
    if (look.pet && !opt.noPet) s += pet(look.pet, opt.petX != null ? opt.petX : 20, 0);
    return s;
  }

  function pet(kind, x, y) {
    if (kind === "cat") return cat(x, y);
    var g = '<g class="cat" transform="translate(' + x + ' ' + y + ')"><ellipse cx="0" cy="0" rx="8" ry="2" fill="rgba(60,40,20,.15)"/>';
    if (kind === "chick") {
      g += '<ellipse cx="0" cy="-6" rx="7" ry="6.5" fill="#f2cc4a"/><path d="M-7 -5 l-3 1 3 1" fill="#e0a830"/><circle cx="-3" cy="-8" r=".9" fill="#2f2622"/><path d="M-1 -12 q1 -3 2 0" fill="none" stroke="#e0a830" stroke-width="1"/>';
    } else if (kind === "shiba") {
      g += '<path class="tail" d="M6 -7 q7 -6 2 -10 q-3 0 -2 4" fill="#d9914a"/><ellipse cx="0" cy="-5" rx="8" ry="5.5" fill="#d9914a"/><circle cx="-4" cy="-12" r="5.8" fill="#d9914a"/><ellipse cx="-5" cy="-10" rx="3.6" ry="2.6" fill="#fff4e4"/>' +
        '<path d="M-9 -15 l1 -6 l4 4 Z M1 -15 l-1 -6 l-4 4 Z" fill="#d9914a"/><circle cx="-6" cy="-12.5" r=".9" fill="#2f2622"/><circle cx="-2" cy="-12.5" r=".9" fill="#2f2622"/><circle cx="-4.6" cy="-10.5" r=".8" fill="#2f2622"/>';
    } else if (kind === "bunny") {
      g += '<circle cx="7" cy="-5" r="2.4" fill="#fffdf8"/><ellipse cx="0" cy="-5" rx="7.5" ry="5.5" fill="#fffdf8" stroke="#e6dccb" stroke-width=".5"/><circle cx="-4" cy="-11" r="5" fill="#fffdf8" stroke="#e6dccb" stroke-width=".5"/>' +
        '<ellipse cx="-6" cy="-19" rx="1.8" ry="5" fill="#fffdf8" stroke="#e6dccb" stroke-width=".5"/><ellipse cx="-2" cy="-19" rx="1.8" ry="5" fill="#fffdf8" stroke="#e6dccb" stroke-width=".5"/><ellipse cx="-6" cy="-19" rx=".8" ry="3.5" fill="#f2c4c8"/><ellipse cx="-2" cy="-19" rx=".8" ry="3.5" fill="#f2c4c8"/>' +
        '<circle cx="-5.5" cy="-11.5" r=".9" fill="#2f2622"/><circle cx="-2.5" cy="-11.5" r=".9" fill="#2f2622"/>';
    } else if (kind === "panda") {
      g += '<ellipse cx="0" cy="-5" rx="8.5" ry="6" fill="#fffdf8" stroke="#e6dccb" stroke-width=".5"/><ellipse cx="-5" cy="-3" rx="3" ry="3.5" fill="#2a2620"/><ellipse cx="5" cy="-3" rx="3" ry="3.5" fill="#2a2620"/><circle cx="-3" cy="-12" r="6" fill="#fffdf8" stroke="#e6dccb" stroke-width=".5"/>' +
        '<circle cx="-8" cy="-17" r="2.4" fill="#2a2620"/><circle cx="2" cy="-17" r="2.4" fill="#2a2620"/><ellipse cx="-5.5" cy="-12" rx="1.8" ry="2.2" fill="#2a2620"/><ellipse cx="-0.5" cy="-12" rx="1.8" ry="2.2" fill="#2a2620"/><circle cx="-5.3" cy="-12.3" r=".6" fill="#fff"/><circle cx="-0.7" cy="-12.3" r=".6" fill="#fff"/>';
    }
    return g + '</g>';
  }
  function cat(x, y) {
    return '<g class="cat" transform="translate(' + x + ' ' + y + ')"><ellipse cx="0" cy="0" rx="8" ry="2" fill="rgba(60,40,20,.15)"/>' +
      '<path class="tail" d="M6 -4 q8 -2 6 -11" fill="none" stroke="#e3a35b" stroke-width="2.4" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="-5" rx="7.5" ry="5.5" fill="#e3a35b"/><circle cx="-4" cy="-12" r="5.5" fill="#e3a35b"/>' +
      '<path d="M-8.5 -14 l1 -6 l3.5 3.5 Z M0.5 -14 l-1 -6 l-3.5 3.5 Z" fill="#e3a35b"/>' +
      '<circle cx="-6" cy="-12.5" r=".9" fill="#2f2622"/><circle cx="-2" cy="-12.5" r=".9" fill="#2f2622"/></g>';
  }

  /* ===== 書桌與活動道具 ===== */
  function desk(act, active) {
    var s = '';
    // 椅背（在人後面已經畫過的話不需要），桌子
    s += '<rect x="-32" y="-16" width="64" height="7" rx="2" fill="#b07a4f"/>';
    s += '<rect x="-30" y="-9" width="60" height="11" fill="#9a6640"/>';
    s += '<rect x="-28" y="2" width="4" height="10" fill="#8a5a38"/><rect x="24" y="2" width="4" height="10" fill="#8a5a38"/>';
    if (!active) { s += '<circle cx="18" cy="-19" r="4" fill="#8fae7a"/><rect x="15.5" y="-17" width="5" height="3" fill="#c98f6a"/>'; return s; }
    if (act === "read") {
      s += '<path d="M-14 -16 L0 -19 L14 -16 L14 -21 L0 -24 L-14 -21 Z" fill="#f8f4ec" stroke="#c8b89c" stroke-width=".8"/><path d="M0 -24 V-19" stroke="#c8b89c" stroke-width=".8"/>';
      s += '<g stroke="#c8b89c" stroke-width=".6"><path d="M-11 -20.5 h8 M-11 -18.8 h8 M3 -20.5 h8 M3 -18.8 h8"/></g>';
    } else if (act === "pc") {
      s += '<rect x="-14" y="-33" width="28" height="18" rx="2" fill="#b9bec6"/><circle cx="0" cy="-24" r="2" fill="#f2ece1"/>';
      s += '<rect x="-16" y="-16.5" width="32" height="2.5" rx="1" fill="#9aa0a8"/><rect x="18" y="-21" width="6" height="5" rx="1" fill="#f3efe6"/>';
    } else if (act === "homework") {
      s += '<rect x="-15" y="-21" width="22" height="6" fill="#f8f4ec" stroke="#c8b89c" stroke-width=".7"/><g stroke="#9db4cf" stroke-width=".5"><path d="M-13 -19.5 h18 M-13 -17.5 h18"/></g>';
      s += '<rect x="10" y="-22" width="8" height="7" rx="1" fill="#e0b04f"/><g class="pencil"><rect x="-2" y="-27" width="2" height="9" fill="#e8b93a" transform="rotate(25 -1 -22)"/></g>';
    } else if (act === "draw") {
      s += '<rect x="-16" y="-22" width="24" height="7" fill="#fff" stroke="#c8b89c" stroke-width=".7"/>';
      s += '<circle cx="-10" cy="-19" r="2" fill="#e7a6a8"/><circle cx="-5" cy="-18" r="2" fill="#7fa6c9"/><path d="M-1 -20 q3 -2 6 0" fill="none" stroke="#8fae7a" stroke-width="1.4"/>';
      s += '<g fill="#c2453b"><rect x="11" y="-21" width="2" height="6"/></g><rect x="14" y="-21" width="2" height="6" fill="#5d7fa8"/><rect x="17" y="-21" width="2" height="6" fill="#e8b93a"/>';
      s += '<g class="pencil"><rect x="-2" y="-28" width="2" height="9" fill="#5d7fa8" transform="rotate(25 -1 -23)"/></g>';
    }
    return s;
  }

  // 兩碼國家代碼 → 國旗表情符號
  function flag(c) { return /^[A-Z]{2}$/.test(c || "") ? String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65, 0x1F1E6 + c.charCodeAt(1) - 65) : ""; }
  function nameTag(name, y, me, fl) {
    var f = flag(fl), w = Math.min(84, 10 + String(name).length * 7.5 + (f ? 10 : 0));
    return '<g transform="translate(0 ' + y + ')"><rect x="' + (-w / 2) + '" y="-8" width="' + w + '" height="11" rx="5.5" fill="' + (me ? "#9a7440" : "rgba(42,38,32,.72)") + '"/>' +
      '<text x="0" y="0.5" text-anchor="middle" font-size="7" fill="#f8f4ec" font-family="Noto Sans TC, sans-serif">' + (f ? f + " " : "") + esc(String(name).slice(0, 8)) + '</text></g>';
  }
  function bubble(text, y) {
    var w = Math.min(110, 14 + String(text).length * 8);
    return '<g class="bubble" transform="translate(0 ' + y + ')"><rect x="' + (-w / 2) + '" y="-14" width="' + w + '" height="14" rx="7" fill="#fff" stroke="#ddd2c0"/><path d="M-3 0 l3 4 l3 -4" fill="#fff" stroke="#ddd2c0"/><rect x="-3.5" y="-1.5" width="7" height="2" fill="#fff"/>' +
      '<text x="0" y="-4" text-anchor="middle" font-size="8" fill="#2a2620" font-family="Noto Sans TC, sans-serif">' + esc(text) + '</text></g>';
  }

  /* ===== 房間 ===== */
  var W = 420, H = 330;
  var SEATS = [[135, 205], [215, 205], [295, 205], [135, 290], [215, 290], [295, 290]];

  function background() {
    var s = '';
    s += '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4b77e"/><stop offset="1" stop-color="#f9dcb0"/></linearGradient>' +
      '<radialGradient id="warm" cx=".15" cy=".55" r=".6"><stop offset="0" stop-color="#ffb35c" stop-opacity=".35"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient></defs>';
    // 牆與地板
    s += '<rect width="' + W + '" height="160" fill="#efe0c6"/>';
    s += '<g stroke="#e6d4b6" stroke-width="1">' + [30, 60, 90, 120].map(function (y) { return '<path d="M0 ' + y + ' H' + W + '"/>'; }).join("") + '</g>';
    s += '<rect y="148" width="' + W + '" height="12" fill="#d8c3a2"/>';
    s += '<rect y="160" width="' + W + '" height="' + (H - 160) + '" fill="#c8976a"/>';
    s += '<g stroke="#b9875c" stroke-width="1">' + [185, 215, 250, 290].map(function (y) { return '<path d="M0 ' + y + ' H' + W + '"/>'; }).join("") +
      [[60, 160, 185], [190, 160, 185], [320, 160, 185], [120, 185, 215], [260, 185, 215], [40, 215, 250], [180, 215, 250], [340, 215, 250], [100, 250, 290], [250, 250, 290], [380, 250, 290], [60, 290, 330], [210, 290, 330], [350, 290, 330]].map(function (a) { return '<path d="M' + a[0] + ' ' + a[1] + ' V' + a[2] + '"/>'; }).join("") + '</g>';
    // 窗戶
    s += '<rect x="160" y="22" width="100" height="74" rx="4" fill="#fff8ec"/><rect x="166" y="28" width="88" height="62" fill="url(#sky)"/>';
    s += '<circle cx="232" cy="52" r="8" fill="#fff1c9" opacity=".9"/><path d="M166 80 q20 -12 40 -2 q22 -14 48 0 V90 H166 Z" fill="#c9a37a" opacity=".55"/>';
    s += '<path d="M210 28 V90 M166 59 H254" stroke="#fff8ec" stroke-width="4"/>';
    s += '<path d="M152 18 C162 40 158 80 150 102 L162 102 C170 70 170 40 168 18 Z" fill="#c9746a"/><path d="M268 18 C258 40 262 80 270 102 L258 102 C250 70 250 40 252 18 Z" fill="#c9746a"/><rect x="146" y="14" width="128" height="5" rx="2.5" fill="#9a6640"/>';
    // 串燈
    s += '<path d="M0 8 Q105 30 210 10 Q315 30 420 8" fill="none" stroke="#8a6a4a" stroke-width="1"/>';
    [20, 55, 90, 125, 160, 195, 230, 265, 300, 335, 370, 405].forEach(function (x, i) {
      var y = x < 210 ? 8 + 22 * Math.sin(Math.PI * x / 210) * .9 : 8 + 22 * Math.sin(Math.PI * (x - 210) / 210) * .9;
      s += '<circle class="bulb b' + (i % 3) + '" cx="' + x + '" cy="' + (y + 3) + '" r="3" fill="' + ["#ffd27a", "#ffb8a0", "#c9e6a8"][i % 3] + '"/>';
    });
    // 牆上畫框與時鐘
    s += '<rect x="108" y="40" width="34" height="26" fill="#f8f4ec" stroke="#9a6640" stroke-width="3"/><path d="M112 62 l8 -10 l6 6 l5 -4 l8 8 Z" fill="#8fae7a"/><circle cx="133" cy="48" r="3" fill="#e8b93a"/>';
    s += '<circle cx="62" cy="38" r="11" fill="#f8f4ec" stroke="#9a6640" stroke-width="3"/><path d="M62 38 V31 M62 38 L67 41" stroke="#2a2620" stroke-width="1.5" stroke-linecap="round"/>';
    // 書櫃
    s += '<rect x="277" y="30" width="42" height="132" fill="#8a5a38"/><rect x="281" y="34" width="34" height="124" fill="#e9d6b4"/>';
    s += '<path d="M281 64 H315 M281 94 H315 M281 124 H315" stroke="#8a5a38" stroke-width="3"/>';
    var books = ["#c2453b", "#5d7fa8", "#e0b04f", "#8fae7a", "#e7a6a8", "#7a5c8a", "#d98c4a"];
    [[38, 62], [68, 92], [98, 122], [128, 156]].forEach(function (row, ri) {
      var x = 283;
      for (var k = 0; k < 6 && x < 311; k++) {
        var w = 3 + ((k + ri) % 3), h = (row[1] - row[0]) - 4 - ((k * 3 + ri) % 6);
        if (ri === 2 && k === 4) { s += '<circle cx="' + (x + 4) + '" cy="' + (row[1] - 6) + '" r="5" fill="#8fae7a"/>'; x += 10; continue; }
        s += '<rect x="' + x + '" y="' + (row[1] - h) + '" width="' + w + '" height="' + h + '" fill="' + books[(k * 2 + ri) % books.length] + '"/>';
        x += w + 1;
      }
    });
    // 火爐（左）
    s += '<rect x="8" y="78" width="96" height="10" rx="2" fill="#9a6640"/>';
    s += '<rect x="14" y="88" width="84" height="74" fill="#b9a089"/><g stroke="#a58c74" stroke-width="1"><path d="M14 104 H98 M14 120 H98 M14 136 H98 M14 152 H98 M40 88 V104 M70 104 V120 M30 120 V136 M60 136 V152 M84 120 V136"/></g>';
    s += '<path d="M30 162 V126 C30 108 82 108 82 126 V162 Z" fill="#3a2a22"/>';
    s += '<rect x="24" y="160" width="64" height="6" rx="2" fill="#8a7a6a"/>';
    s += '<g class="flame"><path d="M42 160 C38 150 46 142 48 134 C52 144 58 140 56 130 C64 140 68 150 64 160 Z" fill="#f08a3c"/><path d="M47 160 C45 152 50 148 52 142 C55 150 60 148 59 160 Z" fill="#ffd27a"/></g>';
    s += '<path d="M38 161 h36" stroke="#6b4a32" stroke-width="5" stroke-linecap="round"/>';
    s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#warm)" pointer-events="none"/>';
    // 火爐上的小東西
    s += '<rect x="20" y="66" width="10" height="12" rx="2" fill="#c98f6a"/><circle cx="25" cy="62" r="7" fill="#8fae7a"/>';
    s += '<rect x="76" y="64" width="18" height="14" rx="2" fill="#f8f4ec" stroke="#9a6640"/><circle cx="85" cy="71" r="4" fill="#e7a6a8"/>';
    // 咖啡機吧台（右）
    s += '<rect x="318" y="118" width="102" height="8" fill="#9a6640"/><rect x="322" y="126" width="98" height="52" fill="#b07a4f"/><path d="M370 130 V174" stroke="#9a6640" stroke-width="1.5"/><circle cx="364" cy="152" r="2" fill="#e8d3b0"/><circle cx="376" cy="152" r="2" fill="#e8d3b0"/>';
    s += '<rect x="326" y="86" width="30" height="32" rx="3" fill="#5a5f6b"/><rect x="330" y="92" width="22" height="8" rx="1.5" fill="#2a2f38"/><circle cx="335" cy="96" r="1.5" fill="#7cffb2"/><rect x="336" y="104" width="10" height="3" fill="#2a2f38"/><rect x="337" y="108" width="8" height="9" rx="1" fill="#f3efe6"/>';
    s += '<path class="steam" d="M341 104 q-3 -5 0 -10 q3 -5 0 -10" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="1.5" stroke-linecap="round"/>';
    s += '<rect x="360" y="104" width="10" height="14" rx="2" fill="#f8f4ec"/><rect x="360" y="100" width="10" height="5" rx="1" fill="#c98f6a"/>';
    // 零食櫃
    s += '<rect x="380" y="30" width="38" height="88" fill="#9a6640"/><rect x="383" y="34" width="32" height="82" fill="#f3e3c6"/>';
    s += '<path d="M383 60 H415 M383 88 H415" stroke="#9a6640" stroke-width="3"/>';
    s += '<rect x="386" y="44" width="8" height="15" rx="2" fill="#e7a6a8"/><rect x="396" y="40" width="8" height="19" rx="2" fill="#e0b04f"/><rect x="406" y="46" width="7" height="13" rx="2" fill="#7fa6c9"/>';
    s += '<circle cx="391" cy="80" r="6" fill="#c98f52"/><circle cx="405" cy="80" r="6" fill="#c98f52"/><rect x="387" y="94" width="24" height="16" rx="3" fill="#f8f4ec" stroke="#c8b89c"/><circle cx="394" cy="102" r="3" fill="#e7a6a8"/><circle cx="403" cy="103" r="3" fill="#e0b04f"/>';
    // 地毯
    s += '<ellipse cx="215" cy="255" rx="128" ry="52" fill="#d9a77e"/><ellipse cx="215" cy="255" rx="116" ry="44" fill="none" stroke="#f3e3c6" stroke-width="3" stroke-dasharray="6 5"/>';
    // 沙發（背）
    s += '<rect x="6" y="236" width="104" height="30" rx="10" fill="#c26f5e"/>';
    // 盆栽
    s += '<g transform="translate(395 318)"><path d="M-14 -22 C-24 -40 -12 -52 -4 -36 C-6 -56 10 -58 6 -36 C14 -50 26 -40 14 -22 Z" fill="#7b9c68"/><path d="M-12 -24 H12 L9 0 H-9 Z" fill="#c98f6a"/></g>';
    return s;
  }
  function sofaFront() {
    return '<rect x="2" y="262" width="112" height="22" rx="8" fill="#b35f50"/><rect x="2" y="250" width="14" height="34" rx="6" fill="#b35f50"/><rect x="100" y="250" width="14" height="34" rx="6" fill="#b35f50"/>' +
      '<rect x="10" y="284" width="5" height="6" fill="#6b4a32"/><rect x="102" y="284" width="5" height="6" fill="#6b4a32"/>';
  }
  function chair(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')"><rect x="-13" y="-34" width="26" height="22" rx="5" fill="#8a5a38"/><rect x="-11" y="-32" width="22" height="18" rx="4" fill="#d9b38a"/></g>';
  }

  /* 休息時可以去的地方 */
  var SPOTS = [
    { x: 34, y: 282, pose: "sofa" }, { x: 76, y: 282, pose: "sofa" }, { x: 352, y: 196, pose: "mug" }, { x: 398, y: 196, pose: "snack" },
    { x: 298, y: 168, pose: "book" }, { x: 66, y: 198, pose: "stand" }, { x: 175, y: 250, pose: "stand" }, { x: 255, y: 250, pose: "stand" },
    { x: 215, y: 166, pose: "stand" }, { x: 356, y: 304, pose: "stand" }
  ];
  function hash(str) { var h = 7; for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  // 每個人每 9 秒左右換一個地方，各自錯開；同一時間每個地方只站一個人
  function spotsFor(members, now) {
    var taken = {}, out = {};
    members.forEach(function (m) {
      var h = hash(m.id || m.name || "x");
      var k = Math.floor((now + (h % 9000)) / 9000);
      var idx = (h + k * 7) % SPOTS.length;
      for (var j = 0; j < SPOTS.length && taken[idx]; j++) idx = (idx + 1) % SPOTS.length;
      taken[idx] = 1; out[m.id] = idx;
    });
    return out;
  }
  function layerOf(spot) { return spot.y <= 200 ? "La" : spot.y <= 286 ? "Lb" : "Lc"; }
  function moverInner(m, spot, walking) {
    var pose = walking ? "stand" : spot.pose;
    var body = pose === "sofa" ? '<g transform="translate(0 -14)">' + character(m.look, "desk", { smile: true, noPet: true }) + '</g>'
                               : '<g class="' + (walking ? "walk" : "") + '">' + character(m.look, pose, { smile: true, petX: spot.x > 300 ? -22 : 22, noPet: walking }) + '</g>';
    var ty = pose === "sofa" ? -78 : -64;
    return body + nameTag(m.name, ty, m.me, m.fl) + (m.bubble ? bubble(m.bubble, ty - 10) : "");
  }

  /*
    members: [{ id, name, look, act, me, bubble }]，最多 6 位，依序坐 SEATS
    phase: "focus" | "break"
  */
  function render(members, phase, now) {
    now = now || Date.now();
    var s = '<style>' +
      '.flame{transform-origin:53px 160px;animation:fl 1.2s ease-in-out infinite alternate}' +
      '@keyframes fl{from{transform:scale(1,1)}to{transform:scale(.92,1.1)}}' +
      '.steam{animation:st 2.4s ease-in-out infinite;opacity:.8}@keyframes st{0%{transform:translateY(2px);opacity:0}40%{opacity:.9}100%{transform:translateY(-6px);opacity:0}}' +
      '.bulb{animation:bl 3s ease-in-out infinite}.b1{animation-delay:1s}.b2{animation-delay:2s}@keyframes bl{50%{opacity:.55}}' +
      '.eyes{animation:blink 4.5s infinite;transform-box:fill-box;transform-origin:center}@keyframes blink{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}' +
      '.ch.focus .head{animation:bob 3s ease-in-out infinite}@keyframes bob{50%{transform:translateY(1px)}}' +
      '.walk{animation:wk .35s ease-in-out infinite alternate}@keyframes wk{to{transform:translateY(-2px)}}' +
      '.mover{transition:transform 2.6s ease-in-out}' +
      '.pencil{animation:wr .9s ease-in-out infinite alternate}@keyframes wr{to{transform:translateX(6px)}}' +
      '.tail{transform-box:fill-box;transform-origin:0 100%;animation:tl 2s ease-in-out infinite alternate}@keyframes tl{to{transform:rotate(-18deg)}}' +
      '.bubble{animation:pop .3s ease-out}@keyframes pop{from{opacity:0;transform:translateY(4px)}}' +
      '@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}' +
      '</style>';
    s += background();
    var focus = phase !== "break";
    var list = members.slice(0, 6);
    var back = "", front = "", L = { La: "", Lb: "", Lc: "" };
    var spots = focus ? {} : spotsFor(list, now);
    for (var i = 0; i < 6; i++) {
      var m = list[i], seat = SEATS[i];
      var g = "";
      if (!m || !focus) {
        g += '<g transform="translate(' + seat[0] + ' ' + seat[1] + ')">' + chair(0, -2) + desk("", false) + '</g>';
      } else {
        var act = BASE[m.act] || "read";
        g += '<g transform="translate(' + seat[0] + ' ' + seat[1] + ')">' + chair(0, -2) +
          '<g transform="translate(0 -8)">' + character(m.look, "desk", { focus: true, lookDown: act !== "pc", glow: act === "pc", noPet: true }) + '</g>' +
          desk(act, true) +
          (m.look && m.look.pet ? pet(m.look.pet, 36, 8) : "") +
          nameTag(m.name, -72, m.me, m.fl) + (m.bubble ? bubble(m.bubble, -82) : "") + '</g>';
      }
      if (m && !focus) {
        var sp = SPOTS[spots[m.id]];
        L[layerOf(sp)] += '<g class="mover" data-mid="' + esc(m.id) + '" data-spot="' + spots[m.id] + '" style="transform:translate(' + sp.x + 'px,' + sp.y + 'px)">' + moverInner(m, sp, false) + '</g>';
      }
      if (i < 3) back += g; else front += g;
    }
    s += '<g id="La">' + L.La + '</g>' + back + '<g id="Lb">' + L.Lb + '</g>' + sofaFront() + front + '<g id="Lc">' + L.Lc + '</g>';
    return s;
  }

  /* 休息時每秒呼叫：到時間就走去新的地方 */
  function move(svg, members, now) {
    var spots = spotsFor(members.slice(0, 6), now);
    members.slice(0, 6).forEach(function (m) {
      var node = svg.querySelector('[data-mid="' + (window.CSS && CSS.escape ? CSS.escape(m.id) : m.id) + '"]');
      if (!node) return;
      var idx = spots[m.id];
      if (String(idx) === node.getAttribute("data-spot")) return;
      var sp = SPOTS[idx];
      node.setAttribute("data-spot", idx);
      node.innerHTML = moverInner(m, sp, true);
      // 先在原本的圖層走過去，到了再換到正確的前後位置與姿勢
      requestAnimationFrame(function () { node.style.transform = "translate(" + sp.x + "px," + sp.y + "px)"; });
      setTimeout(function () {
        if (node.getAttribute("data-spot") !== String(idx)) return;
        var layer = svg.querySelector("#" + layerOf(sp));
        if (layer && node.parentNode !== layer) { node.style.transition = "none"; layer.appendChild(node); node.getBoundingClientRect(); node.style.transition = ""; }
        node.innerHTML = moverInner(m, sp, false);
      }, 2700);
    });
  }

  /* 角色預覽（角色頁與選單用） */
  function preview(look, opt) {
    opt = opt || {};
    return '<rect x="-60" y="-100" width="120" height="116" rx="10" fill="#efe0c6"/><rect x="-60" y="-4" width="120" height="20" fill="#c8976a"/>' +
      '<g transform="scale(1.35)">' + character(look, "stand", { smile: true, petX: 24 }) + '</g>';
  }

  window.KaidaScene = { flag: flag, render: render, move: move, preview: preview, ITEMS: ITEMS, CATS: CATS, item: item, SKINS: SKINS, HAIRS: HAIRS, ACTS: ACTS, defaultLook: defaultLook, W: W, H: H };
})();
