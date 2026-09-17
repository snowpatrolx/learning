// ============================================================
// 儿童学习平台（家长端）- 主应用逻辑
// 极简风格 · 家长管理孩子的每日任务、知识学习、成长报告
// ============================================================

const App = {
  state: null,
  route: 'dashboard',

  init() {
    this.state = Storage.load();
    this.render();
    this.startEyeCareWatcher();
  },

  navigate(route) {
    this.route = route;
    window.scrollTo(0, 0);
    this.render();
  },

  buildNav() {
    const menus = [
      { id: 'dashboard', label: '首页' },
      { id: 'tasks', label: '今日任务' },
      { id: 'library', label: '知识学习' },
      { id: 'entry', label: '知识录入' },
      { id: 'tree', label: '知识树' },
      { id: 'report', label: '成长报告' },
      { id: 'settings', label: '设置' }
    ];
    document.getElementById('navMenu').innerHTML = menus.map(m =>
      `<a class="${this.route === m.id ? 'active' : ''}" onclick="App.navigate('${m.id}')">${m.label}</a>`
    ).join('');
    // 底部 tab
    const bt = document.getElementById('bottomTabs');
    bt.className = 'bottom-tabs';
    bt.innerHTML = menus.map(m =>
      `<div class="bottom-tab ${this.route === m.id ? 'active' : ''}" onclick="App.navigate('${m.id}')">
        <span>${m.label}</span>
      </div>`).join('');
  },

  render() {
    this.buildNav();
    this.refreshTopBar();
    const c = document.getElementById('content');
    const authed = !!this.state.user;
    if (!authed && !['login', 'dashboard'].includes(this.route)) {
      this.route = 'login';
    }
    // 未登录直接显示登录页（无 landing）
    if (!authed) this.route = 'login';
    const pages = {
      login: () => this.pageLogin(),
      dashboard: () => this.pageDashboard(),
      tasks: () => this.pageTasks(),
      taskSetup: () => this.pageTaskSetup(),
      library: () => this.pageLibrary(),
      card: () => this.pageCard(),
      entry: () => this.pageEntry(),
      tree: () => this.pageTree(),
      report: () => this.pageReport(),
      settings: () => this.pageSettings()
    };
    c.innerHTML = (pages[this.route] || pages.dashboard)();
  },

  refreshTopBar() {
    const ua = document.getElementById('userArea');
    if (this.state.user) {
      ua.innerHTML = `<span class="user-name" onclick="App.navigate('settings')">${this.state.user.childName || this.state.user.username}</span>`;
    } else {
      ua.innerHTML = '';
    }
  },

  // ========== 登录 ==========
  pageLogin() {
    return `
      <div class="login-wrap">
        <div class="login-card">
          <h1 class="login-title">儿童学习陪伴</h1>
          <p class="login-sub">家长端 · 帮助孩子养成每日学习习惯</p>
          <div class="form-group">
            <label>家长称呼</label>
            <input class="form-control" id="loginName" placeholder="请输入您的称呼" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>孩子昵称</label>
              <input class="form-control" id="childName" placeholder="孩子的名字" />
            </div>
            <div class="form-group">
              <label>孩子年龄</label>
              <select class="form-control" id="childAge">
                ${window.APP_DATA.KIDS_AGE_GROUPS.map(a => `<option value="${a}" ${a===4?'selected':''}>${a} 岁</option>`).join('')}
              </select>
            </div>
          </div>
          <button class="btn btn-primary btn-block btn-lg" onclick="App.doLogin()">开始使用</button>
          <button class="btn btn-outline btn-block" onclick="App.quickDemo()">演示数据体验</button>
        </div>
      </div>`;
  },

  doLogin() {
    const name = document.getElementById('loginName').value.trim() || '家长';
    const childName = document.getElementById('childName').value.trim() || '小朋友';
    const childAge = parseInt(document.getElementById('childAge').value);
    this.state.user = { username: name, childName, childAge, email: '' };
    this.state.kidAge = childAge;
    this.state.registered = true;
    this.generateDailyTasks();
    Storage.save(this.state);
    this.navigate('dashboard');
  },

  quickDemo() {
    this.state.user = { username: '豆豆家长', childName: '豆豆', childAge: 4, email: '' };
    this.state.kidAge = 4;
    this.state.registered = true;
    this.state.kidStars = 25;
    this.state.knowledgeNodes = 3;
    this.state.knowledgeMastery = { 'py-a': 3, 'num-1': 2, 'en-A': 1 };
    this.state.knowledgeTree = ['py-a'];
    this.generateDailyTasks();
    Storage.save(this.state);
    this.navigate('dashboard');
  },

  logout() {
    if (!confirm('确定退出登录吗？')) return;
    this.state.user = null;
    Storage.save(this.state);
    this.navigate('login');
  },

  // ========== 首页（家长仪表盘） ==========
  pageDashboard() {
    this.generateDailyTasks();
    const u = this.state.user;
    const tasks = this.state.dailyTasks || [];
    const doneCount = (this.state.checkedIn || []).length;
    const total = tasks.length || 3;
    const pct = total ? Math.round(doneCount / total * 100) : 0;
    const today = new Date().toISOString().slice(0, 10);
    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">${u.childName} 的学习</h1>
          <p class="page-subtitle">${today} · ${u.childAge} 岁</p>
        </div>
        <div class="stat-chips">
          <div class="stat-chip">⭐ ${this.state.kidStars || 0}</div>
          <div class="stat-chip">🌸 ${this.state.kidFlowers || 0}</div>
          <div class="stat-chip">🔥 ${this.state.streak || 0} 天</div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="flex-between mb-1">
          <h3>今日任务</h3>
          <span class="text-muted">${doneCount}/${total}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="task-mini-list mt-2">
          ${tasks.slice(0, 3).map(t => {
            const done = (this.state.checkedIn || []).includes(t.uid);
            return `<div class="task-mini ${done?'done':''}" onclick="App.navigate('tasks')">
              <span class="task-cat ${t.cat}">${this.catLabel(t.cat)}</span>
              <span class="task-mini-name">${t.name}</span>
              <span class="task-mini-status">${done?'✓':'⏳'}</span>
            </div>`;
          }).join('') || '<div class="text-muted">暂无任务</div>'}
        </div>
        <button class="btn btn-outline btn-sm btn-block mt-2" onclick="App.navigate('tasks')">查看全部任务</button>
      </div>

      <div class="card-grid grid-2 mb-3">
        <div class="card nav-card" onclick="App.navigate('library')">
          <div class="nav-card-icon">📚</div>
          <div>
            <h4>知识学习</h4>
            <p class="text-muted">语文 / 数学 / 英语 / 科普 / 艺术</p>
          </div>
        </div>
        <div class="card nav-card" onclick="App.navigate('entry')">
          <div class="nav-card-icon">➕</div>
          <div>
            <h4>知识录入</h4>
            <p class="text-muted">自定义学习卡片与任务</p>
          </div>
        </div>
        <div class="card nav-card" onclick="App.navigate('tree')">
          <div class="nav-card-icon">🌳</div>
          <div>
            <h4>知识树</h4>
            <p class="text-muted">已点亮 ${this.state.knowledgeNodes || 0} 个知识点</p>
          </div>
        </div>
        <div class="card nav-card" onclick="App.navigate('report')">
          <div class="nav-card-icon">📊</div>
          <div>
            <h4>成长报告</h4>
            <p class="text-muted">多维能力雷达图与周报</p>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>推荐学习</h3>
        <p class="text-muted mb-2">根据 ${u.childAge} 岁推荐</p>
        <div class="card-grid grid-3">
          ${this.recommendCards(u.childAge).slice(0, 3).map(card => this.cardHTML(card)).join('')}
        </div>
      </div>`;
  },

  catLabel(cat) {
    return ({ life: '生活', ability: '能力', knowledge: '知识' })[cat] || cat;
  },

  recommendCards(age) {
    return [...window.APP_DATA.KIDS_CARDS, ...(this.state.customCards || [])]
      .filter(c => c.age <= age)
      .sort((a, b) => (this.state.knowledgeMastery[a.id] ? 1 : 0) - (this.state.knowledgeMastery[b.id] ? 1 : 0))
      .slice(0, 6);
  },

  cardHTML(card) {
    const mastery = this.state.knowledgeMastery[card.id] || 0;
    const m = window.APP_DATA.KIDS_MODULES.find(x => x.id === card.module);
    return `<div class="lib-card" onclick="App.openCard('${card.id}')">
      <div class="lib-card-mod">${m ? m.icon : '?'}</div>
      <div class="lib-card-title">${card.title}</div>
      <div class="lib-card-mastery">${'★'.repeat(mastery)}${'☆'.repeat(3-mastery)}</div>
    </div>`;
  },

  // ========== 今日任务 ==========
  generateDailyTasks() {
    const today = new Date().toDateString();
    if (this.state.dailyTasksDate === today && this.state.dailyTasks && this.state.dailyTasks.length) return;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const t = window.APP_DATA.DAILY_TASK_TEMPLATES;
    this.state.dailyTasks = [
      { ...pick(t.life), uid: 't-life-' + Date.now(), cat: 'life' },
      { ...pick(t.ability), uid: 't-ab-' + Date.now(), cat: 'ability' },
      { ...pick(t.knowledge), uid: 't-kn-' + Date.now(), cat: 'knowledge' }
    ];
    this.state.dailyTasksDate = today;
    this.state.checkedIn = [];
    this.state._allTasksDone = false;
    Storage.save(this.state);
  },

  pageTasks() {
    this.generateDailyTasks();
    const tasks = this.state.dailyTasks || [];
    const checked = this.state.checkedIn || [];
    const doneCount = checked.length;
    const pct = tasks.length ? Math.round(doneCount / tasks.length * 100) : 0;
    return `
      <div class="page-header">
        <h1 class="page-title">今日任务</h1>
        <button class="btn btn-outline btn-sm" onclick="App.navigate('taskSetup')">管理任务</button>
      </div>
      <div class="card mb-3">
        <div class="flex-between mb-1">
          <span>完成进度</span>
          <span>${doneCount}/${tasks.length}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="flex gap-2 mt-2">
          <button class="btn btn-outline btn-sm" onclick="App.regenerateTasks()">换一批</button>
        </div>
      </div>
      ${this.renderTaskGroup('life', '生活任务', tasks)}
      ${this.renderTaskGroup('ability', '能力任务', tasks)}
      ${this.renderTaskGroup('knowledge', '知识学习', tasks)}
      ${doneCount === tasks.length && tasks.length ? `<div class="card text-center success-card"><h3>今日任务全部完成 🎉</h3><p>获得 ⭐${tasks.length * 3}</p></div>` : ''}
    `;
  },

  renderTaskGroup(cat, title, tasks) {
    const list = tasks.filter(t => t.cat === cat);
    if (!list.length) return '';
    return `<div class="task-group">
      <h3 class="task-group-title">${title}</h3>
      ${list.map(t => {
        const done = (this.state.checkedIn || []).includes(t.uid);
        const steps = (t.steps || '').split(',').filter(Boolean);
        return `<div class="task-card ${done ? 'done' : ''}">
          <div class="task-card-main">
            <div class="task-card-head">
              <span class="task-cat ${cat}">${this.catLabel(cat)}</span>
              <span class="task-name">${t.name}</span>
              ${t.parent ? '<span class="badge badge-warning">亲子</span>' : ''}
            </div>
            <div class="task-meta">约 ${t.duration} 分钟</div>
            ${steps.length ? `<ol class="task-steps">${steps.map(s => `<li>${s}</li>`).join('')}</ol>` : ''}
          </div>
          <div class="task-card-actions">
            <button class="btn btn-link" onclick="App.editTask('${t.uid}')">编辑</button>
            <button class="btn ${done ? 'btn-outline' : 'btn-primary'} btn-sm" ${done ? '' : ''} onclick="App.checkinTask('${t.uid}')">${done ? '已完成' : '打卡'}</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },

  checkinTask(uid) {
    const t = this.state.dailyTasks.find(x => x.uid === uid);
    if (!t) return;
    if (!(this.state.checkedIn || []).includes(uid)) {
      this.state.checkedIn = this.state.checkedIn || [];
      this.state.checkedIn.push(uid);
      this.state.kidStars = (this.state.kidStars || 0) + 3;
      if (t.cat === 'knowledge') {
        this.state.kidFlowers = (this.state.kidFlowers || 0) + 1;
      }
      this.updateStreak();
      this.state.dimensionStats = this.state.dimensionStats || {};
      this.state.dimensionStats[t.cat] = (this.state.dimensionStats[t.cat] || 0) + t.duration;
      this.logWeekly(t.duration);
      // 全部完成
      if (this.state.checkedIn.length === this.state.dailyTasks.length) {
        this.state._allTasksDone = true;
      }
      this.checkAchievements();
      Storage.save(this.state);
      this.toast(t.cat === 'knowledge' ? '打卡成功 +3⭐ +1🌸' : '打卡成功 +3⭐', 'success');
    }
    this.render();
  },

  editTask(uid) {
    const t = this.state.dailyTasks.find(x => x.uid === uid);
    if (!t) return;
    this.openModal('编辑任务', `
      <div class="form-group"><label>任务名称</label><input class="form-control" id="et-name" value="${t.name}" /></div>
      <div class="form-row">
        <div class="form-group"><label>时长(分钟)</label><input class="form-control" id="et-dur" type="number" value="${t.duration}" /></div>
        <div class="form-group"><label>类型</label>
          <select class="form-control" id="et-cat">
            <option value="life" ${t.cat==='life'?'selected':''}>生活</option>
            <option value="ability" ${t.cat==='ability'?'selected':''}>能力</option>
            <option value="knowledge" ${t.cat==='knowledge'?'selected':''}>知识</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label>步骤(逗号分隔)</label><textarea class="form-control" id="et-steps" rows="3">${t.steps || ''}</textarea></div>
      <label><input type="checkbox" id="et-parent" ${t.parent?'checked':''} /> 亲子任务</label>
      <div class="modal-actions">
        <button class="btn btn-danger btn-sm" onclick="App.deleteTask('${uid}')">删除</button>
        <button class="btn btn-primary" onclick="App.saveTask('${uid}')">保存</button>
      </div>`);
  },

  saveTask(uid) {
    const t = this.state.dailyTasks.find(x => x.uid === uid);
    if (!t) return;
    t.name = document.getElementById('et-name').value.trim() || t.name;
    t.duration = parseInt(document.getElementById('et-dur').value) || t.duration;
    t.cat = document.getElementById('et-cat').value;
    t.steps = document.getElementById('et-steps').value;
    t.parent = document.getElementById('et-parent').checked;
    Storage.save(this.state);
    this.closeModal();
    this.toast('已更新', 'success');
    this.render();
  },

  deleteTask(uid) {
    this.state.dailyTasks = this.state.dailyTasks.filter(t => t.uid !== uid);
    this.state.checkedIn = (this.state.checkedIn || []).filter(x => x !== uid);
    Storage.save(this.state);
    this.closeModal();
    this.toast('已删除');
    this.render();
  },

  regenerateTasks() {
    if (!confirm('重新生成今日任务？已打卡记录将清空。')) return;
    this.state.dailyTasks = [];
    this.state.checkedIn = [];
    this.state.dailyTasksDate = null;
    this.generateDailyTasks();
    this.toast('已重新生成');
    this.render();
  },

  pageTaskSetup() {
    const t = window.APP_DATA.DAILY_TASK_TEMPLATES;
    return `
      <div class="page-header">
        <h1 class="page-title">管理任务</h1>
        <button class="btn btn-outline btn-sm" onclick="App.navigate('tasks')">返回</button>
      </div>
      <div class="card mb-3">
        <h3>添加自定义任务</h3>
        <div class="form-group"><label>任务名称</label><input class="form-control" id="ct-name" placeholder="例如：阅读绘本" /></div>
        <div class="form-row">
          <div class="form-group"><label>时长(分钟)</label><input class="form-control" id="ct-dur" type="number" value="10" /></div>
          <div class="form-group"><label>类型</label>
            <select class="form-control" id="ct-cat">
              <option value="life">生活</option><option value="ability">能力</option><option value="knowledge">知识</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label>步骤(逗号分隔)</label><input class="form-control" id="ct-steps" placeholder="第一步,第二步" /></div>
        <label><input type="checkbox" id="ct-parent" /> 亲子任务</label>
        <button class="btn btn-primary btn-block mt-2" onclick="App.addCustomTask()">添加到今日任务</button>
      </div>
      <h3>任务库</h3>
      ${Object.entries(t).map(([cat, items]) => `
        <div class="card mb-2">
          <h4>${this.catLabel(cat)}</h4>
          ${items.map(it => `
            <div class="lib-row" onclick="App.addTemplateTask('${cat}','${it.id}')">
              <span class="task-cat ${cat}">${this.catLabel(cat)}</span>
              <span class="lib-row-main">
                <span class="lib-row-title">${it.name}</span>
                <span class="text-muted">${it.duration} 分钟</span>
              </span>
              <span class="lib-row-add">+ 添加</span>
            </div>`).join('')}
        </div>`).join('')}
    `;
  },

  addCustomTask() {
    const name = document.getElementById('ct-name').value.trim();
    if (!name) return this.toast('请填写任务名称', 'error');
    this.state.dailyTasks = this.state.dailyTasks || [];
    this.state.dailyTasks.push({
      uid: 'ct-' + Date.now(), name,
      duration: parseInt(document.getElementById('ct-dur').value) || 10,
      cat: document.getElementById('ct-cat').value,
      steps: document.getElementById('ct-steps').value,
      parent: document.getElementById('ct-parent').checked
    });
    Storage.save(this.state);
    this.toast('已添加', 'success');
    this.navigate('tasks');
  },

  addTemplateTask(cat, id) {
    const it = window.APP_DATA.DAILY_TASK_TEMPLATES[cat].find(x => x.id === id);
    if (!it) return;
    this.state.dailyTasks = this.state.dailyTasks || [];
    this.state.dailyTasks.push({ ...it, uid: it.id + '-' + Date.now(), cat });
    Storage.save(this.state);
    this.toast('已添加', 'success');
    this.navigate('tasks');
  },

  // ========== 知识学习库 ==========
  pageLibrary() {
    const age = this.state.kidAge;
    const modules = window.APP_DATA.KIDS_MODULES;
    const selMod = this._libMod || modules[0].id;
    const allCards = [...window.APP_DATA.KIDS_CARDS, ...(this.state.customCards || [])];
    const cards = allCards.filter(c => c.module === selMod && c.age <= age);
    return `
      <div class="page-header">
        <h1 class="page-title">知识学习</h1>
        <select class="form-control form-control-sm" onchange="App.setKidAge(this.value)" style="width:auto">
          ${window.APP_DATA.KIDS_AGE_GROUPS.map(a => `<option value="${a}" ${a==age?'selected':''}>${a} 岁</option>`).join('')}
        </select>
      </div>
      <div class="mod-tabs mb-3">
        ${modules.map(m => `<button class="mod-tab ${m.id===selMod?'active':''}" onclick="App._libMod='${m.id}';App.navigate('library')">${m.icon} ${m.name}</button>`).join('')}
      </div>
      <div class="lib-grid">
        ${cards.length ? cards.map(c => this.cardHTML(c)).join('') : '<div class="empty-state"><div class="icon">📭</div>该模块暂无内容，可去「知识录入」添加</div>'}
      </div>`;
  },

  setKidAge(age) {
    this.state.kidAge = parseInt(age);
    if (this.state.user) this.state.user.childAge = parseInt(age);
    Storage.save(this.state);
    this.render();
  },

  openCard(cardId) {
    this._cardId = cardId;
    this.navigate('card');
  },

  pageCard() {
    const allCards = [...window.APP_DATA.KIDS_CARDS, ...(this.state.customCards || [])];
    const card = allCards.find(c => c.id === this._cardId);
    if (!card) return '<div class="empty-state">卡片不存在</div>';
    const m = window.APP_DATA.KIDS_MODULES.find(x => x.id === card.module);
    const mastery = this.state.knowledgeMastery[card.id] || 0;
    return `
      <button class="btn btn-link" onclick="App.navigate('library')">← 返回</button>
      <div class="card detail-card">
        <div class="detail-head">
          <div class="detail-mod">${m ? m.icon : '?'}</div>
          <div>
            <h2>${card.title}</h2>
            <div class="text-muted">${m ? m.name : ''} · 适合 ${card.age}+ 岁</div>
          </div>
        </div>
        <div class="detail-mastery">掌握度：${'★'.repeat(mastery)}${'☆'.repeat(3-mastery)}</div>
        <div class="detail-content">${card.content.replace(/\n/g, '<br/>')}</div>
        <div class="detail-actions">
          <button class="btn btn-primary" onclick="App.speakCard('${card.id}')">🔊 点读</button>
          <button class="btn btn-outline" onclick="App.completeCard('${card.id}')">完成学习 +1★</button>
        </div>
      </div>`;
  },

  speakCard(cardId) {
    const allCards = [...window.APP_DATA.KIDS_CARDS, ...(this.state.customCards || [])];
    const card = allCards.find(c => c.id === cardId);
    if (!card) return;
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(card.content);
      u.lang = 'zh-CN';
      u.rate = 0.85;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } else {
      this.toast('当前浏览器不支持语音');
    }
  },

  completeCard(cardId) {
    const cur = this.state.knowledgeMastery[cardId] || 0;
    const next = Math.min(3, cur + 1);
    this.state.knowledgeMastery[cardId] = next;
    this.state.kidStars = (this.state.kidStars || 0) + 1;
    if (next === 3 && !(this.state.knowledgeTree || []).includes(cardId)) {
      this.state.knowledgeTree = this.state.knowledgeTree || [];
      this.state.knowledgeTree.push(cardId);
      this.state.knowledgeNodes = (this.state.knowledgeNodes || 0) + 1;
      this.toast('知识点已完全掌握，知识树点亮 🌳', 'success');
    } else {
      this.toast('学习完成 +1⭐', 'success');
    }
    this.addScreenTime(60);
    this.checkAchievements();
    Storage.save(this.state);
    this.render();
  },

  // ========== 知识录入（核心新增） ==========
  pageEntry() {
    const modules = window.APP_DATA.KIDS_MODULES;
    return `
      <div class="page-header">
        <h1 class="page-title">知识录入</h1>
        <p class="page-subtitle">快速为孩子添加学习内容</p>
      </div>

      <div class="card mb-3">
        <h3>录入学习卡片</h3>
        <div class="form-group">
          <label>所属模块</label>
          <div class="mod-tabs">
            ${modules.map((m, i) => `<button class="mod-tab ${i===0?'active':''}" data-mod="${m.id}" onclick="App.selectEntryMod('${m.id}', this)">${m.icon} ${m.name}</button>`).join('')}
          </div>
          <input type="hidden" id="entry-mod" value="${modules[0].id}" />
        </div>
        <div class="form-group">
          <label>标题</label>
          <input class="form-control" id="entry-title" placeholder="例如：认识三角形" />
        </div>
        <div class="form-group">
          <label>内容</label>
          <textarea class="form-control" id="entry-content" rows="4" placeholder="学习内容描述，支持换行"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>适合年龄</label>
            <select class="form-control" id="entry-age">
              ${window.APP_DATA.KIDS_AGE_GROUPS.map(a => `<option value="${a}">${a} 岁</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>类型</label>
            <select class="form-control" id="entry-type">
              <option value="card">图文卡片</option>
              <option value="animation">短动画</option>
              <option value="game">互动游戏</option>
            </select>
          </div>
        </div>
        <button class="btn btn-primary btn-block btn-lg" onclick="App.saveCard()">保存卡片</button>
      </div>

      <div class="card">
        <h3>已录入卡片 (${(this.state.customCards || []).length})</h3>
        ${(this.state.customCards || []).length ? this.state.customCards.map(c => {
          const m = window.APP_DATA.KIDS_MODULES.find(x => x.id === c.module);
          return `<div class="lib-row">
            <span class="task-cat knowledge">${m ? m.icon : '?'}</span>
            <div class="lib-row-main">
              <div class="lib-row-title">${c.title}</div>
              <div class="text-muted" style="font-size:.8rem">${c.content.slice(0, 40)}${c.content.length > 40 ? '...' : ''}</div>
            </div>
            <button class="btn btn-link" onclick="App.deleteCustomCard('${c.id}')">删除</button>
          </div>`;
        }).join('') : '<div class="text-muted">暂无录入内容</div>'}
      </div>`;
  },

  selectEntryMod(modId, el) {
    document.querySelectorAll('[data-mod]').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('entry-mod').value = modId;
  },

  saveCard() {
    const mod = document.getElementById('entry-mod').value;
    const title = document.getElementById('entry-title').value.trim();
    const content = document.getElementById('entry-content').value.trim();
    const age = parseInt(document.getElementById('entry-age').value);
    const type = document.getElementById('entry-type').value;
    if (!title || !content) return this.toast('标题和内容不能为空', 'error');
    const card = {
      id: 'cc-' + Date.now(),
      module: mod, title, content, age, type, custom: true
    };
    this.state.customCards = this.state.customCards || [];
    this.state.customCards.unshift(card);
    Storage.save(this.state);
    this.toast('卡片已保存 ✓', 'success');
    this.navigate('entry');
  },

  deleteCustomCard(id) {
    if (!confirm('删除此卡片？')) return;
    this.state.customCards = (this.state.customCards || []).filter(c => c.id !== id);
    Storage.save(this.state);
    this.toast('已删除');
    this.render();
  },

  // ========== 知识树 ==========
  pageTree() {
    const nodes = this.state.knowledgeTree || [];
    const allCards = [...window.APP_DATA.KIDS_CARDS, ...(this.state.customCards || [])];
    return `
      <h1 class="page-title">知识树</h1>
      <p class="page-subtitle">已点亮 ${nodes.length} 个知识点</p>
      <div class="card mb-3 text-center">
        <div class="tree-visual">
          ${nodes.length ? nodes.map(id => {
            const c = allCards.find(x => x.id === id);
            return c ? `<span class="tree-leaf" title="${c.title}">${c.title.slice(0,4)}</span>` : '';
          }).join('') : '<div class="empty-state"><div class="icon">🌱</div>完成知识卡片学习后点亮</div>'}
        </div>
      </div>
      <div class="card">
        <h3>星星兑换</h3>
        <p class="text-muted">当前 ⭐ ${this.state.kidStars || 0}</p>
        <div class="card-grid grid-2">
          ${window.APP_DATA.GIFT_EXCHANGE.map(g => {
            const can = (this.state.kidStars || 0) >= g.cost;
            const redeemed = (this.state.redeemedGifts || []).includes(g.id);
            return `<div class="gift-card">
              <div class="gift-name">${g.name}</div>
              <div class="gift-cost">⭐ ${g.cost}</div>
              <button class="btn ${can && !redeemed ? 'btn-primary' : 'btn-outline'} btn-sm btn-block" ${can && !redeemed ? '' : 'disabled'} onclick="App.redeemGift('${g.id}')">${redeemed ? '已兑换' : (can ? '兑换' : '星星不足')}</button>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  },

  redeemGift(id) {
    const g = window.APP_DATA.GIFT_EXCHANGE.find(x => x.id === id);
    if (!g || (this.state.kidStars || 0) < g.cost) return;
    this.state.kidStars -= g.cost;
    this.state.redeemedGifts = this.state.redeemedGifts || [];
    this.state.redeemedGifts.push(id);
    Storage.save(this.state);
    this.toast(`兑换成功：${g.name}`, 'success');
    this.render();
  },

  // ========== 成长报告 ==========
  pageReport() {
    const dims = window.APP_DATA.DIMENSIONS;
    const stats = this.state.dimensionStats || {};
    const values = dims.map(d => stats[d.key] || 0);
    const maxV = Math.max(...values, 60);
    return `
      <h1 class="page-title">成长报告</h1>
      <p class="page-subtitle">多维能力发展追踪</p>
      <div class="card mb-3">
        <h3>能力雷达图</h3>
        <div class="radar-wrap">${this.renderRadar(dims, values, maxV)}</div>
      </div>
      <div class="card-grid grid-3 mb-3">
        <div class="card stat-card"><div class="stat-num">${this.state.kidStars || 0}</div><div class="stat-label">累计星星</div></div>
        <div class="card stat-card"><div class="stat-num">${this.state.knowledgeNodes || 0}</div><div class="stat-label">知识点</div></div>
        <div class="card stat-card"><div class="stat-num">${this.state.streak || 0}</div><div class="stat-label">连续打卡</div></div>
      </div>
      <div class="card mb-3">
        <h3>周报</h3>
        ${this.renderWeekly()}
      </div>
      <div class="card">
        <h3>导出</h3>
        <p class="text-muted">导出孩子的成长数据</p>
        <button class="btn btn-primary" onclick="App.exportReport()">导出报告</button>
      </div>
    `;
  },

  renderRadar(dims, values, maxV) {
    const cx = 180, cy = 180, R = 130;
    const n = dims.length;
    const angle = (i) => -Math.PI / 2 + i * 2 * Math.PI / n;
    const point = (i, r) => `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`;
    const grid = [0.25, 0.5, 0.75, 1].map(s => {
      const pts = dims.map((_, i) => point(i, R * s)).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="#e5e7eb" stroke-width="1"/>`;
    }).join('');
    const axes = dims.map((d, i) => {
      const x = cx + R * Math.cos(angle(i));
      const y = cy + R * Math.sin(angle(i));
      const lx = cx + (R + 22) * Math.cos(angle(i));
      const ly = cy + (R + 22) * Math.sin(angle(i));
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#e5e7eb"/>
        <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="13" fill="#374151">${d.label}</text>`;
    }).join('');
    const dataPts = dims.map((d, i) => point(i, R * (values[i] / maxV))).join(' ');
    const dataPoly = `<polygon points="${dataPts}" fill="rgba(99,102,241,.25)" stroke="#6366f1" stroke-width="2"/>`;
    const dataDots = dims.map((d, i) => {
      const [x, y] = point(i, R * (values[i] / maxV)).split(',').map(Number);
      return `<circle cx="${x}" cy="${y}" r="4" fill="#6366f1"/>`;
    }).join('');
    return `<svg class="radar-svg" viewBox="0 0 360 360">${grid}${axes}${dataPoly}${dataDots}</svg>`;
  },

  renderWeekly() {
    const log = this.state.weeklyLog || [];
    if (!log.length) return '<p class="text-muted">暂无数据</p>';
    const total = log.reduce((s, d) => s + (d.duration || 0), 0);
    const completed = log.reduce((s, d) => s + (d.completed || 0), 0);
    const active = log.filter(d => d.completed > 0).length;
    return `
      <div class="card-grid grid-3 mb-2">
        <div class="text-center"><div class="stat-num">${completed}</div><div class="stat-label">完成任务</div></div>
        <div class="text-center"><div class="stat-num">${Math.round(total)}</div><div class="stat-label">学习(分钟)</div></div>
        <div class="text-center"><div class="stat-num">${active}</div><div class="stat-label">活跃天数</div></div>
      </div>`;
  },

  logWeekly(duration) {
    const today = new Date().toISOString().slice(0, 10);
    let day = (this.state.weeklyLog || []).find(d => d.date === today);
    if (!day) {
      this.state.weeklyLog = this.state.weeklyLog || [];
      day = { date: today, completed: 0, duration: 0 };
      this.state.weeklyLog.push(day);
    }
    day.completed = (day.completed || 0) + 1;
    day.duration = (day.duration || 0) + (duration || 0);
  },

  exportReport() {
    const report = {
      child: this.state.user ? this.state.user.childName : '',
      age: this.state.kidAge,
      generatedAt: new Date().toISOString(),
      stars: this.state.kidStars,
      knowledgeNodes: this.state.knowledgeNodes,
      dimensionStats: this.state.dimensionStats,
      weeklyLog: this.state.weeklyLog,
      mastery: this.state.knowledgeMastery
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    this.toast('已导出', 'success');
  },

  // ========== 设置 ==========
  pageSettings() {
    const u = this.state.user;
    const ec = this.state.eyeCare;
    return `
      <h1 class="page-title">设置</h1>
      <div class="card mb-3">
        <h3>孩子信息</h3>
        <div class="form-row">
          <div class="form-group"><label>孩子昵称</label><input class="form-control" id="st-name" value="${u.childName || ''}" /></div>
          <div class="form-group"><label>年龄</label>
            <select class="form-control" id="st-age">
              ${window.APP_DATA.KIDS_AGE_GROUPS.map(a => `<option value="${a}" ${a===this.state.kidAge?'selected':''}>${a} 岁</option>`).join('')}
            </select>
          </div>
        </div>
        <button class="btn btn-primary" onclick="App.saveProfile()">保存</button>
      </div>
      <div class="card mb-3">
        <h3>护眼设置</h3>
        <div class="form-row">
          <div class="form-group"><label>单次学习上限(分钟)</label><input class="form-control" id="ec-lesson" type="number" value="${ec.lessonMaxMinutes}" /></div>
          <div class="form-group"><label>累计休息阈值(分钟)</label><input class="form-control" id="ec-rest" type="number" value="${ec.restAfterMinutes}" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>休息时长(秒)</label><input class="form-control" id="ec-dur" type="number" value="${ec.restDurationSeconds}" /></div>
          <div class="form-group"><label>每日屏幕上限(分钟)</label><input class="form-control" id="ec-daily" type="number" value="${ec.dailyScreenMinutes}" /></div>
        </div>
        <button class="btn btn-primary" onclick="App.saveEyeCare()">保存护眼设置</button>
      </div>
      <div class="card mb-3">
        <h3>数据管理</h3>
        <p class="text-muted">导出或清空全部数据</p>
        <div class="flex gap-2">
          <button class="btn btn-outline" onclick="App.exportData()">导出数据</button>
          <button class="btn btn-danger" onclick="App.clearData()">清空数据</button>
        </div>
      </div>
      <button class="btn btn-outline btn-block" onclick="App.logout()">退出登录</button>
    `;
  },

  saveProfile() {
    this.state.user.childName = document.getElementById('st-name').value.trim() || this.state.user.childName;
    this.state.kidAge = parseInt(document.getElementById('st-age').value);
    this.state.user.childAge = this.state.kidAge;
    Storage.save(this.state);
    this.toast('已保存', 'success');
    this.render();
  },

  saveEyeCare() {
    this.state.eyeCare = {
      lessonMaxMinutes: parseInt(document.getElementById('ec-lesson').value) || 5,
      restAfterMinutes: parseInt(document.getElementById('ec-rest').value) || 15,
      restDurationSeconds: parseInt(document.getElementById('ec-dur').value) || 60,
      dailyScreenMinutes: parseInt(document.getElementById('ec-daily').value) || 30
    };
    Storage.save(this.state);
    this.toast('护眼设置已保存', 'success');
  },

  exportData() {
    const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-data.json';
    a.click();
    this.toast('已导出', 'success');
  },

  clearData() {
    if (!confirm('确定清空所有数据？此操作不可恢复。')) return;
    Storage.reset();
    this.state = Storage.load();
    this.navigate('login');
  },

  // ========== 成就 ==========
  checkAchievements() {
    window.APP_DATA.ACHIEVEMENTS.forEach(a => {
      const has = (this.state.achievements || []).includes(a.id);
      if (!has && a.condition(this.state)) {
        this.state.achievements = this.state.achievements || [];
        this.state.achievements.push(a.id);
        this.state.kidStars = (this.state.kidStars || 0) + a.points;
        this.toast(`解锁成就：${a.name} +${a.points}⭐`, 'success');
      }
    });
  },

  // ========== 连续学习 ==========
  updateStreak() {
    const today = new Date().toDateString();
    if (this.state.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      this.state.streak = this.state.lastStudyDate === yesterday ? (this.state.streak || 0) + 1 : 1;
      this.state.lastStudyDate = today;
    }
  },

  // ========== 护眼 ==========
  startEyeCareWatcher() {
    this._eyeTimer = setInterval(() => {
      const ec = this.state.eyeCare;
      const today = new Date().toDateString();
      if (this.state.screenDate !== today) {
        this.state.screenDate = today;
        this.state.screenUsedToday = 0;
      }
      const used = this.state.screenUsedToday || 0;
      if (used > 0 && used % (ec.restAfterMinutes * 60) === 0 && !this._resting) {
        this.triggerEyeRest(ec.restDurationSeconds);
      }
      if (used >= ec.dailyScreenMinutes * 60 && !this._resting) {
        this.triggerEyeRest(0, true);
      }
    }, 1000);
  },

  addScreenTime(seconds) {
    const today = new Date().toDateString();
    if (this.state.screenDate !== today) {
      this.state.screenDate = today;
      this.state.screenUsedToday = 0;
    }
    this.state.screenUsedToday = (this.state.screenUsedToday || 0) + seconds;
    Storage.save(this.state);
  },

  triggerEyeRest(duration, isLimit = false) {
    this._resting = true;
    const overlay = document.getElementById('eyeRestOverlay');
    const timer = document.getElementById('eyeRestTimer');
    if (isLimit) {
      timer.textContent = '—';
      document.querySelector('.eye-rest-box p').textContent = '今日屏幕时长已达上限';
      overlay.classList.add('show');
      return;
    }
    let left = duration;
    overlay.classList.add('show');
    timer.textContent = left;
    this._restInterval = setInterval(() => {
      left--;
      timer.textContent = left;
      if (left <= 0) {
        clearInterval(this._restInterval);
        overlay.classList.remove('show');
        this._resting = false;
      }
    }, 1000);
  },

  // ========== 通用 UI ==========
  openModal(title, body) {
    document.getElementById('modal').innerHTML = `<span class="modal-close" onclick="App.closeModal()">×</span><div class="modal-title">${title}</div>${body}`;
    document.getElementById('modalOverlay').classList.add('show');
  },
  closeModal() { document.getElementById('modalOverlay').classList.remove('show'); },

  toast(msg, type = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show ' + type;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.className = 'toast', 2200);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
