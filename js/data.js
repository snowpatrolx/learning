// ============================================================
// 儿童学习平台（家长端）- 数据层
// 包含：知识学习模块、每日任务、成就体系、护眼设置
// ============================================================

// ---------- 知识学习模块（按年龄 3-6 分层） ----------
const KIDS_AGE_GROUPS = [3, 4, 5, 6];

const KIDS_MODULES = [
  { id: 'chinese', name: '语文启蒙', icon: '文' },
  { id: 'math', name: '数学启蒙', icon: '数' },
  { id: 'english', name: '英语启蒙', icon: '英' },
  { id: 'science', name: '科普百科', icon: '科' },
  { id: 'art', name: '艺术启蒙', icon: '艺' }
];

// ---------- 知识卡片（内置示例 + 家长自建会追加） ----------
const KIDS_CARDS = [
  // 语文
  { id: 'py-a', module: 'chinese', title: '韵母 a', content: '张大嘴巴 a a a，像唱歌一样。', age: 3, type: 'card' },
  { id: 'py-o', module: 'chinese', title: '韵母 o', content: '嘴巴圆圆 o o o，像公鸡叫。', age: 3, type: 'card' },
  { id: 'py-e', module: 'chinese', title: '韵母 e', content: '嘴巴扁扁 e e e，像白鹅叫。', age: 3, type: 'card' },
  { id: 'hz-ren', module: 'chinese', title: '汉字「人」', content: '一撇一捺，组成「人」字。', age: 4, type: 'card' },
  { id: 'hz-shan', module: 'chinese', title: '汉字「山」', content: '三座山峰，组成「山」字。', age: 4, type: 'card' },
  { id: 'poem-jingyesi', module: 'chinese', title: '《静夜思》李白', content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。', age: 5, type: 'animation' },
  { id: 'idiom-shouzhudaitu', module: 'chinese', title: '成语：守株待兔', content: '比喻死守经验，不知变通，或妄想不劳而获。', age: 6, type: 'animation' },
  // 数学
  { id: 'num-1', module: 'math', title: '认识数字 1', content: '1 像铅笔细又长。点数：1 个苹果。', age: 3, type: 'card' },
  { id: 'num-2', module: 'math', title: '认识数字 2', content: '2 像鸭子水中游。点数：2 只小鸭。', age: 3, type: 'card' },
  { id: 'num-3', module: 'math', title: '认识数字 3', content: '3 像耳朵听声音。点数：3 朵花。', age: 3, type: 'card' },
  { id: 'compare-big', module: 'math', title: '比较大小', content: '哪个大？大象大，蚂蚁小。', age: 4, type: 'game' },
  { id: 'shape-circle', module: 'math', title: '图形：圆形', content: '太阳、盘子、皮球都是圆形。', age: 4, type: 'card' },
  { id: 'add-1+1', module: 'math', title: '1 + 1 = ?', content: '1 个苹果加 1 个苹果，一共几个？', age: 5, type: 'game' },
  // 英语
  { id: 'en-A', module: 'english', title: '字母 Aa', content: 'A for Apple（苹果）。', age: 3, type: 'card' },
  { id: 'en-B', module: 'english', title: '字母 Bb', content: 'B for Bee（蜜蜂）。', age: 3, type: 'card' },
  { id: 'en-cat', module: 'english', title: 'cat 猫', content: 'This is a cat. 这是一只猫。', age: 4, type: 'card' },
  { id: 'en-dog', module: 'english', title: 'dog 狗', content: 'This is a dog. 这是一只狗。', age: 4, type: 'card' },
  { id: 'en-hello', module: 'english', title: 'Hello 你好', content: 'Hello! How are you? 你好！你好吗？', age: 5, type: 'card' },
  // 科普
  { id: 'sci-cat', module: 'science', title: '小猫', content: '小猫会喵喵叫，喜欢抓老鼠，爱干净。', age: 3, type: 'animation' },
  { id: 'sci-elephant', module: 'science', title: '大象', content: '大象是陆地上最大的动物，有长长的鼻子。', age: 4, type: 'animation' },
  { id: 'sci-sun', module: 'science', title: '太阳', content: '太阳是一颗恒星，给我们光和热。', age: 5, type: 'animation' },
  { id: 'sci-rain', module: 'science', title: '为什么会下雨？', content: '水蒸发成云，云太重就变成雨落下来。', age: 6, type: 'animation' },
  // 艺术
  { id: 'art-color', module: 'art', title: '认识红色', content: '红色像苹果、像太阳，暖暖的。', age: 3, type: 'card' },
  { id: 'art-line', module: 'art', title: '画直线', content: '从这头画到那头，直直的一条线。', age: 4, type: 'card' },
  { id: 'art-song', module: 'art', title: '两只老虎', content: '两只老虎，两只老虎，跑得快，跑得快。', age: 3, type: 'animation' }
];

// ---------- 每日任务模板（生活 / 能力 / 知识） ----------
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
  knowledge: [
    { id: 'kn-1', name: '学拼音 a o e', duration: 5, steps: '看动画,玩认读游戏,说给家长听', parent: true, module: 'chinese' },
    { id: 'kn-2', name: '认识数字 1-5', duration: 5, steps: '看动画,玩点数游戏,找身边数字', parent: false, module: 'math' },
    { id: 'kn-3', name: '英语字母 A B', duration: 5, steps: '看动画,玩配对,说单词', parent: false, module: 'english' },
    { id: 'kn-4', name: '认识一种动物', duration: 5, steps: '看百科,说特征,画一画', parent: true, module: 'science' }
  ]
};

// ---------- 成就勋章 ----------
const ACHIEVEMENTS = [
  { id: 'first-task', name: '第一次打卡', desc: '完成第一个任务', condition: (s) => (s.checkedIn || []).length >= 1, points: 5 },
  { id: 'streak-7', name: '坚持一周', desc: '连续打卡 7 天', condition: (s) => (s.streak || 0) >= 7, points: 30 },
  { id: 'streak-30', name: '月度达人', desc: '连续打卡 30 天', condition: (s) => (s.streak || 0) >= 30, points: 100 },
  { id: 'stars-100', name: '星星收集者', desc: '累计获得 100 颗星星', condition: (s) => (s.kidStars || 0) >= 100, points: 50 },
  { id: 'tree-10', name: '知识之树', desc: '点亮 10 个知识点', condition: (s) => (s.knowledgeNodes || 0) >= 10, points: 40 },
  { id: 'all-tasks', name: '今日全勤', desc: '一天内完成全部任务', condition: (s) => s._allTasksDone, points: 10 }
];

// ---------- 礼物兑换 ----------
const GIFT_EXCHANGE = [
  { id: 'g1', name: '小贴纸', cost: 20 },
  { id: 'g2', name: '绘本一本', cost: 100 },
  { id: 'g3', name: '玩具', cost: 200 },
  { id: 'g4', name: '游乐园门票', cost: 500 }
];

// ---------- 护眼默认设置 ----------
const EYE_CARE_DEFAULTS = {
  lessonMaxMinutes: 5,
  restAfterMinutes: 15,
  restDurationSeconds: 60,
  dailyScreenMinutes: 30
};

// ---------- 维度定义（成长报告雷达图） ----------
const DIMENSIONS = [
  { key: 'life', label: '生活' },
  { key: 'ability', label: '能力' },
  { key: 'knowledge', label: '知识' },
  { key: 'focus', label: '专注' },
  { key: 'sport', label: '运动' },
  { key: 'emotion', label: '情绪' }
];

// 导出到 window
if (typeof window !== 'undefined') {
  window.APP_DATA = {
    KIDS_AGE_GROUPS, KIDS_MODULES, KIDS_CARDS,
    DAILY_TASK_TEMPLATES, ACHIEVEMENTS, GIFT_EXCHANGE,
    EYE_CARE_DEFAULTS, DIMENSIONS
  };
}
