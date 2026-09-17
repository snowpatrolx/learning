// ============================================================
// 存储层 - 基于 localStorage 的本地数据持久化
// 模拟多端同步：每次写入时打上 sync 标记，联网自动同步
// v2.0：移除护眼相关字段
// ============================================================

const Storage = {
  KEY: 'kids_learn_platform_v2',
  SYNC_KEY: 'kids_learn_sync_queue',

  defaults() {
    return {
      user: null,                     // { username, childName, childAge }
      registered: false,
      // 儿童学习数据
      kidAge: 4,
      kidStars: 0,
      kidFlowers: 0,
      knowledgeTree: [],              // 已点亮的知识点 id
      knowledgeMastery: {},          // { cardId: stars(0-3) }
      knowledgeNodes: 0,              // 已点亮数量（冗余，便于统计）
      dailyTasks: [],                 // 当天任务列表
      dailyTasksDate: null,
      checkedIn: [],                  // 已打卡任务 id
      streak: 0,
      lastStudyDate: null,
      achievements: [],               // 已解锁的 achievement id
      // 统计维度（v2.0：识字+算数 替代 knowledge）
      dimensionStats: { life: 0, ability: 0, literacy: 0, arithmetic: 0, focus: 0, sport: 0 },
      weeklyLog: [],                  // [{date, completed, duration}]
      // 家长自建内容
      customCards: [],                // 家长录入的知识卡片
      customTasks: [],                // 家长自建任务
      redeemedGifts: [],
      // 内部标记
      _allTasksDone: false
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return this.defaults();
      const data = JSON.parse(raw);
      return { ...this.defaults(), ...data };
    } catch (e) {
      console.warn('Storage load failed, using defaults', e);
      return this.defaults();
    }
  },

  save(state) {
    try {
      state._syncMark = Date.now();
      localStorage.setItem(this.KEY, JSON.stringify(state));
      const queue = JSON.parse(localStorage.getItem(this.SYNC_KEY) || '[]');
      queue.push({ t: Date.now(), action: 'save' });
      if (queue.length > 50) queue.shift();
      localStorage.setItem(this.SYNC_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('Storage save failed', e);
    }
  },

  reset() {
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.SYNC_KEY);
  },

  lastSync() {
    try {
      const queue = JSON.parse(localStorage.getItem(this.SYNC_KEY) || '[]');
      return queue.length ? queue[queue.length - 1].t : null;
    } catch { return null; }
  }
};

if (typeof window !== 'undefined') window.Storage = Storage;
