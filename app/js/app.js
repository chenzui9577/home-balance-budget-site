// 小满家账的入口：加载账本状态、哈希路由、月份切换、主题切换与全局提示的装配。
import { loadState, saveState } from './store.js';
import { currentMonthKey, shiftMonth, monthLabel } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderLedger } from './ledger.js';
import { renderBudgets } from './budgets.js';
import { renderStats } from './stats.js';
import { renderGoals } from './goals.js';
import { renderMembers } from './members.js';
import { setupRecordModal } from './record-modal.js';

let state = loadState();
let viewMonth = currentMonthKey();

const TITLES = {
  overview: ['本月总览', '林小满一家 · 四口人的小日子'],
  ledger: ['流水明细', '每一笔都有名有姓'],
  budgets: ['分类预算', '先留位置，再花钱'],
  stats: ['收支统计', '把数字翻译成过日子的话'],
  goals: ['储蓄目标', '心愿不大，一点点攒'],
  members: ['家庭成员', '钱从谁手里过，心里有个数'],
};
const RENDERERS = {
  overview: renderDashboard,
  ledger: renderLedger,
  budgets: renderBudgets,
  stats: renderStats,
  goals: renderGoals,
  members: renderMembers,
};

const root = document.getElementById('view-root');
const toastEl = document.getElementById('toast');
let toastTimer = null;

function toast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
}

const actions = {
  rerender: () => render(),
  toast,
  replaceState: (fresh) => { state = fresh; },
  afterRecord: (dateText) => {
    viewMonth = dateText.slice(0, 7);
    syncMonthLabel();
    render();
  },
};

function currentView() {
  const name = location.hash.replace('#/', '').split('?')[0];
  return RENDERERS[name] ? name : 'overview';
}

function syncMonthLabel() {
  document.getElementById('month-label').textContent = monthLabel(viewMonth);
}

function render() {
  const view = currentView();
  const [title, subtitle] = TITLES[view];
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = subtitle;
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === view));
  syncMonthLabel();
  RENDERERS[view](root, state, viewMonth, actions);
}

document.getElementById('month-prev').addEventListener('click', () => { viewMonth = shiftMonth(viewMonth, -1); render(); });
document.getElementById('month-next').addEventListener('click', () => { viewMonth = shiftMonth(viewMonth, 1); render(); });
window.addEventListener('hashchange', render);

const themeBtn = document.getElementById('theme-toggle');
function applyTheme() {
  document.documentElement.dataset.theme = state.theme === 'dark' ? 'dark' : 'light';
  themeBtn.textContent = state.theme === 'dark' ? '切换浅色模式' : '切换深色模式';
}
themeBtn.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  saveState(state);
  applyTheme();
  render();
});

applyTheme();
setupRecordModal(state, actions);
if (!location.hash) location.hash = '#/overview';
render();
