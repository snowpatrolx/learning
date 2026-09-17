// ============================================================
// 儿童学习陪伴（家长端）- 数据层 v2.0
// 核心功能：识字 + 算数；含知识图谱、自动扩展词典
// ============================================================

const APP_VERSION = '2.0.0';

// ---------- 年龄分层 ----------
const KIDS_AGE_GROUPS = [3, 4, 5, 6];

// ---------- 学习模块（仅识字 + 算数） ----------
const KIDS_MODULES = [
  { id: 'literacy', name: '识字', icon: '字', color: '#4f46e5' },
  { id: 'arithmetic', name: '算数', icon: '数', color: '#0d9488' }
];

// 模块下的子分类（用于知识图谱分层）
const MODULE_UNITS = {
  literacy: [
    { id: 'pinyin', name: '拼音', ages: [3, 4] },
    { id: 'hanzi', name: '汉字', ages: [4, 5, 6] },
    { id: 'idiom', name: '成语', ages: [5, 6] },
    { id: 'poem', name: '古诗', ages: [5, 6] }
  ],
  arithmetic: [
    { id: 'number', name: '数字认知', ages: [3, 4] },
    { id: 'compare', name: '比较大小', ages: [4, 5] },
    { id: 'shape', name: '图形', ages: [4, 5, 6] },
    { id: 'addsub', name: '加减法', ages: [5, 6] }
  ]
};

// ---------- 内置知识卡片 ----------
const KIDS_CARDS = [
  // ===== 识字 - 拼音 =====
  { id: 'py-a', module: 'literacy', unit: 'pinyin', title: '韵母 a', content: '张大嘴巴 a a a，像唱歌一样。', age: 3 },
  { id: 'py-o', module: 'literacy', unit: 'pinyin', title: '韵母 o', content: '嘴巴圆圆 o o o，像公鸡叫。', age: 3 },
  { id: 'py-e', module: 'literacy', unit: 'pinyin', title: '韵母 e', content: '嘴巴扁扁 e e e，像白鹅叫。', age: 3 },
  { id: 'py-i', module: 'literacy', unit: 'pinyin', title: '韵母 i', content: '牙齿对齐 i i i，像衣服的衣。', age: 3 },
  { id: 'py-u', module: 'literacy', unit: 'pinyin', title: '韵母 u', content: '嘴巴突出 u u u，像乌鸦的乌。', age: 4 },
  { id: 'py-b', module: 'literacy', unit: 'pinyin', title: '声母 b', content: '像 6 字 b b b，播广播的播。', age: 4 },
  { id: 'py-p', module: 'literacy', unit: 'pinyin', title: '声母 p', content: '泼水 p p p，泼水的泼。', age: 4 },
  // ===== 识字 - 汉字 =====
  { id: 'hz-ren', module: 'literacy', unit: 'hanzi', title: '汉字「人」', content: '一撇一捺，组成「人」字。\n人：人类、人们。', age: 4 },
  { id: 'hz-shan', module: 'literacy', unit: 'hanzi', title: '汉字「山」', content: '三座山峰，组成「山」字。\n山：大山、山林。', age: 4 },
  { id: 'hz-shui', module: 'literacy', unit: 'hanzi', title: '汉字「水」', content: '水流的样子，组成「水」字。\n水：水杯、流水。', age: 4 },
  { id: 'hz-huo', module: 'literacy', unit: 'hanzi', title: '汉字「火」', content: '火焰的样子，组成「火」字。\n火：火苗、生火。', age: 5 },
  { id: 'hz-mu', module: 'literacy', unit: 'hanzi', title: '汉字「木」', content: '一棵树的样子，组成「木」字。\n木：木头、树木。', age: 5 },
  { id: 'hz-ri', module: 'literacy', unit: 'hanzi', title: '汉字「日」', content: '太阳的样子，组成「日」字。\n日：日子、今日。', age: 5 },
  { id: 'hz-yue', module: 'literacy', unit: 'hanzi', title: '汉字「月」', content: '弯月的样子，组成「月」字。\n月：月亮、月份。', age: 5 },
  { id: 'hz-tian', module: 'literacy', unit: 'hanzi', title: '汉字「天」', content: '一在大之上，组成「天」字。\n天：天空、今天。', age: 6 },
  { id: 'hz-shang', module: 'literacy', unit: 'hanzi', title: '汉字「上」', content: '在上的方向，组成「上」字。\n上：上面、上课。', age: 6 },
  // ===== 算数 - 数字认知 =====
  { id: 'num-1', module: 'arithmetic', unit: 'number', title: '认识数字 1', content: '1 像铅笔细又长。\n点数：1 个苹果。', age: 3 },
  { id: 'num-2', module: 'arithmetic', unit: 'number', title: '认识数字 2', content: '2 像鸭子水中游。\n点数：2 只小鸭。', age: 3 },
  { id: 'num-3', module: 'arithmetic', unit: 'number', title: '认识数字 3', content: '3 像耳朵听声音。\n点数：3 朵花。', age: 3 },
  { id: 'num-4', module: 'arithmetic', unit: 'number', title: '认识数字 4', content: '4 像小旗迎风飘。\n点数：4 辆车。', age: 4 },
  { id: 'num-5', module: 'arithmetic', unit: 'number', title: '认识数字 5', content: '5 像秤钩称东西。\n点数：5 颗星。', age: 4 },
  { id: 'num-6', module: 'arithmetic', unit: 'number', title: '认识数字 6', content: '6 像口哨吹得响。\n点数：6 只小鸡。', age: 4 },
  { id: 'num-7', module: 'arithmetic', unit: 'number', title: '认识数字 7', content: '7 像镰刀割青草。\n点数：7 朵云。', age: 5 },
  { id: 'num-8', module: 'arithmetic', unit: 'number', title: '认识数字 8', content: '8 像麻花拧一圈。\n点数：8 条鱼。', age: 5 },
  { id: 'num-9', module: 'arithmetic', unit: 'number', title: '认识数字 9', content: '9 像蝌蚪尾巴摇。\n点数：9 朵花。', age: 5 },
  { id: 'num-10', module: 'arithmetic', unit: 'number', title: '认识数字 10', content: '10 像棍棒打棒球，1 和 0 在一起。\n点数：10 个手指。', age: 5 },
  // ===== 算数 - 比较大小 =====
  { id: 'cmp-big', module: 'arithmetic', unit: 'compare', title: '比较大小', content: '大象大，蚂蚁小。\n用「>」表示大于，「<」表示小于。', age: 4 },
  { id: 'cmp-more', module: 'arithmetic', unit: 'compare', title: '多与少', content: '3 个苹果比 2 个多。\n多的那边数字大。', age: 4 },
  { id: 'cmp-long', module: 'arithmetic', unit: 'compare', title: '长与短', content: '铅笔长，橡皮短。\n可以一端对齐比较。', age: 5 },
  // ===== 算数 - 图形 =====
  { id: 'shp-circle', module: 'arithmetic', unit: 'shape', title: '圆形', content: '圆圆的，没有角。\n太阳、盘子、皮球都是圆形。', age: 4 },
  { id: 'shp-square', module: 'arithmetic', unit: 'shape', title: '正方形', content: '四条边一样长，四个角都是直角。\n手帕、窗子是正方形。', age: 4 },
  { id: 'shp-triangle', module: 'arithmetic', unit: 'shape', title: '三角形', content: '三条边，三个角。\n红领巾、小旗是三角形。', age: 5 },
  { id: 'shp-rect', module: 'arithmetic', unit: 'shape', title: '长方形', content: '对边相等，四个直角。\n书本、门是长方形。', age: 5 },
  // ===== 算数 - 加减法 =====
  { id: 'add-intro', module: 'arithmetic', unit: 'addsub', title: '认识加法', content: '把两堆东西合在一起，就是加法。\n例如：1 个苹果 + 1 个苹果 = 2 个苹果。\n用「+」表示加。', age: 4 },
  { id: 'sub-intro', module: 'arithmetic', unit: 'addsub', title: '认识减法', content: '从一堆里拿走一些，就是减法。\n例如：3 颗糖吃了 1 颗，还剩 2 颗。\n用「-」表示减。', age: 4 },
  { id: 'add-1+1', module: 'arithmetic', unit: 'addsub', title: '1 + 1 = ?', content: '1 个苹果加 1 个苹果，一共 2 个。\n1 + 1 = 2', age: 5 },
  { id: 'add-2+1', module: 'arithmetic', unit: 'addsub', title: '2 + 1 = ?', content: '2 朵花再加 1 朵，一共 3 朵。\n2 + 1 = 3', age: 5 },
  { id: 'add-3+2', module: 'arithmetic', unit: 'addsub', title: '3 + 2 = ?', content: '3 只小鸡又来 2 只，一共 5 只。\n3 + 2 = 5', age: 5 },
  { id: 'sub-3-1', module: 'arithmetic', unit: 'addsub', title: '3 - 1 = ?', content: '3 个苹果吃了 1 个，还剩 2 个。\n3 - 1 = 2', age: 6 },
  { id: 'sub-5-2', module: 'arithmetic', unit: 'addsub', title: '5 - 2 = ?', content: '5 朵花摘了 2 朵，还剩 3 朵。\n5 - 2 = 3', age: 6 },
  { id: 'sub-10-3', module: 'arithmetic', unit: 'addsub', title: '10 - 3 = ?', content: '10 颗糖吃了 3 颗，还剩 7 颗。\n10 - 3 = 7', age: 6 }
];

// ---------- 自动扩展词典：成语 ----------
const IDIOM_DICT = {
  '守株待兔': '战国时宋国有个农夫，看见一只兔子撞死在树桩上，便放下锄头守在树桩旁等兔子。\n比喻死守经验，不知变通，或妄想不劳而获。',
  '画蛇添足': '楚国人祭祀祖先，赐酒一壶，众人画蛇饮酒，有人先画好又添上脚，结果输了。\n比喻做了多余的事，反而把事情弄糟。',
  '亡羊补牢': '羊丢了再去修补羊圈，还不算晚。\n比喻出了问题及时补救，可以防止继续受损。',
  '刻舟求剑': '楚国人渡江时剑掉水里，他在船边刻记号，靠岸后再按记号下水找剑。\n比喻拘泥成法，不知变通。',
  '揠苗助长': '宋国人嫌禾苗长得慢，把它们拔高，结果苗都枯死了。\n比喻违反规律，急于求成，反而坏事。',
  '掩耳盗铃': '偷铃铛的人怕铃响，捂住自己耳朵去偷。\n比喻自欺欺人，掩盖不住的事硬要掩盖。',
  '自相矛盾': '楚国人卖矛又卖盾，说盾什么矛都戳不破，又说矛什么盾都能戳穿。\n比喻言行或前后言论互相抵触。',
  '狐假虎威': '老虎抓住狐狸，狐狸自称天帝派它做百兽王，让老虎跟在后面看百兽都怕它。\n比喻依仗别人的势力欺压人。',
  '坐井观天': '青蛙坐在井里看天，以为天只有井口大。\n比喻眼界狭小，所见有限。',
  '井底之蛙': '井底的青蛙，只能看到井口大的天。\n比喻见识短浅的人。',
  '对牛弹琴': '给牛弹琴，牛只顾吃草。\n比喻对不懂的人讲道理，白费口舌。',
  '盲人摸象': '盲人摸大象，摸到腿的说像柱子，摸到耳朵的说像扇子。\n比喻只凭片面了解就下结论。',
  '杞人忧天': '杞国人担心天会塌下来，急得吃不下饭。\n比喻不必要的忧虑。',
  '愚公移山': '愚公九十岁，下决心把挡路的两座大山搬走，最终感动天帝派神搬山。\n比喻坚持不懈，终能克服困难。',
  '画龙点睛': '张僧繇画龙不点眼，说一点眼龙就飞了，人不信，他点了一下，雷电破壁龙飞走。\n比喻艺术创作在关键处用一两句话点明要旨，使全篇生色。',
  '叶公好龙': '叶公自称爱龙，真龙来了他却吓得逃跑。\n比喻表面爱好，实际惧怕。',
  '南辕北辙': '有人要去南边却驾车向北走，说马好、钱多、车夫好。\n比喻行动和目的相反。',
  '滥竽充数': '南郭先生不会吹竽却混在乐队里凑数，新王要一一独奏，他只好逃跑。\n比喻没有真才实学的人混在行家里面充数。',
  '塞翁失马': '边塞老翁丢了马，后来马带一群马回来，儿子骑马摔断腿，因此躲过征兵保住命。\n比喻坏事可能变好事，福祸相依。',
  '鹬蚌相争': '蚌夹住鹬的嘴，鹬说今天不下雨明天不下雨就有死蚌，蚌说今天不松口明天不松口就有死鹬，渔夫一起抓走。\n比喻双方争执不下，第三者得利。'
};

// ---------- 自动扩展词典：古诗 ----------
const POEM_DICT = {
  '静夜思': { author: '李白', dynasty: '唐', content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。', hint: '思乡之作，月光引发乡愁' },
  '春晓': { author: '孟浩然', dynasty: '唐', content: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。', hint: '春晨景象，惜春之情' },
  '登鹳雀楼': { author: '王之涣', dynasty: '唐', content: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。', hint: '登高远望，进取向上' },
  '悯农': { author: '李绅', dynasty: '唐', content: '锄禾日当午，汗滴禾下土。\n谁知盘中餐，粒粒皆辛苦。', hint: '同情农夫，珍惜粮食' },
  '咏鹅': { author: '骆宾王', dynasty: '唐', content: '鹅，鹅，鹅，曲项向天歌。\n白毛浮绿水，红掌拨清波。', hint: '儿童视角描绘鹅' },
  '望庐山瀑布': { author: '李白', dynasty: '唐', content: '日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。', hint: '描绘瀑布壮丽' },
  '早发白帝城': { author: '李白', dynasty: '唐', content: '朝辞白帝彩云间，千里江陵一日还。\n两岸猿声啼不住，轻舟已过万重山。', hint: '顺流而下，轻快豪迈' },
  '绝句': { author: '杜甫', dynasty: '唐', content: '两个黄鹂鸣翠柳，一行白鹭上青天。\n窗含西岭千秋雪，门泊东吴万里船。', hint: '春日草堂即景' },
  '江雪': { author: '柳宗元', dynasty: '唐', content: '千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。', hint: '雪天孤舟，寂寞清高' },
  '池上': { author: '白居易', dynasty: '唐', content: '小娃撑小艇，偷采白莲回。\n不解藏踪迹，浮萍一道开。', hint: '描写儿童偷采莲蓬' },
  '草': { author: '白居易', dynasty: '唐', content: '离离原上草，一岁一枯荣。\n野火烧不尽，春风吹又生。', hint: '赞颂生命顽强' },
  '寻隐者不遇': { author: '贾岛', dynasty: '唐', content: '松下问童子，言师采药去。\n只在此山中，云深不知处。', hint: '访友不遇，山中隐者' },
  '游子吟': { author: '孟郊', dynasty: '唐', content: '慈母手中线，游子身上衣。\n临行密密缝，意恐迟迟归。\n谁言寸草心，报得三春晖。', hint: '母爱深沉，临行缝衣' },
  '清明': { author: '杜牧', dynasty: '唐', content: '清明时节雨纷纷，路上行人欲断魂。\n借问酒家何处有，牧童遥指杏花村。', hint: '清明节令，行人愁绪' },
  '回乡偶书': { author: '贺知章', dynasty: '唐', content: '少小离家老大回，乡音无改鬓毛衰。\n儿童相见不相识，笑问客从何处来。', hint: '离家多年归乡感慨' },
  '枫桥夜泊': { author: '张继', dynasty: '唐', content: '月落乌啼霜满天，江枫渔火对愁眠。\n姑苏城外寒山寺，夜半钟声到客船。', hint: '夜泊枫桥，乡愁难眠' },
  '赋得古原草送别': { author: '白居易', dynasty: '唐', content: '离离原上草，一岁一枯荣。\n野火烧不尽，春风吹又生。\n远芳侵古道，晴翠接荒城。\n又送王孙去，萋萋满别情。', hint: '咏草送别' },
  '鹿柴': { author: '王维', dynasty: '唐', content: '空山不见人，但闻人语响。\n返景入深林，复照青苔上。', hint: '空山寂静，光影流转' },
  '相思': { author: '王维', dynasty: '唐', content: '红豆生南国，春来发几枝。\n愿君多采撷，此物最相思。', hint: '托物寄情，思念友人' },
  '悯农其二': { author: '李绅', dynasty: '唐', content: '春种一粒粟，秋收万颗子。\n四海无闲田，农夫犹饿死。', hint: '揭露社会不公' }
};

// ---------- 每日任务模板 ----------
const DAILY_TASK_TEMPLATES = {
  life: [
    { id: 'life-1', name: '自己穿衣服', duration: 10, steps: '拿出衣服,穿上衣,穿裤子,检查整齐', parent: false },
    { id: 'life-2', name: '整理玩具', duration: 15, steps: '分类玩具,放入收纳箱,擦拭干净', parent: false },
    { id: 'life-3', name: '帮家长摆碗筷', duration: 10, steps: '数人数,摆碗,摆筷子,邀请吃饭', parent: true },
    { id: 'life-4', name: '饭前洗手', duration: 5, steps: '打湿双手,涂肥皂,搓洗20秒,冲干净', parent: false }
  ],
  ability: [
    { id: 'ab-1', name: '跳绳 20 下', duration: 10, steps: '热身,调整绳子,跳20下,放松', parent: false },
    { id: 'ab-2', name: '拼图游戏', duration: 15, steps: '观察图案,先拼边框,再拼中间,检查', parent: false },
    { id: 'ab-3', name: '专注力训练', duration: 10, steps: '安静坐好,看图找不同,记录用时', parent: true },
    { id: 'ab-4', name: '搭积木', duration: 20, steps: '选择积木,设计造型,搭建,展示', parent: false }
  ],
  literacy: [
    { id: 'kn-py', name: '学拼音 a o e', duration: 5, steps: '看卡片,跟读,自己读,默写', parent: true, module: 'literacy' },
    { id: 'kn-hz', name: '认 3 个汉字', duration: 8, steps: '看字,读字,组词,造句', parent: true, module: 'literacy' },
    { id: 'kn-id', name: '学一个成语', duration: 5, steps: '读成语,听故事,说含义', parent: true, module: 'literacy' }
  ],
  arithmetic: [
    { id: 'kn-num', name: '认识数字 1-5', duration: 5, steps: '看数字,点数,找身边数字', parent: false, module: 'arithmetic' },
    { id: 'kn-add', name: '练 5 道加法题', duration: 8, steps: '读题,计算,检查,订正', parent: false, module: 'arithmetic' },
    { id: 'kn-shape', name: '认图形', duration: 5, steps: '看图形,找生活中的图形,画一画', parent: false, module: 'arithmetic' }
  ]
};

// ---------- 成就 ----------
const ACHIEVEMENTS = [
  { id: 'first-task', name: '第一次打卡', desc: '完成第一个任务', condition: (s) => (s.checkedIn || []).length >= 1, points: 5 },
  { id: 'streak-7', name: '坚持一周', desc: '连续打卡 7 天', condition: (s) => (s.streak || 0) >= 7, points: 30 },
  { id: 'streak-30', name: '月度达人', desc: '连续打卡 30 天', condition: (s) => (s.streak || 0) >= 30, points: 100 },
  { id: 'stars-100', name: '星星收集者', desc: '累计获得 100 颗星星', condition: (s) => (s.kidStars || 0) >= 100, points: 50 },
  { id: 'literacy-10', name: '识字小能手', desc: '点亮 10 个识字知识点', condition: (s) => App.countNodesByModule('literacy') >= 10, points: 40 },
  { id: 'math-10', name: '算数小能手', desc: '点亮 10 个算数知识点', condition: (s) => App.countNodesByModule('arithmetic') >= 10, points: 40 },
  { id: 'all-tasks', name: '今日全勤', desc: '一天内完成全部任务', condition: (s) => s._allTasksDone, points: 10 }
];

// ---------- 礼物兑换 ----------
const GIFT_EXCHANGE = [
  { id: 'g1', name: '小贴纸', cost: 20 },
  { id: 'g2', name: '绘本一本', cost: 100 },
  { id: 'g3', name: '玩具', cost: 200 },
  { id: 'g4', name: '游乐园门票', cost: 500 }
];

// ---------- 维度定义（成长报告） ----------
const DIMENSIONS = [
  { key: 'life', label: '生活' },
  { key: 'ability', label: '能力' },
  { key: 'literacy', label: '识字' },
  { key: 'arithmetic', label: '算数' },
  { key: 'focus', label: '专注' },
  { key: 'sport', label: '运动' }
];

if (typeof window !== 'undefined') {
  window.APP_DATA = {
    APP_VERSION, KIDS_AGE_GROUPS, KIDS_MODULES, MODULE_UNITS, KIDS_CARDS,
    IDIOM_DICT, POEM_DICT, DAILY_TASK_TEMPLATES,
    ACHIEVEMENTS, GIFT_EXCHANGE, DIMENSIONS
  };
}
