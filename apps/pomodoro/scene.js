/* 番茄讀書會：溫馨小房間與角色（純 SVG，不用圖片檔） */
(function () {
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* 外觀選項（免費） */
  var SKINS = ["#f6d7bd", "#e9b994", "#c98e64", "#fbe6d4", "#d9a27a", "#a8704a", "#8a5532", "#5e3a24"];
  var HAIRS = ["#3b2a20", "#7a4a2a", "#c58b4c", "#2c2c34", "#151515", "#e6c27a", "#b0302a", "#9a9aa0", "#f2efe8", "#e88aa8", "#5a7ad0", "#7a5ad0", "#4a8a6a"];

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
    { id: "cardigan", slot: "top", price: 5, zh: "米色開襟衫", en: "Oat cardigan", color: "#e6d3b3", open: "#f8f4ec" },
    { id: "plaid", slot: "top", price: 6, zh: "格紋襯衫", en: "Plaid shirt", color: "#c8574a", plaid: "#8a3a32" },
    { id: "sport", slot: "top", price: 6, zh: "運動外套", en: "Track jacket", color: "#3f6f6a", zip: "#f3efe6" },
    { id: "overalls", slot: "top", price: 7, zh: "吊帶褲", en: "Overalls", color: "#f3efe6", bib: "#5d7fa8" },
    { id: "bob", slot: "style", price: 3, zh: "妹妹頭", en: "Bob cut" },
    { id: "spiky", slot: "style", price: 4, zh: "刺刺頭", en: "Spiky hair" },
    { id: "pony", slot: "style", price: 4, zh: "馬尾", en: "Ponytail" },
    { id: "long", slot: "style", price: 4, zh: "長直髮", en: "Long hair" },
    { id: "buns", slot: "style", price: 5, zh: "雙丸子頭", en: "Space buns" },
    { id: "curly", slot: "style", price: 5, zh: "捲捲頭", en: "Curly hair" },
    { id: "flower", slot: "hat", price: 3, zh: "小花髮夾", en: "Flower clip", color: "#e7a6a8" },
    { id: "cap", slot: "hat", price: 4, zh: "棒球帽", en: "Baseball cap", color: "#5d7fa8" },
    { id: "bunnyband", slot: "hat", price: 7, zh: "兔耳髮箍", en: "Bunny ears", color: "#f8f4ec" },
    { id: "star", slot: "face", price: 3, zh: "星星貼紙", en: "Star sticker", color: "#e8b93a" },
    { id: "shades", slot: "face", price: 5, zh: "墨鏡", en: "Sunglasses", color: "#2a2620" },
    { id: "bowtie", slot: "neck", price: 4, zh: "蝴蝶結", en: "Bow tie", color: "#c2453b" },
    { id: "pearls", slot: "neck", price: 6, zh: "珍珠項鍊", en: "Pearl necklace", color: "#f8f4ec" },
    { id: "muffs", slot: "ears", price: 5, zh: "毛毛耳罩", en: "Earmuffs", color: "#e7a6a8" },
    { id: "backpack", slot: "back", price: 6, zh: "小背包", en: "Little backpack", color: "#e0b04f" },
    { id: "wings", slot: "back", price: 15, zh: "天使翅膀", en: "Angel wings", color: "#ffffff" },
    { id: "chick", slot: "pet", price: 8, zh: "小雞", en: "Chick", color: "#f2cc4a" },
    { id: "shiba", slot: "pet", price: 12, zh: "柴犬", en: "Shiba", color: "#d9914a" },
    { id: "bunny", slot: "pet", price: 12, zh: "小白兔", en: "Bunny", color: "#f8f4ec" },
    { id: "blackcat", slot: "pet", price: 10, zh: "小黑貓", en: "Black cat", color: "#3c3842" },
    { id: "calico", slot: "pet", price: 12, zh: "三花貓", en: "Calico cat", color: "#ee9a4a" },
    { id: "corgi", slot: "pet", price: 14, zh: "柯基", en: "Corgi", color: "#ec9a4e" },
    { id: "poodle", slot: "pet", price: 14, zh: "貴賓狗", en: "Poodle", color: "#c98a5a" },
    { id: "denim", slot: "top", price: 6, zh: "牛仔外套", en: "Denim jacket", color: "#5d7fa8", zip: "#e8d6a8" },
    { id: "turtle", slot: "top", price: 6, zh: "黑色高領", en: "Black turtleneck", color: "#3a3640", roll: "#2a2630" },
    { id: "twins", slot: "style", price: 5, zh: "雙馬尾", en: "Pigtails" },
    { id: "buzz", slot: "style", price: 3, zh: "小平頭", en: "Buzz cut" },
    { id: "catband", slot: "hat", price: 7, zh: "貓耳髮箍", en: "Cat ears", color: "#3d3a4a" },
    { id: "bucket", slot: "hat", price: 5, zh: "漁夫帽", en: "Bucket hat", color: "#c9b48a" },
    { id: "tie", slot: "neck", price: 4, zh: "領帶", en: "Necktie", color: "#3a5a8a" },
    { id: "cape", slot: "back", price: 10, zh: "紅披風", en: "Red cape", color: "#b0302a" },
    { id: "fox", slot: "pet", price: 14, zh: "小狐狸", en: "Little fox", color: "#e07a3a" },
    { id: "hamster", slot: "pet", price: 8, zh: "倉鼠", en: "Hamster", color: "#e8c08a" }
  ];
  // 商店分類
  var CATS = [
    { id: "top", slots: ["top"] }, { id: "style", slots: ["style"] }, { id: "hat", slots: ["hat"] },
    { id: "acc", slots: ["face", "neck", "ears", "back"] }, { id: "pet", slots: ["pet"] }
  ];
  function item(id) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i]; return null; }

  var ACTS = ["read", "novel", "homework", "research", "report", "code", "pc", "draw", "vocab", "journal", "calligraphy", "lesson", "music", "piano", "sing", "craft"];
  // 平面畫面只有四種桌面道具，其他活動借用最像的那一種
  var BASE = { read: "read", novel: "read", research: "read", homework: "homework", report: "homework", vocab: "homework", journal: "homework", code: "pc", pc: "pc", lesson: "pc", draw: "draw", calligraphy: "draw", music: "music", piano: "piano", sing: "read", craft: "draw" };

  /* 預設角色 */
  function defaultLook() { return { g: "girl", skin: 0, hair: 0, top: "tee-blue", style: "", hat: "", face: "", neck: "", ears: "", back: "", pet: "" }; }

  /* ===== 角色 ===== */
  // 以腳底中心為原點，大約 60 高。pose: desk / stand / sofa / mug / snack
  // 頭的群組以脖子 (0,-30) 為轉軸：外層移到脖子、中間這層做動畫、內層再移回來
  var HEAD_OPEN = '<g transform="translate(0 -30)"><g class="head"><g transform="translate(0 30)">', HEAD_CLOSE = '</g></g></g>';
  function character(look, pose, opt) {
    opt = opt || {};
    look = look || defaultLook();
    var skin = SKINS[look.skin] || SKINS[0], hair = HAIRS[look.hair] || HAIRS[0];
    var top = item(look.top) || item("tee-blue");
    var girl = look.g === "girl";
    var s = '<g class="ch' + (opt.focus ? " focus" : "") + '">';
    s += '<ellipse cx="0" cy="0" rx="15" ry="3.5" fill="rgba(60,40,20,.18)"/>';
    if (pose !== "desk" && pose !== "sofa") {
      s += '<rect x="-8" y="-12" width="6.5" height="12" rx="3" fill="#5b5f7a"/><rect x="1.5" y="-12" width="6.5" height="12" rx="3" fill="#5b5f7a"/>';
      s += '<ellipse cx="-4.8" cy="-0.5" rx="4.5" ry="2.4" fill="#4a3a30"/><ellipse cx="4.8" cy="-0.5" rx="4.5" ry="2.4" fill="#4a3a30"/>';
    }
    var style = look.style || "";
    // 背上的東西（在身體後面）
    if (look.back === "wings") s += '<g fill="#fffdf8" stroke="#d9cbb5" stroke-width=".7"><path d="M-9 -26 C-24 -38 -32 -26 -27 -16 C-22 -12 -14 -16 -9 -20 Z"/><path d="M9 -26 C24 -38 32 -26 27 -16 C22 -12 14 -16 9 -20 Z"/></g>';
    if (look.back === "cape") s += '<path d="M-11 -29 L-17 -8 Q0 -4 17 -8 L11 -29 Z" fill="#b0302a"/>';
    if (look.back === "backpack") s += '<rect x="-15" y="-27" width="30" height="16" rx="5" fill="#e0b04f"/>';
    // 長髮（在頭後面）：包在跟頭一樣會動的群組裡，轉頭、點頭時頭髮跟著動，不會像黏在背後
    var bh = "";
    if (style === "long") bh += '<path d="M-8 -56 C-17 -54.5 -19.5 -28 -17 -17 C-16 -14.5 -14 -14 -12 -14 L12 -14 C14 -14 16 -14.5 17 -17 C19.5 -28 17 -54.5 8 -56 Z" fill="' + hair + '"/>';
    else if (style === "bob") bh += '<path d="M-8 -56 C-17.5 -55 -19.5 -35 -15 -30 L15 -30 C19.5 -35 17.5 -55 8 -56 Z" fill="' + hair + '"/>';
    else if (style === "pony") bh += '<path d="M14 -52 C24 -50 25 -36 19 -28 C17 -34 17 -42 12 -48 Z" fill="' + hair + '"/>';
    else if (girl && !style) bh += '<path d="M-8 -56 C-17 -54.5 -19.5 -29 -16 -22.5 C-15 -20.5 -13 -20 -11 -20 L11 -20 C13 -20 15 -20.5 16 -22.5 C19.5 -29 17 -54.5 8 -56 Z" fill="' + hair + '"/>';
    if (bh) s += HEAD_OPEN + bh + HEAD_CLOSE;
    s += '<path d="M-12 -12 C-13 -22 -11 -29 0 -29 C11 -29 13 -22 12 -12 Z" fill="' + top.color + '"/>';
    if (top.stripe) s += '<g fill="' + top.stripe + '"><rect x="-12.5" y="-25" width="25" height="2.2"/><rect x="-12.8" y="-20" width="25.6" height="2.2"/><rect x="-12.8" y="-15" width="25.6" height="2.2"/></g>';
    if (top.hood) s += '<path d="M-9 -29 C-6 -24 6 -24 9 -29" fill="none" stroke="#6f8f5c" stroke-width="2.4" stroke-linecap="round"/><path d="M-2 -25 L-2.5 -19 M2 -25 L2.5 -19" stroke="#f3efe6" stroke-width="1.2"/>';
    if (top.open) s += '<path d="M-3.5 -29 L-2 -12 L2 -12 L3.5 -29 Z" fill="' + top.open + '"/><circle cx="-4.5" cy="-22" r=".9" fill="#a08a6a"/><circle cx="-4.5" cy="-17" r=".9" fill="#a08a6a"/>';
    if (top.plaid) s += '<g stroke="' + top.plaid + '" stroke-width="1.2" opacity=".75"><path d="M-12 -24 H12 M-12.6 -18 H12.6 M-6 -29 V-12 M0 -29 V-12 M6 -29 V-12"/></g>';
    if (top.zip) s += '<path d="M0 -28 V-12" stroke="' + top.zip + '" stroke-width="1.2"/><path d="M-12 -21 h4 M8 -21 h4" stroke="' + top.zip + '" stroke-width="1.6"/>';
    if (top.bib) s += '<path d="M-8 -22 H8 V-12 H-8 Z" fill="' + top.bib + '"/><path d="M-7 -29 L-6 -22 M7 -29 L6 -22" stroke="' + top.bib + '" stroke-width="2.2"/><circle cx="-6" cy="-21" r="1" fill="#e8b93a"/><circle cx="6" cy="-21" r="1" fill="#e8b93a"/>';
    if (look.back === "backpack") s += '<path d="M-9 -29 L-10 -15 M9 -29 L10 -15" stroke="#b98a30" stroke-width="2.2" stroke-linecap="round"/>';
    if (top.roll) s += '<rect x="-7.5" y="-31.5" width="15" height="5" rx="2.5" fill="' + top.roll + '"/>';
    if (top.knit) s += '<path d="M-11 -14 H11" stroke="#c99a3e" stroke-width="2"/><path d="M-4 -27 L0 -23 L4 -27" fill="none" stroke="#c99a3e" stroke-width="1.6"/>';
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
    if (look.neck === "scarf") s += '<path d="M-9 -29.5 C-4 -26 4 -26 9 -29.5 L9 -27 C4 -23.5 -4 -23.5 -9 -27 Z" fill="#c2453b"/><rect x="3" y="-27" width="4" height="9" rx="1.5" fill="#c2453b"/>';
    if (look.neck === "bowtie") s += '<path d="M0 -28 L-6 -31 L-6 -25 Z M0 -28 L6 -31 L6 -25 Z" fill="#c2453b"/><circle cx="0" cy="-28" r="1.6" fill="#a9363a"/>';
    if (look.neck === "tie") s += '<path d="M-1.8 -28.5 h3.6 l-.8 2 l1.4 8 l-2.4 2.6 l-2.4 -2.6 l1.4 -8 Z" fill="#3a5a8a"/><path d="M-1 -24 l2 -1.2 M-1.2 -21 l2.2 -1.3" stroke="#e8b93a" stroke-width=".7"/>';
    if (look.neck === "pearls") s += '<g fill="#fffdf8" stroke="#d9cbb5" stroke-width=".4">' + [-7, -4.5, -1.5, 1.5, 4.5, 7].map(function (x) { return '<circle cx="' + x + '" cy="' + (-27.5 + Math.abs(x) * -0.25 + 2.2) + '" r="1.3"/>'; }).join("") + '</g>';
    var hy = -43;
    s += HEAD_OPEN;
    s += '<circle cx="0" cy="' + hy + '" r="15" fill="' + skin + '"/>';
    if (style === "spiky") {
      s += '<path d="M-15.5 ' + (hy + 2) + ' L-17 ' + (hy - 10) + ' L-11 ' + (hy - 13) + ' L-10 ' + (hy - 22) + ' L-4 ' + (hy - 16) + ' L0 ' + (hy - 25) + ' L4 ' + (hy - 16) + ' L10 ' + (hy - 22) + ' L11 ' + (hy - 13) + ' L17 ' + (hy - 10) + ' L15.5 ' + (hy + 2) + ' C12 ' + (hy - 5) + ' 4 ' + (hy - 7) + ' 0 ' + (hy - 5) + ' C-4 ' + (hy - 7) + ' -12 ' + (hy - 5) + ' -15.5 ' + (hy + 2) + ' Z" fill="' + hair + '"/>';
    } else if (style === "curly") {
      s += '<path d="M-15.5 ' + (hy + 2) + ' C-17 ' + (hy - 21) + ' 17 ' + (hy - 21) + ' 15.5 ' + (hy + 2) + ' C12 ' + (hy - 5) + ' -12 ' + (hy - 5) + ' -15.5 ' + (hy + 2) + ' Z" fill="' + hair + '"/>';
      [[-14, -6], [-9, -13], [-2, -16], [5, -15], [11, -11], [15, -5], [-16, 1], [16, 1], [-6, -6], [3, -7]].forEach(function (c) { s += '<circle cx="' + c[0] + '" cy="' + (hy + c[1]) + '" r="4.6" fill="' + hair + '"/>'; });
    } else if (style === "buzz") {
      s += '<path d="M-15.2 ' + (hy - 1) + ' C-16 ' + (hy - 20) + ' 16 ' + (hy - 20) + ' 15.2 ' + (hy - 1) + ' C11 ' + (hy - 8) + ' -11 ' + (hy - 8) + ' -15.2 ' + (hy - 1) + ' Z" fill="' + hair + '" opacity=".9"/>';
    } else if (style === "bob" || style === "long" || style === "buns" || style === "pony" || style === "twins") {
      if (style === "twins") s += '<ellipse cx="-19" cy="' + (hy + 3) + '" rx="4.5" ry="10" fill="' + hair + '" transform="rotate(12 -19 ' + (hy + 3) + ')"/><ellipse cx="19" cy="' + (hy + 3) + '" rx="4.5" ry="10" fill="' + hair + '" transform="rotate(-12 19 ' + (hy + 3) + ')"/><circle cx="-16" cy="' + (hy - 7) + '" r="2.2" fill="#e7a6a8"/><circle cx="16" cy="' + (hy - 7) + '" r="2.2" fill="#e7a6a8"/>';
      s += '<path d="M-16 ' + (hy + 3) + ' C-17.5 ' + (hy - 21.5) + ' 17.5 ' + (hy - 21.5) + ' 16 ' + (hy + 3) + ' L13 ' + (hy - 4) + ' L-13 ' + (hy - 4) + ' Z" fill="' + hair + '"/>';
      if (style === "buns") s += '<circle cx="-11" cy="' + (hy - 15) + '" r="5.5" fill="' + hair + '"/><circle cx="11" cy="' + (hy - 15) + '" r="5.5" fill="' + hair + '"/>';
      if (style === "pony") s += '<circle cx="13" cy="' + (hy - 9) + '" r="2.2" fill="#e7a6a8"/>';
    } else if (girl) {
      s += '<path d="M-15.5 ' + (hy + 1) + ' C-17 ' + (hy - 21) + ' 17 ' + (hy - 21) + ' 15.5 ' + (hy + 1) + ' C12 ' + (hy - 6) + ' 4 ' + (hy - 8) + ' 0 ' + (hy - 5) + ' C-4 ' + (hy - 8) + ' -12 ' + (hy - 6) + ' -15.5 ' + (hy + 1) + ' Z" fill="' + hair + '"/>';
      s += '<circle cx="13" cy="' + (hy - 9) + '" r="3" fill="#e7a6a8"/>';
    } else {
      s += '<path d="M-15.5 ' + (hy + 2) + ' C-17.5 ' + (hy - 21.5) + ' 17.5 ' + (hy - 21.5) + ' 15.5 ' + (hy + 2) + ' C13 ' + (hy - 4) + ' 9 ' + (hy - 7) + ' 2 ' + (hy - 6) + ' C-4 ' + (hy - 9) + ' -12 ' + (hy - 5) + ' -15.5 ' + (hy + 2) + ' Z" fill="' + hair + '"/>';
    }
    var ey = opt.lookDown ? hy + 3 : hy + 1;
    if (opt.expr) s += faces(hy, girl);
    else s += '<g class="eyes"><ellipse cx="-5.5" cy="' + ey + '" rx="' + (girl ? 2.1 : 1.6) + '" ry="' + (girl ? 2.6 : 2.1) + '" fill="#2f2622"/><ellipse cx="5.5" cy="' + ey + '" rx="' + (girl ? 2.1 : 1.6) + '" ry="' + (girl ? 2.6 : 2.1) + '" fill="#2f2622"/></g>';
    s += faceMarks(hy, girl, hair);
    s += '<ellipse cx="-9" cy="' + (hy + 5.5) + '" rx="2.6" ry="1.6" fill="' + (girl ? "#f38c9a" : "#f0a0a0") + '" opacity="' + (girl ? .65 : .3) + '"/><ellipse cx="9" cy="' + (hy + 5.5) + '" rx="2.6" ry="1.6" fill="' + (girl ? "#f38c9a" : "#f0a0a0") + '" opacity="' + (girl ? .65 : .3) + '"/>';
    if (!opt.expr) s += opt.smile ? '<path d="M-2.2 ' + (hy + 6) + ' q2.2 2.4 4.4 0" fill="none" stroke="#7a4a3a" stroke-width="1.1" stroke-linecap="round"/>'
                   : '<path d="M-1.5 ' + (hy + 6.5) + ' h3" stroke="#7a4a3a" stroke-width="1.1" stroke-linecap="round"/>';
    if (opt.glow) s += '<ellipse cx="0" cy="' + (hy + 3) + '" rx="13" ry="9" fill="#bfe3ff" opacity=".22"/>';
    if (look.face === "shades") s += '<g fill="#2a2620"><rect x="-10" y="' + (hy - 2) + '" width="8.5" height="5.5" rx="2"/><rect x="1.5" y="' + (hy - 2) + '" width="8.5" height="5.5" rx="2"/><path d="M-1.5 ' + hy + ' h3" stroke="#2a2620" stroke-width="1"/></g>';
    if (look.face === "star") s += '<path d="M9 ' + (hy + 2) + ' l1.2 2.5 2.7 .3 -2 1.8 .6 2.7 -2.5 -1.4 -2.5 1.4 .6 -2.7 -2 -1.8 2.7 -.3 Z" fill="#e8b93a"/>';
    if (look.ears === "muffs") s += '<path d="M-15 ' + (hy - 2) + ' C-15 ' + (hy - 20) + ' 15 ' + (hy - 20) + ' 15 ' + (hy - 2) + '" fill="none" stroke="#c98e9a" stroke-width="2.4"/><circle cx="-15.5" cy="' + hy + '" r="5.5" fill="#f2c4c8"/><circle cx="15.5" cy="' + hy + '" r="5.5" fill="#f2c4c8"/>';
    if (look.hat === "cap") s += '<path d="M-17.5 ' + (hy - 5) + ' C-17.5 ' + (hy - 24) + ' 17.5 ' + (hy - 24) + ' 17.5 ' + (hy - 5) + ' Z" fill="#5d7fa8"/><path d="M-2 ' + (hy - 6) + ' Q12 ' + (hy - 9) + ' 22 ' + (hy - 5) + ' L14 ' + (hy - 3) + ' Z" fill="#4a6a90"/><circle cx="0" cy="' + (hy - 19) + '" r="1.5" fill="#4a6a90"/>';
    if (look.hat === "bunnyband") s += '<path d="M-14 ' + (hy - 10) + ' C-14 ' + (hy - 18) + ' 14 ' + (hy - 18) + ' 14 ' + (hy - 10) + '" fill="none" stroke="#e7a6a8" stroke-width="2"/><ellipse cx="-6" cy="' + (hy - 26) + '" rx="3.6" ry="10" fill="#f8f4ec" stroke="#e0d0c0" stroke-width=".6" transform="rotate(-12 -6 ' + (hy - 26) + ')"/><ellipse cx="6" cy="' + (hy - 26) + '" rx="3.6" ry="10" fill="#f8f4ec" stroke="#e0d0c0" stroke-width=".6" transform="rotate(12 6 ' + (hy - 26) + ')"/><ellipse cx="-6" cy="' + (hy - 25) + '" rx="1.6" ry="7" fill="#f2c4c8" transform="rotate(-12 -6 ' + (hy - 25) + ')"/><ellipse cx="6" cy="' + (hy - 25) + '" rx="1.6" ry="7" fill="#f2c4c8" transform="rotate(12 6 ' + (hy - 25) + ')"/>';
    if (look.hat === "flower") s += '<g transform="translate(-11 ' + (hy - 11) + ')">' + [0, 72, 144, 216, 288].map(function (a) { return '<circle cx="' + (Math.cos(a * Math.PI / 180) * 3).toFixed(2) + '" cy="' + (Math.sin(a * Math.PI / 180) * 3).toFixed(2) + '" r="2.4" fill="#e7a6a8"/>'; }).join("") + '<circle r="1.8" fill="#f2cc4a"/></g>';
    if (look.face === "glasses") s += '<g fill="none" stroke="#4a3a2c" stroke-width="1.1"><circle cx="-5.5" cy="' + (hy + 1) + '" r="3.6"/><circle cx="5.5" cy="' + (hy + 1) + '" r="3.6"/><path d="M-1.9 ' + (hy + 1) + ' h3.8"/></g>';
    if (look.ears === "phones") s += '<path d="M-15 ' + (hy - 2) + ' C-15 ' + (hy - 20) + ' 15 ' + (hy - 20) + ' 15 ' + (hy - 2) + '" fill="none" stroke="#5a6b7a" stroke-width="2.4"/><rect x="-18" y="' + (hy - 4) + '" width="5.5" height="9" rx="2.5" fill="#5a6b7a"/><rect x="12.5" y="' + (hy - 4) + '" width="5.5" height="9" rx="2.5" fill="#5a6b7a"/>';
    if (look.hat === "beanie") s += '<path d="M-17.5 ' + (hy - 4) + ' C-17.5 ' + (hy - 24) + ' 17.5 ' + (hy - 24) + ' 17.5 ' + (hy - 4) + ' Z" fill="#c8574a"/><rect x="-18.5" y="' + (hy - 7) + '" width="37" height="5" rx="2.5" fill="#a9463c"/><circle cx="0" cy="' + (hy - 19) + '" r="3.2" fill="#f3efe6"/>';
    if (look.hat === "straw") s += '<ellipse cx="0" cy="' + (hy - 8) + '" rx="23" ry="5" fill="#e6c27a"/><path d="M-11 ' + (hy - 8) + ' C-11 ' + (hy - 20) + ' 11 ' + (hy - 20) + ' 11 ' + (hy - 8) + ' Z" fill="#e6c27a"/><rect x="-11" y="' + (hy - 11) + '" width="22" height="3" fill="#c2453b"/>';
    if (look.hat === "beret") s += '<ellipse cx="2" cy="' + (hy - 13) + '" rx="19" ry="7.5" fill="#3d3a4a"/><circle cx="2" cy="' + (hy - 21) + '" r="1.6" fill="#3d3a4a"/>';
    if (look.hat === "catband") s += '<path d="M-14 ' + (hy - 10) + ' C-14 ' + (hy - 18) + ' 14 ' + (hy - 18) + ' 14 ' + (hy - 10) + '" fill="none" stroke="#3d3a4a" stroke-width="2"/><path d="M-13 ' + (hy - 12) + ' L-10 ' + (hy - 25) + ' L-3 ' + (hy - 16) + ' Z M13 ' + (hy - 12) + ' L10 ' + (hy - 25) + ' L3 ' + (hy - 16) + ' Z" fill="#3d3a4a"/><path d="M-10.5 ' + (hy - 14) + ' L-9.6 ' + (hy - 21) + ' L-5.5 ' + (hy - 16) + ' Z M10.5 ' + (hy - 14) + ' L9.6 ' + (hy - 21) + ' L5.5 ' + (hy - 16) + ' Z" fill="#f2c4c8"/>';
    if (look.hat === "bucket") s += '<path d="M-22 ' + (hy - 5) + ' L22 ' + (hy - 5) + ' L15 ' + (hy - 11) + ' L13 ' + (hy - 22) + ' C5 ' + (hy - 25) + ' -5 ' + (hy - 25) + ' -13 ' + (hy - 22) + ' L-15 ' + (hy - 11) + ' Z" fill="#c9b48a"/><path d="M-14.6 ' + (hy - 11) + ' H14.6" stroke="#a8916a" stroke-width="2.4"/>';
    if (look.hat === "crown") s += '<path d="M-9 ' + (hy - 12) + ' L-9 ' + (hy - 21) + ' L-4.5 ' + (hy - 16) + ' L0 ' + (hy - 23) + ' L4.5 ' + (hy - 16) + ' L9 ' + (hy - 21) + ' L9 ' + (hy - 12) + ' Z" fill="#e8b93a" stroke="#c99a2a" stroke-width=".8"/><circle cx="0" cy="' + (hy - 15) + '" r="1.6" fill="#c2453b"/>';
    // 寵物坐在頭頂，跟著頭一起點頭（戴帽子就坐在帽子上）
    if (opt.headPet) s += '<g transform="translate(2 ' + (hy - (look.hat && look.hat !== "catband" ? 20 : 15) + (opt.headPet === "chick" || opt.headPet === "hamster" ? 4 : 0)) + ') scale(' + (opt.headPet === "chick" || opt.headPet === "hamster" ? ".5" : ".52") + ')">' + pet(opt.headPet, 0, 0).replace(/<ellipse[^>]*rgba\(60,40,20,\.18\)"\/>/, "") + '</g>';
    s += HEAD_CLOSE;
    s += '</g>';
    if (look.pet && !opt.noPet) s += pet(look.pet, opt.petX != null ? opt.petX : 20, 0);
    return s;
  }

  /* 寵物：坐著、面向左，腳底在 y=0，大約 18 寬 22 高。
     每一塊都是「暗色底 + 亮色往左上偏一點」做出立體感，再加深色細描邊 */
  var INK = "#2f2622";
  function petEyes(x1, x2, y, r, iris) {
    r = r || 1; iris = iris || "#5a3a2a";
    function one(x) {
      return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (1.25 * r) + '" ry="' + (1.5 * r) + '" fill="' + INK + '"/>' +
        '<ellipse cx="' + x + '" cy="' + (y + .5 * r) + '" rx="' + (.95 * r) + '" ry="' + (.75 * r) + '" fill="' + iris + '"/>' +
        '<circle cx="' + (x + .45 * r) + '" cy="' + (y - .55 * r) + '" r="' + (.5 * r) + '" fill="#fff"/><circle cx="' + (x - .4 * r) + '" cy="' + (y + .6 * r) + '" r="' + (.22 * r) + '" fill="#fff" opacity=".85"/>';
    }
    return one(x1) + one(x2);
  }
  function petBlush(x1, x2, y) {
    return '<ellipse cx="' + x1 + '" cy="' + y + '" rx="1.4" ry=".8" fill="#f38c9a" opacity=".6"/><ellipse cx="' + x2 + '" cy="' + y + '" rx="1.4" ry=".8" fill="#f38c9a" opacity=".6"/>';
  }
  function whiskers(x, y) {
    return '<g stroke="' + INK + '" stroke-width=".28" opacity=".5" stroke-linecap="round" fill="none"><path d="M' + (x - 2.8) + ' ' + y + ' q-1.6 -.4 -3.2 -.2 M' + (x - 2.8) + ' ' + (y + .8) + ' q-1.6 .3 -3 1.1 M' + (x + 2.8) + ' ' + y + ' q1.6 -.4 3.2 -.2 M' + (x + 2.8) + ' ' + (y + .8) + ' q1.6 .3 3 1.1"/></g>';
  }
  function snout(x, y, nose) {
    return '<path d="M' + (x - .7) + ' ' + y + ' h1.4 q.1 .6 -.7 .9 q-.8 -.3 -.7 -.9 Z" fill="' + (nose || "#e9798a") + '"/><path d="M' + x + ' ' + (y + .9) + ' v.45 M' + x + ' ' + (y + 1.35) + ' q-.8 .7 -1.5 .1 M' + x + ' ' + (y + 1.35) + ' q.8 .7 1.5 .1" fill="none" stroke="' + INK + '" stroke-width=".38" stroke-linecap="round"/>';
  }
  // 毛茸茸的頭：兩頰各有兩撮毛
  function fluffPath(cx, cy, rx, ry) {
    return 'M' + cx + ' ' + (cy - ry) + ' C' + (cx + rx * .62) + ' ' + (cy - ry) + ' ' + (cx + rx) + ' ' + (cy - ry * .55) + ' ' + (cx + rx) + ' ' + (cy - ry * .05) +
      ' L' + (cx + rx + 1.3) + ' ' + (cy + ry * .28) + ' L' + (cx + rx - .3) + ' ' + (cy + ry * .38) + ' L' + (cx + rx + .9) + ' ' + (cy + ry * .66) + ' L' + (cx + rx * .62) + ' ' + (cy + ry * .78) +
      ' C' + (cx + rx * .35) + ' ' + (cy + ry * 1.02) + ' ' + (cx - rx * .35) + ' ' + (cy + ry * 1.02) + ' ' + (cx - rx * .62) + ' ' + (cy + ry * .78) +
      ' L' + (cx - rx - .9) + ' ' + (cy + ry * .66) + ' L' + (cx - rx + .3) + ' ' + (cy + ry * .38) + ' L' + (cx - rx - 1.3) + ' ' + (cy + ry * .28) + ' L' + (cx - rx) + ' ' + (cy - ry * .05) +
      ' C' + (cx - rx) + ' ' + (cy - ry * .55) + ' ' + (cx - rx * .62) + ' ' + (cy - ry) + ' ' + cx + ' ' + (cy - ry) + ' Z';
  }
  function lit(d, base, shade, line, extra) {
    // 暗色整塊 + 亮色往左上縮一點 + 描邊
    return '<path d="' + d + '" fill="' + shade + '" stroke="' + line + '" stroke-width=".55" stroke-linejoin="round"' + (extra || "") + '/>' +
      '<path d="' + d + '" fill="' + base + '" transform="translate(-.7 -.6) scale(.95)" style="transform-box:fill-box;transform-origin:30% 30%"/>';
  }
  function shine(cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".35" transform="rotate(-25 ' + cx + ' ' + cy + ')"/>';
  }
  var BODY = "M-6.5 0 C-8.4 -3.6 -7.6 -8.8 -3.2 -10.2 L3.6 -9.8 C8.2 -8.8 9.4 -3.6 8.2 0 Z";
  function sitBody(c, sh, line, belly, paw) {
    return lit(BODY, c, sh, line) +
      (belly ? '<path d="M-5 -1 C-6 -4.4 -4.6 -8 -2 -8.4 C.6 -8 1.6 -4.4 1 -1 Z" fill="' + belly + '"/><path d="M-3.4 -6 l.5 .6 l.5 -.6 M-2.6 -4.4 l.5 .6 l.5 -.6" fill="none" stroke="' + sh + '" stroke-width=".3" opacity=".6"/>' : "") +
      '<ellipse cx="6.4" cy="-1.1" rx="2.6" ry="1.6" fill="' + c + '" stroke="' + line + '" stroke-width=".5"/>' +
      paws(paw || c, line);
  }
  function paws(c, line) {
    var s = '';
    [-4.6, -.6].forEach(function (x) {
      s += '<ellipse cx="' + x + '" cy="-.8" rx="2.1" ry="1.35" fill="' + c + '" stroke="' + line + '" stroke-width=".45"/><path d="M' + (x - .6) + ' -.2 v-.7 M' + (x + .6) + ' -.2 v-.7" stroke="' + line + '" stroke-width=".3" stroke-linecap="round"/>';
    });
    return s;
  }
  function ears(c, inner, line, tall) {
    var h = tall || 7;
    return '<path d="M-8.8 -15.2 L-8.3 ' + (-15.2 - h) + ' L-3.6 -18.8 Z M4.4 -15.2 L3.9 ' + (-15.2 - h) + ' L-.8 -18.8 Z" fill="' + c + '" stroke="' + line + '" stroke-width=".55" stroke-linejoin="round"/>' +
      '<path d="M-7.8 -16.6 L-7.5 ' + (-16.6 - h + 2.6) + ' L-5 -18.6 Z M3.4 -16.6 L3.1 ' + (-16.6 - h + 2.6) + ' L.6 -18.6 Z" fill="' + inner + '"/>' +
      '<path d="M-7 -17.4 l.5 -1.6 M-6.4 -17.2 l.7 -1.2 M2.6 -17.4 l-.5 -1.6 M2 -17.2 l-.7 -1.2" stroke="#fff" stroke-width=".3" opacity=".8" stroke-linecap="round"/>';
  }
  function catPet(o, os, ol, oc, iris, stripes, calico) {
    var spot = function (d, c) { return '<path d="' + d + '" fill="' + c + '"/>'; };
    var g = '<path class="tail" d="M7.4 -2.4 C13.6 -2.8 14.6 -9.4 11.2 -14" fill="none" stroke="' + ol + '" stroke-width="3.4" stroke-linecap="round"/><path class="tail" d="M7.4 -2.4 C13.6 -2.8 14.6 -9.4 11.2 -14" fill="none" stroke="' + (calico ? "#3a3036" : o) + '" stroke-width="2.4" stroke-linecap="round"/>' +
      sitBody(o, os, ol, oc === o ? null : oc, oc);
    if (stripes) g += '<path d="M3 -8.8 q1.4 1.8 .5 3.6 M5.6 -8.2 q1.4 1.8 .5 3.6 M7.4 -6.6 q.8 1.2 .3 2.4" fill="none" stroke="' + os + '" stroke-width="1" stroke-linecap="round"/>';
    if (calico) g += spot("M2.6 -9.4 C5.8 -9.6 7.6 -7.2 7 -4.6 C5 -5.6 3 -6.6 2.6 -9.4 Z", "#ee9a4a") + spot("M4.2 -3.2 C6 -4.4 8.4 -3.6 8.4 -1.4 C6.8 -1 5 -1.6 4.2 -3.2 Z", "#3a3036");
    g += ears(o, calico ? "#f6aab4" : (o === "#3c3842" ? "#6a5a66" : "#f6aab4"), ol) + lit(fluffPath(-2.2, -14, 6.9, 5.9), o, os, ol);
    if (calico) g += spot("M-9 -16.4 C-8.6 -19.6 -5.4 -20.2 -3.8 -18.6 C-4.6 -16.4 -6.6 -15 -9 -16.4 Z", "#ee9a4a") + spot("M4.6 -16.2 C4.2 -19.2 1.6 -20 -.2 -18.8 C.4 -16.8 2.4 -15.4 4.6 -16.2 Z", "#3a3036") +
      '<path d="M-8.8 -15.2 L-8.3 -22.2 L-3.6 -18.8 Z" fill="#ee9a4a" stroke="' + ol + '" stroke-width=".55" stroke-linejoin="round"/><path d="M-7.8 -16.6 L-7.5 -19.6 L-5 -18.6 Z" fill="#f6aab4"/>' +
      '<path d="M4.4 -15.2 L3.9 -22.2 L-.8 -18.8 Z" fill="#3a3036" stroke="' + ol + '" stroke-width=".55" stroke-linejoin="round"/><path d="M3.4 -16.6 L3.1 -19.6 L.6 -18.6 Z" fill="#8a6a72"/>';
    if (stripes) g += '<path d="M-3.4 -19.6 q.2 1.2 0 2.2 M-2.2 -19.9 v2.6 M-1 -19.6 q-.2 1.2 0 2.2" stroke="' + os + '" stroke-width=".75" stroke-linecap="round" fill="none"/>' +
      '<path d="M-8.4 -13.4 l1.6 .3 M-8.6 -12.4 l1.6 0 M4 -13.4 l-1.6 .3 M4.2 -12.4 l-1.6 0" stroke="' + os + '" stroke-width=".55" stroke-linecap="round"/>';
    g += shine(-5, -17, 2.2, 1) +
      '<path d="M-5.6 -11.4 C-5.4 -13.2 -3.8 -13 -2.2 -12.4 C-.6 -13 1 -13.2 1.2 -11.4 C.8 -9.6 -.6 -9.2 -2.2 -9.6 C-3.8 -9.2 -5.2 -9.6 -5.6 -11.4 Z" fill="' + (oc === o ? "#fff" : oc) + '" opacity="' + (oc === o ? ".5" : "1") + '"/>' +
      petEyes(-4.8, .4, -14.6, 1, iris) + petBlush(-6.6, 2.2, -12.2) + snout(-2.2, -12.6) + whiskers(-2.2, -11.8);
    if (o === "#3c3842") g = g.replace(/stroke="#2f2622" stroke-width=".28" opacity=".5"/, 'stroke="#d8d0c8" stroke-width=".28" opacity=".7"');
    return g;
  }
  // 柯基：大立耳、白色鼻樑、短腿、屁股小尾巴
  function corgiPet() {
    var c1 = "#ec9a4e", cs = "#c87432", cl = "#8a4c1c", cw = "#fffaf2";
    return '<ellipse cx="8.4" cy="-4.6" rx="1.8" ry="1.4" fill="' + c1 + '" stroke="' + cl + '" stroke-width=".5"/>' +
      sitBody(c1, cs, cl, cw, cw) +
      '<path d="M-10 -15 L-9.6 -24.8 L-3.4 -18.8 Z M5.6 -15 L5.2 -24.8 L-1 -18.8 Z" fill="' + c1 + '" stroke="' + cl + '" stroke-width=".55" stroke-linejoin="round"/>' +
      '<path d="M-8.8 -16.6 L-8.6 -22.4 L-5 -18.8 Z M4.4 -16.6 L4.2 -22.4 L.6 -18.8 Z" fill="#f6c0a8"/><path d="M-7.8 -17.6 l.5 -2 M3.4 -17.6 l-.5 -2" stroke="#fff" stroke-width=".3" opacity=".8"/>' +
      lit(fluffPath(-2.2, -14, 7.2, 5.9), c1, cs, cl) + shine(-5.2, -17.4, 2.2, .9) +
      '<path d="M-2.2 -20 C-1.2 -17.6 -.8 -15.4 -.4 -13.6 C1.6 -13.4 3.6 -12.4 4.4 -11 C3 -8.6 .4 -8 -2.2 -8 C-4.8 -8 -7.4 -8.6 -8.8 -11 C-8 -12.4 -6 -13.4 -4 -13.6 C-3.6 -15.4 -3.2 -17.6 -2.2 -20 Z" fill="' + cw + '"/>' +
      petEyes(-5, .6, -14.6, .95, "#4a2a1a") + petBlush(-7, 2.6, -12) +
      '<ellipse cx="-2.2" cy="-11.9" rx="1.2" ry=".85" fill="' + INK + '"/><circle cx="-2.5" cy="-12.2" r=".3" fill="#fff" opacity=".8"/>' +
      '<path d="M-2.2 -11.1 v.5 M-2.2 -10.6 q-.9 .8 -1.6 .1 M-2.2 -10.6 q.9 .8 1.6 .1" fill="none" stroke="' + INK + '" stroke-width=".38" stroke-linecap="round"/><path d="M-2.9 -10 q.7 1.4 1.4 0 Z" fill="#f08a9a"/>';
  }
  // 貴賓：坐姿跟大家一樣，頭頂一球毛、垂耳捲捲、腳和尾巴是小毛球
  function poodlePet() {
    var p1 = "#d39466", ps = "#ad6e40", pl = "#6e4222", pm = "#ecc49e";
    function puff(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + ps + '" stroke="' + pl + '" stroke-width=".45"/><circle cx="' + (cx - r * .2) + '" cy="' + (cy - r * .2) + '" r="' + (r * .74) + '" fill="' + p1 + '"/>'; }
    function curls(pts) { return '<g fill="none" stroke="' + ps + '" stroke-width=".45" stroke-linecap="round">' + pts.map(function (p) { return '<path d="M' + p[0] + ' ' + p[1] + ' a.9 .9 0 1 1 1.4 .6"/>'; }).join("") + '</g>'; }
    var g = puff(9.6, -6.6, 2.3) + '<path d="M7.4 -3 Q8.8 -4.4 9.2 -5" stroke="' + pl + '" stroke-width=".9" fill="none"/>' +
      sitBody(p1, ps, pl, null, p1) + curls([[1, -8], [4, -7.4], [5.6, -4.6], [2.6, -4.4], [-1.6, -5.6], [-4.6, -6.4], [6, -1.6]]) +
      puff(-4.6, -.9, 1.9) + puff(-.6, -.9, 1.9) +
      lit(fluffPath(-2.2, -13.8, 6.4, 5.6), p1, ps, pl) + curls([[-5.4, -17.4], [-1.6, -18], [1.4, -16.6]]) +
      puff(-5.4, -19.4, 2.5) + puff(-2.2, -20.8, 2.8) + puff(1, -19.4, 2.5) + puff(-2.2, -18.4, 2.2);
    [-9.4, 5].forEach(function (x) {
      g += lit("M" + x + " -16.4 C" + (x - 2.6) + " -16 " + (x - 2.8) + " -9.6 " + x + " -8.6 C" + (x + 2.8) + " -9.6 " + (x + 2.6) + " -16 " + x + " -16.4 Z", p1, ps, pl) +
        curls([[x - 1.2, -14.4], [x - .6, -11.4]]);
    });
    g += '<path d="M-6.2 -11.6 C-6.2 -14 1.8 -14 1.8 -11.6 C1.8 -9 -6.2 -9 -6.2 -11.6 Z" fill="' + pm + '"/>' +
      petEyes(-4.8, .4, -14.4, .9, "#3a2a1a") + petBlush(-6.4, 2, -12.4) +
      '<ellipse cx="-2.2" cy="-12.2" rx="1.1" ry=".8" fill="' + INK + '"/><circle cx="-2.5" cy="-12.5" r=".3" fill="#fff" opacity=".8"/>' +
      '<path d="M-2.2 -11.4 v.45 M-2.2 -10.95 q-.8 .7 -1.4 .1 M-2.2 -10.95 q.8 .7 1.4 .1" fill="none" stroke="' + INK + '" stroke-width=".38" stroke-linecap="round"/>' +
      '<path d="M-4.4 -22.4 l2.2 1.1 l-2.2 1.1 Z M0 -22.4 l-2.2 1.1 l2.2 1.1 Z" fill="#f08a9a" stroke="#c05a6a" stroke-width=".3"/><circle cx="-2.2" cy="-21.3" r=".55" fill="#c05a6a"/>';
    return g;
  }
  // 小雞：圓身體 + 圓頭，頭頂三根毛、小翅膀、尖嘴
  function chickPet() {
    var y1 = "#ffd84e", ys = "#eab42a", yl = "#b88414";
    return '<path d="M-3 -.3 v-1.8 M-3 -.3 l-1.1 .4 M-3 -.3 l1.1 .4 M1.6 -.3 v-1.8 M1.6 -.3 l-1.1 .4 M1.6 -.3 l1.1 .4" stroke="#e08a2a" stroke-width=".75" stroke-linecap="round"/>' +
      '<path d="M6.6 -6.6 l2.6 -1.6 l-.6 1.8 l1.6 .2 l-2.6 1.6 Z" fill="' + ys + '" stroke="' + yl + '" stroke-width=".4" stroke-linejoin="round"/>' +
      lit("M0 -10.6 C4.6 -10.6 7.4 -7.6 7.2 -4.6 C7 -1.6 4.2 -.9 0 -.9 C-4.2 -.9 -7 -1.6 -7.2 -4.6 C-7.4 -7.6 -4.6 -10.6 0 -10.6 Z", y1, ys, yl) +
      '<path d="M-3.4 -2.2 C-4.6 -4.6 -3.6 -7.4 -.6 -7.6 C2 -7.4 2.6 -4.6 1.6 -2.2 Z" fill="#fff4b8" opacity=".8"/>' +
      '<path d="M1.6 -7.6 C4.8 -7.8 6.6 -5.4 6 -3 C4.2 -3.4 2.2 -4.8 1.6 -7.6 Z" fill="' + ys + '" stroke="' + yl + '" stroke-width=".4"/><path d="M3 -6.4 l1.6 2 M4.2 -6.8 l1.4 2.2" stroke="' + yl + '" stroke-width=".3" opacity=".7"/>' +
      lit(fluffPath(-1.6, -13.6, 5.6, 4.8), y1, ys, yl) + shine(-3.8, -16, 1.9, .8) +
      '<path d="M-2.4 -18.2 C-2.8 -20.6 -1.6 -21.8 -.4 -21.6 C-1.2 -20.6 -1 -19.4 -1.2 -18.4 Z M-1.2 -18.4 C-.4 -20.4 1.4 -20.8 2.2 -20 C1 -19.6 .2 -19 -.4 -18.2 Z M-2.6 -18.2 C-3.6 -19.8 -5 -19.8 -5.6 -19 C-4.4 -18.8 -3.6 -18.4 -3 -17.8 Z" fill="' + y1 + '" stroke="' + yl + '" stroke-width=".35" stroke-linejoin="round"/>' +
      petEyes(-4, .6, -14, .9, "#3a2a20") + petBlush(-5.6, 2.2, -12) +
      '<path d="M-1.6 -13 L-3.4 -12.2 L-1.6 -11.4 L.2 -12.2 Z" fill="#f59a3a" stroke="#c0601a" stroke-width=".35" stroke-linejoin="round"/><path d="M-3.4 -12.2 H.2" stroke="#c0601a" stroke-width=".3"/>';
  }
  // 倉鼠：坐姿，圓耳朵、白肚子，兩手抱著葵花子
  function hamsterPet() {
    var h1 = "#eec28a", hs = "#cc9a5a", hl = "#9a6a30", hc = "#fff6e8";
    return '<ellipse cx="7.6" cy="-1.6" rx="1.2" ry=".9" fill="' + h1 + '" stroke="' + hl + '" stroke-width=".4"/>' +
      lit("M-7 0 C-8.8 -3.6 -8 -8.4 -3.4 -9.6 L3.4 -9.4 C8.2 -8.4 9.2 -3.6 8 0 Z", h1, hs, hl) +
      '<path d="M-5.2 -.8 C-6.4 -4.4 -4.8 -8 -1.8 -8.2 C1.2 -8 2.4 -4.4 1.4 -.8 Z" fill="' + hc + '"/>' +
      '<ellipse cx="-4.6" cy="-.6" rx="1.7" ry=".95" fill="#f4c4c8" stroke="' + hl + '" stroke-width=".35"/><ellipse cx=".4" cy="-.6" rx="1.7" ry=".95" fill="#f4c4c8" stroke="' + hl + '" stroke-width=".35"/>' +
      '<circle cx="-7.4" cy="-17.6" r="2.4" fill="' + h1 + '" stroke="' + hl + '" stroke-width=".5"/><circle cx="3" cy="-17.6" r="2.4" fill="' + h1 + '" stroke="' + hl + '" stroke-width=".5"/><circle cx="-7.4" cy="-17.6" r="1.3" fill="#f4b4bc"/><circle cx="3" cy="-17.6" r="1.3" fill="#f4b4bc"/>' +
      lit(fluffPath(-2.2, -13, 7, 5.4), h1, hs, hl) + shine(-5, -16, 2.2, .9) +
      '<path d="M-2.2 -18.2 q.5 1.6 0 3" stroke="' + hs + '" stroke-width="1" stroke-linecap="round" fill="none"/>' +
      '<path d="M-9 -11.6 C-8.6 -9 -5.6 -7.6 -2.2 -7.8 C1.2 -7.6 4.2 -9 4.6 -11.6 C2.4 -10.8 .4 -11.6 -2.2 -11.6 C-4.8 -11.6 -6.8 -10.8 -9 -11.6 Z" fill="' + hc + '"/>' +
      petEyes(-4.9, .5, -13.6, .9, "#3a2a20") + petBlush(-7.2, 2.8, -11) + snout(-2.2, -11.8, "#d98e9a") +
      '<path d="M-2.2 -6.8 C-.6 -6.6 .2 -4.8 -.4 -3.4 C-1 -2.4 -3.4 -2.4 -4 -3.4 C-4.6 -4.8 -3.8 -6.6 -2.2 -6.8 Z" fill="#5a4a3e" stroke="#2f2622" stroke-width=".3"/><path d="M-2.2 -6.4 v3.6 M-3.2 -5.8 q-.2 1.4 .2 2.4 M-1.2 -5.8 q.2 1.4 -.2 2.4" stroke="#f2ead8" stroke-width=".35" fill="none"/>' +
      '<ellipse cx="-4.4" cy="-4.6" rx="1.3" ry="1" fill="#f4c4c8" stroke="' + hl + '" stroke-width=".35"/><ellipse cx="0" cy="-4.6" rx="1.3" ry="1" fill="#f4c4c8" stroke="' + hl + '" stroke-width=".35"/>';
  }
  function pet(kind, x, y) {
    var g = '<g class="cat" transform="translate(' + x + ' ' + y + ')"><ellipse cx="1" cy="0" rx="' + (kind === "chick" || kind === "hamster" ? 6.6 : 9.5) + '" ry="' + (kind === "chick" || kind === "hamster" ? 1.6 : 2.1) + '" fill="rgba(60,40,20,.18)"/>';
    if (kind === "cat") g += catPet("#f0a052", "#d07a32", "#9a5420", "#fff1de", "#7a8a3a", true);
    else if (kind === "blackcat") g += catPet("#3c3842", "#26232b", "#141218", "#5a5560", "#e2b63a", false);
    else if (kind === "calico") g += catPet("#fffaf2", "#e6dccc", "#a89a86", "#fffaf2", "#6a8a3a", false, true);
    else if (kind === "corgi") g += corgiPet();
    else if (kind === "poodle") g += poodlePet();
    // 小雞和倉鼠比貓狗小一號
    else if (kind === "chick") g += '<g transform="scale(.72)">' + chickPet() + '</g>';
    else if (kind === "hamster") g += '<g transform="scale(.75)">' + hamsterPet() + '</g>';
    if (kind === "shiba") {
      var s1 = "#e09a52", ss = "#bc7234", sl = "#8a4c1c", sc = "#fff6e8";
      g += '<path class="tail" d="M6.6 -6 C12.4 -8 14 -14.6 9.4 -15.6 C6.8 -16 6.4 -12.6 9 -12.2 C10.8 -11.6 9.8 -9 6.6 -8.6 Z" fill="' + s1 + '" stroke="' + sl + '" stroke-width=".55" stroke-linejoin="round"/><path d="M9.4 -15.2 C7.6 -15.4 7.2 -13 9.2 -12.6" fill="none" stroke="' + sc + '" stroke-width="1.3" stroke-linecap="round"/>' +
        sitBody(s1, ss, sl, sc, sc) +
        ears(s1, "#f2c9a0", sl, 6.6) + lit(fluffPath(-2.2, -14.2, 7.1, 6), s1, ss, sl) +
        shine(-5, -17.4, 2.2, .9) +
        '<path d="M-9.2 -12.8 C-8 -9 -4.8 -8 -2.2 -8.2 C.4 -8 3.6 -9 4.8 -12.8 C3 -11.6 .8 -12.8 -2.2 -12.8 C-5.2 -12.8 -7.4 -11.6 -9.2 -12.8 Z" fill="' + sc + '"/>' +
        '<ellipse cx="-5.2" cy="-17.6" rx="1.2" ry=".6" fill="' + sc + '"/><ellipse cx=".8" cy="-17.6" rx="1.2" ry=".6" fill="' + sc + '"/>' +
        petEyes(-4.9, .5, -14.8, .95, "#4a2a1a") + petBlush(-6.8, 2.4, -12.2) +
        '<ellipse cx="-2.2" cy="-12.3" rx="1.2" ry=".85" fill="' + INK + '"/><circle cx="-2.5" cy="-12.6" r=".3" fill="#fff" opacity=".8"/>' +
        '<path d="M-2.2 -11.5 v.5 M-2.2 -11 q-.9 .8 -1.6 .1 M-2.2 -11 q.9 .8 1.6 .1" fill="none" stroke="' + INK + '" stroke-width=".38" stroke-linecap="round"/><path d="M-2.9 -10.4 q.7 1.4 1.4 0 Z" fill="#f08a9a"/>' +
        '<path d="M-3.4 -4.2 q1.2 .9 2.4 0" fill="none" stroke="#e05a4a" stroke-width=".9"/><circle cx="-2.2" cy="-3.6" r=".6" fill="#f2c94c"/>';
    } else if (kind === "bunny") {
      var w = "#fffdf8", ws = "#e9e0d2", wl = "#bfb3a2", wp = "#f6b6c0";
      g += '<circle cx="8.2" cy="-3.4" r="2.7" fill="' + w + '" stroke="' + wl + '" stroke-width=".5"/>' +
        lit(BODY, w, ws, wl) + paws(w, wl) +
        '<g transform="rotate(-12 -5 -18)">' + lit("M-5.4 -16.6 C-7.8 -18 -8 -26 -5.4 -29.4 C-2.8 -26 -3 -18 -5.4 -16.6 Z", w, ws, wl) + '<path d="M-5.4 -18.4 C-6.6 -19.6 -6.6 -25 -5.4 -27.2 C-4.2 -25 -4.2 -19.6 -5.4 -18.4 Z" fill="' + wp + '"/></g>' +
        '<g transform="rotate(16 0 -18)">' + lit("M.4 -16.6 C-2 -18 -2.2 -26 .4 -29.4 C3 -26 2.8 -18 .4 -16.6 Z", w, ws, wl) + '<path d="M.4 -18.4 C-.8 -19.6 -.8 -25 .4 -27.2 C1.6 -25 1.6 -19.6 .4 -18.4 Z" fill="' + wp + '"/></g>' +
        lit(fluffPath(-2.4, -13.6, 6.4, 5.4), w, ws, wl) +
        petEyes(-4.9, .1, -14, 1, "#8a3a4a") + petBlush(-6.6, 1.8, -11.8) + snout(-2.4, -12.4, "#f08a9a") +
        '<path d="M-3.2 -10.6 h1.6 v1 h-1.6 Z" fill="#fff" stroke="' + wl + '" stroke-width=".25"/>';
    } else if (kind === "fox") {
      var f1 = "#ee7c3a", fs = "#c45a20", fl = "#8a3a12", fc = "#fffdf8";
      g += '<path class="tail" d="M6.4 -1.8 C13.6 -1.8 16.2 -8.4 13.8 -16 C12.8 -10.6 10 -8.8 6.4 -7.8 Z" fill="' + f1 + '" stroke="' + fl + '" stroke-width=".55" stroke-linejoin="round"/>' +
        '<path d="M13.8 -16 C15 -13.8 15 -12 14.3 -10.6 C13 -11.6 12.6 -13.6 13.8 -16 Z" fill="' + fc + '"/><path d="M9 -5 q2.4 -1.4 3.4 -4" fill="none" stroke="' + fs + '" stroke-width=".5" opacity=".7"/>' +
        sitBody(f1, fs, fl, fc, "#3a2a24") +
        '<path d="M-9 -15 L-8.6 -23.4 L-3.6 -18.6 Z M4.6 -15 L4.2 -23.4 L-.8 -18.6 Z" fill="' + f1 + '" stroke="' + fl + '" stroke-width=".55" stroke-linejoin="round"/>' +
        '<path d="M-8 -16.8 L-7.9 -21 L-5.2 -18.6 Z M3.6 -16.8 L3.5 -21 L.8 -18.6 Z" fill="#3a2a24"/><path d="M-7.2 -17.6 l.4 -1.6 M2.8 -17.6 l-.4 -1.6" stroke="#fff" stroke-width=".3" opacity=".7"/>' +
        lit(fluffPath(-2.2, -14, 7, 5.8), f1, fs, fl) + shine(-5, -17.4, 2.2, .9) +
        '<path d="M-9.4 -13 C-7.2 -13.4 -4.4 -12.6 -2.2 -9.2 C0 -12.6 2.8 -13.4 5 -13 C4 -9.6 .6 -8 -2.2 -8 C-5 -8 -8.4 -9.6 -9.4 -13 Z" fill="' + fc + '"/>' +
        petEyes(-4.9, .5, -14.9, .95, "#c87a2a") + petBlush(-7, 2.6, -12.6) +
        '<ellipse cx="-2.2" cy="-9.8" rx="1.1" ry=".8" fill="' + INK + '"/><circle cx="-2.5" cy="-10.1" r=".3" fill="#fff" opacity=".8"/>';
    }
    return g + '</g>';
  }
  function cat(x, y) { return pet("cat", x, y); }

  /* ===== 書桌與活動道具 ===== */
  function desk(act, active) {
    var s = '';
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
    } else if (act === "music") {
      s += '<g transform="rotate(-28 2 -20)"><rect x="4" y="-21.5" width="20" height="3" rx="1" fill="#7a4a2a"/><ellipse cx="-2" cy="-20" rx="8" ry="6.5" fill="#d9903e"/><ellipse cx="5" cy="-20" rx="5" ry="4.5" fill="#d9903e"/><circle cx="0" cy="-20" r="2" fill="#3b2a20"/></g>';
    } else if (act === "piano") {
      s += '<rect x="-18" y="-21" width="36" height="6" rx="1" fill="#2a2620"/><rect x="-16.5" y="-19.5" width="33" height="3.5" fill="#fbf8f2"/>';
      s += '<g fill="#1c1a18">' + [-14, -11, -5, -2, 1, 7, 10, 13].map(function (x) { return '<rect x="' + x + '" y="-19.5" width="1.6" height="2"/>'; }).join("") + '</g>';
    }
    return s;
  }

  // 兩碼國家代碼 → 國旗表情符號
  function flag(c) { return /^[A-Z]{2}$/.test(c || "") ? String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65, 0x1F1E6 + c.charCodeAt(1) - 65) : ""; }
  function nameTag(name, y, me, fl) {
    var f = flag(fl), w = Math.min(84, 10 + String(name).length * 7.5 + (f ? 10 : 0));
    return '<g transform="translate(0 ' + y + ')"><rect x="' + (-w / 2) + '" y="-8" width="' + w + '" height="11" rx="5.5" fill="' + (me ? "#9a7440" : "rgba(42,38,32,.72)") + '"/>' +
      '<text x="0" y="0.5" text-anchor="middle" font-size="7" fill="#f8f4ec" font-family="Twemoji Country Flags, Noto Sans TC, sans-serif">' + (f ? f + " " : "") + esc(String(name).slice(0, 8)) + '</text></g>';
  }
  function bubble(text, y) {
    var w = Math.min(110, 14 + String(text).length * 8);
    return '<g class="bubble" transform="translate(0 ' + y + ')"><rect x="' + (-w / 2) + '" y="-14" width="' + w + '" height="14" rx="7" fill="#fff" stroke="#ddd2c0"/><path d="M-3 0 l3 4 l3 -4" fill="#fff" stroke="#ddd2c0"/><rect x="-3.5" y="-1.5" width="7" height="2" fill="#fff"/>' +
      '<text x="0" y="-4" text-anchor="middle" font-size="8" fill="#2a2620" font-family="Twemoji Country Flags, Noto Sans TC, sans-serif">' + esc(text) + '</text></g>';
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
    s += '<rect x="160" y="22" width="100" height="74" rx="4" fill="#fff8ec"/><rect x="166" y="28" width="88" height="62" fill="url(#sky)"/>';
    s += '<circle cx="232" cy="52" r="8" fill="#fff1c9" opacity=".9"/><path d="M166 80 q20 -12 40 -2 q22 -14 48 0 V90 H166 Z" fill="#c9a37a" opacity=".55"/>';
    s += '<path d="M210 28 V90 M166 59 H254" stroke="#fff8ec" stroke-width="4"/>';
    s += '<path d="M152 18 C162 40 158 80 150 102 L162 102 C170 70 170 40 168 18 Z" fill="#c9746a"/><path d="M268 18 C258 40 262 80 270 102 L258 102 C250 70 250 40 252 18 Z" fill="#c9746a"/><rect x="146" y="14" width="128" height="5" rx="2.5" fill="#9a6640"/>';
    s += '<path d="M0 8 Q105 30 210 10 Q315 30 420 8" fill="none" stroke="#8a6a4a" stroke-width="1"/>';
    [20, 55, 90, 125, 160, 195, 230, 265, 300, 335, 370, 405].forEach(function (x, i) {
      var y = x < 210 ? 8 + 22 * Math.sin(Math.PI * x / 210) * .9 : 8 + 22 * Math.sin(Math.PI * (x - 210) / 210) * .9;
      s += '<circle class="bulb b' + (i % 3) + '" cx="' + x + '" cy="' + (y + 3) + '" r="3" fill="' + ["#ffd27a", "#ffb8a0", "#c9e6a8"][i % 3] + '"/>';
    });
    // 牆上畫框與時鐘
    s += '<rect x="108" y="40" width="34" height="26" fill="#f8f4ec" stroke="#9a6640" stroke-width="3"/><path d="M112 62 l8 -10 l6 6 l5 -4 l8 8 Z" fill="#8fae7a"/><circle cx="133" cy="48" r="3" fill="#e8b93a"/>';
    s += '<circle cx="62" cy="38" r="11" fill="#f8f4ec" stroke="#9a6640" stroke-width="3"/><path d="M62 38 V31 M62 38 L67 41" stroke="#2a2620" stroke-width="1.5" stroke-linecap="round"/>';
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
    s += '<ellipse cx="215" cy="255" rx="128" ry="52" fill="#d9a77e"/><ellipse cx="215" cy="255" rx="116" ry="44" fill="none" stroke="#f3e3c6" stroke-width="3" stroke-dasharray="6 5"/>';
    // 沙發（背）
    s += '<rect x="6" y="236" width="104" height="30" rx="10" fill="#c26f5e"/>';
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
    return body + nameTag(m.name, ty, m.me, "") + (m.bubble ? bubble(m.bubble, ty - 10) : "");
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
          nameTag(m.name, -72, m.me, "") + (m.bubble ? bubble(m.bubble, -82) : "") + '</g>';
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

  // 個人設定的半身像：輪流換表情（眨眼微笑、開心、眨一隻眼、驚訝）
  // 女生眼尾睫毛、男生眉毛
  function faceMarks(hy, girl, hair) {
    if (girl) return '<g stroke="#2f2622" stroke-width=".9" stroke-linecap="round" fill="none"><path d="M-8 ' + (hy - 1) + ' l-1.6 -1.4 M-7.6 ' + (hy - 1.8) + ' l-1 -1.8 M8 ' + (hy - 1) + ' l1.6 -1.4 M7.6 ' + (hy - 1.8) + ' l1 -1.8"/></g>';
    return '<g stroke="' + hair + '" stroke-width="1.5" stroke-linecap="round"><path d="M-8 ' + (hy - 4) + ' L-3.4 ' + (hy - 4.6) + ' M8 ' + (hy - 4) + ' L3.4 ' + (hy - 4.6) + '"/></g>';
  }
  function faces(hy, girl) {
    var ink = '#2f2622', lip = girl ? '#d0606a' : '#7a4a3a', y = hy + 1;
    var dot = function (x) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (girl ? 2.1 : 1.6) + '" ry="' + (girl ? 2.6 : 2.1) + '" fill="' + ink + '"/>'; };
    var arc = function (x) { return '<path d="M' + (x - 2.2) + ' ' + (y + 0.8) + ' q2.2 -3 4.4 0" fill="none" stroke="' + ink + '" stroke-width="1.3" stroke-linecap="round"/>'; };
    var smile = '<path d="M-2.2 ' + (hy + 6) + ' q2.2 2.4 4.4 0" fill="none" stroke="' + lip + '" stroke-width="1.1" stroke-linecap="round"/>';
    return '<g class="ex ex0"><g class="blink">' + dot(-5.5) + dot(5.5) + '</g>' + smile + '</g>' +
      '<g class="ex ex1">' + arc(-5.5) + arc(5.5) + '<path d="M-3 ' + (hy + 5.5) + ' q3 4.2 6 0 Z" fill="' + lip + '"/></g>' +
      '<g class="ex ex2">' + arc(-5.5) + dot(5.5) + '<path d="M-2.5 ' + (hy + 6) + ' q2.5 2 5 -.6" fill="none" stroke="' + lip + '" stroke-width="1.1" stroke-linecap="round"/></g>' +
      '<g class="ex ex3"><circle cx="-5.5" cy="' + y + '" r="2.2" fill="' + ink + '"/><circle cx="5.5" cy="' + y + '" r="2.2" fill="' + ink + '"/><ellipse cx="0" cy="' + (hy + 7) + '" rx="1.6" ry="2" fill="' + lip + '"/></g>';
  }
  function bust(look, still, headPet) {
    return '<g class="bust">' + character(look, "stand", still ? { smile: true, noPet: true, headPet: headPet } : { expr: true, noPet: true, headPet: headPet }) + '</g>';
  }

  /* 角色預覽（角色頁與選單用） */
  function preview(look, opt) {
    opt = opt || {};
    return '<rect x="-60" y="-100" width="120" height="116" rx="10" fill="#efe0c6"/><rect x="-60" y="-4" width="120" height="20" fill="#c8976a"/>' +
      '<g transform="scale(1.35)">' + character(look, "stand", { smile: true, petX: 24 }) + '</g>';
  }

  window.KaidaScene = { flag: flag, pet: pet, render: render, move: move, preview: preview, bust: bust, ITEMS: ITEMS, CATS: CATS, item: item, SKINS: SKINS, HAIRS: HAIRS, ACTS: ACTS, defaultLook: defaultLook, W: W, H: H };
})();
