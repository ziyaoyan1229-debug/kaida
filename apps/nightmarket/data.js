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
  { key: "miaoli", zh: "苗栗", en: "Miaoli" },
  { key: "taichung", zh: "台中", en: "Taichung" },
  { key: "changhua", zh: "彰化", en: "Changhua" },
  { key: "nantou", zh: "南投", en: "Nantou" },
  { key: "yunlin", zh: "雲林", en: "Yunlin" },
  { key: "chiayi", zh: "嘉義", en: "Chiayi" },
  { key: "tainan", zh: "台南", en: "Tainan" },
  { key: "kaohsiung", zh: "高雄", en: "Kaohsiung" },
  { key: "pingtung", zh: "屏東", en: "Pingtung" },
  { key: "yilan", zh: "宜蘭", en: "Yilan" },
  { key: "hualien", zh: "花蓮", en: "Hualien" },
  { key: "taitung", zh: "台東", en: "Taitung" },
  { key: "penghu", zh: "澎湖", en: "Penghu" }
];

// 首頁的大區分類：先選大區，地圖放大到那一區，再選細部縣市
window.NM_REGIONS = [
  { key: "north", zh: "北北基", en: "Taipei area", cities: ["keelung", "taipei", "newtaipei"] },
  { key: "tzm", zh: "桃竹苗", en: "Taoyuan–Hsinchu–Miaoli", cities: ["taoyuan", "hsinchu", "miaoli"] },
  { key: "central", zh: "中彰投", en: "Taichung–Changhua–Nantou", cities: ["taichung", "changhua", "nantou"] },
  { key: "yjn", zh: "雲嘉南", en: "Yunlin–Chiayi–Tainan", cities: ["yunlin", "chiayi", "tainan"] },
  { key: "gp", zh: "高屏", en: "Kaohsiung–Pingtung", cities: ["kaohsiung", "pingtung"] },
  { key: "east", zh: "宜花東", en: "East coast", cities: ["yilan", "hualien", "taitung"] },
  { key: "islands", zh: "離島", en: "Islands", cities: ["penghu"] }
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
    id: "badouzi", city: "keelung", lat: 25.1425, lng: 121.779, days: [0,6], hours: "17:00–24:00",
    zh: "八斗子假日夜市", en: "Badouzi Weekend Night Market",
    foodsZh: ["炸彈蔥油餅", "藥燉排骨", "碳烤串燒", "大塊牛排", "大腸包小腸"],
    foodsEn: ["Puffy fried scallion pancake", "Herbal pork rib soup", "Charcoal skewers", "Thick-cut steak", "Sausage in sticky-rice sausage"],
    transitZh: "基隆火車站搭往八斗子、碧砂漁港方向公車至碧砂漁港附近；周邊有付費停車場", transitEn: "From Keelung Station take a bus toward Bisha Fishing Port/Badouzi; paid parking nearby",
    noteZh: "碧砂漁港旁的週末露天流動夜市，攤數不固定，下雨就不開，出發前先看在地社團。", noteEn: "An open-air weekend market by Bisha Fishing Port; stall numbers vary and it is cancelled in rain, so check local groups first."
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
    id: "ningxia", city: "taipei", lat: 25.056, lng: 121.5153, days: null, hours: "17:00–24:00",
    zh: "寧夏夜市", en: "Ningxia Night Market",
    foodsZh: ["蚵仔煎", "芋餅", "豬肝湯", "滷肉飯", "愛玉冰"],
    foodsEn: ["Oyster omelette", "Fried taro balls", "Pork liver soup", "Braised pork rice", "Aiyu jelly"],
    transitZh: "捷運雙連站或中山站步行約 8 分鐘", transitEn: "About 8 min walk from MRT Shuanglian or Zhongshan",
    noteZh: "以台灣小吃為主的夜市，攤位集中，適合專心吃。", noteEn: "Compact and food-focused; great for a pure eating trip."
  },
  {
    id: "huaxi", city: "taipei", lat: 25.038, lng: 121.4983, days: null, hours: "16:00–24:00",
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
    id: "yansan", city: "taipei", lat: 25.064, lng: 121.5115, days: null, hours: "17:00–24:00",
    zh: "延三夜市", en: "Yansan Night Market",
    foodsZh: ["肉羹", "麻油雞", "炒米粉", "四神湯", "烤香腸"],
    foodsEn: ["Pork thick soup", "Sesame oil chicken", "Fried rice noodles", "Four herbs soup", "Grilled sausage"],
    transitZh: "捷運大橋頭站 1 號出口", transitEn: "MRT Daqiaotou Station, Exit 1",
    noteZh: "大稻埕一帶的老社區夜市，傳統小吃多。", noteEn: "Old-town Dadaocheng market with classic snacks."
  },
  {
    id: "jingmei", city: "taipei", lat: 24.9915, lng: 121.5419, days: null, hours: "17:00–24:00",
    zh: "景美夜市", en: "Jingmei Night Market",
    foodsZh: ["四神湯", "煙燻鵝肉", "蔥油餅韭菜盒", "生煎包", "豆花"],
    foodsEn: ["Four-herb pork intestine soup", "Smoked goose", "Scallion pancake & chive box", "Pan-fried pork buns", "Tofu pudding"],
    transitZh: "捷運景美站 2 號出口步行約 3–5 分鐘", transitEn: "MRT Jingmei Station Exit 2, about a 3–5 minute walk",
    noteZh: "白天是傳統市場、傍晚變身小吃街，以在地老店與學生客為主，價格親民。", noteEn: "A morning produce market that turns into a snack street at dusk, full of long-running local shops and student-friendly prices."
  },
  {
    id: "liaoning", city: "taipei", lat: 25.0491, lng: 121.5422, days: null, hours: "18:00–24:00",
    zh: "遼寧街夜市", en: "Liaoning Street Night Market",
    foodsZh: ["熱炒海鮮", "鵝肉", "蚵仔煎", "牛肉麵", "麻油腰花"],
    foodsEn: ["Stir-fried seafood", "Goose meat", "Oyster omelette", "Beef noodles", "Sesame-oil pork kidney"],
    transitZh: "捷運南京復興站步行約 5 分鐘", transitEn: "About a 5-minute walk from MRT Nanjing Fuxing Station",
    noteZh: "長安東路到朱崙街之間的短街，以海鮮熱炒和下班後的小酌宵夜聞名。", noteEn: "A short strip between Chang'an E. Rd. and Zhulun St. known for seafood stir-fry joints and after-work beers."
  },
  {
    id: "shida", city: "taipei", lat: 25.024, lng: 121.529, days: null, hours: "16:00–24:00",
    zh: "師大夜市", en: "Shida Night Market",
    foodsZh: ["鹹酥雞", "滷味", "港式菠蘿油", "蘿蔔絲餅", "鹹水雞"],
    foodsEn: ["Taiwanese popcorn chicken", "Braised snacks", "Hong Kong pineapple bun with butter", "Radish pastry", "Chilled salted chicken"],
    transitZh: "捷運台電大樓站 3 號出口步行約 2–5 分鐘", transitEn: "MRT Taipower Building Station Exit 3, about a 2–5 minute walk",
    noteZh: "緊鄰台師大的學生商圈，夜市小吃與平價服飾、咖啡館交錯，宵夜選擇多。", noteEn: "A university-district market mixing late-night snacks with budget fashion shops and cafés."
  },
  {
    id: "shuangcheng", city: "taipei", lat: 25.0642, lng: 121.5244, days: null, hours: "17:00–01:00",
    zh: "雙城街夜市（晴光）", en: "Shuangcheng Street (Qingguang) Night Market",
    foodsZh: ["滷肉飯", "咖哩豬排飯", "海鮮粥", "紅豆餅", "愛玉冰"],
    foodsEn: ["Braised pork rice", "Pork cutlet curry", "Seafood congee", "Red bean wheel cakes", "Aiyu jelly ice"],
    transitZh: "捷運中山國小站 1 號出口步行約 5 分鐘，或民權西路站步行約 8 分鐘", transitEn: "About 5 minutes on foot from MRT Zhongshan Elementary School Station Exit 1, or 8 minutes from Minquan W. Rd. Station",
    noteZh: "緊鄰晴光市場，白天有市場小吃、晚上雙城街攤位接棒，可從午餐一路吃到宵夜。", noteEn: "Right beside Qingguang Market: daytime market snacks hand over to Shuangcheng St. stalls at night, so you can eat from lunch to late supper."
  },
  {
    id: "bangka-guangzhou", city: "taipei", lat: 25.0361, lng: 121.4976, days: null, hours: "16:00–24:00",
    zh: "艋舺夜市（廣州街）", en: "Bangka (Guangzhou Street) Night Market",
    foodsZh: ["旗魚黑輪", "地瓜球", "烤魷魚", "愛玉冰", "滷雞腳"],
    foodsEn: ["Swordfish fish-cake skewers", "Sweet potato balls", "Grilled squid", "Aiyu jelly ice", "Braised chicken feet"],
    transitZh: "捷運龍山寺站 1 號出口右轉西園路，再左轉廣州街，步行約 3 分鐘", transitEn: "MRT Longshan Temple Station Exit 1, right on Xiyuan Rd. then left onto Guangzhou St., about 3 minutes",
    noteZh: "龍山寺旁的老夜市，廣州街與梧州街一帶攤位密集，古早味小吃為主。", noteEn: "An old-town market beside Longshan Temple, with dense stalls along Guangzhou and Wuzhou Streets serving classic Taiwanese snacks."
  },
  {
    id: "wuxing", city: "taipei", lat: 25.029, lng: 121.565, days: null, hours: "16:00–22:00",
    zh: "吳興街夜市", en: "Wuxing Street Night Market",
    foodsZh: ["雞蛋糕", "沙威瑪", "牛肉麵", "雞肉飯", "越式河粉"],
    foodsEn: ["Egg cakes", "Shawarma", "Beef noodles", "Chicken rice", "Vietnamese pho"],
    transitZh: "捷運台北101/世貿站 2 號出口步行約 5–10 分鐘", transitEn: "MRT Taipei 101/World Trade Center Station Exit 2, about 5–10 minutes on foot",
    noteZh: "台北101後方的住宅區老街，傍晚市場與小吃攤並存，偏向在地生活型夜市。", noteEn: "A residential street behind Taipei 101 where an evening market and snack stalls serve mostly locals."
  },
  {
    id: "dalong", city: "taipei", lat: 25.0715, lng: 121.5159, days: null, hours: "16:00–24:00",
    zh: "大龍街夜市", en: "Dalong Street Night Market",
    foodsZh: ["滷肉飯", "沙茶羊肉", "鹽酥雞", "燒麻糬", "鹼粽冰"],
    foodsEn: ["Braised pork rice", "Satay lamb stir-fry", "Popcorn chicken", "Fried mochi", "Lye-zongzi shaved ice"],
    transitZh: "捷運圓山站步行約 8–10 分鐘，鄰近保安宮與孔廟", transitEn: "About 8–10 minutes on foot from MRT Yuanshan Station, next to Bao'an Temple and the Confucius Temple",
    noteZh: "大龍峒老街區的小型夜市，早上賣早點、晚上賣老字號小吃，適合配古蹟散步。", noteEn: "A compact old-neighbourhood market: breakfast stalls by morning, heritage snacks by night, ideal with a temple stroll."
  },
  {
    id: "neihu-737", city: "taipei", lat: 25.0808, lng: 121.5728, days: null, hours: "16:00–23:00",
    zh: "內湖737巷夜市", en: "Neihu Lane 737 Night Market",
    foodsZh: ["蔥油餅", "地瓜球", "豬血糕", "麻油雞", "刈包"],
    foodsEn: ["Scallion pancake", "Sweet potato balls", "Pig blood cake", "Sesame-oil chicken", "Gua bao"],
    transitZh: "捷運文湖線港墘站步行約 5 分鐘", transitEn: "About 5 minutes on foot from MRT Gangqian Station (Wenhu Line)",
    noteZh: "內湖科技園區旁的美食巷，上班族下班覓食的熱點，多數攤位晚上十點前收。", noteEn: "A food lane beside the Neihu tech park, packed with office workers after hours; many stalls wrap up before 10 pm."
  },
  {
    id: "lehua", city: "newtaipei", lat: 25.008, lng: 121.511, days: null, hours: "17:00–24:00",
    zh: "樂華夜市", en: "Lehua Night Market",
    foodsZh: ["鹽酥雞", "炸雞排", "珍珠奶茶", "臭豆腐", "烤魷魚"],
    foodsEn: ["Popcorn chicken", "Fried chicken cutlet", "Bubble tea", "Stinky tofu", "Grilled squid"],
    transitZh: "捷運頂溪站 1 號出口步行約 8 分鐘", transitEn: "About 8 min walk from MRT Dingxi, Exit 1",
    noteZh: "永和人的日常夜市，攤位密集、價格親民。", noteEn: "Yonghe's everyday night market, dense and affordable."
  },
  {
    id: "xinzhuang", city: "newtaipei", lat: 25.036, lng: 121.4515, days: null, hours: "11:00–23:00",
    zh: "新莊廟街夜市", en: "Xinzhuang Temple Street Night Market",
    foodsZh: ["炸粿", "蝦仁羹", "米苔目", "麻糬", "豬血糕"],
    foodsEn: ["Fried radish cake", "Shrimp thick soup", "Rice noodles (mi tai mu)", "Mochi", "Pig blood cake"],
    transitZh: "捷運新莊站 2 號出口", transitEn: "MRT Xinzhuang Station, Exit 2",
    noteZh: "沿著新莊路的百年老街，廟宇和老店並排。", noteEn: "Century-old street of temples and long-running food shops."
  },
  {
    id: "sanhe", city: "newtaipei", lat: 25.067, lng: 121.4955, days: null, hours: "17:00–24:00",
    zh: "三和夜市", en: "Sanhe Night Market",
    foodsZh: ["蚵仔煎", "肉圓", "生煎包", "烤香腸", "芋圓"],
    foodsEn: ["Oyster omelette", "Ba-wan meatball", "Pan-fried buns", "Grilled sausage", "Taro balls"],
    transitZh: "捷運台北橋站步行約 5 分鐘", transitEn: "About 5 min walk from MRT Taipei Bridge",
    noteZh: "三重的老夜市，在地小吃多。", noteEn: "Long-standing Sanchong market with local snacks."
  },
  {
    id: "nanya-banqiao", city: "newtaipei", lat: 25.0052, lng: 121.462, days: null, hours: "17:00–01:00",
    zh: "湳雅夜市（南雅夜市）", en: "Nanya Night Market (Banqiao)",
    foodsZh: ["麻油雞", "排骨酥湯", "旗魚黑輪", "碳烤玉米", "甘蔗汁"],
    foodsEn: ["Sesame-oil chicken", "Fried pork rib soup", "Swordfish fish cake", "Charcoal-grilled corn", "Sugarcane juice"],
    transitZh: "捷運板南線府中站步行約 5 分鐘", transitEn: "About 5 minutes on foot from MRT Fuzhong Station (Bannan Line)",
    noteZh: "板橋在地人的宵夜大本營，南雅東路一帶以吃為主，營業到深夜。", noteEn: "Banqiao's late-night food hub around Nanya E. Rd.; mostly eating, open well past midnight."
  },
  {
    id: "xingnan-zhonghe", city: "newtaipei", lat: 24.9905, lng: 121.511, days: null, hours: "17:00–24:00",
    zh: "興南夜市", en: "Xingnan Night Market (Zhonghe)",
    foodsZh: ["大腸蚵仔麵線", "東山鴨頭", "大熱狗", "刀削麵", "地瓜球"],
    foodsEn: ["Intestine & oyster vermicelli", "Dongshan braised duck heads", "Jumbo hot dog", "Knife-cut noodles", "Sweet potato balls"],
    transitZh: "捷運中和新蘆線南勢角站（終點站）4 號出口步行約 3 分鐘", transitEn: "About 3 minutes on foot from MRT Nanshijiao Station Exit 4 (end of the Zhonghe-Xinlu Line)",
    noteZh: "南勢角站旁的社區夜市，攤數比全盛期少，但仍是中和居民的晚餐好去處；人車混行要留意。", noteEn: "A neighbourhood market next to Nanshijiao Station; smaller than in its heyday but still a local dinner spot. Watch for scooters in the lanes."
  },
  {
    id: "yingzhuan-tamsui", city: "newtaipei", lat: 25.169, lng: 121.4448, days: null, hours: "16:00–23:00",
    zh: "英專夜市", en: "Yingzhuan Night Market (Tamsui)",
    foodsZh: ["沙拉船", "水煎包", "餡餅", "肉圓", "東山鴨頭"],
    foodsEn: ["Fried salad boat", "Pan-fried buns", "Meat pies", "Ba-wan meat dumplings", "Braised duck heads"],
    transitZh: "捷運淡水站出站過馬路即達英專路", transitEn: "Cross the road from MRT Tamsui Station straight onto Yingzhuan Rd.",
    noteZh: "淡大學生與通勤族的覓食街，英專路、清水街一帶銅板小吃密集，和觀光味重的老街不同。", noteEn: "A student and commuter snack street on Yingzhuan Rd. and Qingshui St. — cheaper and more local than the touristy Old Street."
  },
  {
    id: "luzhou-miaokou", city: "newtaipei", lat: 25.0855, lng: 121.4738, days: null, hours: "17:00–23:00",
    zh: "蘆洲廟口夜市", en: "Luzhou Miaokou Night Market",
    foodsZh: ["切仔麵", "沙茶羊肉", "蔥油餅", "福州包", "可麗餅"],
    foodsEn: ["Cut noodles", "Satay lamb", "Scallion pancake", "Fuzhou buns", "Crêpes"],
    transitZh: "捷運蘆洲線三民高中站或徐匯中學站步行約 10–15 分鐘", transitEn: "About 10–15 minutes on foot from MRT Sanmin Senior High School or St. Ignatius High School Station (Luzhou Line)",
    noteZh: "圍繞湧蓮寺的廟口夜市，得勝街、成功路一帶，切仔麵老店是蘆洲代表。", noteEn: "A temple-front market around Yonglian Temple on Desheng St. and Chenggong Rd.; the old cut-noodle shops define Luzhou."
  },
  {
    id: "shulin-xingren", city: "newtaipei", lat: 24.985, lng: 121.415, days: [0,3,5,6], hours: "17:00–24:00",
    zh: "樹林興仁花園夜市", en: "Shulin Xingren Garden Night Market",
    foodsZh: ["火爆雞排", "酒蒸蛤蜊", "臭豆腐", "木瓜牛奶", "泡泡冰"],
    foodsEn: ["Flame-grilled chicken cutlet", "Wine-steamed clams", "Stinky tofu", "Papaya milk", "Keelung-style whipped ice"],
    transitZh: "台鐵樹林站轉乘公車約 10 分鐘；夜市設大型停車場", transitEn: "About 10 minutes by bus from TRA Shulin Station; large on-site car park",
    noteZh: "有遮雨棚的大型室內夜市，週三、五、六、日營業，附遊戲區與兒童遊樂設施。", noteEn: "A huge covered market open Wed/Fri/Sat/Sun, with game alleys and kids' rides — rain-proof."
  },
  {
    id: "xizhi", city: "newtaipei", lat: 25.067, lng: 121.6575, days: null, hours: "17:00–23:00",
    zh: "汐止觀光夜市", en: "Xizhi Tourist Night Market",
    foodsZh: ["雞排", "臭豆腐", "漢堡", "剉冰", "鍋燒麵"],
    foodsEn: ["Fried chicken cutlet", "Stinky tofu", "Burgers", "Shaved ice", "Hot-pot noodles"],
    transitZh: "台鐵汐止站步行約 7 分鐘", transitEn: "About 7 minutes on foot from TRA Xizhi Station",
    noteZh: "位在鐵路高架橋下、超過三十年的夜市，下雨也能逛，緊鄰秀峰（秀豐）市場。", noteEn: "A 30-plus-year market tucked under the railway viaduct — rain-proof, and next to Xiufeng Market."
  },
  {
    id: "linkou", city: "newtaipei", lat: 25.078, lng: 121.388, days: [0,3], hours: "17:00–23:30",
    zh: "林口夜市", en: "Linkou Night Market",
    foodsZh: ["珍珠玉米", "碳烤七里香", "沙威瑪", "港式牛雜", "吉拿棒"],
    foodsEn: ["Grilled waxy corn", "Grilled chicken tails", "Shawarma", "Hong Kong beef offal", "Churros"],
    transitZh: "搭公車 5063、925、936 至「頭湖路口」站步行可達；開車周邊有付費停車場", transitEn: "Buses 5063, 925 or 936 to Touhu Rd. Intersection, then a short walk; paid car parks nearby",
    noteZh: "每週三、日才出現的大型流動夜市，平價小吃多，適合全家逛。", noteEn: "A large rotating market that pops up only on Wednesdays and Sundays, full of budget snacks and family crowds."
  },
  {
    id: "yingge-longfeng", city: "newtaipei", lat: 24.964, lng: 121.337, days: [2,5,6], hours: "17:00–24:00",
    zh: "鶯歌龍鳳夜市", en: "Yingge Longfeng Night Market",
    foodsZh: ["一口酥臭豆腐", "炸蛋蔥油餅", "新疆羊肉串", "排骨酥", "石板烤肉"],
    foodsEn: ["Bite-size crispy stinky tofu", "Fried-egg scallion pancake", "Xinjiang lamb skewers", "Boneless fried pork ribs", "Stone-grilled pork"],
    transitZh: "台鐵鳳鳴站步行約 5 分鐘", transitEn: "About 5 minutes on foot from TRA Fengming Station",
    noteZh: "鶯歌鳳鳴地區的千坪流動夜市，約八十攤、重複性低，另設遊戲區。", noteEn: "A sprawling rotating market near Fengming with around 80 stalls, little repetition and a games zone."
  },
  {
    id: "zhongyuan", city: "taoyuan", lat: 24.958, lng: 121.241, days: null, hours: "17:00–24:00",
    zh: "中原夜市", en: "Zhongyuan Night Market",
    foodsZh: ["雞排", "臭豆腐", "炸湯圓", "珍珠奶茶", "烤肉串"],
    foodsEn: ["Fried chicken cutlet", "Stinky tofu", "Fried tangyuan", "Bubble tea", "Skewers"],
    transitZh: "中壢火車站搭公車往中原大學", transitEn: "Bus from Zhongli Station towards Chung Yuan University",
    noteZh: "中原大學旁的學生夜市，東南亞料理也不少。", noteEn: "Student market by Chung Yuan University, with plenty of Southeast Asian food."
  },
  {
    id: "taoyuan-guanguang", city: "taoyuan", lat: 25.001, lng: 121.304, days: null, hours: "17:30–24:00",
    zh: "桃園觀光夜市", en: "Taoyuan Tourist Night Market",
    foodsZh: ["越式煎蝦餅", "蚵仔煎", "鼎邊趖", "鍋貼", "甜芋湯米糕粥"],
    foodsEn: ["Vietnamese shrimp cakes", "Oyster omelet", "Ding bian cuo rice-sheet soup", "Potstickers", "Taro rice-cake porridge"],
    transitZh: "台鐵桃園站步行約 20 分鐘，或搭公車至中正路北埔路口；附近有收費停車場，機車較好停", transitEn: "About a 20-minute walk from TRA Taoyuan Station, or take a bus to the Zhongzheng Rd / Beipu Rd junction; paid car parks nearby, scooter parking is easier",
    noteZh: "沿北埔路與正康二街呈十字展開的每日夜市，是桃園市區在地人最常去的老牌夜市", noteEn: "A daily cross-shaped market along Beipu Rd and Zhengkang 2nd St — the long-standing everyday night market of central Taoyuan"
  },
  {
    id: "zhongli-xinming", city: "taoyuan", lat: 24.9625, lng: 121.217, days: null, hours: "17:00–24:00",
    zh: "中壢觀光夜市（新明夜市）", en: "Zhongli Tourist Night Market (Xinming)",
    foodsZh: ["麻辣臭豆腐", "混蛋爆蝦", "石頭燒餅", "排骨酥", "檳城炒粿條"],
    foodsEn: ["Spicy stinky tofu", "Egg-battered shrimp", "Stone-baked sesame buns", "Fried pork rib bites", "Penang fried kway teow"],
    transitZh: "桃園捷運老街溪站（A22）步行約 10 分鐘；開車可停新明國小地下停車場", transitEn: "About 10 minutes on foot from Taoyuan Metro Laojiexi Station (A22); drivers can use the underground car park at Xinming Elementary School",
    noteZh: "新明路一條直線約 700 公尺、數百攤，有編號攤位，是桃園規模最大的每日夜市之一", noteEn: "One straight 700 m stretch of Xinming Rd with hundreds of numbered stalls — among Taoyuan's largest daily markets"
  },
  {
    id: "xingren-bade", city: "taoyuan", lat: 24.956, lng: 121.2975, days: [0,2,5,6], hours: "17:00–24:00",
    zh: "八德興仁花園夜市", en: "Bade Xingren Garden Night Market",
    foodsZh: ["炸大魷魚", "棺材板", "米殼甜點", "蛤蜊燒", "金沙臭豆腐"],
    foodsEn: ["Fried giant squid", "Coffin toast", "Rice-shell pastries", "Clam dishes", "Salted-egg stinky tofu"],
    transitZh: "位於八德長興路與中正路口，從桃園火車站搭往八德方向公車於附近下車；設有停車場", transitEn: "At the Changxing Rd / Zhongzheng Rd junction in Bade; take a Bade-bound bus from Taoyuan Station; on-site parking",
    noteZh: "有遮雨棚的大型集中式夜市，美食、遊戲、雜貨分區，一週開四天", noteEn: "A large covered, zoned market (food, games, goods) open four nights a week"
  },
  {
    id: "nankan-wufu", city: "taoyuan", lat: 25.053, lng: 121.288, days: [2,5,6], hours: "17:30–23:00",
    zh: "南崁五福夜市", en: "Nankan Wufu Night Market",
    foodsZh: ["三杯滷味", "手工潤餅", "烤魷魚", "大腸包小腸", "鐵板牛排"],
    foodsEn: ["Three-cup braised snacks", "Handmade spring rolls", "Grilled squid", "Sausage in sticky-rice sausage", "Sizzling-plate steak"],
    transitZh: "位於五福宮旁、南崁高中附近，可搭公車至南崁地區步行前往；周邊有路邊停車", transitEn: "Beside Wufu Temple near Nankan High School; reach Nankan by bus and walk; street parking nearby",
    noteZh: "蘆竹南崁一帶的流動夜市，每週二、五、六在五福宮旁開張，以平價小吃為主", noteEn: "Nankan's rotating market, set up beside Wufu Temple on Tue/Fri/Sat with mostly cheap eats"
  },
  {
    id: "yangmei", city: "taoyuan", lat: 24.9105, lng: 121.144, days: [5], hours: "17:00–23:30",
    zh: "楊梅觀光夜市", en: "Yangmei Tourist Night Market",
    foodsZh: ["大腸包小腸", "臭豆腐", "一口煎餃", "炸魷魚", "炭烤玉米"],
    foodsEn: ["Sausage in sticky-rice sausage", "Stinky tofu", "Bite-size pan-fried dumplings", "Fried squid", "Charcoal-grilled corn"],
    transitZh: "位於金山街天成醫院後方，可由台鐵楊梅站轉乘或騎車前往；周邊有多處收費停車場，機車可從金山街298巷進入", transitEn: "On Jinshan St behind Tian Cheng Hospital; reach it from TRA Yangmei Station by bus or scooter; several paid car parks, scooter access via Jinshan St Lane 298",
    noteZh: "一週只開週五一晚，2023 年遷到金山街後場地平整好逛，熱門攤常大排長龍", noteEn: "Friday-only; since moving to Jinshan St in 2023 the flat open lot is easy to walk, and popular stalls draw long queues"
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
    id: "houzhan-hsinchu", city: "hsinchu", lat: 24.7995, lng: 120.9725, days: [2,5], hours: "17:00–23:00",
    zh: "新竹後站夜市", en: "Hsinchu Houzhan (Rear Station) Night Market",
    foodsZh: ["蒙古烤肉", "脆皮章魚燒", "炒薯條", "雞屁股串", "蚵仔煎"],
    foodsEn: ["Mongolian barbecue", "Crispy takoyaki", "Stir-fried fries", "Chicken-tail skewers", "Oyster omelet"],
    transitZh: "台鐵新竹站後站出口步行約 3 分鐘，鄰近新竹轉運站；機車停車每次 NT$20", transitEn: "About 3 minutes on foot from the rear exit of TRA Hsinchu Station, next to Hsinchu Bus Station; scooter parking NT$20 per visit",
    noteZh: "停辦數年後於 2023 年底在後站停車場復辦，約 200 攤，樹林頭夜市 2026 年熄燈後成為新竹市區最大的流動夜市", noteEn: "Revived at the rear-station car park in late 2023 with about 200 stalls; since Shulintou closed in 2026 it is the city's biggest rotating market"
  },
  {
    id: "zhubei", city: "hsinchu", lat: 24.846, lng: 121.002, days: [0,5,6], hours: "17:00–23:00",
    zh: "竹北夜市", en: "Zhubei Night Market",
    foodsZh: ["大腸包小腸", "炸蛋蔥油餅", "西班牙油條", "蒜香豆乾", "爆香雞"],
    foodsEn: ["Sausage in sticky-rice sausage", "Fried-egg scallion pancake", "Churros", "Garlic dried tofu", "Spicy stir-fried chicken"],
    transitZh: "位於環北路五段，從台鐵竹北站騎車或開車約 10 分鐘；旁邊有大型收費停車場（每次約 NT$100）", transitEn: "On Huanbei Rd Sec. 5, about 10 minutes by scooter or car from TRA Zhubei Station; large paid lot next door (about NT$100 per entry)",
    noteZh: "新竹縣規模最大的夜市，食物、遊戲、雜貨分區；2026 年 2 月起承接樹林頭夜市的週五場", noteEn: "Hsinchu County's largest market, split into food, games and goods zones; took over Shulintou's Friday slot from Feb 2026"
  },
  {
    id: "zhudong-yanhe", city: "hsinchu", lat: 24.74, lng: 121.09, days: [6], hours: "18:00–23:00",
    zh: "竹東觀光夜市（沿河街夜市）", en: "Zhudong Tourist Night Market (Yanhe St)",
    foodsZh: ["炭烤玉米", "泰式奶茶", "香酥雞", "烤魷魚", "大熱狗"],
    foodsEn: ["Charcoal-grilled corn", "Thai milk tea", "Fried chicken bites", "Grilled squid", "Jumbo hot dogs"],
    transitZh: "台鐵內灣線竹東站步行約 5 分鐘，沿河街一帶", transitEn: "About 5 minutes on foot from Zhudong Station on the TRA Neiwan Line, along Yanhe St",
    noteZh: "只在週六晚上沿著河岸擺開的長條夜市，吃與玩都齊全", noteEn: "A Saturday-only market strung out along the riverside, with plenty of food and games"
  },
  {
    id: "qingda", city: "hsinchu", lat: 24.792, lng: 120.9935, days: null, hours: "11:30–24:00",
    zh: "清大夜市", en: "Tsing Hua (Qingda) Night Market",
    foodsZh: ["豆花", "米腸香腸", "蒸餃", "滷肉飯", "鴨肉麵"],
    foodsEn: ["Tofu pudding", "Sausage and rice sausage", "Steamed dumplings", "Braised pork rice", "Duck noodles"],
    transitZh: "從新竹火車站搭往清華大學方向公車，在清大正門附近下車步行數分鐘", transitEn: "Bus from Hsinchu Station toward National Tsing Hua University; get off near the main gate and walk a few minutes",
    noteZh: "清華大學旁的店面加攤販美食街區，天天營業，學生價小吃為主", noteEn: "A daily student food quarter of shops and stalls beside Tsing Hua University, with budget-friendly eats"
  },
  {
    id: "yingcai-miaoli", city: "miaoli", lat: 24.5698, lng: 120.8195, days: [0,3,5,6], hours: "17:00–23:00",
    zh: "苗栗英才觀光夜市", en: "Miaoli Yingcai Tourist Night Market",
    foodsZh: ["麻辣臭豆腐", "豆花", "炭烤玉米", "炸雞翅", "排骨酥"],
    foodsEn: ["Spicy stinky tofu", "Tofu pudding", "Charcoal-grilled corn", "Fried chicken wings", "Fried pork rib bites"],
    transitZh: "台鐵苗栗站後站出口步行約 1 分鐘；對面與旁邊都有收費停車場", transitEn: "About a 1-minute walk from the rear exit of TRA Miaoli Station; paid car parks opposite and alongside",
    noteZh: "苗栗市最主要的夜市，就在火車站後方，週三和週五攤位最齊", noteEn: "Miaoli City's main market right behind the station; Wednesdays and Fridays have the fullest line-up"
  },
  {
    id: "zhunan-saturday", city: "miaoli", lat: 24.69, lng: 120.873, days: [6], hours: "18:00–22:00",
    zh: "竹南夜市（週六）", en: "Zhunan Saturday Night Market",
    foodsZh: ["日式串燒", "豆乳雞", "鐵板牛排", "手工蔥油餅", "黑糖粉圓鮮奶"],
    foodsEn: ["Japanese-style skewers", "Soy-milk fried chicken", "Sizzling-plate steak", "Handmade scallion pancake", "Brown-sugar tapioca milk"],
    transitZh: "位於竹南獅山親子公園旁，從台鐵竹南站騎車或開車前往，可停公園停車場", transitEn: "Next to Zhunan Shishan Parent-Child Park; reach it by scooter or car from TRA Zhunan Station and use the park's car park",
    noteZh: "竹南每週六一場的流動夜市，緊鄰親子公園，帶小孩逛很方便", noteEn: "Zhunan's once-a-week Saturday market beside a family park, easy with kids"
  },
  {
    id: "yuanli-saturday", city: "miaoli", lat: 24.4405, lng: 120.6535, days: [6], hours: "18:00–22:00",
    zh: "苑裡觀光夜市", en: "Yuanli Tourist Night Market",
    foodsZh: ["地瓜球", "蔥油餅", "豆花", "麵包", "炭烤玉米"],
    foodsEn: ["Sweet potato balls", "Scallion pancake", "Tofu pudding", "Bakery buns", "Charcoal-grilled corn"],
    transitZh: "台鐵苑裡站步行約 10 分鐘，位於大同路一帶", transitEn: "About a 10-minute walk from TRA Yuanli Station, around Datong Rd",
    noteZh: "苑裡每週六才有的在地夜市，小吃選擇多，價格平實", noteEn: "Yuanli's Saturday-only local market with lots of snacks at modest prices"
  },
  {
    id: "toufen-gong11", city: "miaoli", lat: 24.6915, lng: 120.9, days: [6], hours: "16:00–22:00",
    zh: "頭份公11夜市市集", en: "Toufen Gong 11 Night Market",
    foodsZh: ["脆皮豬", "蚵蛋燒", "潤餅", "烤鴨潛艇堡", "現打果汁"],
    foodsEn: ["Crispy roast pork", "Oyster egg omelet", "Spring rolls", "Roast duck sub", "Fresh juice"],
    transitZh: "位於尚順購物中心旁，可從台鐵竹南站轉乘公車或開車；旁邊停車場汽車每次 NT$50、機車免費", transitEn: "Next to Shangshun Mall; bus from TRA Zhunan Station or drive; adjacent lot NT$50 per car, scooters free",
    noteZh: "2023 年開張的週六市集，傳統攤位加上每週輪替的餐車與街頭表演", noteEn: "A Saturday market opened in 2023 mixing traditional stalls with rotating food trucks and street performers"
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
    id: "tunghai", city: "taichung", lat: 24.181, lng: 120.595, days: null, hours: "17:00–24:00",
    zh: "東海夜市", en: "Tunghai Night Market",
    foodsZh: ["鹽酥雞", "炒飯", "滷味", "豆花", "雞蛋糕"],
    foodsEn: ["Popcorn chicken", "Fried rice", "Lu wei braised snacks", "Douhua", "Egg cake"],
    transitZh: "搭公車至東海大學", transitEn: "Bus to Tunghai University",
    noteZh: "東海大學旁的學生夜市，晚餐選擇多。", noteEn: "Student market next to Tunghai University."
  },
  {
    id: "zhongxiao-tc", city: "taichung", lat: 24.132, lng: 120.688, days: null, hours: "17:00–02:00",
    zh: "忠孝夜市", en: "Zhongxiao Night Market (Taichung)",
    foodsZh: ["肉圓", "麻油雞", "炒鱔魚", "米糕", "冰品"],
    foodsEn: ["Ba-wan meatball", "Sesame oil chicken", "Stir-fried eel", "Glutinous rice cake", "Shaved ice"],
    transitZh: "台中火車站騎 YouBike 約 10 分鐘", transitEn: "About 10 min by YouBike from Taichung Station",
    noteZh: "以傳統台式小吃為主，開到深夜。", noteEn: "Traditional Taiwanese food, open late."
  },
  {
    id: "hanxi", city: "taichung", lat: 24.1383, lng: 120.6942, days: [2,4,5,6], hours: "17:00–24:00",
    zh: "旱溪夜市", en: "Hanxi Night Market",
    foodsZh: ["蒜香豆干", "鳳梨冰", "黃金豆乳雞", "碳烤玉米", "拔絲地瓜"],
    foodsEn: ["Garlic braised tofu", "Pineapple ice drink", "Soy-milk fried chicken", "Charcoal-grilled corn", "Candied sweet potato"],
    transitZh: "搭台中市公車至「旱溪夜市」站下車即達；開車可停周邊收費停車場。", transitEn: "Take a Taichung city bus to the Hanxi Night Market stop; paid parking lots surround the market.",
    noteZh: "台中東區規模最大的流動夜市之一，每週四天開張，人氣攤多、建議傍晚早點到。", noteEn: "One of east Taichung's biggest rotating night markets, open four nights a week; popular stalls queue early, so arrive around dusk."
  },
  {
    id: "daqing", city: "taichung", lat: 24.1218, lng: 120.6522, days: [0,3,5,6], hours: "17:00–24:00",
    zh: "大慶夜市", en: "Daqing Night Market",
    foodsZh: ["豆乳雞", "炸麻糬", "炸湯圓", "泰式奶茶", "肉夾饃"],
    foodsEn: ["Soy-milk fried chicken", "Fried mochi", "Fried tangyuan", "Thai milk tea", "Rougamo (Chinese burger)"],
    transitZh: "台中捷運／台鐵大慶站出站步行約 10 分鐘；有免費停車場。", transitEn: "About a 10-minute walk from Daqing Station (Taichung MRT / TRA); free parking on site.",
    noteZh: "旱溪夜市團隊經營的新興夜市，鄰近中山醫大，有停車場又好搭捷運。", noteEn: "A newer market run by the Hanxi team near Chung Shan Medical University, with free parking and an MRT station nearby."
  },
  {
    id: "zhonghua-taichung", city: "taichung", lat: 24.1452, lng: 120.6788, days: null, hours: "17:00–03:00",
    zh: "中華路夜市", en: "Zhonghua Road Night Market",
    foodsZh: ["廣東粥", "熱炒", "迷你火鍋", "大麵焿", "豬腳"],
    foodsEn: ["Cantonese congee", "Stir-fry dishes", "Mini hot pot", "Thick noodle soup", "Braised pork knuckle"],
    transitZh: "台鐵台中車站步行約 15 分鐘；台中公園西側一帶。", transitEn: "About a 15-minute walk from TRA Taichung Station, west of Taichung Park.",
    noteZh: "台中老牌宵夜街，以熱炒、粥品和深夜小吃店為主，越晚越熱鬧。", noteEn: "Taichung's veteran late-night strip, mostly eateries serving stir-fries, congee and supper snacks well past midnight."
  },
  {
    id: "miaodong-fengyuan", city: "taichung", lat: 24.253, lng: 120.7238, days: null, hours: "10:00–23:00",
    zh: "豐原廟東夜市", en: "Fengyuan Miaodong Night Market",
    foodsZh: ["菱角酥", "清水排骨麵", "蚵仔煎", "肉丸", "鳳梨冰"],
    foodsEn: ["Water-chestnut fritters", "Pork chop noodles", "Oyster omelet", "Fried meatballs (bawan)", "Pineapple shaved ice"],
    transitZh: "台鐵豐原站步行約 5–10 分鐘，入口在慈濟宮旁；周邊停車不易。", transitEn: "A 5–10 minute walk from TRA Fengyuan Station; enter beside Tzu Chi Temple. Parking nearby is tight.",
    noteZh: "依著豐原慈濟宮發展的百年小吃巷，白天就營業，老店密集。", noteEn: "A century-old snack alley that grew up around Fengyuan's Tzu Chi (Mazu) Temple, open from late morning and packed with veteran shops."
  },
  {
    id: "wuquan-qingshui", city: "taichung", lat: 24.2742, lng: 120.5733, days: [0,3,5,6], hours: "16:30–24:00",
    zh: "清水五權夜市", en: "Qingshui Wuquan Night Market",
    foodsZh: ["臭豆腐", "蚵仔煎", "炸雞", "鐵板牛排", "酸菜魚"],
    foodsEn: ["Stinky tofu", "Oyster omelet", "Fried chicken", "Teppanyaki steak", "Sour cabbage fish"],
    transitZh: "搭台中市公車 183、186 或 304 至「清水五權夜市」站；設有免費停車場但易滿。", transitEn: "Take Taichung bus 183, 186 or 304 to the Qingshui Wuquan Night Market stop; free parking fills quickly.",
    noteZh: "海線地區的大型流動夜市，約 150 攤，週末尤其熱鬧。", noteEn: "A large rotating market on Taichung's coastal side with around 150 stalls, busiest at weekends."
  },
  {
    id: "wuqi-zhonggang", city: "taichung", lat: 24.2478, lng: 120.5372, days: [2,4,5,6], hours: "16:00–24:00",
    zh: "梧棲中港觀光夜市", en: "Wuqi Zhonggang Night Market",
    foodsZh: ["煎餃水煎包", "蒙古烤肉", "新疆羊肉串", "烤魷魚", "蔥油餅"],
    foodsEn: ["Pan-fried dumplings & buns", "Mongolian BBQ", "Xinjiang lamb skewers", "Grilled squid", "Scallion pancake"],
    transitZh: "以開車為主，導航至文昌路280號；車位不足時可停台灣大道公有停車場步行約 8–10 分鐘。", transitEn: "Best reached by car (No. 280 Wenchang Rd). If the lot is full, the Taiwan Blvd public lot is an 8–10 minute walk away.",
    noteZh: "2024 年啟用的大型夜市，承接舊梧棲夜市的人氣攤，場地寬敞。", noteEn: "A spacious market opened in 2024 that took over many favourites from the old Wuqi street market."
  },
  {
    id: "jingcheng-changhua", city: "changhua", lat: 24.0772, lng: 120.5468, days: [0,3,4,5,6], hours: "18:00–01:00",
    zh: "彰化精誠夜市", en: "Changhua Jingcheng Night Market",
    foodsZh: ["清蒸臭豆腐", "地瓜球", "碳烤雞排", "雞湯燉盅", "東山鴨頭"],
    foodsEn: ["Steamed stinky tofu", "Sweet potato balls", "Charcoal-grilled chicken cutlet", "Double-boiled chicken soup", "Dongshan duck heads"],
    transitZh: "位於彰化市林森路，距台鐵彰化站約 2 公里，建議騎車、開車或搭計程車。", transitEn: "On Linsen Rd in Changhua City, about 2 km from TRA Changhua Station; go by scooter, car or taxi.",
    noteZh: "彰化市區最具代表性的夜市，在地人暱稱「狗屎夜市」，攤位多且營業到深夜。", noteEn: "Changhua City's signature night market (locally nicknamed 'Gousi'), with lots of stalls open until 1 am."
  },
  {
    id: "longdeng-yuanlin", city: "changhua", lat: 23.9525, lng: 120.5795, days: [0,2,5,6], hours: "17:00–24:00",
    zh: "員林龍燈夜市", en: "Yuanlin Longdeng Night Market",
    foodsZh: ["碳烤大魷魚", "黑輪關東煮", "鴨肉羹", "木瓜牛奶", "烤玉米"],
    foodsEn: ["Grilled giant squid", "Oden", "Duck thick soup", "Papaya milk", "Grilled corn"],
    transitZh: "以開車為主，旁有小型停車場，滿了需在附近找路邊停車；場內有公廁。", transitEn: "Mainly reached by car; a small lot sits beside the market, otherwise park on nearby streets. Public toilets inside.",
    noteZh: "員林最熱門的流動夜市，價格親民，一千元就能吃得很滿足。", noteEn: "Yuanlin's busiest rotating market, known for low prices."
  },
  {
    id: "beidou", city: "changhua", lat: 23.8712, lng: 120.5222, days: [4], hours: "17:00–24:00",
    zh: "北斗夜市", en: "Beidou Night Market",
    foodsZh: ["藥燉排骨", "鴨肉油飯", "豆乳雞", "炸魷魚", "木瓜牛奶"],
    foodsEn: ["Herbal pork rib soup", "Duck sticky rice", "Soy-milk fried chicken", "Fried squid", "Papaya milk"],
    transitZh: "開車經國道 1 號北斗交流道約 5 分鐘；台鐵員林站轉乘客運約 30 分鐘。", transitEn: "About 5 minutes by car from the Beidou interchange on National Freeway 1, or a bus ride from TRA Yuanlin Station.",
    noteZh: "彰化南部每週四登場的夜市，以平價藥燉與鴨肉料理聞名。", noteEn: "A Thursday-only market in southern Changhua, liked for its herbal soups and duck dishes."
  },
  {
    id: "xihu-chenggong", city: "changhua", lat: 23.9618, lng: 120.4792, days: [2,6], hours: "18:00–23:00",
    zh: "溪湖成功夜市", en: "Xihu Chenggong Night Market",
    foodsZh: ["蚵仔煎", "潤餅", "炸魷魚", "羊肉爐", "烤玉米"],
    foodsEn: ["Oyster omelet", "Spring rolls (runbing)", "Fried squid", "Mutton hot pot", "Grilled corn"],
    transitZh: "以開車或騎車為主，位於溪湖鎮福德路一帶；台鐵員林站轉乘客運可達溪湖市區。", transitEn: "Best by car or scooter (Fude Rd, Xihu); buses link Xihu town with TRA Yuanlin Station.",
    noteZh: "溪湖每週二、六的在地夜市，以傳統小吃為主、氣氛純樸。", noteEn: "A homely local market in Xihu on Tuesdays and Saturdays, focused on traditional snacks."
  },
  {
    id: "tianwei-garden", city: "changhua", lat: 23.8975, lng: 120.5248, days: [6], hours: "17:00–24:00",
    zh: "田尾公路花園夜市", en: "Tianwei Garden Night Market",
    foodsZh: ["脆皮臭豆腐", "水煮玉米", "豆乳雞", "烤肉串", "蚵仔煎"],
    foodsEn: ["Crispy stinky tofu", "Boiled corn", "Soy-milk fried chicken", "Grilled skewers", "Oyster omelet"],
    transitZh: "開車經國道 1 號北斗交流道或台 1 線即達；可順遊田尾公路花園。", transitEn: "Drive via Provincial Hwy 1 or the Beidou freeway exit; easy to combine with the Tianwei flower road.",
    noteZh: "只在週六營業的花卉之鄉夜市，白天賞花晚上逛夜市剛好。", noteEn: "A Saturday-only market in Tianwei's flower-growing area, handy after a day at the garden nurseries."
  },
  {
    id: "puli-cheng", city: "nantou", lat: 23.9725, lng: 120.9555, days: [0,5,6], hours: "17:00–24:00",
    zh: "埔里城觀光夜市", en: "Puli Cheng Night Market",
    foodsZh: ["鹽烤魚", "豆乳雞", "牛排", "地瓜球", "烤玉米"],
    foodsEn: ["Salt-grilled fish", "Soy-milk fried chicken", "Night-market steak", "Sweet potato balls", "Grilled corn"],
    transitZh: "以開車為主，旁有大型停車場；從埔里市區騎車約 10 分鐘。", transitEn: "Mostly by car, with a large lot alongside; about 10 minutes by scooter from central Puli.",
    noteZh: "埔里週末限定的大型觀光夜市，美食之外還有大量親子遊樂設施。", noteEn: "Puli's big weekend market, with plenty of kids' rides and games alongside the food."
  },
  {
    id: "caoxiedun-caotun", city: "nantou", lat: 23.9455, lng: 120.6868, days: [0,2,5,6], hours: "18:30–23:00",
    zh: "草鞋墩人文觀光夜市", en: "Caoxiedun Night Market (Caotun)",
    foodsZh: ["蔥油餅", "彩色臭豆腐", "豆乳雞", "烤肉串", "牛排"],
    foodsEn: ["Scallion pancake", "Colourful stinky tofu", "Soy-milk fried chicken", "Grilled skewers", "Night-market steak"],
    transitZh: "搭往埔里／南投方向客運（6877、6899、6268 等）至「御史里」站，往南步行約 3 分鐘；停車場與寶島時代村共用。", transitEn: "Take a Puli/Nantou-bound bus (6877, 6899, 6268) to Yushili stop and walk about 3 minutes south; parking is shared with Formosa Time Village.",
    noteZh: "緊鄰寶島時代村的大型夜市，可以白天看懷舊展、晚上接著逛。", noteEn: "A large market next to Formosa Time Village, so you can see the nostalgia exhibits by day and eat here at night."
  },
  {
    id: "zhushan", city: "nantou", lat: 23.758, lng: 120.6745, days: [1,4], hours: "17:30–22:30",
    zh: "竹山夜市", en: "Zhushan Night Market",
    foodsZh: ["夜市牛排", "沙威瑪", "炸雞", "章魚大丸子", "關東煮"],
    foodsEn: ["Night-market steak", "Shawarma", "Fried chicken", "Giant takoyaki", "Oden"],
    transitZh: "以開車或騎車為主；週一與週四擺攤地點不同，出發前請先確認。", transitEn: "Best by car or scooter; the Monday and Thursday sites differ, so check before heading out.",
    noteZh: "竹山鎮的流動夜市，每週一、四各在不同地點擺攤，小吃多在百元以內。", noteEn: "Zhushan's rotating market sets up at different spots on Mondays and Thursdays; most snacks cost under NT$100."
  },
  {
    id: "shuili", city: "nantou", lat: 23.8112, lng: 120.8528, days: [4], hours: "17:30–23:00",
    zh: "水里夜市", en: "Shuili Night Market",
    foodsZh: ["鍋燒意麵", "炸雞腳", "鹹水醉雞", "章魚燒", "蚵仔煎"],
    foodsEn: ["Pot-boiled yi noodles", "Fried chicken feet", "Brined drunken chicken", "Takoyaki", "Oyster omelet"],
    transitZh: "台鐵集集線水里站步行約 10 分鐘；也可作為日月潭行程回程的晚餐點。", transitEn: "About a 10-minute walk from Shuili Station on the TRA Jiji Line; a handy dinner stop on the way back from Sun Moon Lake.",
    noteZh: "山城水里每週四的小型夜市，攤位不多但在地味濃。", noteEn: "A small Thursday market in the mountain town of Shuili, few stalls but very local."
  },
  {
    id: "jiji", city: "nantou", lat: 23.829, lng: 120.7868, days: [2,6], hours: "17:30–22:30",
    zh: "集集夜市", en: "Jiji Night Market",
    foodsZh: ["臭豆腐", "水里肉圓", "東山鴨頭", "蚵仔煎", "春捲"],
    foodsEn: ["Stinky tofu", "Shuili-style ba-wan", "Dongshan duck heads", "Oyster omelet", "Spring rolls"],
    transitZh: "台鐵集集線集集站步行約 5–10 分鐘，可搭配集集小鎮一日遊。", transitEn: "A 5–10 minute walk from Jiji Station on the TRA Jiji Line; pairs well with a day in Jiji town.",
    noteZh: "集集小鎮每週二、六的流動夜市，攤位雖少但小吃齊全。", noteEn: "Jiji's Tuesday and Saturday market: modest in size but covers the classic snacks."
  },
  {
    id: "sanhe-nantou", city: "nantou", lat: 23.9052, lng: 120.6812, days: [3], hours: "17:30–22:30",
    zh: "南投三和夜市", en: "Nantou Sanhe Night Market",
    foodsZh: ["地瓜球", "鍋燒意麵", "烤玉米", "炭烤雞排", "潤餅"],
    foodsEn: ["Sweet potato balls", "Pot-boiled yi noodles", "Grilled corn", "Charcoal-grilled chicken cutlet", "Spring rolls"],
    transitZh: "位於南投市三和二路（家樂福／遠百一帶），以開車或騎車為主。", transitEn: "On Sanhe 2nd Rd in Nantou City near the hypermarket; best by car or scooter.",
    noteZh: "南投市區最熱鬧的週三流動夜市，又稱家樂福夜市。", noteEn: "Nantou City's busiest Wednesday market, also called the Carrefour night market."
  },
  {
    id: "douliu-renwen", city: "yunlin", lat: 23.699, lng: 120.54, days: [0,2,6], hours: "17:00–24:00",
    zh: "斗六人文夜市（斗六觀光夜市）", en: "Douliu Renwen (Tourist) Night Market",
    foodsZh: ["三杯滷味", "酥皮蚵仔煎", "鳳梨水果茶", "豆乳雞翅", "脆皮炸雞"],
    foodsEn: ["Three-cup braised snacks", "Flaky-crust oyster omelette", "Pineapple fruit tea", "Soy-milk chicken wings", "Crispy fried chicken"],
    transitZh: "台鐵斗六站開車或騎車約 10 分鐘；夜市旁有大型停車場，建議自行開車前往。", transitEn: "About 10 minutes by car or scooter from TRA Douliu Station; large parking lots beside the market make driving the easiest option.",
    noteZh: "雲林規模最大的夜市，棋盤式攤位區動輒上千攤，週六人潮最多。", noteEn: "Yunlin's biggest night market: a grid of roughly a thousand stalls, busiest on Saturday nights."
  },
  {
    id: "douliu-chenggong", city: "yunlin", lat: 23.7085, lng: 120.556, days: [3,6], hours: "17:00–24:00",
    zh: "斗六成功夜市", en: "Douliu Chenggong Night Market",
    foodsZh: ["夜市牛排", "黑糖碳烤雞排", "碳烤玉米", "冰鴨翅", "東山鴨頭"],
    foodsEn: ["Night-market steak", "Brown-sugar charcoal chicken cutlet", "Charcoal-grilled corn", "Chilled duck wings", "Dongshan duck heads"],
    transitZh: "台鐵斗六站開車約 8 分鐘；週三、六設有收費停車場。", transitEn: "About 8 minutes by car from TRA Douliu Station; a paid parking lot operates on market nights.",
    noteZh: "斗六的老牌夜市，比觀光夜市小、人也少一點，適合週三想逛的人。", noteEn: "Douliu's older night market, smaller and calmer than the Renwen market, and the go-to option on Wednesdays."
  },
  {
    id: "douliu-shiliu", city: "yunlin", lat: 23.727, lng: 120.492, days: [4], hours: "17:00–24:00",
    zh: "石榴班夜市", en: "Shiliuban Night Market",
    foodsZh: ["酥皮蚵仔煎", "炒麵", "啾啾蛋", "蔬果", "炸物"],
    foodsEn: ["Flaky oyster omelette", "Fried noodles", "Jiujiu egg puffs", "Fresh produce", "Fried snacks"],
    transitZh: "台鐵石榴站附近，開車或騎車前往較方便。", transitEn: "Near TRA Shiliu Station; easiest to reach by car or scooter.",
    noteZh: "週四限定的社區型夜市，靠近工業區，除了小吃也賣到晚上的新鮮蔬果。", noteEn: "Thursday-only neighbourhood market near the industrial zone, mixing street food with fresh produce sold into the evening."
  },
  {
    id: "huwei-baiwu", city: "yunlin", lat: 23.718, lng: 120.444, days: [5], hours: "17:00–01:00",
    zh: "虎尾夜市（拜五街夜市）", en: "Huwei (Friday Street) Night Market",
    foodsZh: ["酥皮蚵仔煎", "夜市牛排", "蚵蛋燒", "碳烤雞排", "蔥油餅"],
    foodsEn: ["Flaky oyster omelette", "Night-market steak", "Oyster egg cake", "Charcoal chicken cutlet", "Scallion pancake"],
    transitZh: "高鐵雲林站或虎尾市區開車約 10 分鐘，夜市旁有停車空間。", transitEn: "About 10 minutes by car from HSR Yunlin Station or central Huwei; parking is available beside the market.",
    noteZh: "名字就說明一切——每逢週五才開，是虎尾學生和上班族的週末起點。", noteEn: "As the name says, it only runs on Fridays, kicking off the weekend for Huwei's students and workers."
  },
  {
    id: "beigang-tongren", city: "yunlin", lat: 23.572, lng: 120.308, days: [3,6], hours: "17:00–24:00",
    zh: "北港同仁夜市", en: "Beigang Tongren Night Market",
    foodsZh: ["炸大魷魚", "脆皮炸雞", "北港粉圓", "蒙古烤肉", "硬悶玉米"],
    foodsEn: ["Fried whole squid", "Crispy fried chicken", "Beigang tapioca", "Mongolian barbecue", "Stone-baked corn"],
    transitZh: "北港朝天宮開車約 5 分鐘；嘉義或斗六搭客運至北港站後轉計程車。", transitEn: "About 5 minutes by car from Beigang Chaotian Temple; buses run from Chiayi or Douliu to Beigang, then take a taxi.",
    noteZh: "北港在地人的固定夜市，逛完朝天宮可以順路來吃晚餐。", noteEn: "Beigang's regular local night market, an easy dinner stop after visiting Chaotian Temple."
  },
  {
    id: "dounan", city: "yunlin", lat: 23.679, lng: 120.479, days: [6], hours: "17:00–24:00",
    zh: "斗南夜市", en: "Dounan Night Market",
    foodsZh: ["黑輪", "三杯土虱", "滷味", "碳烤雞排", "蔥油餅"],
    foodsEn: ["Oden-style fish cake", "Three-cup catfish", "Braised snacks", "Charcoal chicken cutlet", "Scallion pancake"],
    transitZh: "台鐵斗南站步行約 10–15 分鐘。", transitEn: "About 10–15 minutes on foot from TRA Dounan Station.",
    noteZh: "週六限定，離火車站不遠，是少數不開車也能去的雲林夜市。", noteEn: "Saturday-only and close to the train station — one of the few Yunlin night markets you can reach without a car."
  },
  {
    id: "xiluo-dongnan", city: "yunlin", lat: 23.796, lng: 120.471, days: [0], hours: "17:00–23:30",
    zh: "西螺東南觀光夜市", en: "Xiluo Dongnan Night Market",
    foodsZh: ["碳烤", "石頭火鍋", "臭豆腐", "夜市牛排", "現打果汁"],
    foodsEn: ["Charcoal grill skewers", "Stone hot pot", "Stinky tofu", "Night-market steak", "Fresh-pressed juice"],
    transitZh: "西螺市區（延平老街）開車約 5 分鐘，位於東南國中旁。", transitEn: "About 5 minutes by car from central Xiluo (Yanping Old Street), next to Dongnan Junior High School.",
    noteZh: "原本西螺夜市的攤商多已搬到這裡，週日晚上是西螺最熱鬧的地方。", noteEn: "Most vendors from Xiluo's old night market moved here, making it the town's liveliest spot on Sunday evenings."
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
    id: "chiayi-jialefu", city: "chiayi", lat: 23.4875, lng: 120.4295, days: [0,4,5,6], hours: "18:00–24:00",
    zh: "嘉樂福夜市", en: "Jialefu Night Market",
    foodsZh: ["脆皮魷魚燒", "豆乳雞", "碳烤", "石頭火鍋", "豆花"],
    foodsEn: ["Crispy squid balls", "Soy-milk fried chicken", "Charcoal grill", "Stone hot pot", "Tofu pudding"],
    transitZh: "台鐵嘉義站開車約 10 分鐘，位於博愛路家樂福旁，有大型停車場。", transitEn: "About 10 minutes by car from TRA Chiayi Station, next to the Carrefour on Bo'ai Road, with a large parking lot.",
    noteZh: "嘉義市區占地最大的夜市，約六千坪，還有打擊場，攤位種類比文化路更雜。", noteEn: "Chiayi City's largest night-market site (about 6,000 ping, batting cages included) with a more eclectic stall mix than Wenhua Road."
  },
  {
    id: "chiayi-humei", city: "chiayi", lat: 23.46, lng: 120.428, days: [2,6], hours: "17:00–24:00",
    zh: "湖美夜市", en: "Humei Night Market",
    foodsZh: ["拔絲地瓜", "手工鮮蝦貢丸", "仙草", "五花肉泡菜卷", "蛋堡"],
    foodsEn: ["Candied sweet potato", "Handmade shrimp meatballs", "Grass jelly", "Pork-belly kimchi rolls", "Egg burger"],
    transitZh: "台鐵嘉義站開車約 10 分鐘，位於西區湖子內一帶。", transitEn: "About 10 minutes by car from TRA Chiayi Station, in the Huzinei area of West District.",
    noteZh: "2025 年才開張的新夜市（又稱湖子內夜市），攤位重複少、創意小吃多。", noteEn: "A new market opened in 2025 (also called Huzinei Night Market) with few duplicate stalls and lots of inventive snacks."
  },
  {
    id: "chiayi-mituo", city: "chiayi", lat: 23.472, lng: 120.458, days: [3,5], hours: "17:00–23:00",
    zh: "彌陀夜市", en: "Mituo Night Market",
    foodsZh: ["炸雞腳", "黑輪湯", "豆花", "蚵仔煎", "地瓜球"],
    foodsEn: ["Fried chicken feet", "Fish-cake soup", "Tofu pudding", "Oyster omelette", "Sweet potato balls"],
    transitZh: "台鐵嘉義站開車約 10 分鐘，位於東區立仁路勞工育樂中心附近。", transitEn: "About 10 minutes by car from TRA Chiayi Station, by the Labor Recreation Center on Liren Road, East District.",
    noteZh: "規模不大但多是老攤，下班的在地人居多，氣氛很生活。", noteEn: "Small but packed with long-running vendors and after-work locals — an everyday, neighbourhood feel."
  },
  {
    id: "puzi", city: "chiayi", lat: 23.465, lng: 120.247, days: [6], hours: "17:00–23:00",
    zh: "朴子夜市", en: "Puzi Night Market",
    foodsZh: ["豆乳雞翅", "臭豆腐", "大尾魷魚", "煎鳥蛋", "黑糖鮮奶粉圓"],
    foodsEn: ["Soy-milk chicken wings", "Stinky tofu", "Fried whole squid", "Pan-fried quail eggs", "Brown-sugar milk tapioca"],
    transitZh: "嘉義市區開車約 25 分鐘；市公所前有兩座大型免費停車場。", transitEn: "About 25 minutes by car from Chiayi City; two large free parking lots sit in front of Puzi City Hall.",
    noteZh: "嘉義沿海規模最大的週六夜市，從廟口牌樓一路延伸，價格實惠份量大。", noteEn: "The biggest Saturday market on the Chiayi coast, stretching out from the temple archway, with generous portions at low prices."
  },
  {
    id: "dalin", city: "chiayi", lat: 23.602, lng: 120.46, days: [1], hours: "17:00–22:00",
    zh: "大林夜市", en: "Dalin Night Market",
    foodsZh: ["脆皮炸雞", "碳烤串燒", "蚵蛋燒", "QQ涼圓", "地瓜球"],
    foodsEn: ["Crispy fried chicken", "Charcoal skewers", "Oyster egg cake", "QQ jelly balls", "Sweet potato balls"],
    transitZh: "台鐵大林站開車約 5 分鐘，位於自來水廠旁空地，停車方便。", transitEn: "About 5 minutes by car from TRA Dalin Station, on an open lot beside the waterworks with easy parking.",
    noteZh: "嘉義縣面積最大的週一夜市，走道寬敞，平價小吃很多。", noteEn: "Chiayi County's largest Monday market, with wide aisles and plenty of budget snacks."
  },
  {
    id: "garden", city: "tainan", lat: 23.0105, lng: 120.2117, days: [4,6,0], hours: "18:00–24:00",
    zh: "花園夜市", en: "Garden Night Market",
    foodsZh: ["牛排", "炭烤", "臭豆腐", "蚵仔煎", "檸檬汁"],
    foodsEn: ["Night-market steak", "Charcoal BBQ", "Stinky tofu", "Oyster omelette", "Lemon juice"],
    transitZh: "台南火車站搭計程車約 10 分鐘", transitEn: "About 10 min by taxi from Tainan Station",
    noteZh: "台南最大的流動夜市，只在週四、六、日營業。", noteEn: "Tainan's biggest rotating market, open Thu, Sat and Sun only."
  },
  {
    id: "dadong", city: "tainan", lat: 22.9858, lng: 120.2238, days: [1,2,5], hours: "18:00–24:00",
    zh: "大東夜市", en: "Dadong Night Market",
    foodsZh: ["烤肉串", "雞排", "炸物", "冬瓜茶", "章魚燒"],
    foodsEn: ["Skewers", "Fried chicken cutlet", "Fried snacks", "Winter melon tea", "Takoyaki"],
    transitZh: "台南火車站搭計程車約 10 分鐘", transitEn: "About 10 min by taxi from Tainan Station",
    noteZh: "週一、二、五營業，和花園、武聖輪流開。", noteEn: "Open Mon, Tue and Fri, taking turns with Garden and Wusheng."
  },
  {
    id: "wusheng", city: "tainan", lat: 23.0035, lng: 120.1915, days: [3,6], hours: "18:00–24:00",
    zh: "武聖夜市", en: "Wusheng Night Market",
    foodsZh: ["臭豆腐", "烤玉米", "蚵仔煎", "地瓜球", "珍珠奶茶"],
    foodsEn: ["Stinky tofu", "Grilled corn", "Oyster omelette", "Sweet potato balls", "Bubble tea"],
    transitZh: "台南火車站搭計程車約 10 分鐘", transitEn: "About 10 min by taxi from Tainan Station",
    noteZh: "週三、六營業，在地人比例高。", noteEn: "Open Wed and Sat; mostly locals."
  },
  {
    id: "xiaobei-chenggong", city: "tainan", lat: 23.011, lng: 120.205, days: [2,5], hours: "17:00–24:00",
    zh: "小北成功夜市", en: "Xiaobei Chenggong Night Market",
    foodsZh: ["雞蛋糕", "可麗餅", "滷雞腳", "關東煮", "碳烤雞排"],
    foodsEn: ["Egg cakes", "Crepes", "Braised chicken feet", "Oden", "Charcoal-grilled chicken cutlet"],
    transitZh: "位於北區西門路四段171巷，鄰近新光三越小北門店；夜市入口對面有停車場，從台南火車站可搭計程車或騎 YouBike 前往。", transitEn: "Off Lane 171, Ximen Rd. Sec. 4 (North District), near Shin Kong Mitsukoshi Xiaobei; a parking lot faces the entrance. Taxi or YouBike from Tainan Station.",
    noteZh: "府城北區的老牌週二、週五夜市，約兩百多攤，在地家庭與學生的晚餐首選。", noteEn: "A long-running Tuesday/Friday market in north Tainan with about 250 stalls, a weeknight dinner habit for local families and students."
  },
  {
    id: "yongda-yongkang", city: "tainan", lat: 23.019, lng: 120.26, days: [0,1,4,6], hours: "17:00–24:00",
    zh: "永大夜市", en: "Yongda Night Market",
    foodsZh: ["無骨香酥雞", "臭豆腐", "蔥油餅", "關東煮", "香酥排骨"],
    foodsEn: ["Boneless popcorn chicken", "Stinky tofu", "Scallion pancake", "Oden", "Crispy pork chop"],
    transitZh: "位於永康區永大路二段與永大二路口，以自行開車或騎機車最方便，現場設有汽機車停車場。", transitEn: "At Yongda Rd. Sec. 2 and Yongda 2nd Rd., Yongkang; easiest by car or scooter, with an on-site parking lot.",
    noteZh: "台南少見一週開四天的大型夜市，攤位約兩百七十攤，永康人的日常宵夜場。", noteEn: "One of the few Tainan markets open four nights a week, with roughly 270 stalls serving Yongkang's suburbs."
  },
  {
    id: "xin-yonghua-anping", city: "tainan", lat: 22.989, lng: 120.172, days: [0,4], hours: "17:00–23:30",
    zh: "新永華夜市", en: "Xin Yonghua Night Market",
    foodsZh: ["三角骨", "炸大魷魚", "蚵仔煎", "港式魚蛋", "炭烤串"],
    foodsEn: ["Fried chicken shoulder bits", "Fried whole squid", "Oyster omelette", "Hong Kong fish balls", "Charcoal skewers"],
    transitZh: "位於安平區郡平路與建平七街口廣場，可搭行經華平路、育平路的公車再步行；對面有郡平路公有停車場。", transitEn: "Plaza at Junping Rd. and Jianping 7th St., Anping; take a bus along Huaping or Yuping Rd. and walk. Public lot across Junping Rd.",
    noteZh: "安平的週四、週日廣場型夜市，搬到郡平路新址後動線更寬敞，適合全家逛。", noteEn: "Anping's Thursday/Sunday plaza market; its newer Junping Rd. site has roomier aisles that suit families."
  },
  {
    id: "wanli-south", city: "tainan", lat: 22.928, lng: 120.179, days: [3,6], hours: "18:00–23:00",
    zh: "灣裡夜市", en: "Wanli Night Market",
    foodsZh: ["紅豆餅", "東山鴨頭", "藥膳排骨", "烤玉米", "章魚燒"],
    foodsEn: ["Red bean cakes", "Dongshan duck head", "Herbal pork rib soup", "Grilled corn", "Takoyaki"],
    transitZh: "位於南區灣裡路207號一帶的灣裡市場內，白天是菜市場；距市區較遠，建議騎機車或開車。", transitEn: "Inside Wanli traditional market around No. 207 Wanli Rd., South District (a day market by morning); best reached by scooter or car.",
    noteZh: "白天菜市場、晚上變夜市的小型社區夜市，八成攤位賣吃的，價格是全台南數一數二便宜。", noteEn: "A small neighbourhood market that takes over the day market at night; mostly food stalls, with some of Tainan's lowest prices."
  },
  {
    id: "xinying-zhonghua", city: "tainan", lat: 23.304, lng: 120.307, days: [6], hours: "17:00–23:30",
    zh: "新營夜市（中華路夜市）", en: "Xinying Night Market (Zhonghua Road)",
    foodsZh: ["排骨酥", "滷雞腳", "炸大魷魚", "粉圓", "綠豆冰"],
    foodsEn: ["Fried pork rib nuggets", "Braised chicken feet", "Fried giant squid", "Tapioca drink", "Mung bean shaved ice"],
    transitZh: "入口在三民路與民生路口，沿民生路、中華路呈L型；可停新營民生站停車場（民生路62號），或從台鐵新營站騎 YouBike 前往。", transitEn: "Entrance at Sanmin Rd. and Minsheng Rd.; the market runs in an L along Minsheng and Zhonghua roads. Park at the Minsheng lot (No. 62 Minsheng Rd.) or YouBike from TRA Xinying Station.",
    noteZh: "溪北最大的週六街道夜市，近三百攤沿街擺開，在地人公認大台南北邊最好逛的一場。", noteEn: "The biggest Saturday street market in northern Tainan, with nearly 300 stalls; locals call it the best market north of the Zengwen River."
  },
  {
    id: "madou", city: "tainan", lat: 23.184, lng: 120.243, days: [1], hours: "16:00–24:00",
    zh: "麻豆夜市", en: "Madou Night Market",
    foodsZh: ["蚵仔煎", "無骨香酥雞", "炸大魷魚", "蒙古烤肉", "地瓜球"],
    foodsEn: ["Oyster omelette", "Boneless fried chicken", "Fried giant squid", "Mongolian barbecue", "Sweet potato balls"],
    transitZh: "位於麻豆市區三民路（中山路至新興街）及光復路、中華街一帶，無鐵路直達，建議開車或騎機車並利用周邊路邊停車。", transitEn: "Along Sanmin Rd. (Zhongshan Rd. to Xinxing St.), Guangfu Rd. and Zhonghua St. in central Madou; no rail link, so drive or ride and use street parking.",
    noteZh: "麻豆每週一才有的街道夜市，約兩百二十攤塞滿市中心幾條街，曾文溪北邊週一晚上的熱鬧去處。", noteEn: "Madou's Monday-only street market, about 220 stalls filling several downtown streets; the place to be north of the Zengwen on a Monday night."
  },
  {
    id: "jiali-thursday", city: "tainan", lat: 23.157, lng: 120.179, days: [4], hours: "17:00–23:00",
    zh: "佳里傳統夜市", en: "Jiali Traditional Night Market",
    foodsZh: ["旗魚黑輪", "石頭餅", "大腸麵線", "排骨酥", "炸魷魚"],
    foodsEn: ["Swordfish fish cake", "Stone-baked biscuit", "Intestine vermicelli", "Fried pork ribs", "Fried squid"],
    transitZh: "位於佳里區平等街、信義一街一帶，可從佳池宮那頭開始逛；路邊停車還算好找。", transitEn: "Along Pingdeng St. and Xinyi 1st St. in Jiali, starting from Jiachi Temple; street parking is fairly easy.",
    noteZh: "已有數十年歷史的週四街道夜市，約兩百四十攤，在地人自組自治會管理，充滿老鎮味道。", noteEn: "A decades-old Thursday street market of about 245 stalls, run by a vendors' association and full of small-town character."
  },
  {
    id: "anxi-jiali", city: "tainan", lat: 23.165, lng: 120.165, days: [3,6], hours: "17:00–23:00",
    zh: "安西夜市", en: "Anxi Night Market",
    foodsZh: ["旗魚黑輪", "心肝湯", "蚵仔煎", "碳烤雞排", "茶葉蛋"],
    foodsEn: ["Swordfish fish cake", "Pork heart & liver soup", "Oyster omelette", "Grilled chicken cutlet", "Tea eggs"],
    transitZh: "位於佳里區佳西路與光華路口，旁邊有大型免費停車場，開車或騎車前往最方便。", transitEn: "At Jiaxi Rd. and Guanghua Rd., Jiali, beside a large free parking lot; best by car or scooter.",
    noteZh: "佳里的週三、週六廣場夜市，約一百三十攤，有遮棚座位區和公廁，被形容為佳里版的武聖夜市。", noteEn: "Jiali's Wednesday/Saturday lot market of about 130 stalls, with covered seating and toilets; often likened to a small-town Wusheng."
  },
  {
    id: "shanhua", city: "tainan", lat: 23.128, lng: 120.295, days: [0,2,5], hours: "17:00–24:00",
    zh: "善化夜市", en: "Shanhua Night Market",
    foodsZh: ["炭烤肉串", "炸大魷魚", "沙威瑪", "蒙古烤肉", "章魚燒"],
    foodsEn: ["Charcoal skewers", "Fried giant squid", "Shawarma", "Mongolian barbecue", "Takoyaki"],
    transitZh: "位於善化區建國路與興華路口，附近有兩處停車場；週五、週日車位難找，建議停遠一點或騎機車。", transitEn: "At Jianguo Rd. and Xinghua Rd., Shanhua, with two nearby lots; parking is tight on Fridays and Sundays, so park farther out or ride a scooter.",
    noteZh: "南科人愛逛的大型廣場夜市，約兩百四十攤，座位多、廁所還有冷氣。", noteEn: "A big lot market of about 240 stalls popular with Southern Science Park workers; plenty of seating and even air-conditioned toilets."
  },
  {
    id: "yanshui", city: "tainan", lat: 23.323, lng: 120.266, days: [3], hours: "17:30–23:30",
    zh: "鹽水夜市", en: "Yanshui Night Market",
    foodsZh: ["炸大魷魚", "蔥油餅", "鐵板牛排", "滷雞腳", "鴨肉油飯"],
    foodsEn: ["Fried giant squid", "Scallion pancake", "Sizzling steak", "Braised chicken feet", "Duck sticky rice"],
    transitZh: "位於鹽水區北門路一帶（武廟前至鹽水國小後方），北門路有停車場；離市區遠，建議開車或騎車。", transitEn: "Along Beimen Rd. in Yanshui, from the Wu Temple to behind Yanshui Elementary; parking lot on Beimen Rd. Drive or ride—it is far from central Tainan.",
    noteZh: "三十多年的週三夜市，約三百攤沿運河旁的北門路展開，元宵節前後還會連開多天。", noteEn: "A 30-plus-year Wednesday market of around 300 stalls along canal-side Beimen Rd.; it runs for several nights around the Lantern Festival."
  },
  {
    id: "xuejia", city: "tainan", lat: 23.236, lng: 120.176, days: [3], hours: "17:00–22:30",
    zh: "學甲夜市", en: "Xuejia Night Market",
    foodsZh: ["蚵仔煎", "地瓜球", "甘草芭樂", "小火鍋", "雞排"],
    foodsEn: ["Oyster omelette", "Sweet potato balls", "Licorice guava", "Mini hot pot", "Chicken cutlet"],
    transitZh: "位於學甲區天水路、三民路、信義路、新生路一帶（近三連路、中正路口），汽車有專屬停車區。", transitEn: "Along Tianshui, Sanmin, Xinyi and Xinsheng roads in Xuejia (near Sanlian and Zhongzheng roads); there is a car parking area.",
    noteZh: "學甲每週三的街道夜市，約一百八十攤，2016年前後遷到天水路現址，保留濃濃鄉鎮氣氛。", noteEn: "Xuejia's Wednesday street market of about 180 stalls, moved to its Tianshui Rd. site around 2016, with a relaxed small-town feel."
  },
  {
    id: "guanmiao", city: "tainan", lat: 22.961, lng: 120.327, days: [1,5], hours: "16:00–22:00",
    zh: "關廟夜市", en: "Guanmiao Night Market",
    foodsZh: ["炒泡麵", "排骨酥", "炸蛋蔥油餅", "臭豆腐", "碳烤雞排"],
    foodsEn: ["Stir-fried instant noodles", "Fried pork ribs", "Fried-egg scallion pancake", "Stinky tofu", "Charcoal chicken cutlet"],
    transitZh: "位於關廟區中央路關廟郵局前及仁愛路一帶，靠近山西宮與關廟市場；建議開車或騎車。", transitEn: "Around Zhongyang Rd. in front of Guanmiao Post Office and along Renai Rd., near Shanxi Temple and the town market; drive or ride.",
    noteZh: "從老戲院周邊發展出來的週一、週五夜市，下午四點就開攤，是鳳梨小鎮的晚餐場。", noteEn: "A Monday/Friday market that grew up around an old theatre; stalls open from 4 pm, making it the pineapple town's early dinner spot."
  },
  {
    id: "guiren-fuxing", city: "tainan", lat: 22.965, lng: 120.294, days: [4], hours: "17:00–22:00",
    zh: "歸仁復興路夜市", en: "Guiren Fuxing Road Night Market",
    foodsZh: ["大腸麵線", "無骨香酥雞", "烤玉米", "地瓜球", "可麗餅"],
    foodsEn: ["Intestine vermicelli", "Boneless fried chicken", "Grilled corn", "Sweet potato balls", "Crepes"],
    transitZh: "位於歸仁圓環附近的復興路與和平南街一帶，國道1號仁德交流道或86快速道路歸仁出口下沿182縣道可達；只有路邊停車。", transitEn: "Around Fuxing Rd. and Heping S. St. near the Guiren roundabout; reach via Freeway 1 (Rende exit) or Expressway 86 (Guiren exit) and Route 182. Street parking only.",
    noteZh: "歸仁市場旁的週四街邊夜市，約一百二十攤，從1970年代的騎樓小攤一路演變而來。", noteEn: "A Thursday street market of about 126 stalls beside Guiren's town market, descended from arcade vendors of the late 1970s."
  },
  {
    id: "yujing", city: "tainan", lat: 23.124, lng: 120.467, days: [3,6], hours: "17:00–22:30",
    zh: "玉井夜市", en: "Yujing Night Market",
    foodsZh: ["鍋貼煎餃", "鐵板牛排", "藥膳排骨", "豆乳雞", "鱔魚意麵"],
    foodsEn: ["Pan-fried dumplings", "Sizzling steak", "Herbal pork ribs", "Soy-milk fried chicken", "Eel noodles"],
    transitZh: "位於玉井市區民生路與民族路一帶（玉田里），可搭往玉井的公車至玉井站再步行，或自行開車。", transitEn: "Along Minsheng and Minzu roads in central Yujing (Yutian Village); take a bus to Yujing and walk, or drive.",
    noteZh: "芒果之鄉的週三、週六夜市，約一百一十攤；週三規模較大，是山城居民的聚會場。", noteEn: "The mango town's Wednesday/Saturday market of about 110 stalls; Wednesday is the bigger night and a social hub for the hill-country community."
  },
  {
    id: "liuhe", city: "kaohsiung", lat: 22.6318, lng: 120.299, days: null, hours: "18:00–24:00",
    zh: "六合觀光夜市", en: "Liuhe Night Market",
    foodsZh: ["木瓜牛奶", "海產粥", "烤海鮮", "鱔魚意麵", "滷肉飯"],
    foodsEn: ["Papaya milk", "Seafood congee", "Grilled seafood", "Eel noodles", "Braised pork rice"],
    transitZh: "捷運美麗島站 11 號出口", transitEn: "MRT Formosa Boulevard Station, Exit 11",
    noteZh: "高雄最有名的觀光夜市，走路就到美麗島站。", noteEn: "Kaohsiung's best-known tourist market, right by Formosa Boulevard."
  },
  {
    id: "ruifeng", city: "kaohsiung", lat: 22.666, lng: 120.2995, days: [2,4,5,6,0], hours: "18:00–24:00",
    zh: "瑞豐夜市", en: "Ruifeng Night Market",
    foodsZh: ["牛排", "麻辣鴨血", "炸雞", "日式燒烤", "冰沙"],
    foodsEn: ["Night-market steak", "Spicy duck blood", "Fried chicken", "Japanese BBQ", "Smoothies"],
    transitZh: "捷運巨蛋站 1 號出口", transitEn: "MRT Kaohsiung Arena Station, Exit 1",
    noteZh: "高雄在地人最愛，週一、週三公休。", noteEn: "Kaohsiung locals' favourite; closed Mon and Wed."
  },
  {
    id: "guanghua-kaohsiung", city: "kaohsiung", lat: 22.609, lng: 120.3175, days: null, hours: "17:00–01:00",
    zh: "光華夜市", en: "Guanghua Night Market",
    foodsZh: ["鱔魚意麵", "藥燉排骨", "木瓜牛奶", "麻辣臭豆腐", "豆花"],
    foodsEn: ["Eel noodles", "Herbal pork rib soup", "Papaya milk", "Mala stinky tofu", "Tofu pudding"],
    transitZh: "環狀輕軌五權國小站步行約 10 分鐘；或搭公車 100 至光華路口站", transitEn: "About 10 min walk from Wuquan Elementary School light-rail stop, or bus 100 to Guanghua Rd. Intersection",
    noteZh: "沿光華二路排開的在地老夜市，多為有店面的數十年老攤，適合來吃正餐與宵夜。", noteEn: "A long-running locals' strip along Guanghua 2nd Rd, mostly decades-old shopfront stalls good for a full dinner or late snack."
  },
  {
    id: "xingzhong", city: "kaohsiung", lat: 22.615, lng: 120.3075, days: null, hours: "16:00–01:30",
    zh: "興中夜市", en: "Xingzhong Night Market",
    foodsZh: ["香菇肉羹", "香雞排", "甘草芭樂", "火雞肉飯", "鹽水雞"],
    foodsEn: ["Shiitake pork thick soup", "Fried chicken cutlet", "Licorice guava", "Turkey rice", "Salt-water chicken"],
    transitZh: "捷運紅線三多商圈站下車，沿三多三路步行約 5 分鐘", transitEn: "MRT Red Line Sanduo Shopping District Station, then about 5 min walk along Sanduo 3rd Rd",
    noteZh: "藏在三多商圈旁的社區型小夜市，攤位集中在文橫二路，宵夜選擇多、價格平實。", noteEn: "Compact neighbourhood market beside the Sanduo shopping area, clustered on Wenheng 2nd Rd with cheap late-night eats."
  },
  {
    id: "nanhua-kaohsiung", city: "kaohsiung", lat: 22.628, lng: 120.2998, days: null, hours: "12:00–22:00",
    zh: "南華觀光夜市", en: "Nanhua Night Market",
    foodsZh: ["碗粿", "豬血湯", "愛玉冰", "刀削麵", "鹽水意麵"],
    foodsEn: ["Steamed rice cake (wa-gui)", "Pork blood soup", "Aiyu jelly ice", "Knife-cut noodles", "Salt-water noodles"],
    transitZh: "捷運美麗島站 3 號出口步行約 5 分鐘", transitEn: "About 5 min walk from MRT Formosa Boulevard Station Exit 3",
    noteZh: "從中午就開市的徒步商圈，服飾攤與傳統市場老味道混在一起，晚上收得比一般夜市早。", noteEn: "A pedestrian market street that opens from noon, mixing clothing stalls with old market-side eateries; it winds down earlier than most night markets."
  },
  {
    id: "fengshan-qingnian", city: "kaohsiung", lat: 22.629, lng: 120.36, days: [0,4,5,6], hours: "17:00–23:00",
    zh: "鳳山青年夜市", en: "Fengshan Youth Night Market",
    foodsZh: ["凍圓", "豆乳雞", "蒙古烤肉", "碳烤串", "小火鍋"],
    foodsEn: ["Frozen tapioca balls (dong-yuan)", "Soy-milk fried chicken", "Mongolian BBQ", "Charcoal skewers", "Mini hot pot"],
    transitZh: "設有大型專屬停車場，建議騎車或開車前往；捷運大東站搭計程車約 5 分鐘", transitEn: "Large dedicated car/scooter park; easiest by scooter or car, or a short taxi ride from MRT Dadong Station",
    noteZh: "幾經搬遷後於2021年回到鳳山的大型週末夜市，七條美食街加上套圈圈、彈珠台等遊戲。", noteEn: "A big weekend-style market that returned to Fengshan in 2021 after several moves, with seven food lanes plus ring-toss and pinball games."
  },
  {
    id: "fengshan-zhonghua", city: "kaohsiung", lat: 22.6262, lng: 120.358, days: null, hours: "18:00–24:00",
    zh: "鳳山中華街觀光夜市", en: "Fengshan Zhonghua Street Night Market",
    foodsZh: ["肉燥飯", "愛玉冰", "綠豆湯", "筍乾腿庫飯", "鮮魚湯"],
    foodsEn: ["Braised pork rice", "Aiyu jelly ice", "Mung bean soup", "Braised pork knuckle rice with bamboo", "Fish soup"],
    transitZh: "捷運鳳山站 2 號出口步行約 3 分鐘", transitEn: "About 3 min walk from MRT Fengshan Station Exit 2",
    noteZh: "鳳山老城區的小吃街，白天就有店家營業，晚上最熱鬧，以傳統飯湯與冰品為主。", noteEn: "A snack street in old Fengshan where some shops trade from morning; busiest at night, centred on traditional rice dishes, soups and ices."
  },
  {
    id: "ziqiang-lingya", city: "kaohsiung", lat: 22.62, lng: 120.302, days: null, hours: "17:00–01:00",
    zh: "苓雅自強夜市", en: "Lingya Ziqiang Night Market",
    foodsZh: ["白糖粿", "滷肉飯", "煎餅果子", "冷凍芋", "蒜香豆干"],
    foodsEn: ["Sugar-coated fried rice cake", "Braised pork rice", "Jianbing guozi crepe", "Frozen taro", "Garlic braised tofu"],
    transitZh: "捷運中央公園站或三多商圈站步行約 10 分鐘", transitEn: "About 10 min walk from MRT Central Park or Sanduo Shopping District Station",
    noteZh: "白天是苓雅市場，傍晚後轉成小吃夜市，老攤林立，在地人吃晚餐的好去處。", noteEn: "Lingya traditional market by day that turns into a snack market at dusk, packed with veteran stalls locals use for dinner."
  },
  {
    id: "wujia-ziqiang", city: "kaohsiung", lat: 22.5985, lng: 120.3355, days: null, hours: "18:00–23:00",
    zh: "五甲自強夜市", en: "Wujia Ziqiang Night Market",
    foodsZh: ["蒸餃", "鴨肉飯", "蝦米飯", "豆菜麵", "麻辣鴨血"],
    foodsEn: ["Steamed dumplings", "Duck rice", "Dried-shrimp rice", "Bean-sprout noodles", "Mala duck blood"],
    transitZh: "捷運前鎮高中站下車，沿五甲路步行約 10 分鐘", transitEn: "MRT Cianjhen Senior High School Station, then about 10 min walk along Wujia Rd",
    noteZh: "沿自強二路的鳳山在地小吃街，從中午到深夜都有店家，價格親民。", noteEn: "A Fengshan snack street along Ziqiang 2nd Rd with shops trading from midday to late night at local prices."
  },
  {
    id: "jilin-kaohsiung", city: "kaohsiung", lat: 22.6455, lng: 120.31, days: null, hours: "15:00–01:00",
    zh: "吉林夜市", en: "Jilin Street Night Market",
    foodsZh: ["蒸餃", "八寶冰", "月亮蝦餅", "春捲", "香雞排"],
    foodsEn: ["Steamed dumplings", "Eight-treasure ice", "Thai moon shrimp cake", "Spring rolls", "Fried chicken cutlet"],
    transitZh: "捷運後驛站 2 號出口步行約 8 分鐘", transitEn: "About 8 min walk from MRT Houyi Station Exit 2",
    noteZh: "高雄後站、高醫附近的在地夜市，學生與上班族多，從下午一路營業到深夜。", noteEn: "A local market behind Kaohsiung Main Station near KMU, busy with students and office workers from afternoon to late night."
  },
  {
    id: "gangshan", city: "kaohsiung", lat: 22.794, lng: 120.2985, days: [1,5,6], hours: "17:00–24:00",
    zh: "岡山夜市", en: "Gangshan Night Market",
    foodsZh: ["木炭烤肉", "三角骨", "旗魚黑輪", "冬瓜茶", "地瓜球"],
    foodsEn: ["Charcoal BBQ skewers", "Fried pork cartilage bites", "Swordfish tempura", "Winter melon tea", "Sweet potato balls"],
    transitZh: "捷運岡山車站 1 號出口或台鐵岡山站步行約 5 分鐘", transitEn: "About 5 min walk from MRT Gangshan Station Exit 1 / TRA Gangshan Station",
    noteZh: "北高雄的大型流動夜市，每週一、五、六開市，吃喝之外也有服飾、五金與遊戲攤。", noteEn: "North Kaohsiung's big rotating market (Mon, Fri, Sat), with clothes, hardware and game stalls alongside the food."
  },
  {
    id: "qishan", city: "kaohsiung", lat: 22.902, lng: 120.483, days: [2,6], hours: "17:00–22:00",
    zh: "旗山夜市", en: "Qishan Night Market",
    foodsZh: ["夜市牛排", "臭豆腐", "碳烤雞翅", "雪淇冰", "地瓜球"],
    foodsEn: ["Night-market steak", "Stinky tofu", "Grilled chicken wings", "Old-style ice cream", "Sweet potato balls"],
    transitZh: "位於旗山農工對面的果菜市場，建議開車或騎車；旗山轉運站步行約 15 分鐘", transitEn: "In the produce market opposite Qishan Agricultural & Industrial School; best by car or scooter, about 15 min walk from Qishan bus terminal",
    noteZh: "早上是果菜市場、週二週六晚上變成夜市，背後就是山景，鄉鎮夜市氣氛濃。", noteEn: "A produce market by morning that becomes a night market on Tuesday and Saturday evenings, with a mountain backdrop and small-town feel."
  },
  {
    id: "houjin", city: "kaohsiung", lat: 22.7265, lng: 120.3105, days: [5,6], hours: "17:00–24:00",
    zh: "後勁夜市", en: "Houjin Night Market",
    foodsZh: ["燒烤", "臭臭鍋", "鹽酥雞", "沙威瑪", "蚵仔煎"],
    foodsEn: ["Grilled skewers", "Stinky hot pot", "Popcorn chicken", "Shawarma", "Oyster omelette"],
    transitZh: "捷運紅線楠梓加工區站步行約 5 分鐘", transitEn: "About 5 min walk from MRT Red Line Nanzih Export Processing Zone Station",
    noteZh: "楠梓加工區旁的週五、週六夜市，平日也有部分攤位營業，服務附近上班族與居民。", noteEn: "A Friday–Saturday market beside the Nanzih export zone; some stalls also open on weeknights for workers and residents."
  },
  {
    id: "hanmin", city: "kaohsiung", lat: 22.566, lng: 120.358, days: [0,2,3,5,6], hours: "18:00–24:00",
    zh: "漢民夜市", en: "Hanmin Night Market",
    foodsZh: ["臭豆腐鍋", "東山鴨頭", "花雕雞麵", "夜市牛排", "蒙古烤肉"],
    foodsEn: ["Stinky tofu hot pot", "Dongshan fried duck head", "Shaoxing-wine chicken noodles", "Night-market steak", "Mongolian BBQ"],
    transitZh: "捷運紅線小港站步行約 5 分鐘", transitEn: "About 5 min walk from MRT Red Line Siaogang Station",
    noteZh: "小港文教區、漢民公園旁的觀光夜市，週一、週四公休，小吃與彈珠台等遊戲兼具。", noteEn: "A tourist night market by Hanmin Park in Siaogang's school district, closed Mon and Thu, mixing snacks with pinball and games."
  },
  {
    id: "yanchengpu", city: "kaohsiung", lat: 22.6285, lng: 120.2855, days: [6], hours: "17:30–22:30",
    zh: "鹽埕埔夜市（駁二夜市）", en: "Yanchengpu (Pier-2) Night Market",
    foodsZh: ["QQ蛋", "鹽水雞", "麵疙瘩", "可麗餅", "豆花奶茶"],
    foodsEn: ["QQ sweet potato eggs", "Salt-water chicken", "Hand-pulled dough soup", "Crepes", "Tofu-pudding milk tea"],
    transitZh: "輕軌駁二蓬萊站或捷運鹽埕埔站步行約 10 分鐘", transitEn: "About 10 min walk from Penglai (Pier-2) light-rail stop or MRT Yanchengpu Station",
    noteZh: "只在週六晚上出現的橋下夜市，離駁二藝術特區不遠，看完展覽順路來吃。", noteEn: "A Saturday-only market under the bridge near the Pier-2 Art Center, handy after a gallery visit."
  },
  {
    id: "neiwei", city: "kaohsiung", lat: 22.6555, lng: 120.2885, days: [0,3], hours: "18:00–23:30",
    zh: "內惟夜市", en: "Neiwei Night Market",
    foodsZh: ["香酥雞", "石頭火鍋", "夜市牛排", "東山鴨頭", "臭豆腐"],
    foodsEn: ["Crispy fried chicken", "Stone-pot hot pot", "Night-market steak", "Dongshan duck head", "Stinky tofu"],
    transitZh: "輕軌美術館站或內惟藝術中心站步行約 10 分鐘", transitEn: "About 10 min walk from the Museum of Fine Arts or Neiwei Arts Center light-rail stops",
    noteZh: "鼓山內惟的社區型流動夜市，週三、週日晚上開市，週末白天同場地另有跳蚤市場。", noteEn: "A neighbourhood rotating market in Neiwei, Gushan, held Wed and Sun nights; the same lot hosts a weekend daytime flea market."
  },
  {
    id: "zhongxiao-kaohsiung", city: "kaohsiung", lat: 22.622, lng: 120.305, days: null, hours: "16:00–01:00",
    zh: "忠孝夜市（高雄）", en: "Zhongxiao Night Market (Kaohsiung)",
    foodsZh: ["陽春麵", "楊桃湯", "米糕", "十元燒烤", "臭豆腐"],
    foodsEn: ["Plain noodles", "Starfruit juice", "Glutinous rice cake (mi-gao)", "NT$10 grilled skewers", "Stinky tofu"],
    transitZh: "捷運中央公園站下車，沿五福二路步行約 10 分鐘", transitEn: "MRT Central Park Station, then about 10 min walk along Wufu 2nd Rd",
    noteZh: "苓雅區忠孝二路上的老街區夜市，規模不大，以平價麵飯與宵夜為主。", noteEn: "A modest old-neighbourhood market on Zhongxiao 2nd Rd in Lingya, mostly cheap noodles, rice and late-night bites."
  },
  {
    id: "minzu-pt", city: "pingtung", lat: 22.6735, lng: 120.489, days: null, hours: "17:00–24:00",
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
    id: "donggang", city: "pingtung", lat: 22.47, lng: 120.451, days: [3,6], hours: "17:00–23:00",
    zh: "東港夜市", en: "Donggang Night Market",
    foodsZh: ["百元牛排", "古早味剉冰", "東山鴨頭", "鹽水雞", "現做粉圓"],
    foodsEn: ["NT$100 steak", "Old-style shaved ice", "Dongshan duck head", "Salt-water chicken", "Fresh tapioca pearls"],
    transitZh: "東港轉運站步行約 15 分鐘；入口有收費停車場", transitEn: "About 15 min walk from Donggang bus terminal; paid parking at the entrance",
    noteZh: "每週三、六開市、綿延約600公尺的街邊夜市，打香腸、撈金魚等古早遊戲很多，週六觀光客較多。", noteEn: "A roughly 600 m street market on Wed and Sat with lots of old-school games like sausage dice and goldfish scooping; Saturdays draw more visitors."
  },
  {
    id: "hengchun", city: "pingtung", lat: 22.0035, lng: 120.741, days: [0], hours: "17:00–24:00",
    zh: "恆春夜市", en: "Hengchun Night Market",
    foodsZh: ["煙燻滷味", "章魚燒", "大腸包小腸", "夜市牛排", "甘草芭樂"],
    foodsEn: ["Smoked braised snacks", "Takoyaki", "Sausage in sticky-rice sausage", "Night-market steak", "Licorice guava"],
    transitZh: "恆春轉運站步行約 10 分鐘；開車可停恆春郵局或猴洞山公園周邊", transitEn: "About 10 min walk from Hengchun bus terminal; drivers can park near the post office or Houdongshan Park",
    noteZh: "只在週日晚上開的恆春在地夜市，比墾丁大街更有鄉鎮味，煙燻滷味很受推薦。", noteEn: "Hengchun's Sunday-only local market — more small-town than Kenting Street, with smoked braised snacks the star."
  },
  {
    id: "luodong", city: "yilan", lat: 24.6775, lng: 121.769, days: null, hours: "17:00–24:00",
    zh: "羅東夜市", en: "Luodong Night Market",
    foodsZh: ["包心粉圓", "卜肉", "羊肉湯", "三星蔥餅", "龍鳳腿"],
    foodsEn: ["Filled tapioca balls", "Fried pork strips (bu rou)", "Lamb soup", "Sanxing scallion pancake", "Long feng tui roll"],
    transitZh: "羅東火車站步行約 8 分鐘", transitEn: "About 8 min walk from Luodong Station",
    noteZh: "圍著羅東中山公園，宜蘭最熱鬧的夜市。", noteEn: "Around Luodong Zhongshan Park; Yilan's liveliest market."
  },
  {
    id: "dongmen-yl", city: "yilan", lat: 24.754, lng: 121.7585, days: null, hours: "17:00–24:00",
    zh: "宜蘭東門夜市", en: "Yilan Dongmen Night Market",
    foodsZh: ["卜肉", "臭豆腐", "米糕", "炸蔥油餅", "麻糬"],
    foodsEn: ["Fried pork strips (bu rou)", "Stinky tofu", "Glutinous rice cake", "Fried scallion pancake", "Mochi"],
    transitZh: "宜蘭火車站步行約 8 分鐘", transitEn: "About 8 min walk from Yilan Station",
    noteZh: "宜蘭市區的在地夜市，比羅東安靜一些。", noteEn: "Downtown Yilan market, a little calmer than Luodong."
  },
  {
    id: "qinggou-dongshan", city: "yilan", lat: 24.656, lng: 121.774, days: [3], hours: "18:00–23:00",
    zh: "清溝夜市", en: "Qinggou Night Market",
    foodsZh: ["燒肉刈包", "無骨排骨酥", "麻油腰子", "油飯", "泰式奶茶"],
    foodsEn: ["Fried gua bao with braised pork", "Boneless fried pork ribs", "Sesame-oil pork kidney", "Sticky oil rice", "Thai milk tea"],
    transitZh: "位於冬山鄉稻田間，大眾運輸不便；建議自羅東或冬山火車站開車、騎車或搭計程車約 10 分鐘，現場路邊停車。", transitEn: "Set among Dongshan rice fields with little public transport; drive, ride or take a taxi about 10 minutes from Luodong or Dongshan station and park along the roads.",
    noteZh: "宜蘭規模最大的週三流動夜市，攤位沿著田間道路延伸一公里以上，是各地巡迴名攤的大集合。", noteEn: "Yilan's biggest Wednesday pop-up market, stretching over a kilometre along a rural road and gathering the county's best-known roving stalls."
  },
  {
    id: "jiaoxi-hotspring", city: "yilan", lat: 24.831, lng: 121.768, days: [0], hours: "17:00–22:00",
    zh: "礁溪溫泉夜市", en: "Jiaoxi Hot Spring Night Market",
    foodsZh: ["炸雞", "夜市牛排", "油飯", "水果茶", "窯烤披薩"],
    foodsEn: ["Fried chicken", "Night-market steak", "Sticky oil rice", "Fruit tea", "Oven-baked pizza"],
    transitZh: "2025 年中已由礁溪後站遷至五峰旗山下的得子三路重劃區，距礁溪火車站約 2 公里，建議騎車、開車或搭計程車。", transitEn: "Moved in mid-2025 from behind Jiaoxi station to the Dezi 3rd Rd redevelopment zone below Wufengqi, roughly 2 km from Jiaoxi station; ride, drive or take a taxi.",
    noteZh: "每週日限定，泡完溫泉後可順道覓食的流動夜市；舊址已無攤位，前往前請確認新地點。", noteEn: "A Sunday-only roving market handy after a hot-spring soak; the old site is empty, so head to the new location."
  },
  {
    id: "toucheng-jixiang", city: "yilan", lat: 24.86, lng: 121.824, days: [5], hours: "17:30–22:30",
    zh: "頭城吉祥夜市", en: "Toucheng Jixiang Night Market",
    foodsZh: ["臭豆腐", "章魚燒", "炸雞", "燒肉刈包", "水果茶"],
    foodsEn: ["Stinky tofu", "Takoyaki", "Fried chicken", "Fried pork gua bao", "Fruit tea"],
    transitZh: "台鐵頭城站步行約 10 分鐘，位於鎮公所後方、城隍廟旁的空地。", transitEn: "About a 10-minute walk from TRA Toucheng station, on the open lot behind the town office beside the City God temple.",
    noteZh: "頭城每週五的小型流動夜市，臭豆腐攤選擇多，適合北宜沿線順路一逛。", noteEn: "Toucheng's compact Friday market, notable for several competing stinky tofu stalls."
  },
  {
    id: "masai-suao", city: "yilan", lat: 24.611, lng: 121.83, days: [6], hours: "18:30–21:30",
    zh: "馬賽夜市", en: "Masai Night Market (Su'ao)",
    foodsZh: ["地瓜球", "可麗餅", "蚵仔煎", "藥燉排骨", "薏仁豆花"],
    foodsEn: ["Sweet potato balls", "Crispy crepes", "Oyster omelette", "Herbal pork rib soup", "Barley tofu pudding"],
    transitZh: "台鐵蘇澳新站步行約 10–15 分鐘，位於馬賽中心一帶的和平路。", transitEn: "Around 10–15 minutes on foot from TRA Su'aoxin station, on Heping Rd near the Masai centre.",
    noteZh: "蘇澳在地人的週六小夜市，營業時間短、以平價點心為主。", noteEn: "A short-hours Saturday market for Su'ao locals, focused on cheap snacks."
  },
  {
    id: "dongdamen", city: "hualien", lat: 23.9745, lng: 121.612, days: null, hours: "18:00–24:00",
    zh: "東大門夜市", en: "Dongdamen Night Market",
    foodsZh: ["原住民烤肉", "石板烤山豬肉", "蔥油餅", "炸彈蔥油餅", "小米酒"],
    foodsEn: ["Indigenous BBQ", "Stone-grilled wild boar", "Scallion pancake", "'Bomb' scallion pancake", "Millet wine"],
    transitZh: "花蓮火車站搭計程車約 10 分鐘", transitEn: "About 10 min by taxi from Hualien Station",
    noteZh: "有原住民一條街和各省一條街，花蓮最大的夜市。", noteEn: "Hualien's largest market, with an Indigenous food street."
  },
  {
    id: "nanpu-jian", city: "hualien", lat: 23.97, lng: 121.61, days: [2], hours: "18:00–22:00",
    zh: "南埔夜市", en: "Nanpu Night Market (Ji'an)",
    foodsZh: ["炸雞", "鹽水雞", "QQ蛋球", "泰式雞腿捲", "港式碳烤"],
    foodsEn: ["Fried chicken", "Salted chilled chicken", "QQ egg balls", "Thai chicken roll", "HK-style charcoal grill"],
    transitZh: "位於吉安鄉海岸路旁，建議自花蓮市區開車或騎車約 10–15 分鐘；海岸路車多，行走留意安全。", transitEn: "Beside Haian Rd in Ji'an; drive or ride 10–15 minutes from central Hualien and watch the traffic on the main road.",
    noteZh: "花蓮週二的固定流動夜市，鄰近市區、以炸物和鹽水雞等宵夜小吃為主。", noteEn: "Hualien's Tuesday pop-up near the city, strong on fried snacks and chilled chicken."
  },
  {
    id: "taichang-jian", city: "hualien", lat: 23.996, lng: 121.587, days: [4], hours: "17:00–22:00",
    zh: "太昌夜市", en: "Taichang Night Market",
    foodsZh: ["十元碳烤", "炸雞", "QQ蛋", "平價牛排", "鬆餅"],
    foodsEn: ["NT$10 charcoal skewers", "Fried chicken", "QQ egg balls", "Budget steak", "Waffles"],
    transitZh: "位於吉安鄉建國路二段、慈濟科技大學附近的空地，自花蓮火車站開車或騎車約 10 分鐘。", transitEn: "On a lot along Jianguo Rd Sec 2 near Tzu Chi University of Science and Technology, about 10 minutes by car or scooter from Hualien station.",
    noteZh: "又稱建國夜市，週四登場，吃喝之外還有不少遊戲與服飾攤，是吉安居民的週間娛樂。", noteEn: "Also called Jianguo night market; the Thursday edition mixes food with games and clothing stalls."
  },
  {
    id: "yuli", city: "hualien", lat: 23.331, lng: 121.317, days: [5], hours: "18:00–22:00",
    zh: "玉里夜市", en: "Yuli Night Market",
    foodsZh: ["東山鴨頭", "羊肉湯", "炸雞", "烤玉米", "冷滷味"],
    foodsEn: ["Dongshan duck heads", "Mutton soup", "Fried chicken", "Grilled corn", "Chilled braised snacks"],
    transitZh: "台鐵玉里站步行約 15 分鐘，位於玉里國小旁的忠智路與忠勇路。", transitEn: "About 15 minutes on foot from TRA Yuli station, along Zhongzhi and Zhongyong roads next to Yuli Elementary School.",
    noteZh: "花東縱谷南段小鎮的週五夜市，L 型攤街吃喝玩樂兼具，充滿在地人情味。", noteEn: "A small-town Friday market in the southern Rift Valley, an L-shaped strip of snacks, games and cheap clothes."
  },
  {
    id: "taitung", city: "taitung", lat: 22.7545, lng: 121.1495, days: "check", hours: "18:00–23:00",
    zh: "台東觀光夜市", en: "Taitung Tourist Night Market",
    foodsZh: ["原住民小吃", "炸物", "烤玉米", "釋迦冰品", "米苔目"],
    foodsEn: ["Indigenous snacks", "Fried snacks", "Grilled corn", "Sugar-apple ice", "Rice noodles (mi tai mu)"],
    transitZh: "台東市區正氣路一帶", transitEn: "Zhengqi Road, downtown Taitung",
    noteZh: "每週只開特定幾天，出發前請先確認營業日。", noteEn: "Only open on certain days of the week; check before you go."
  },
  {
    id: "siwei-taitung", city: "taitung", lat: 22.768, lng: 121.142, days: [0], hours: "18:00–24:00",
    zh: "四維夜市", en: "Siwei Night Market",
    foodsZh: ["炸雞排", "雞蛋糕", "烤肉刈包", "泡芙", "地瓜球"],
    foodsEn: ["Fried chicken cutlet", "Egg cakes", "Grilled pork gua bao", "Cream puffs", "Sweet potato balls"],
    transitZh: "位於台東市區四維路一段，自台東轉運站騎車或開車約 5–10 分鐘，周邊道路封街擺攤。", transitEn: "On Siwei Rd Sec 1 in Taitung city, 5–10 minutes by scooter or car from the Taitung bus terminal; the streets are closed to traffic.",
    noteZh: "台東市區週日限定的大型夜市，攤位與遊樂設施多，是在地家庭週末夜晚的去處。", noteEn: "Taitung city's big Sunday-only market with lots of stalls and kids' rides, popular with local families."
  },
  {
    id: "zhiben", city: "taitung", lat: 22.711, lng: 121.062, days: [5], hours: "17:30–22:30",
    zh: "知本夜市", en: "Zhiben Night Market",
    foodsZh: ["米血糕", "酥皮蚵仔煎", "冬粉鴨", "東山鴨頭", "地瓜球"],
    foodsEn: ["Rice blood cake", "Flaky oyster omelette", "Duck vermicelli soup", "Dongshan duck heads", "Sweet potato balls"],
    transitZh: "台鐵知本站前，出站步行約 3 分鐘。", transitEn: "Right in front of TRA Zhiben station, about a 3-minute walk.",
    noteZh: "週五在知本車站前登場，石板烤肉和原民料理之外，蚵仔煎攤也很受歡迎。", noteEn: "Friday market outside Zhiben station, known for stone-slab grills, Indigenous dishes and oyster omelettes."
  },
  {
    id: "chishang", city: "taitung", lat: 23.124, lng: 121.219, days: [3,6], hours: "17:00–22:00",
    zh: "池上夜市", en: "Chishang Night Market",
    foodsZh: ["官財板", "蚵仔煎", "臭豆腐", "春捲", "炸雞"],
    foodsEn: ["Coffin bread", "Oyster omelette", "Stinky tofu", "Spring rolls", "Fried chicken"],
    transitZh: "台鐵池上站步行約 5 分鐘，近伯朗大道入口。", transitEn: "About 5 minutes on foot from TRA Chishang station, near the Mr. Brown Avenue entrance.",
    noteZh: "每週三、六的迷你夜市，五分鐘就能逛完，騎完伯朗大道後順道吃晚餐剛好。", noteEn: "A tiny Wednesday and Saturday market you can walk in five minutes, ideal for dinner after cycling Mr. Brown Avenue."
  },
  {
    id: "beijiagong-magong", city: "penghu", lat: 23.566, lng: 119.582, days: null, hours: "16:00–24:00",
    zh: "北甲宮夜市", en: "Beijia Temple Night Market",
    foodsZh: ["燒肉飯", "蚵仔煎", "黑糖剉冰", "仙人掌冰", "碳烤"],
    foodsEn: ["Braised pork rice", "Oyster omelette", "Brown sugar shaved ice", "Cactus ice", "Charcoal-grilled skewers"],
    transitZh: "位於馬公市中心中正路麥當勞斜對面，市區步行即可抵達。", transitEn: "On Zhongzheng Rd across from the McDonald's in central Magong, walkable from most downtown hotels.",
    noteZh: "營業數十年的馬公老夜市，攤位集中在北甲宮前廣場與巷弄，以在地小吃與冰品為主。", noteEn: "Magong's decades-old market around Beijia Temple, centred on local snacks and shaved ice."
  },
  {
    id: "zushi-temple-magong", city: "penghu", lat: 23.574, lng: 119.594, days: null, hours: "17:00–23:00",
    zh: "祖師廟夜市", en: "Zushi Temple Night Market (Magong)",
    foodsZh: ["鹽酥雞", "炸魷魚", "黑砂糖冰", "原民烤肉串", "烤牡蠣"],
    foodsEn: ["Popcorn chicken", "Fried squid", "Black sugar ice", "Indigenous-style grilled skewers", "Grilled oysters"],
    transitZh: "位於馬公市區東側西文里的祖師廟前廣場，自市中心騎車約 10 分鐘。", transitEn: "On the plaza in front of the Zushi Temple in Xiwen, east Magong, about 10 minutes by scooter from downtown.",
    noteZh: "馬公東區較新的夜市，平日攤位不多，每年花火節期間會擴大成數十攤。", noteEn: "A newer market in east Magong; small on ordinary nights but swelling to dozens of stalls during the summer fireworks festival."
  }
];
