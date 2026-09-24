// ============================================================
// 儿童学习陪伴（家长端）- 数据层 v1.04
// 核心功能：识字 + 算数 + 英语；知识图谱、知识树、自动扩展词典
// ============================================================

const APP_VERSION = '1.04';

// ---------- 年龄分层 ----------
const KIDS_AGE_GROUPS = [3, 4, 5, 6];

// ---------- 学习模块 ----------
const KIDS_MODULES = [
  { id: 'literacy', name: '识字', icon: '字', color: '#4f46e5' },
  { id: 'arithmetic', name: '算数', icon: '数', color: '#0d9488' },
  { id: 'english', name: '英语', icon: 'A', color: '#db2777' }
];

// 模块下的子分类（用于知识图谱分层与录入自动识别）
const MODULE_UNITS = {
  literacy: [
    { id: 'pinyin', name: '拼音', ages: [3, 4] },
    { id: 'hanzi', name: '汉字', ages: [4, 5, 6] },
    { id: 'word', name: '词语', ages: [4, 5, 6] },
    { id: 'idiom', name: '成语', ages: [5, 6] },
    { id: 'poem', name: '古诗', ages: [5, 6] },
    { id: 'proverb', name: '谚语', ages: [5, 6] }
  ],
  arithmetic: [
    { id: 'number', name: '数字认知', ages: [3, 4] },
    { id: 'compare', name: '比较大小', ages: [4, 5] },
    { id: 'shape', name: '图形', ages: [4, 5, 6] },
    { id: 'addsub', name: '加减法', ages: [5, 6] },
    { id: 'muldiv', name: '乘除法', ages: [6] },
    { id: 'wordproblem', name: '应用题', ages: [5, 6] },
    { id: 'time', name: '时间', ages: [5, 6] },
    { id: 'money', name: '钱币', ages: [5, 6] }
  ],
  english: [
    { id: 'letter', name: '字母', ages: [3, 4] },
    { id: 'word', name: '单词', ages: [4, 5, 6] },
    { id: 'phrase', name: '日常用语', ages: [5, 6] }
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
  { id: 'sub-10-3', module: 'arithmetic', unit: 'addsub', title: '10 - 3 = ?', content: '10 颗糖吃了 3 颗，还剩 7 颗。\n10 - 3 = 7', age: 6 },
  // ===== 算数 - 乘除法 =====
  { id: 'mul-intro', module: 'arithmetic', unit: 'muldiv', title: '认识乘法', content: '几个相同的数相加，可以用乘法表示。\n例如：2 + 2 + 2 = 6，也就是 2 × 3 = 6。\n用「×」表示乘。', age: 6 },
  { id: 'mul-2x3', module: 'arithmetic', unit: 'muldiv', title: '2 × 3 = ?', content: '3 个 2 相加：2 + 2 + 2 = 6。\n所以 2 × 3 = 6。', age: 6 },
  { id: 'mul-3x4', module: 'arithmetic', unit: 'muldiv', title: '3 × 4 = ?', content: '4 个 3 相加：3 + 3 + 3 + 3 = 12。\n所以 3 × 4 = 12。', age: 6 },
  { id: 'div-intro', module: 'arithmetic', unit: 'muldiv', title: '认识除法', content: '把一些东西平均分成几份，就是除法。\n例如：6 个苹果平均分给 2 个人，每人 3 个。\n6 ÷ 2 = 3，用「÷」表示除。', age: 6 },
  { id: 'div-6-2', module: 'arithmetic', unit: 'muldiv', title: '6 ÷ 2 = ?', content: '6 个苹果平均分给 2 人，每人 3 个。\n6 ÷ 2 = 3。', age: 6 },
  // ===== 算数 - 应用题 =====
  { id: 'wp-apple', module: 'arithmetic', unit: 'wordproblem', title: '苹果应用题', content: '小明有 3 个苹果，妈妈又给了他 2 个，小明现在有几个苹果？\n列式：3 + 2 = 5（个）\n答：小明现在有 5 个苹果。', age: 5 },
  { id: 'wp-candy', module: 'arithmetic', unit: 'wordproblem', title: '糖果应用题', content: '小红有 8 颗糖，吃了 3 颗，还剩几颗？\n列式：8 - 3 = 5（颗）\n答：还剩 5 颗糖。', age: 5 },
  { id: 'wp-flower', module: 'arithmetic', unit: 'wordproblem', title: '花朵应用题', content: '花园里有 5 朵红花，4 朵黄花，一共有几朵花？\n列式：5 + 4 = 9（朵）\n答：一共有 9 朵花。', age: 6 },
  // ===== 算数 - 时间 =====
  { id: 'time-clock', module: 'arithmetic', unit: 'time', title: '认识钟表', content: '钟面上有 12 个数字，又短又粗的是时针，又细又长的是分针。\n时针走一大格是 1 小时，分针走一圈是 1 小时。', age: 5 },
  { id: 'time-hour', module: 'arithmetic', unit: 'time', title: '认识整点', content: '分针指向 12，时针指向几，就是几点整。\n例如：分针指向 12，时针指向 3，就是 3 点整（3:00）。', age: 5 },
  { id: 'time-half', module: 'arithmetic', unit: 'time', title: '认识半点', content: '分针指向 6，时针走过几，就是几点半。\n例如：分针指向 6，时针走过 4，就是 4 点半（4:30）。', age: 6 },
  // ===== 算数 - 钱币 =====
  { id: 'money-unit', module: 'arithmetic', unit: 'money', title: '认识人民币', content: '人民币的单位有元、角、分。\n1 元 = 10 角，1 角 = 10 分。\n常见硬币：1 元、5 角、1 角。', age: 5 },
  { id: 'money-add', module: 'arithmetic', unit: 'money', title: '钱币计算', content: '一支铅笔 2 元，一块橡皮 1 元，一共多少钱？\n2 元 + 1 元 = 3 元。\n答：一共 3 元。', age: 6 },
  // ===== 英语 - 字母 =====
  { id: 'en-A', module: 'english', unit: 'letter', title: '字母 Aa', content: '大写 A，小写 a。\nA is for Apple（苹果）。\n读一读：A, a, A。', age: 3 },
  { id: 'en-B', module: 'english', unit: 'letter', title: '字母 Bb', content: '大写 B，小写 b。\nB is for Banana（香蕉）。\n读一读：B, b, B。', age: 3 },
  { id: 'en-C', module: 'english', unit: 'letter', title: '字母 Cc', content: '大写 C，小写 c。\nC is for Cat（猫）。\n读一读：C, c, C。', age: 4 },
  // ===== 英语 - 单词 =====
  { id: 'en-apple', module: 'english', unit: 'word', title: 'apple 苹果', content: '单词：apple\n中文：苹果\n例句：I like apples.（我喜欢苹果。）', age: 4 },
  { id: 'en-cat', module: 'english', unit: 'word', title: 'cat 猫', content: '单词：cat\n中文：猫\n例句：The cat is small.（这只猫很小。）', age: 4 },
  { id: 'en-dog', module: 'english', unit: 'word', title: 'dog 狗', content: '单词：dog\n中文：狗\n例句：I have a dog.（我有一只狗。）', age: 4 },
  { id: 'en-mom', module: 'english', unit: 'word', title: 'mom 妈妈', content: '单词：mom / mother\n中文：妈妈\n例句：I love my mom.（我爱妈妈。）', age: 4 },
  // ===== 英语 - 日常用语 =====
  { id: 'en-hello', module: 'english', unit: 'phrase', title: 'Hello 你好', content: 'Hello! 你好！\nHi! 嗨！\nGood morning! 早上好！', age: 5 },
  { id: 'en-thanks', module: 'english', unit: 'phrase', title: 'Thank you 谢谢', content: 'Thank you. 谢谢。\nYou are welcome. 不客气。\nSorry. 对不起。', age: 5 },
  { id: 'en-bye', module: 'english', unit: 'phrase', title: 'Goodbye 再见', content: 'Goodbye. 再见。\nSee you. 回头见。\nBye-bye. 拜拜。', age: 5 },
  // ===== 识字 - 谚语 =====
  { id: 'pv-rain', module: 'literacy', unit: 'proverb', title: '谚语：朝霞不出门', content: '朝霞不出门，晚霞行千里。\n意思：早上有霞光可能会下雨，不宜出门；傍晚有霞光预示第二天天气好，可以远行。', age: 5 },
  { id: 'pv-rain2', module: 'literacy', unit: 'proverb', title: '谚语：燕子低飞', content: '燕子低飞蛇过道，大雨不久就来到。\n意思：燕子飞得低、蛇从路上爬过，说明快要下大雨了。', age: 6 },
  // ===== 识字 - 词语 =====
  { id: 'wd-happy', module: 'literacy', unit: 'word', title: '词语：开心', content: '词语：开心\n意思：心情快乐、高兴。\n例句：今天我玩得很开心。\n近义词：高兴、快乐', age: 4 },
  { id: 'wd-brave', module: 'literacy', unit: 'word', title: '词语：勇敢', content: '词语：勇敢\n意思：不怕危险和困难。\n例句：他是一个勇敢的孩子。\n近义词：英勇、大胆', age: 5 },
  { id: 'wd-kind', module: 'literacy', unit: 'word', title: '词语：善良', content: '词语：善良\n意思：心地好，愿意帮助别人。\n例句：她有一颗善良的心。', age: 5 }
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
  '鹬蚌相争': '蚌夹住鹬的嘴，鹬说今天不下雨明天不下雨就有死蚌，蚌说今天不松口明天不松口就有死鹬，渔夫一起抓走。\n比喻双方争执不下，第三者得利。',
  '画饼充饥': '画个饼来解除饥饿。\n比喻用空想来安慰自己。',
  '望梅止渴': '曹操行军时士兵口渴，他说前面有梅林，士兵想到梅子流口水就不渴了。\n比喻用空想安慰自己。',
  '闻鸡起舞': '祖逖和刘琨听到鸡叫就起床练剑。\n比喻有志报国的人及时奋起。',
  '胸有成竹': '文同画竹前心中已有完整的竹子形象。\n比喻做事前已有通盘考虑。',
  '雪中送炭': '下雪天给人送炭取暖。\n比喻在别人急需时给予帮助。',
  '锦上添花': '在锦缎上再绣花。\n比喻好上加好，美上添美。',
  '水落石出': '水退下去，石头露出来。\n比喻事情真相大白。',
  '天长地久': '像天地一样长久。\n形容时间悠久，也形容永远不变。',
  '风调雨顺': '风雨适合农时。\n形容年成好，也形容时局太平。',
  '一心一意': '只有一个心眼，没有别的念头。\n形容做事专心。',
  '人山人海': '人群如山似海。\n形容聚集的人极多。',
  '大同小异': '大体相同，略有差异。',
  '三心二意': '又想这样又想那样，犹豫不定。\n常指不安心，不专一。',
  '七上八下': '形容心里慌乱不安。',
  '五颜六色': '形容色彩复杂或花样繁多。',
  '九牛一毛': '九条牛身上的一根毛。\n比喻极大数量中极微小的一部分。',
  '十全十美': '各方面都非常完美，毫无缺陷。'
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
  '悯农其二': { author: '李绅', dynasty: '唐', content: '春种一粒粟，秋收万颗子。\n四海无闲田，农夫犹饿死。', hint: '揭露社会不公' },
  '咏柳': { author: '贺知章', dynasty: '唐', content: '碧玉妆成一树高，万条垂下绿丝绦。\n不知细叶谁裁出，二月春风似剪刀。', hint: '赞美春柳与春风' },
  '望天门山': { author: '李白', dynasty: '唐', content: '天门中断楚江开，碧水东流至此回。\n两岸青山相对出，孤帆一片日边来。', hint: '描绘天门山壮丽景色' },
  '别董大': { author: '高适', dynasty: '唐', content: '千里黄云白日曛，北风吹雁雪纷纷。\n莫愁前路无知己，天下谁人不识君。', hint: '送别友人，豪迈豁达' },
  '出塞': { author: '王昌龄', dynasty: '唐', content: '秦时明月汉时关，万里长征人未还。\n但使龙城飞将在，不教胡马度阴山。', hint: '边塞诗，慨叹征战' },
  '九月九日忆山东兄弟': { author: '王维', dynasty: '唐', content: '独在异乡为异客，每逢佳节倍思亲。\n遥知兄弟登高处，遍插茱萸少一人。', hint: '重阳思乡怀亲' },
  '赠汪伦': { author: '李白', dynasty: '唐', content: '李白乘舟将欲行，忽闻岸上踏歌声。\n桃花潭水深千尺，不及汪伦送我情。', hint: '赞颂友情深厚' },
  '黄鹤楼送孟浩然之广陵': { author: '李白', dynasty: '唐', content: '故人西辞黄鹤楼，烟花三月下扬州。\n孤帆远影碧空尽，唯见长江天际流。', hint: '送别诗，意境开阔' },
  '山行': { author: '杜牧', dynasty: '唐', content: '远上寒山石径斜，白云生处有人家。\n停车坐爱枫林晚，霜叶红于二月花。', hint: '秋日山行，枫叶胜花' },
  '小池': { author: '杨万里', dynasty: '宋', content: '泉眼无声惜细流，树阴照水爱晴柔。\n小荷才露尖尖角，早有蜻蜓立上头。', hint: '初夏小池景致' },
  '晓出净慈寺送林子方': { author: '杨万里', dynasty: '宋', content: '毕竟西湖六月中，风光不与四时同。\n接天莲叶无穷碧，映日荷花别样红。', hint: '西湖夏日荷塘' },
  '饮湖上初晴后雨': { author: '苏轼', dynasty: '宋', content: '水光潋滟晴方好，山色空蒙雨亦奇。\n欲把西湖比西子，淡妆浓抹总相宜。', hint: '赞美西湖晴雨皆宜' },
  '题西林壁': { author: '苏轼', dynasty: '宋', content: '横看成岭侧成峰，远近高低各不同。\n不识庐山真面目，只缘身在此山中。', hint: '庐山观景，蕴含哲理' },
  '泊船瓜洲': { author: '王安石', dynasty: '宋', content: '京口瓜洲一水间，钟山只隔数重山。\n春风又绿江南岸，明月何时照我还。', hint: '思念家乡' },
  '元日': { author: '王安石', dynasty: '宋', content: '爆竹声中一岁除，春风送暖入屠苏。\n千门万户曈曈日，总把新桃换旧符。', hint: '春节辞旧迎新' },
  '村居': { author: '高鼎', dynasty: '清', content: '草长莺飞二月天，拂堤杨柳醉春烟。\n儿童散学归来早，忙趁东风放纸鸢。', hint: '春日儿童放纸鸢' },
  '所见': { author: '袁枚', dynasty: '清', content: '牧童骑黄牛，歌声振林樾。\n意欲捕鸣蝉，忽然闭口立。', hint: '牧童捕蝉的生动画面' }
};

// ---------- 自动扩展词典：英文单词 ----------
const ENGLISH_DICT = {
  'apple': { phonetic: '/ˈæpl/', meaning: '苹果', example: 'I like apples. 我喜欢苹果。' },
  'banana': { phonetic: '/bəˈnɑːnə/', meaning: '香蕉', example: 'The banana is yellow. 香蕉是黄色的。' },
  'cat': { phonetic: '/kæt/', meaning: '猫', example: 'The cat is small. 这只猫很小。' },
  'dog': { phonetic: '/dɒɡ/', meaning: '狗', example: 'I have a dog. 我有一只狗。' },
  'book': { phonetic: '/bʊk/', meaning: '书', example: 'This is a book. 这是一本书。' },
  'pen': { phonetic: '/pen/', meaning: '钢笔', example: 'I have a pen. 我有一支钢笔。' },
  'pencil': { phonetic: '/ˈpensl/', meaning: '铅笔', example: 'This is my pencil. 这是我的铅笔。' },
  'water': { phonetic: '/ˈwɔːtə/', meaning: '水', example: 'I drink water. 我喝水。' },
  'milk': { phonetic: '/mɪlk/', meaning: '牛奶', example: 'I drink milk. 我喝牛奶。' },
  'bread': { phonetic: '/bred/', meaning: '面包', example: 'I eat bread. 我吃面包。' },
  'egg': { phonetic: '/eɡ/', meaning: '鸡蛋', example: 'I eat an egg. 我吃一个鸡蛋。' },
  'fish': { phonetic: '/fɪʃ/', meaning: '鱼', example: 'The fish can swim. 鱼会游泳。' },
  'bird': { phonetic: '/bɜːd/', meaning: '鸟', example: 'The bird can fly. 鸟会飞。' },
  'pig': { phonetic: '/pɪɡ/', meaning: '猪', example: 'The pig is fat. 猪很胖。' },
  'cow': { phonetic: '/kaʊ/', meaning: '牛', example: 'The cow gives milk. 牛产奶。' },
  'sun': { phonetic: '/sʌn/', meaning: '太阳', example: 'The sun is hot. 太阳很热。' },
  'moon': { phonetic: '/muːn/', meaning: '月亮', example: 'The moon is bright. 月亮很亮。' },
  'star': { phonetic: '/stɑː/', meaning: '星星', example: 'I see a star. 我看到一颗星星。' },
  'tree': { phonetic: '/triː/', meaning: '树', example: 'The tree is tall. 这棵树很高。' },
  'flower': { phonetic: '/ˈflaʊə/', meaning: '花', example: 'The flower is red. 这朵花是红色的。' },
  'car': { phonetic: '/kɑː/', meaning: '汽车', example: 'The car is fast. 汽车很快。' },
  'bus': { phonetic: '/bʌs/', meaning: '公交车', example: 'I take the bus. 我坐公交车。' },
  'bike': { phonetic: '/baɪk/', meaning: '自行车', example: 'I ride a bike. 我骑自行车。' },
  'ball': { phonetic: '/bɔːl/', meaning: '球', example: 'I play with a ball. 我玩球。' },
  'doll': { phonetic: '/dɒl/', meaning: '洋娃娃', example: 'I have a doll. 我有一个洋娃娃。' },
  'red': { phonetic: '/red/', meaning: '红色的', example: 'The apple is red. 苹果是红色的。' },
  'blue': { phonetic: '/bluː/', meaning: '蓝色的', example: 'The sky is blue. 天空是蓝色的。' },
  'yellow': { phonetic: '/ˈjeləʊ/', meaning: '黄色的', example: 'The banana is yellow. 香蕉是黄色的。' },
  'green': { phonetic: '/ɡriːn/', meaning: '绿色的', example: 'The tree is green. 树是绿色的。' },
  'one': { phonetic: '/wʌn/', meaning: '一', example: 'I have one apple. 我有一个苹果。' },
  'two': { phonetic: '/tuː/', meaning: '二', example: 'I have two eyes. 我有两只眼睛。' },
  'three': { phonetic: '/θriː/', meaning: '三', example: 'I have three books. 我有三本书。' },
  'mom': { phonetic: '/mɒm/', meaning: '妈妈', example: 'I love my mom. 我爱妈妈。' },
  'dad': { phonetic: '/dæd/', meaning: '爸爸', example: 'I love my dad. 我爱爸爸。' },
  'hello': { phonetic: '/həˈləʊ/', meaning: '你好', example: 'Hello! 你好！' },
  'goodbye': { phonetic: '/ˌɡʊdˈbaɪ/', meaning: '再见', example: 'Goodbye! 再见！' },
  'thanks': { phonetic: '/θæŋks/', meaning: '谢谢', example: 'Thanks! 谢谢！' },
  'yes': { phonetic: '/jes/', meaning: '是的', example: 'Yes, I do. 是的。' },
  'no': { phonetic: '/nəʊ/', meaning: '不', example: 'No, thanks. 不，谢谢。' },
  'big': { phonetic: '/bɪɡ/', meaning: '大的', example: 'The elephant is big. 大象很大。' },
  'small': { phonetic: '/smɔːl/', meaning: '小的', example: 'The ant is small. 蚂蚁很小。' },
  'happy': { phonetic: '/ˈhæpi/', meaning: '开心的', example: 'I am happy. 我很开心。' },
  'sad': { phonetic: '/sæd/', meaning: '伤心的', example: 'I am sad. 我很伤心。' }
};

// ---------- 自动扩展词典：常用词语 ----------
const WORD_DICT = {
  '开心': '心情快乐、高兴。\n例句：今天我玩得很开心。\n近义词：高兴、快乐',
  '高兴': '愉快而兴奋。\n例句：收到礼物我很高兴。\n近义词：开心、快乐',
  '勇敢': '不怕危险和困难。\n例句：他是一个勇敢的孩子。\n近义词：英勇、大胆',
  '善良': '心地好，愿意帮助别人。\n例句：她有一颗善良的心。\n近义词：仁慈、好心',
  '聪明': '智力发达，记忆和理解能力强。\n例句：这个孩子很聪明。\n近义词：机灵、聪慧',
  '勤劳': '努力劳动，不怕辛苦。\n例句：蜜蜂是勤劳的小动物。\n近义词：勤奋、勤快',
  '诚实': '言行跟内心思想一致，不虚假。\n例句：我们要做诚实的孩子。\n近义词：老实、真诚',
  '友谊': '朋友之间的交情。\n例句：他们的友谊很深厚。\n近义词：友情、交情',
  '认真': '严肃对待，不马虎。\n例句：他学习很认真。\n近义词：仔细、专心',
  '努力': '把力量尽量使出来。\n例句：只要努力就会成功。\n近义词：尽力、奋发',
  '分享': '和别人共同享受。\n例句：好东西要和朋友分享。',
  '感谢': '因对方的好意或帮助而感激。\n例句：我感谢老师的教导。\n近义词：谢谢、感激',
  '抱歉': '心中不安，觉得对不起别人。\n例句：抱歉，我迟到了。\n近义词：对不起、歉意',
  '珍惜': '珍重爱惜。\n例句：我们要珍惜时间。\n近义词：爱惜、珍视',
  '希望': '心里想着达到某种目的或出现某种情况。\n例句：我希望快快长大。\n近义词：期望、盼望',
  '梦想': '对未来的期望和追求。\n例句：我的梦想是当一名医生。',
  '耐心': '不急躁，不厌烦。\n例句：妈妈很有耐心地教我。',
  '细心': '用心仔细。\n例句：做题要细心。\n近义词：仔细、认真',
  '自信': '相信自己。\n例句：我们要自信地面对挑战。',
  '独立': '依靠自己的力量去做。\n例句：我学会了独立穿衣。'
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
    IDIOM_DICT, POEM_DICT, ENGLISH_DICT, WORD_DICT, DAILY_TASK_TEMPLATES,
    ACHIEVEMENTS, GIFT_EXCHANGE, DIMENSIONS
  };
}
