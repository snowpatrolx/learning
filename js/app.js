// ============================================================
// 儿童学习陪伴（家长端）- 主应用逻辑 v1.02
// 核心功能：识字 + 算数
// 导航：首页(含今日任务) / 知识 / 知识录入 / 知识图谱(含知识树) / 成长报告(含星星兑换) / 设置
// ============================================================

const App = {
  state: null,
  route: 'dashboard',

  init() {
    this.state = Storage.load();
    this.cleanLegacyState();
    Storage.save(this.state);
    this.render();
  },

  cleanLegacyState() {
    // 清理历史废弃字段
    const s = this.state;
    delete s.eyeCare;
    delete s.screenUsedToday;
    delete s.screenDate;
    if (s.dimensionStats) {
      if (s.dimensionStats.knowledge && !s.dimensionStats.literacy) {
        s.dimensionStats.literacy = s.dimensionStats.knowledge;
      }
      delete s.dimensionStats.knowledge;
      delete s.dimensionStats.emotion;
    }
  },

  navigate(route) {
    this.route = route;
    window.scrollTo(0, 0);
    this.render();
  },

  buildNav() {
    const menus = [
      { id: 'dashboard', label: '首页' },
      { id: 'knowledge', label: '知识' },
      { id: 'entry', label: '录入' },
      { id: 'graph', label: '图谱' },
      { id: 'report', label: '报告' },
      { id: 'settings', label: '设置' }
    ];
    document.getElementById('navMenu').innerHTML = menus.map(m =>
      `<a class="${this.route === m.id ? 'active' : ''}" onclick="App.navigate('${m.id}')">${m.label}</a>`
    ).join('');
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
    if (!this.state.user) this.route = 'login';
    const pages = {
      login: () => this.pageLogin(),
      dashboard: () => this.pageDashboard(),
      taskSetup: () => this.pageTaskSetup(),
      knowledge: () => this.pageKnowledge(),
      card: () => this.pageCard(),
      entry: () => this.pageEntry(),
      graph: () => this.pageGraph(),
      report: () => this.pageReport(),
      settings: () => this.pageSettings()
    };
    c.innerHTML = (pages[this.route] || pages.dashboard)();
    if (this.route === 'graph') this.drawGraph();
    if (this.route === 'knowledge') this.applyStarFilter();
  },

  refreshTopBar() {
    const ua = document.getElementById('userArea');
    const ver = window.APP_DATA.APP_VERSION;
    if (this.state.user) {
      ua.innerHTML = `<span class="ver-badge">v${ver}</span><span class="user-name" onclick="App.navigate('settings')">${this.state.user.childName || this.state.user.username}</span>`;
    } else {
      ua.innerHTML = `<span class="ver-badge">v${ver}</span>`;
    }
  },

  // ========== 登录 ==========
  pageLogin() {
    return `
      <div class="login-wrap">
        <div class="login-card">
          <h1 class="login-title">儿童学习陪伴</h1>
          <p class="login-sub">家长端 · 识字 与 算数</p>
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
    this.state.knowledgeMastery = { 'py-a': 3, 'py-o': 2, 'num-1': 3, 'num-2': 2, 'num-3': 1, 'hz-ren': 1 };
    this.state.knowledgeTree = ['py-a', 'num-1'];
    this.state.knowledgeNodes = 2;
    this.state.dimensionStats = { life: 15, ability: 10, literacy: 25, arithmetic: 20, focus: 8, sport: 12 };
    this.state.streak = 5;
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

  // ========== 首页（合并今日任务） ==========
  pageDashboard() {
    this.generateDailyTasks();
    const u = this.state.user;
    const tasks = this.state.dailyTasks || [];
    const doneCount = (this.state.checkedIn || []).length;
    const total = tasks.length || 3;
    const pct = total ? Math.round(doneCount / total * 100) : 0;
    const today = new Date().toISOString().slice(0, 10);
    const litCount = this.countNodesByModule('literacy');
    const mathCount = this.countNodesByModule('arithmetic');

    // 今日任务组
    const taskGroups = [
      { cat: 'life', title: '生活任务' },
      { cat: 'ability', title: '能力任务' },
      { cat: 'knowledge', title: '知识学习' }
    ];
    const tasksHTML = taskGroups.map(g => {
      const list = tasks.filter(t => t.cat === g.cat);
      if (!list.length) return '';
      return `<div class="task-group">
        <h3 class="task-group-title">${g.title}</h3>
        ${list.map(t => {
          const done = (this.state.checkedIn || []).includes(t.uid);
          const steps = (t.steps || '').split(',').filter(Boolean);
          const modLabel = t.module ? ` · ${this.catLabel(t.module)}` : '';
          return `<div class="task-card ${done ? 'done' : ''}">
            <div class="task-card-main">
              <div class="task-card-head">
                <span class="task-cat ${g.cat}">${this.catLabel(g.cat)}${modLabel}</span>
                <span class="task-name">${t.name}</span>
                ${t.parent ? '<span class="badge badge-warning">亲子</span>' : ''}
              </div>
              <div class="task-meta">约 ${t.duration} 分钟</div>
              ${steps.length ? `<ol class="task-steps">${steps.map(s => `<li>${s}</li>`).join('')}</ol>` : ''}
            </div>
            <div class="task-card-actions">
              <button class="btn btn-link" onclick="App.editTask('${t.uid}')">编辑</button>
              <button class="btn ${done ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="App.checkinTask('${t.uid}')">${done ? '已完成' : '打卡'}</button>
            </div>
          </div>`;
        }).join('')}
      </div>`;
    }).join('');

    return `
      <div class="page-header">
        <div>
          <h1 class="page-title">${u.childName} 的学习</h1>
          <p class="page-subtitle">${today} · ${u.childAge} 岁</p>
        </div>
        <div class="stat-chips">
          <div class="stat-chip">⭐ ${this.state.kidStars || 0}</div>
          <div class="stat-chip">🌳 ${this.state.knowledgeNodes || 0}</div>
          <div class="stat-chip">🔥 ${this.state.streak || 0} 天</div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="flex-between mb-1">
          <h3>今日任务</h3>
          <div class="flex gap-2">
            <span class="text-muted">${doneCount}/${total}</span>
            <button class="btn btn-outline btn-sm" onclick="App.regenerateTasks()">换一批</button>
            <button class="btn btn-link btn-sm" onclick="App.navigate('taskSetup')">管理</button>
          </div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        ${doneCount === total && total ? `<div class="all-done-banner">今日任务全部完成 🎉 获得 ⭐${total * 3}</div>` : ''}
      </div>

      ${tasksHTML}

      <div class="card-grid grid-2 mb-3 mt-3">
        <div class="card nav-card" onclick="App.navigate('knowledge')">
          <div class="nav-card-icon">📚</div>
          <div>
            <h4>知识学习</h4>
            <p class="text-muted">识字 ${litCount} · 算数 ${mathCount}</p>
          </div>
        </div>
        <div class="card nav-card" onclick="App.navigate('entry')">
          <div class="nav-card-icon">➕</div>
          <div>
            <h4>知识录入</h4>
            <p class="text-muted">自动扩展成语/古诗</p>
          </div>
        </div>
        <div class="card nav-card" onclick="App.navigate('graph')">
          <div class="nav-card-icon">🕸️</div>
          <div>
            <h4>知识图谱</h4>
            <p class="text-muted">网络 + 知识树</p>
          </div>
        </div>
        <div class="card nav-card" onclick="App.navigate('report')">
          <div class="nav-card-icon">📊</div>
          <div>
            <h4>成长报告</h4>
            <p class="text-muted">雷达图 + 星星兑换</p>
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
    return ({ life: '生活', ability: '能力', knowledge: '知识', literacy: '识字', arithmetic: '算数' })[cat] || cat;
  },

  countNodesByModule(mod) {
    const allCards = this.allCards();
    return allCards.filter(c => c.module === mod && (this.state.knowledgeMastery[c.id] || 0) >= 3).length;
  },

  allCards() {
    return [...window.APP_DATA.KIDS_CARDS, ...(this.state.customCards || [])];
  },

  recommendCards(age) {
    return this.allCards()
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

  // ========== 今日任务逻辑 ==========
  generateDailyTasks() {
    const today = new Date().toDateString();
    if (this.state.dailyTasksDate === today && this.state.dailyTasks && this.state.dailyTasks.length) return;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const t = window.APP_DATA.DAILY_TASK_TEMPLATES;
    this.state.dailyTasks = [
      { ...pick(t.life), uid: 't-life-' + Date.now(), cat: 'life' },
      { ...pick(t.ability), uid: 't-ab-' + Date.now(), cat: 'ability' },
      { ...pick(t.literacy), uid: 't-lit-' + Date.now(), cat: 'knowledge' },
      { ...pick(t.arithmetic), uid: 't-ari-' + Date.now(), cat: 'knowledge' }
    ];
    this.state.dailyTasksDate = today;
    this.state.checkedIn = [];
    this.state._allTasksDone = false;
    Storage.save(this.state);
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
      const dimKey = t.module || t.cat;
      this.state.dimensionStats[dimKey] = (this.state.dimensionStats[dimKey] || 0) + t.duration;
      this.logWeekly(t.duration);
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
        <button class="btn btn-outline btn-sm" onclick="App.navigate('dashboard')">返回</button>
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
              <span class="task-cat ${cat === 'literacy' || cat === 'arithmetic' ? 'knowledge' : cat}">${this.catLabel(cat)}</span>
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
    this.navigate('dashboard');
  },

  addTemplateTask(cat, id) {
    const it = window.APP_DATA.DAILY_TASK_TEMPLATES[cat].find(x => x.id === id);
    if (!it) return;
    this.state.dailyTasks = this.state.dailyTasks || [];
    const taskCat = (cat === 'literacy' || cat === 'arithmetic') ? 'knowledge' : cat;
    this.state.dailyTasks.push({ ...it, uid: it.id + '-' + Date.now(), cat: taskCat });
    Storage.save(this.state);
    this.toast('已添加', 'success');
    this.navigate('dashboard');
  },

  // ========== 知识学习（按星级展示 + 筛选） ==========
  pageKnowledge() {
    const age = this.state.kidAge;
    const modules = window.APP_DATA.KIDS_MODULES;
    const selMod = this._libMod || modules[0].id;
    const allCards = this.allCards();
    const cards = allCards.filter(c => c.module === selMod && c.age <= age);
    const units = window.APP_DATA.MODULE_UNITS[selMod] || [];
    const selUnit = this._libUnit || 'all';
    const selStar = this._libStar != null ? this._libStar : -1; // -1=全部

    let filtered = cards;
    if (selUnit !== 'all') filtered = filtered.filter(c => c.unit === selUnit);
    if (selStar >= 0) filtered = filtered.filter(c => (this.state.knowledgeMastery[c.id] || 0) === selStar);

    // 按星级降序排序
    filtered = [...filtered].sort((a, b) => (this.state.knowledgeMastery[b.id] || 0) - (this.state.knowledgeMastery[a.id] || 0));

    return `
      <div class="page-header">
        <h1 class="page-title">知识</h1>
        <select class="form-control form-control-sm" onchange="App.setKidAge(this.value)" style="width:auto">
          ${window.APP_DATA.KIDS_AGE_GROUPS.map(a => `<option value="${a}" ${a==age?'selected':''}>${a} 岁</option>`).join('')}
        </select>
      </div>

      <div class="mod-tabs mb-2">
        ${modules.map(m => `<button class="mod-tab ${m.id===selMod?'active':''}" onclick="App._libMod='${m.id}';App._libUnit='all';App._libStar=-1;App.navigate('knowledge')">${m.icon} ${m.name}</button>`).join('')}
      </div>

      <div class="unit-tabs mb-2">
        <button class="unit-tab ${selUnit==='all'?'active':''}" onclick="App._libUnit='all';App.navigate('knowledge')">全部</button>
        ${units.map(u => `<button class="unit-tab ${selUnit===u.id?'active':''}" onclick="App._libUnit='${u.id}';App.navigate('knowledge')">${u.name}</button>`).join('')}
      </div>

      <div class="star-filter mb-3" id="starFilter">
        <span class="filter-label">星级：</span>
        <button class="star-btn ${selStar===-1?'active':''}" data-star="-1" onclick="App.setStarFilter(-1)">全部</button>
        <button class="star-btn ${selStar===0?'active':''}" data-star="0" onclick="App.setStarFilter(0)">☆☆☆</button>
        <button class="star-btn ${selStar===1?'active':''}" data-star="1" onclick="App.setStarFilter(1)">★☆☆</button>
        <button class="star-btn ${selStar===2?'active':''}" data-star="2" onclick="App.setStarFilter(2)">★★☆</button>
        <button class="star-btn ${selStar===3?'active':''}" data-star="3" onclick="App.setStarFilter(3)">★★★</button>
      </div>

      <h3>${this.moduleName(selMod)} · ${selUnit === 'all' ? '全部' : (units.find(u => u.id === selUnit) || {}).name || ''} <span class="text-muted" style="font-size:.85rem;font-weight:normal">(${filtered.length})</span></h3>
      <div class="lib-grid" id="libGrid">
        ${filtered.length ? filtered.map(c => this.cardHTML(c)).join('') : '<div class="empty-state"><div class="icon">📭</div>暂无内容，可去「录入」添加</div>'}
      </div>
    `;
  },

  setStarFilter(star) {
    this._libStar = star;
    this.render();
  },

  applyStarFilter() {
    // 可扩展：DOM 级筛选（当前已用 render 重新渲染）
  },

  moduleName(id) { return (window.APP_DATA.KIDS_MODULES.find(m => m.id === id) || {}).name || ''; },
  moduleIcon(id) { return (window.APP_DATA.KIDS_MODULES.find(m => m.id === id) || {}).icon || '?'; },

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
    const card = this.allCards().find(c => c.id === this._cardId);
    if (!card) return '<div class="empty-state">卡片不存在</div>';
    const m = window.APP_DATA.KIDS_MODULES.find(x => x.id === card.module);
    const mastery = this.state.knowledgeMastery[card.id] || 0;
    const unitName = (window.APP_DATA.MODULE_UNITS[card.module] || []).find(u => u.id === card.unit);
    return `
      <button class="btn btn-link" onclick="App.navigate('knowledge')">← 返回</button>
      <div class="card detail-card">
        <div class="detail-head">
          <div class="detail-mod">${m ? m.icon : '?'}</div>
          <div>
            <h2>${card.title}</h2>
            <div class="text-muted">${m ? m.name : ''}${unitName ? ' · ' + unitName.name : ''} · 适合 ${card.age}+ 岁</div>
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
    const card = this.allCards().find(c => c.id === cardId);
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
    this.checkAchievements();
    Storage.save(this.state);
    this.render();
  },

  // ========== 知识录入（独立页 + 增强自动扩展） ==========
  pageEntry() {
    const modules = window.APP_DATA.KIDS_MODULES;
    const selMod = this._entryMod || modules[0].id;
    const units = window.APP_DATA.MODULE_UNITS[selMod] || [];
    const customCount = (this.state.customCards || []).length;
    return `
      <div class="page-header">
        <h1 class="page-title">知识录入</h1>
        <p class="page-subtitle">输入标题，自动扩展内容、分类、分级</p>
      </div>

      <div class="card mb-3">
        <h3>快速录入</h3>
        <div class="form-group">
          <label>所属模块</label>
          <div class="mod-tabs">
            ${modules.map(m => `<button class="mod-tab ${m.id===selMod?'active':''}" onclick="App._entryMod='${m.id}';App.render()">${m.icon} ${m.name}</button>`).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>标题 <span class="text-muted" style="font-size:.8rem">（输入成语名/诗名/汉字/算数题，点自动扩展）</span></label>
          <div class="input-with-action">
            <input class="form-control" id="entry-title" placeholder="例如：守株待兔 / 静夜思 / 人 / 3+2" oninput="App.onEntryTitleInput()" />
            <button class="btn btn-primary btn-sm" onclick="App.autoExpand()" id="autoBtn">✨ 自动扩展</button>
          </div>
          <div class="auto-hint" id="autoHint"></div>
        </div>
        <div class="form-group">
          <label>内容</label>
          <textarea class="form-control" id="entry-content" rows="4" placeholder="支持换行；自动扩展会填充此处"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>子分类 <span class="text-muted" style="font-size:.75rem">（自动扩展会自动选择）</span></label>
            <select class="form-control" id="entry-unit">
              ${units.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>适合年龄 <span class="text-muted" style="font-size:.75rem">（自动扩展会自动分级）</span></label>
            <select class="form-control" id="entry-age">
              ${window.APP_DATA.KIDS_AGE_GROUPS.map(a => `<option value="${a}" ${a===4?'selected':''}>${a} 岁</option>`).join('')}
            </select>
          </div>
        </div>
        <button class="btn btn-primary btn-block btn-lg" onclick="App.saveEntryCard('${selMod}')">保存卡片</button>
      </div>

      <div class="card">
        <h3>已录入卡片 (${customCount})</h3>
        ${customCount ? (this.state.customCards || []).map(c => {
          const m = window.APP_DATA.KIDS_MODULES.find(x => x.id === c.module);
          const mastery = this.state.knowledgeMastery[c.id] || 0;
          return `<div class="lib-row">
            <span class="task-cat knowledge">${m ? m.icon : '?'}</span>
            <div class="lib-row-main">
              <div class="lib-row-title">${c.title} <span class="lib-row-mastery">${'★'.repeat(mastery)}${'☆'.repeat(3-mastery)}</span></div>
              <div class="text-muted" style="font-size:.8rem">${(c.content || '').slice(0, 50)}${(c.content || '').length > 50 ? '...' : ''}</div>
            </div>
            <div class="flex gap-1">
              <button class="btn btn-link" onclick="App.openCard('${c.id}')">查看</button>
              <button class="btn btn-link" style="color:var(--c-danger)" onclick="App.deleteCustomCard('${c.id}')">删除</button>
            </div>
          </div>`;
        }).join('') : '<div class="text-muted">暂无录入内容</div>'}
      </div>
    `;
  },

  onEntryTitleInput() {
    const title = document.getElementById('entry-title').value.trim();
    const hint = document.getElementById('autoHint');
    if (!title) { hint.textContent = ''; return; }
    const inIdiom = window.APP_DATA.IDIOM_DICT[title];
    const inPoem = window.APP_DATA.POEM_DICT[title];
    if (inIdiom) {
      hint.textContent = '✓ 命中本地成语词典';
      hint.style.color = '#0d9488';
    } else if (inPoem) {
      hint.textContent = '✓ 命中本地古诗词典';
      hint.style.color = '#0d9488';
    } else {
      hint.textContent = '本地未命中，将尝试网络字典查询';
      hint.style.color = '#6b7280';
    }
  },

  // 自动扩展：本地词典 → 网络字典 → 智能模板；同时自动分类+分级
  async autoExpand() {
    const titleInput = document.getElementById('entry-title');
    const title = titleInput.value.trim();
    if (!title) return this.toast('请先输入标题', 'error');
    const contentEl = document.getElementById('entry-content');
    const unitSel = document.getElementById('entry-unit');
    const ageSel = document.getElementById('entry-age');
    const hint = document.getElementById('autoHint');

    // 1. 本地成语词典
    if (window.APP_DATA.IDIOM_DICT[title]) {
      contentEl.value = window.APP_DATA.IDIOM_DICT[title];
      this.selectUnit(unitSel, '成语');
      ageSel.value = '5';
      this.toast('✓ 本地成语释义已填充', 'success');
      return;
    }
    // 2. 本地古诗词典
    if (window.APP_DATA.POEM_DICT[title]) {
      const p = window.APP_DATA.POEM_DICT[title];
      contentEl.value = `【${p.dynasty}】${p.author}\n${p.content}\n\n点评：${p.hint}`;
      this.selectUnit(unitSel, '古诗');
      ageSel.value = '5';
      this.toast('✓ 本地古诗全文已填充', 'success');
      return;
    }

    // 3. 网络字典查询
    hint.textContent = '正在查询网络字典...';
    hint.style.color = '#6b7280';
    try {
      const net = await this.fetchNetDict(title);
      if (net) {
        contentEl.value = net.content;
        if (net.unit) this.selectUnit(unitSel, net.unit);
        if (net.age) ageSel.value = String(net.age);
        this.toast(`✓ 网络字典已填充（${net.source}）`, 'success');
        return;
      }
    } catch (e) {
      console.warn('网络查询失败', e);
    }

    // 4. 智能模板 fallback
    const guess = this.guessContent(title);
    contentEl.value = guess.content;
    if (guess.unit) this.selectUnit(unitSel, guess.unit);
    if (guess.age) ageSel.value = String(guess.age);
    this.toast('已按模板生成，请家长修改后保存', 'success');
  },

  selectUnit(sel, name) {
    const opt = [...sel.options].find(o => o.text.includes(name));
    if (opt) sel.value = opt.value;
  },

  // 网络字典查询：依次尝试多个开放 API
  async fetchNetDict(title) {
    // 3.1 成语 API
    try {
      const res = await fetch(`https://api.vvhan.com/api/chengyu?word=${encodeURIComponent(title)}`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (data && data.success && data.ciyu) {
        const parts = [];
        parts.push(data.ciyu);
        if (data.pinyin) parts.push(`拼音：${data.pinyin}`);
        if (data.jianjie) parts.push(`释义：${data.jianjie}`);
        if (data.chuchu) parts.push(`出处：${data.chuchu}`);
        if (data.liju) parts.push(`例句：${data.liju}`);
        return { content: parts.join('\n'), unit: '成语', age: 6, source: '网络成语' };
      }
    } catch (e) { console.warn('成语API失败', e); }

    // 3.2 古诗 API
    try {
      const res = await fetch(`https://api.vvhan.com/api/shici?word=${encodeURIComponent(title)}`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (data && data.success) {
        const poem = data.data || data;
        const parts = [];
        if (poem.author) parts.push(`【${poem.dynasty || ''}】${poem.author}`);
        if (poem.content) parts.push(poem.content);
        if (poem.translate) parts.push(`译文：${poem.translate}`);
        if (poem.appreciation) parts.push(`赏析：${poem.appreciation}`);
        if (parts.length) return { content: parts.join('\n'), unit: '古诗', age: 6, source: '网络古诗' };
      }
    } catch (e) { console.warn('古诗API失败', e); }

    // 3.3 汉字查询 API
    if (title.length === 1 && /[\u4e00-\u9fa5]/.test(title)) {
      try {
        const res = await fetch(`https://api.vvhan.com/api/hanzibihua?text=${encodeURIComponent(title)}`, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        if (data && data.success) {
          const parts = [`汉字「${title}」`];
          if (data.pinyin) parts.push(`拼音：${data.pinyin}`);
          if (data.bihua) parts.push(`笔画：${data.bihua}`);
          if (data.bushou) parts.push(`部首：${data.bushou}`);
          if (data.jiegou) parts.push(`结构：${data.jiegou}`);
          parts.push(`组词：请家长补充常用词`);
          parts.push(`造句：用「${title}」说一句话`);
          return { content: parts.join('\n'), unit: '汉字', age: 4, source: '网络汉字' };
        }
      } catch (e) { console.warn('汉字API失败', e); }
    }

    return null;
  },

  // 智能模板：根据标题特征猜测内容、分类、年龄
  guessContent(title) {
    const len = title.length;
    // 单字汉字
    if (len === 1 && /[\u4e00-\u9fa5]/.test(title)) {
      return {
        content: `汉字「${title}」\n字形：请观察「${title}」的结构。\n字义：请家长补充含义。\n组词：${title} + 常用词。\n造句：用「${title}」说一句话。`,
        unit: '汉字', age: 4
      };
    }
    // 算数题（含数字和加减号）
    if (/[0-9]/.test(title) && /[+\-]/.test(title)) {
      return {
        content: `算数：${title}\n请家长用实物演示计算过程。\n例如：用苹果、积木等让孩子点数。\n练习：再出 2 道类似题目。`,
        unit: '加减法', age: 5
      };
    }
    // 纯数字
    if (/^[0-9]+$/.test(title)) {
      return {
        content: `认识数字 ${title}\n${title} 像什么？请家长引导联想。\n点数：数出 ${title} 个物品。\n找一找：生活中哪里有 ${title}？`,
        unit: '数字认知', age: 3
      };
    }
    // 2-4 字中文（可能是词语或成语）
    if (len >= 2 && len <= 4 && /^[\u4e00-\u9fa5]+$/.test(title)) {
      return {
        content: `「${title}」\n释义：请家长查字典补充。\n例句：用「${title}」造句示范。\n延伸：找一找生活中的${title}。`,
        unit: len === 4 ? '成语' : '汉字', age: len === 4 ? 6 : 5
      };
    }
    // 默认
    return {
      content: `${title}\n请家长补充学习内容。`,
      unit: null, age: 4
    };
  },

  saveEntryCard(mod) {
    const title = document.getElementById('entry-title').value.trim();
    const content = document.getElementById('entry-content').value.trim();
    const unit = document.getElementById('entry-unit').value;
    const age = parseInt(document.getElementById('entry-age').value);
    if (!title || !content) return this.toast('标题和内容不能为空', 'error');
    const card = {
      id: 'cc-' + Date.now(),
      module: mod, unit, title, content, age,
      type: 'card', custom: true
    };
    this.state.customCards = this.state.customCards || [];
    this.state.customCards.unshift(card);
    Storage.save(this.state);
    // 清空表单
    document.getElementById('entry-title').value = '';
    document.getElementById('entry-content').value = '';
    document.getElementById('autoHint').textContent = '';
    this.toast('卡片已保存 ✓', 'success');
    this.render();
  },

  deleteCustomCard(id) {
    if (!confirm('删除此卡片？')) return;
    this.state.customCards = (this.state.customCards || []).filter(c => c.id !== id);
    Storage.save(this.state);
    this.toast('已删除');
    this.render();
  },

  // ========== 知识图谱（合并知识树） ==========
  pageGraph() {
    const litCount = this.countNodesByModule('literacy');
    const mathCount = this.countNodesByModule('arithmetic');
    const totalCards = this.allCards();
    const mastered = totalCards.filter(c => (this.state.knowledgeMastery[c.id] || 0) >= 3).length;
    const learning = totalCards.filter(c => {
      const m = this.state.knowledgeMastery[c.id] || 0;
      return m > 0 && m < 3;
    }).length;
    const treeNodes = this.state.knowledgeTree || [];
    return `
      <div class="page-header">
        <h1 class="page-title">知识图谱</h1>
      </div>
      <div class="card-grid grid-3 mb-3">
        <div class="card stat-card"><div class="stat-num">${mastered}</div><div class="stat-label">已掌握</div></div>
        <div class="card stat-card"><div class="stat-num">${learning}</div><div class="stat-label">学习中</div></div>
        <div class="card stat-card"><div class="stat-num">${totalCards.length - mastered - learning}</div><div class="stat-label">未开始</div></div>
      </div>
      <div class="card mb-3">
        <h3>识字 · 算数 知识网络</h3>
        <p class="text-muted">节点大小=掌握度，颜色=状态。点击节点查看详情</p>
        <div class="graph-wrap">
          <svg id="graphSvg" class="graph-svg" viewBox="0 0 800 500"></svg>
        </div>
        <div class="graph-legend">
          <span class="legend-item"><span class="legend-dot" style="background:#4f46e5"></span>识字</span>
          <span class="legend-item"><span class="legend-dot" style="background:#0d9488"></span>算数</span>
          <span class="legend-item"><span class="legend-dot" style="background:#9ca3af"></span>未开始</span>
          <span class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>学习中</span>
          <span class="legend-item"><span class="legend-dot" style="background:#10b981"></span>已掌握</span>
        </div>
      </div>
      <div class="card">
        <h3>知识树 · 已点亮 ${treeNodes.length} 个</h3>
        <div class="tree-visual">
          ${treeNodes.length ? treeNodes.map(id => {
            const c = this.allCards().find(x => x.id === id);
            return c ? `<span class="tree-leaf" title="${c.title}">${c.title.slice(0,4)}</span>` : '';
          }).join('') : '<div class="empty-state"><div class="icon">🌱</div>完成知识卡片学习后点亮</div>'}
        </div>
      </div>`;
  },

  drawGraph() {
    const svg = document.getElementById('graphSvg');
    if (!svg) return;
    const modules = window.APP_DATA.KIDS_MODULES;
    const moduleUnits = window.APP_DATA.MODULE_UNITS;
    const allCards = this.allCards();
    const W = 800, H = 500;
    const modPos = {
      literacy: { x: W * 0.3, y: H * 0.5 },
      arithmetic: { x: W * 0.7, y: H * 0.5 }
    };
    let nodes = [];
    let edges = [];

    modules.forEach(m => {
      nodes.push({ id: 'mod-' + m.id, type: 'module', label: m.name, x: modPos[m.id].x, y: modPos[m.id].y, r: 26, color: m.color });
    });

    modules.forEach(m => {
      const units = moduleUnits[m.id] || [];
      const cx = modPos[m.id].x, cy = modPos[m.id].y;
      const unitR = 110;
      const n = units.length;
      units.forEach((u, i) => {
        const ang = -Math.PI / 2 + i * 2 * Math.PI / n;
        const ux = cx + unitR * Math.cos(ang);
        const uy = cy + unitR * Math.sin(ang);
        nodes.push({ id: 'unit-' + m.id + '-' + u.id, type: 'unit', label: u.name, x: ux, y: uy, r: 16, color: m.color, moduleId: m.id, unitId: u.id });
        edges.push({ from: 'mod-' + m.id, to: 'unit-' + m.id + '-' + u.id, color: m.color });
        const cards = allCards.filter(c => c.module === m.id && c.unit === u.id);
        const cardR = 70;
        const cn = cards.length;
        cards.forEach((c, j) => {
          const cang = -Math.PI / 2 + j * 2 * Math.PI / Math.max(cn, 1);
          const cardx = ux + cardR * Math.cos(cang);
          const cardy = uy + cardR * Math.sin(cang);
          const mastery = this.state.knowledgeMastery[c.id] || 0;
          let nodeColor;
          if (mastery >= 3) nodeColor = '#10b981';
          else if (mastery > 0) nodeColor = '#f59e0b';
          else nodeColor = m.color;
          nodes.push({ id: 'card-' + c.id, type: 'card', label: c.title, x: cardx, y: cardy, r: 6 + mastery * 3, color: nodeColor, cardId: c.id, mastery });
          edges.push({ from: 'unit-' + m.id + '-' + u.id, to: 'card-' + c.id, color: '#d1d5db' });
        });
      });
    });

    let html = '';
    edges.forEach(e => {
      const a = nodes.find(n => n.id === e.from);
      const b = nodes.find(n => n.id === e.to);
      if (!a || !b) return;
      html += `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${e.color}" stroke-width="${e.color === '#d1d5db' ? 1 : 2}" stroke-opacity="${e.color === '#d1d5db' ? 0.5 : 0.7}"/>`;
    });
    nodes.forEach(n => {
      const fontSize = n.type === 'module' ? 14 : (n.type === 'unit' ? 12 : 9);
      const fontWeight = n.type === 'module' ? 'bold' : 'normal';
      const labelOffset = n.r + (n.type === 'card' ? 8 : 12);
      const clickable = n.type === 'card';
      html += `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.color}" fill-opacity="${n.type === 'card' ? 0.85 : 0.15}" stroke="${n.color}" stroke-width="2" ${clickable ? `onclick="App.openCard('${n.cardId}')" style="cursor:pointer"` : ''}/>`;
      if (n.type === 'module' || n.type === 'unit') {
        html += `<text x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" font-weight="${fontWeight}" fill="${n.color}">${n.label}</text>`;
      } else {
        const text = n.label.length > 6 ? n.label.slice(0, 5) + '…' : n.label;
        html += `<text x="${n.x}" y="${n.y + labelOffset}" text-anchor="middle" font-size="${fontSize}" fill="#6b7280">${text}</text>`;
      }
    });
    svg.innerHTML = html;
  },

  // ========== 成长报告（合并星星兑换） ==========
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
      <div class="card mb-3">
        <h3>导出</h3>
        <p class="text-muted">导出孩子的成长数据</p>
        <button class="btn btn-primary" onclick="App.exportReport()">导出报告</button>
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

  exportReport() {
    const report = {
      child: this.state.user ? this.state.user.childName : '',
      age: this.state.kidAge,
      generatedAt: new Date().toISOString(),
      appVersion: window.APP_DATA.APP_VERSION,
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
        <h3>关于</h3>
        <p class="text-muted">版本：v${window.APP_DATA.APP_VERSION}</p>
        <p class="text-muted">儿童学习陪伴 · 家长端 · 识字与算数专项</p>
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

  updateStreak() {
    const today = new Date().toDateString();
    if (this.state.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      this.state.streak = this.state.lastStudyDate === yesterday ? (this.state.streak || 0) + 1 : 1;
      this.state.lastStudyDate = today;
    }
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
