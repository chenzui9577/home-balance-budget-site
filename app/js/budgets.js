// 预算页：每个支出分类的月度上限、本月已用进度、超支提醒，以及上限的就地修改。
import { recordsOfMonth, setBudget } from './store.js';
import { EXPENSE_CATEGORIES } from './categories.js';
import { formatMoney } from './utils.js';

export function renderBudgets(root, state, monthKey, actions) {
  const monthRecords = recordsOfMonth(state, monthKey);
  const rows = EXPENSE_CATEGORIES.map((cat) => {
    const spent = monthRecords.filter((r) => r.type === 'expense' && r.category === cat.id).reduce((s, r) => s + r.amount, 0);
    const limit = state.budgets[cat.id] || 0;
    return { cat, spent, limit, pct: limit > 0 ? Math.round((spent / limit) * 100) : 0 };
  });
  const totalLimit = rows.reduce((s, x) => s + x.limit, 0);
  const totalSpent = rows.reduce((s, x) => s + x.spent, 0);
  const overCount = rows.filter((x) => x.limit > 0 && x.spent > x.limit).length;

  root.innerHTML = `
    <div class="card">
      <h3 class="card-title">分类预算</h3>
      <p class="card-hint">预算不是紧箍咒，是给每个月先留好的位置。本月总预算 ${formatMoney(totalLimit)}，已用 ${formatMoney(totalSpent)}${overCount ? `，有 ${overCount} 项超了支，看看能不能从别处匀一匀。` : '，每一项都还稳当。'}</p>
      ${rows.map(({ cat, spent, limit, pct }) => `
        <div class="budget-row">
          <div class="budget-head">
            <span class="budget-name"><span class="dot" style="background:${cat.color}"></span>${cat.name}</span>
            <span class="budget-nums">已用 ${formatMoney(spent)} / 上限 ${formatMoney(limit)} · ${pct}%</span>
          </div>
          <div class="progress"><div class="progress-fill ${pct > 100 ? 'over' : pct < 70 ? 'ok' : ''}" style="width:${Math.min(100, pct)}%"></div></div>
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <span class="card-hint">${pct > 100 ? `⚠ 已超出 ${formatMoney(spent - limit)}，下半月手下留情。` : pct >= 85 ? '快到上限了，接下来花之前多想三秒。' : `还剩 ${formatMoney(Math.max(0, limit - spent))}，花得从容。`}</span>
            <span class="budget-edit">
              <input type="number" min="0" step="50" value="${limit}" data-budget-input="${cat.id}" aria-label="${cat.name}预算上限">
              <button class="small-btn" type="button" data-budget-save="${cat.id}">保存上限</button>
            </span>
          </div>
        </div>`).join('')}
    </div>`;

  root.querySelectorAll('[data-budget-save]').forEach((btn) => btn.addEventListener('click', () => {
    const input = root.querySelector(`[data-budget-input="${btn.dataset.budgetSave}"]`);
    const value = Math.max(0, Math.round(Number(input.value) || 0));
    setBudget(state, btn.dataset.budgetSave, value);
    actions.toast('预算上限已更新');
    actions.rerender();
  }));
}
