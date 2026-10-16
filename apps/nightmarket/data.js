/*
 * 台灣夜市資料
 * 由開達整理自公開資訊（各縣市觀光網站、OpenStreetMap 等），未逐一實地查證。
 * 座標為夜市大致中心點；營業日、時間與攤位會變動，一切以現場為準。
 * days：營業的星期（0 = 週日 … 6 = 週六）；null 表示每天營業。
 */
window.NM_DATA_UPDATED = "2026-10";

window.NM_CITIES = [
  { key: "keelung", zh: "基隆", en: "Keelung" },
  { key: "taipei", zh: "台北", en: "Taipei" },
  { key: "newtaipei", zh: "新北", en: "New Taipei" },
  { key: "taoyuan", zh: "桃園", en: "Taoyuan" },
  { key: "hsinchu", zh: "新竹", en: "Hsinchu" },
  { key: "taichung", zh: "台中", en: "Taichung" },
  { key: "chiayi", zh: "嘉義", en: "Chiayi" },
  { key: "tainan", zh: "台南", en: "Tainan" },
  { key: "kaohsiung", zh: "高雄", en: "Kaohsiung" },
  { key: "pingtung", zh: "屏東", en: "Pingtung" },
  { key: "yilan", zh: "宜蘭", en: "Yilan" },
  { key: "hualien", zh: "花蓮", en: "Hualien" },
  { key: "taitung", zh: "台東", en: "Taitung" }
];

window.NM_MARKETS = [
  {
    id: "miaokou", city: "keelung", lat: 25.1283, lng: 121.7434, days: null, hours: "11:00–24:00",
    zh: "基隆廟口夜市", en: "Keelung Miaokou Night Market",
    foodsZh: ["鼎邊趖", "營養三明治", "天婦羅", "泡泡冰", "豆簽羹"],
    foodsEn: ["Ding bian cuo (rice-batter soup)", "Fried 'nutritious' sandwich", "Tempura fish cake", "Shaved bubble ice", "Bean noodle soup"],
    transitZh: "基隆火車站步行約 10 分鐘", transitEn: "About 10 min walk from Keelung Station",
    noteZh: "圍著奠濟宮的老牌小吃街，白天就有不少攤開門。", noteEn: "Old food street around Dianji Temple; many stalls open in the daytime too."
  },
  {
    id: "shilin", city: "taipei", lat: 25.0878, lng: 121.5241, days: null, hours: "16:00–24:00",
    zh: "士林夜市", en: "Shilin Night Market",
    foodsZh: ["大雞排", "士林大香腸", "青蛙下蛋", "生炒花枝", "蚵仔煎"],
    foodsEn: ["Giant fried chicken cutlet", "Grilled sausage", "Bubble tea 'frog eggs'", "Stir-fried squid", "Oyster omelette"],
    transitZh: "捷運劍潭站 1 號出口", transitEn: "MRT Jiantan Station, Exit 1",
    noteZh: "台北規模最大的夜市，地下美食區加上周邊巷弄，逛不完。", noteEn: "Taipei's biggest night market, with an underground food court and side alleys."
  },
  {
    id: "raohe", city: "taipei", lat: 25.0509, lng: 121.5774, days: null, hours: "17:00–24:00",
    zh: "饒河街觀光夜市", en: "Raohe Street Night Market",
    foodsZh: ["胡椒餅", "藥燉排骨", "麻辣臭豆腐", "蚵仔麵線", "烤玉米"],
    foodsEn: ["Black pepper bun", "Herbal pork rib soup", "Spicy stinky tofu", "Oyster vermicelli", "Grilled corn"],
    transitZh: "捷運松山站 5 號出口", transitEn: "MRT Songshan Station, Exit 5",
    noteZh: "一條直線約 600 公尺，入口在慈祐宮旁，路線好走。", noteEn: "A straight 600 m strip starting by Ciyou Temple; easy to walk."
  },
  {
    id: "ningxia", city: "taipei", lat: 25.0560, lng: 121.5153, days: null, hours: "17:00–24:00",
    zh: "寧夏夜市", en: "Ningxia Night Market",
    foodsZh: ["蚵仔煎", "芋餅", "豬肝湯", "滷肉飯", "愛玉冰"],
    foodsEn: ["Oyster omelette", "Fried taro balls", "Pork liver soup", "Braised pork rice", "Aiyu jelly"],
    transitZh: "捷運雙連站或中山站步行約 8 分鐘", transitEn: "About 8 min walk from MRT Shuanglian or Zhongshan",
    noteZh: "以台灣小吃為主的夜市，攤位集中，適合專心吃。", noteEn: "Compact and food-focused; great for a pure eating trip."
  },
  {
    id: "huaxi", city: "taipei", lat: 25.0380, lng: 121.4983, days: null, hours: "16:00–24:00",
    zh: "華西街觀光夜市", en: "Huaxi Street Night Market",
    foodsZh: ["擔仔麵", "米糕", "冬瓜茶", "鱔魚意麵", "肉圓"],
    foodsEn: ["Danzai noodles", "Glutinous rice cake", "Winter melon tea", "Eel noodles", "Ba-wan meatball"],
    transitZh: "捷運龍山寺站 1 號出口", transitEn: "MRT Longshan Temple Station, Exit 1",
    noteZh: "有屋頂的老街夜市，鄰近龍山寺，下雨天也能逛。", noteEn: "Covered arcade next to Longshan Temple; fine on rainy days."
  },
  {
    id: "linjiang", city: "taipei", lat: 25.0302, lng: 121.5544, days: null, hours: "18:00–24:00",
    zh: "臨江街觀光夜市（通化夜市）", en: "Linjiang Street (Tonghua) Night Market",
    foodsZh: ["割包", "蔥油餅", "麻糬", "滷味", "豆花"],
    foodsEn: ["Gua bao (pork bun)", "Scallion pancake", "Mochi", "Lu wei braised snacks", "Douhua"],
    transitZh: "捷運信義安和站 4 號出口", transitEn: "MRT Xinyi Anhe Station, Exit 4",
    noteZh: "靠近信義區的生活型夜市，當地上班族很多。", noteEn: "Neighbourhood market near Xinyi, popular with office workers."
  },
  {
    id: "nanjichang", city: "taipei", lat: 25.0293, lng: 121.5065, days: null, hours: "17:00–24:00",
    zh: "南機場夜市", en: "Nanjichang Night Market",
    foodsZh: ["炸物", "烤玉米", "肉圓", "滷肉飯", "車輪餅"],
    foodsEn: ["Fried snacks", "Grilled corn", "Ba-wan meatball", "Braised pork rice", "Wheel cake"],
    transitZh: "捷運小南門站轉乘公車，或西門町騎 YouBike 約 10 分鐘", transitEn: "Bus from MRT Xiaonanmen, or ~10 min by YouBike from Ximending",
    noteZh: "在地人愛去的社區夜市，觀光客較少。", noteEn: "A local favourite with fewer tourists."
  },
  {
    id: "gongguan", city: "taipei", lat: 25.0145, lng: 121.5345, days: null, hours: "16:00–24:00",
    zh: "公館夜市", en: "Gongguan Night Market",
    foodsZh: ["割包", "黑糖珍珠鮮奶", "臭豆腐", "鹽酥雞", "車輪餅"],
    foodsEn: ["Gua bao", "Brown sugar boba milk", "Stinky tofu", "Popcorn chicken", "Wheel cake"],
    transitZh: "捷運公館站 1 號出口", transitEn: "MRT Gongguan Station, Exit 1",
    noteZh: "台大旁的學生商圈，飲料和平價小吃多。", noteEn: "Student area next to National Taiwan University; cheap eats and drinks."
  },
  {
    id: "yansan", city: "taipei", lat: 25.0640, lng: 121.5115, days: null, hours: "17:00–24:00",
    zh: "延三夜市", en: "Yansan Night Market",
    foodsZh: ["肉羹", "麻油雞", "炒米粉", "四神湯", "烤香腸"],
    foodsEn: ["Pork thick soup", "Sesame oil chicken", "Fried rice noodles", "Four herbs soup", "Grilled sausage"],
    transitZh: "捷運大橋頭站 1 號出口", transitEn: "MRT Daqiaotou Station, Exit 1",
    noteZh: "大稻埕一帶的老社區夜市，傳統小吃多。", noteEn: "Old-town Dadaocheng market with classic snacks."
  },
  {
    id: "lehua", city: "newtaipei", lat: 25.0080, lng: 121.5110, days: null, hours: "17:00–24:00",
    zh: "樂華夜市", en: "Lehua Night Market",
    foodsZh: ["鹽酥雞", "炸雞排", "珍珠奶茶", "臭豆腐", "烤魷魚"],
    foodsEn: ["Popcorn chicken", "Fried chicken cutlet", "Bubble tea", "Stinky tofu", "Grilled squid"],
    transitZh: "捷運頂溪站 1 號出口步行約 8 分鐘", transitEn: "About 8 min walk from MRT Dingxi, Exit 1",
    noteZh: "永和人的日常夜市，攤位密集、價格親民。", noteEn: "Yonghe's everyday night market, dense and affordable."
  },
  {
    id: "xinzhuang", city: "newtaipei", lat: 25.0360, lng: 121.4515, days: null, hours: "11:00–23:00",
    zh: "新莊廟街夜市", en: "Xinzhuang Temple Street Night Market",
    foodsZh: ["炸粿", "蝦仁羹", "米苔目", "麻糬", "豬血糕"],
    foodsEn: ["Fried radish cake", "Shrimp thick soup", "Rice noodles (mi tai mu)", "Mochi", "Pig blood cake"],
    transitZh: "捷運新莊站 2 號出口", transitEn: "MRT Xinzhuang Station, Exit 2",
    noteZh: "沿著新莊路的百年老街，廟宇和老店並排。", noteEn: "Century-old street of temples and long-running food shops."
  },
  {
    id: "sanhe", city: "newtaipei", lat: 25.0670, lng: 121.4955, days: null, hours: "17:00–24:00",
    zh: "三和夜市", en: "Sanhe Night Market",
    foodsZh: ["蚵仔煎", "肉圓", "生煎包", "烤香腸", "芋圓"],
    foodsEn: ["Oyster omelette", "Ba-wan meatball", "Pan-fried buns", "Grilled sausage", "Taro balls"],
    transitZh: "捷運台北橋站步行約 5 分鐘", transitEn: "About 5 min walk from MRT Taipei Bridge",
    noteZh: "三重的老夜市，在地小吃多。", noteEn: "Long-standing Sanchong market with local snacks."
  },
  {
    id: "zhongyuan", city: "taoyuan", lat: 24.9580, lng: 121.2410, days: null, hours: "17:00–24:00",
    zh: "中原夜市", en: "Zhongyuan Night Market",
    foodsZh: ["雞排", "臭豆腐", "炸湯圓", "珍珠奶茶", "烤肉串"],
    foodsEn: ["Fried chicken cutlet", "Stinky tofu", "Fried tangyuan", "Bubble tea", "Skewers"],
    transitZh: "中壢火車站搭公車往中原大學", transitEn: "Bus from Zhongli Station towards Chung Yuan University",
    noteZh: "中原大學旁的學生夜市，東南亞料理也不少。", noteEn: "Student market by Chung Yuan University, with plenty of Southeast Asian food."
  },
  {
    id: "hsinchu-temple", city: "hsinchu", lat: 24.8045, lng: 120.9658, days: null, hours: "10:00–22:00",
    zh: "新竹城隍廟小吃", en: "Hsinchu City God Temple Food Area",
    foodsZh: ["米粉", "貢丸湯", "肉圓", "潤餅", "鴨肉飯"],
    foodsEn: ["Rice vermicelli", "Pork ball soup", "Ba-wan meatball", "Spring roll (run bing)", "Duck rice"],
    transitZh: "新竹火車站步行約 10 分鐘", transitEn: "About 10 min walk from Hsinchu Station",
    noteZh: "廟前小吃區從白天開到晚上，新竹米粉、貢丸一次吃到。", noteEn: "Temple food area open day to night; Hsinchu rice noodles and pork balls."
  },
  {
    id: "fengjia", city: "taichung", lat: 24.1745, lng: 120.6462, days: null, hours: "16:00–01:00",
    zh: "逢甲夜市", en: "Fengjia Night Market",
    foodsZh: ["大腸包小腸", "起司馬鈴薯", "明倫蛋餅", "大魷魚", "日式章魚燒"],
    foodsEn: ["Sausage in sticky-rice sausage", "Cheesy potato", "Minglun egg crepe", "Giant squid", "Takoyaki"],
    transitZh: "台中火車站搭公車往逢甲大學", transitEn: "Bus from Taichung Station to Feng Chia University",
    noteZh: "全台知名的創意小吃發源地，人潮最多在週末。", noteEn: "Birthplace of many trendy snacks; busiest on weekends."
  },
  {
    id: "yizhong", city: "taichung", lat: 24.1497, lng: 120.6851, days: null, hours: "15:00–23:00",
    zh: "一中街商圈", en: "Yizhong Street",
    foodsZh: ["豐仁冰", "雞排", "地瓜球", "珍珠奶茶", "車輪餅"],
    foodsEn: ["Fengren shaved ice", "Fried chicken cutlet", "Sweet potato balls", "Bubble tea", "Wheel cake"],
    transitZh: "台中火車站騎 YouBike 約 10 分鐘", transitEn: "About 10 min by YouBike from Taichung Station",
    noteZh: "台中一中旁的學生商圈，飲料店一間接一間。", noteEn: "Student shopping street with endless drink shops."
  },
  {
    id: "tunghai", city: "taichung", lat: 24.1810, lng: 120.5950, days: null, hours: "17:00–24:00",
    zh: "東海夜市", en: "Tunghai Night Market",
    foodsZh: ["鹽酥雞", "炒飯", "滷味", "豆花", "雞蛋糕"],
    foodsEn: ["Popcorn chicken", "Fried rice", "Lu wei braised snacks", "Douhua", "Egg cake"],
    transitZh: "搭公車至東海大學", transitEn: "Bus to Tunghai University",
    noteZh: "東海大學旁的學生夜市，晚餐選擇多。", noteEn: "Student market next to Tunghai University."
  },
  {
    id: "zhongxiao-tc", city: "taichung", lat: 24.1320, lng: 120.6880, days: null, hours: "17:00–02:00",
    zh: "忠孝夜市", en: "Zhongxiao Night Market (Taichung)",
    foodsZh: ["肉圓", "麻油雞", "炒鱔魚", "米糕", "冰品"],
    foodsEn: ["Ba-wan meatball", "Sesame oil chicken", "Stir-fried eel", "Glutinous rice cake", "Shaved ice"],
    transitZh: "台中火車站騎 YouBike 約 10 分鐘", transitEn: "About 10 min by YouBike from Taichung Station",
    noteZh: "以傳統台式小吃為主，開到深夜。", noteEn: "Traditional Taiwanese food, open late."
  },
  {
    id: "wenhua-cy", city: "chiayi", lat: 23.4795, lng: 120.4495, days: null, hours: "17:00–02:00",
    zh: "文化路夜市", en: "Wenhua Road Night Market",
    foodsZh: ["雞肉飯", "粿仔湯", "豆花", "砂鍋魚頭", "烤玉米"],
    foodsEn: ["Turkey rice", "Rice noodle soup", "Douhua", "Fish head casserole", "Grilled corn"],
    transitZh: "嘉義火車站步行約 15 分鐘", transitEn: "About 15 min walk from Chiayi Station",
    noteZh: "從中央噴水池一路延伸，嘉義雞肉飯必吃。", noteEn: "Runs from the central fountain; try Chiayi turkey rice."
  },
  {
    id: "garden", city: "tainan", lat: 23.0105, lng: 120.2117, days: [4, 6, 0], hours: "18:00–24:00",
    zh: "花園夜市", en: "Garden Night Market",
    foodsZh: ["牛排", "炭烤", "臭豆腐", "蚵仔煎", "檸檬汁"],
    foodsEn: ["Night-market steak", "Charcoal BBQ", "Stinky tofu", "Oyster omelette", "Lemon juice"],
    transitZh: "台南火車站搭計程車約 10 分鐘", transitEn: "About 10 min by taxi from Tainan Station",
    noteZh: "台南最大的流動夜市，只在週四、六、日營業。", noteEn: "Tainan's biggest rotating market, open Thu, Sat and Sun only."
  },
  {
    id: "dadong", city: "tainan", lat: 22.9858, lng: 120.2238, days: [1, 2, 5], hours: "18:00–24:00",
    zh: "大東夜市", en: "Dadong Night Market",
    foodsZh: ["烤肉串", "雞排", "炸物", "冬瓜茶", "章魚燒"],
    foodsEn: ["Skewers", "Fried chicken cutlet", "Fried snacks", "Winter melon tea", "Takoyaki"],
    transitZh: "台南火車站搭計程車約 10 分鐘", transitEn: "About 10 min by taxi from Tainan Station",
    noteZh: "週一、二、五營業，和花園、武聖輪流開。", noteEn: "Open Mon, Tue and Fri, taking turns with Garden and Wusheng."
  },
  {
    id: "wusheng", city: "tainan", lat: 23.0035, lng: 120.1915, days: [3, 6], hours: "18:00–24:00",
    zh: "武聖夜市", en: "Wusheng Night Market",
    foodsZh: ["臭豆腐", "烤玉米", "蚵仔煎", "地瓜球", "珍珠奶茶"],
    foodsEn: ["Stinky tofu", "Grilled corn", "Oyster omelette", "Sweet potato balls", "Bubble tea"],
    transitZh: "台南火車站搭計程車約 10 分鐘", transitEn: "About 10 min by taxi from Tainan Station",
    noteZh: "週三、六營業，在地人比例高。", noteEn: "Open Wed and Sat; mostly locals."
  },
  {
    id: "liuhe", city: "kaohsiung", lat: 22.6318, lng: 120.2990, days: null, hours: "18:00–24:00",
    zh: "六合觀光夜市", en: "Liuhe Night Market",
    foodsZh: ["木瓜牛奶", "海產粥", "烤海鮮", "鱔魚意麵", "滷肉飯"],
    foodsEn: ["Papaya milk", "Seafood congee", "Grilled seafood", "Eel noodles", "Braised pork rice"],
    transitZh: "捷運美麗島站 11 號出口", transitEn: "MRT Formosa Boulevard Station, Exit 11",
    noteZh: "高雄最有名的觀光夜市，走路就到美麗島站。", noteEn: "Kaohsiung's best-known tourist market, right by Formosa Boulevard."
  },
  {
    id: "ruifeng", city: "kaohsiung", lat: 22.6660, lng: 120.2995, days: [2, 4, 5, 6, 0], hours: "18:00–24:00",
    zh: "瑞豐夜市", en: "Ruifeng Night Market",
    foodsZh: ["牛排", "麻辣鴨血", "炸雞", "日式燒烤", "冰沙"],
    foodsEn: ["Night-market steak", "Spicy duck blood", "Fried chicken", "Japanese BBQ", "Smoothies"],
    transitZh: "捷運巨蛋站 1 號出口", transitEn: "MRT Kaohsiung Arena Station, Exit 1",
    noteZh: "高雄在地人最愛，週一、週三公休。", noteEn: "Kaohsiung locals' favourite; closed Mon and Wed."
  },
  {
    id: "minzu-pt", city: "pingtung", lat: 22.6735, lng: 120.4890, days: null, hours: "17:00–24:00",
    zh: "屏東觀光夜市（民族路夜市）", en: "Pingtung Night Market (Minzu Road)",
    foodsZh: ["燒冷冰", "肉圓", "豬腳", "粉粿", "鹹湯圓"],
    foodsEn: ["Hot-and-cold shaved ice", "Ba-wan meatball", "Pork knuckle", "Fen guo jelly", "Savory tangyuan"],
    transitZh: "屏東火車站步行約 10 分鐘", transitEn: "About 10 min walk from Pingtung Station",
    noteZh: "屏東市區的老夜市，燒冷冰是招牌。", noteEn: "Old downtown market; famous for hot-and-cold shaved ice."
  },
  {
    id: "kenting", city: "pingtung", lat: 21.9455, lng: 120.7965, days: null, hours: "18:00–24:00",
    zh: "墾丁大街夜市", en: "Kenting Street Night Market",
    foodsZh: ["烤魷魚", "椰子汁", "海鮮", "雞蛋糕", "啤酒"],
    foodsEn: ["Grilled squid", "Coconut juice", "Seafood", "Egg cake", "Beer"],
    transitZh: "墾丁快線至墾丁站", transitEn: "Kenting Express bus to Kenting stop",
    noteZh: "墾丁大街整條變成夜市，旅遊旺季人潮多。", noteEn: "The whole main street turns into a market; packed in peak season."
  },
  {
    id: "luodong", city: "yilan", lat: 24.6775, lng: 121.7690, days: null, hours: "17:00–24:00",
    zh: "羅東夜市", en: "Luodong Night Market",
    foodsZh: ["包心粉圓", "卜肉", "羊肉湯", "三星蔥餅", "龍鳳腿"],
    foodsEn: ["Filled tapioca balls", "Fried pork strips (bu rou)", "Lamb soup", "Sanxing scallion pancake", "Long feng tui roll"],
    transitZh: "羅東火車站步行約 8 分鐘", transitEn: "About 8 min walk from Luodong Station",
    noteZh: "圍著羅東中山公園，宜蘭最熱鬧的夜市。", noteEn: "Around Luodong Zhongshan Park; Yilan's liveliest market."
  },
  {
    id: "dongmen-yl", city: "yilan", lat: 24.7540, lng: 121.7585, days: null, hours: "17:00–24:00",
    zh: "宜蘭東門夜市", en: "Yilan Dongmen Night Market",
    foodsZh: ["卜肉", "臭豆腐", "米糕", "炸蔥油餅", "麻糬"],
    foodsEn: ["Fried pork strips (bu rou)", "Stinky tofu", "Glutinous rice cake", "Fried scallion pancake", "Mochi"],
    transitZh: "宜蘭火車站步行約 8 分鐘", transitEn: "About 8 min walk from Yilan Station",
    noteZh: "宜蘭市區的在地夜市，比羅東安靜一些。", noteEn: "Downtown Yilan market, a little calmer than Luodong."
  },
  {
    id: "dongdamen", city: "hualien", lat: 23.9745, lng: 121.6120, days: null, hours: "18:00–24:00",
    zh: "東大門夜市", en: "Dongdamen Night Market",
    foodsZh: ["原住民烤肉", "石板烤山豬肉", "蔥油餅", "炸彈蔥油餅", "小米酒"],
    foodsEn: ["Indigenous BBQ", "Stone-grilled wild boar", "Scallion pancake", "'Bomb' scallion pancake", "Millet wine"],
    transitZh: "花蓮火車站搭計程車約 10 分鐘", transitEn: "About 10 min by taxi from Hualien Station",
    noteZh: "有原住民一條街和各省一條街，花蓮最大的夜市。", noteEn: "Hualien's largest market, with an Indigenous food street."
  },
  {
    id: "taitung", city: "taitung", lat: 22.7545, lng: 121.1495, days: "check", hours: "18:00–23:00",
    zh: "台東觀光夜市", en: "Taitung Tourist Night Market",
    foodsZh: ["原住民小吃", "炸物", "烤玉米", "釋迦冰品", "米苔目"],
    foodsEn: ["Indigenous snacks", "Fried snacks", "Grilled corn", "Sugar-apple ice", "Rice noodles (mi tai mu)"],
    transitZh: "台東市區正氣路一帶", transitEn: "Zhengqi Road, downtown Taitung",
    noteZh: "每週只開特定幾天，出發前請先確認營業日。", noteEn: "Only open on certain days of the week; check before you go."
  }
];
