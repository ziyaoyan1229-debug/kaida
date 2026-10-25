/* 番茄讀書會：家裡書店的書。都是沒有版權（公有領域）的經典，收錄節選。
   window.KaidaBooks = [{ id, t, en, by, c, lang, text }]，text 用空行分段 */
(function () {
  window.KaidaBooks = [
    { id: "lunyu", t: "論語", en: "The Analects", by: "孔子弟子 編", c: "#8a5a38", lang: "zh", text:
"子曰：「學而時習之，不亦說乎？有朋自遠方來，不亦樂乎？人不知而不慍，不亦君子乎？」\n\n" +
"曾子曰：「吾日三省吾身：為人謀而不忠乎？與朋友交而不信乎？傳不習乎？」\n\n" +
"子曰：「弟子入則孝，出則弟，謹而信，汎愛眾，而親仁。行有餘力，則以學文。」\n\n" +
"子曰：「君子食無求飽，居無求安，敏於事而慎於言，就有道而正焉，可謂好學也已。」\n\n" +
"子曰：「不患人之不己知，患不知人也。」\n\n" +
"子曰：「吾十有五而志于學，三十而立，四十而不惑，五十而知天命，六十而耳順，七十而從心所欲，不踰矩。」\n\n" +
"子曰：「溫故而知新，可以為師矣。」\n\n" +
"子曰：「學而不思則罔，思而不學則殆。」\n\n" +
"子曰：「由，誨女知之乎！知之為知之，不知為不知，是知也。」" },
    { id: "tang", t: "唐詩選", en: "Tang Poems", by: "李白、孟浩然、王維 等", c: "#c2453b", lang: "zh", text:
"〈靜夜思〉李白\n床前明月光，疑是地上霜。\n舉頭望明月，低頭思故鄉。\n\n" +
"〈春曉〉孟浩然\n春眠不覺曉，處處聞啼鳥。\n夜來風雨聲，花落知多少。\n\n" +
"〈登鸛雀樓〉王之渙\n白日依山盡，黃河入海流。\n欲窮千里目，更上一層樓。\n\n" +
"〈相思〉王維\n紅豆生南國，春來發幾枝。\n願君多采擷，此物最相思。\n\n" +
"〈江雪〉柳宗元\n千山鳥飛絕，萬徑人蹤滅。\n孤舟蓑笠翁，獨釣寒江雪。\n\n" +
"〈黃鶴樓送孟浩然之廣陵〉李白\n故人西辭黃鶴樓，煙花三月下揚州。\n孤帆遠影碧空盡，唯見長江天際流。\n\n" +
"〈遊子吟〉孟郊\n慈母手中線，遊子身上衣。\n臨行密密縫，意恐遲遲歸。\n誰言寸草心，報得三春暉。\n\n" +
"〈楓橋夜泊〉張繼\n月落烏啼霜滿天，江楓漁火對愁眠。\n姑蘇城外寒山寺，夜半鐘聲到客船。" },
    { id: "songci", t: "宋詞選", en: "Song Lyrics", by: "蘇軾、李清照", c: "#5d7fa8", lang: "zh", text:
"〈水調歌頭〉蘇軾\n明月幾時有？把酒問青天。不知天上宮闕，今夕是何年。我欲乘風歸去，又恐瓊樓玉宇，高處不勝寒。起舞弄清影，何似在人間。\n轉朱閣，低綺戶，照無眠。不應有恨，何事長向別時圓？人有悲歡離合，月有陰晴圓缺，此事古難全。但願人長久，千里共嬋娟。\n\n" +
"〈如夢令〉李清照\n常記溪亭日暮，沉醉不知歸路。興盡晚回舟，誤入藕花深處。爭渡，爭渡，驚起一灘鷗鷺。" },
    { id: "daode", t: "道德經", en: "Tao Te Ching", by: "老子", c: "#6a8f5a", lang: "zh", text:
"第一章\n道可道，非常道；名可名，非常名。無名天地之始；有名萬物之母。故常無欲，以觀其妙；常有欲，以觀其徼。此兩者，同出而異名，同謂之玄。玄之又玄，眾妙之門。\n\n" +
"第八章\n上善若水。水善利萬物而不爭，處眾人之所惡，故幾於道。居善地，心善淵，與善仁，言善信，正善治，事善能，動善時。夫唯不爭，故無尤。\n\n" +
"第三十三章\n知人者智，自知者明。勝人者有力，自勝者強。知足者富。強行者有志。不失其所者久。死而不亡者壽。\n\n" +
"第六十四章（節選）\n合抱之木，生於毫末；九層之臺，起於累土；千里之行，始於足下。" },
    { id: "zhuangzi", t: "莊子", en: "Zhuangzi", by: "莊周", c: "#d9a03a", lang: "zh", text:
"〈逍遙遊〉（開頭）\n北冥有魚，其名為鯤。鯤之大，不知其幾千里也。化而為鳥，其名為鵬。鵬之背，不知其幾千里也；怒而飛，其翼若垂天之雲。是鳥也，海運則將徙於南冥。南冥者，天池也。\n\n" +
"〈齊物論〉（莊周夢蝶）\n昔者莊周夢為胡蝶，栩栩然胡蝶也，自喻適志與！不知周也。俄然覺，則蘧蘧然周也。不知周之夢為胡蝶與，胡蝶之夢為周與？周與胡蝶，則必有分矣。此之謂物化。" },
    { id: "sanzi", t: "三字經", en: "Three Character Classic", by: "王應麟（傳）", c: "#e07a5f", lang: "zh", text:
"人之初，性本善。性相近，習相遠。\n苟不教，性乃遷。教之道，貴以專。\n昔孟母，擇鄰處。子不學，斷機杼。\n竇燕山，有義方。教五子，名俱揚。\n養不教，父之過。教不嚴，師之惰。\n子不學，非所宜。幼不學，老何為。\n玉不琢，不成器。人不學，不知義。" },
    { id: "xiyou", t: "西遊記", en: "Journey to the West", by: "吳承恩", c: "#b04a3e", lang: "zh", text:
"第一回（開場詩）\n混沌未分天地亂，茫茫渺渺無人見。\n自從盤古破鴻濛，開闢從茲清濁辨。\n覆載群生仰至仁，發明萬物皆成善。\n欲知造化會元功，須看西遊釋厄傳。" },
    { id: "pride", t: "傲慢與偏見", en: "Pride and Prejudice", by: "Jane Austen", c: "#e7a6a8", lang: "en", text:
"Chapter 1\n\nIt is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\n" +
"However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.\n\n" +
"“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”\n\n" +
"Mr. Bennet replied that he had not.\n\n" +
"“But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”\n\n" +
"Mr. Bennet made no answer.\n\n" +
"“Do you not want to know who has taken it?” cried his wife impatiently.\n\n" +
"“You want to tell me, and I have no objection to hearing it.”\n\n" +
"This was invitation enough." },
    { id: "alice", t: "愛麗絲夢遊仙境", en: "Alice's Adventures in Wonderland", by: "Lewis Carroll", c: "#7fa6c9", lang: "en", text:
"Chapter 1: Down the Rabbit-Hole\n\n" +
"Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”\n\n" +
"So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.\n\n" +
"There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!” (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge." },
    { id: "holmes", t: "福爾摩斯：波希米亞醜聞", en: "A Scandal in Bohemia", by: "Arthur Conan Doyle", c: "#3a3036", lang: "en", text:
"To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind. He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position." },
    { id: "aesop", t: "伊索寓言", en: "Aesop's Fables", by: "Aesop（簡短改寫）", c: "#9cbf7a", lang: "en", text:
"The Tortoise and the Hare\nA hare laughed at a slow tortoise, so the tortoise challenged him to a race. The hare raced far ahead, then lay down for a nap. When he woke, the tortoise was already crossing the finish line.\nSlow and steady wins the race.\n\n" +
"The Ant and the Grasshopper\nAll summer the grasshopper sang while the ant carried grain to her nest. When winter came, the grasshopper had nothing to eat, and the ant had plenty.\nPrepare today for the needs of tomorrow.\n\n" +
"The Fox and the Grapes\nA hungry fox jumped again and again for a bunch of grapes hanging high on a vine. When he could not reach them, he walked away saying, “They were sour anyway.”\nIt is easy to scorn what you cannot have.\n\n" +
"The Boy Who Cried Wolf\nA shepherd boy shouted “Wolf!” for fun, and the villagers ran to help twice for nothing. When a wolf really came, no one believed him.\nA liar is not believed even when he tells the truth." }
  ];
})();
