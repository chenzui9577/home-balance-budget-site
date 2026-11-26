// 总览页：本月收支结余指标卡、预算总进度、分类小环图、最近流水与储蓄目标速览。
import { monthTotals, recordsOfMonth, memberById } from './store.js';
import { categoryById, EXPENSE_CATEGORIES } from './categories.js';
import { formatMoney, formatSigned, animateNumber, savingsComment, prettyDate, escapeHtml, currentMonthKey } from './utils.js';
import { drawDonut } from './charts.js';

export function renderDashboard(root, state, monthKey, actions) {
  const totals = monthTotals(state, monthKey);
  const monthRecords = recordsOfMonth(state, monthKey)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const budgetTotal = Object.values(state.budgets).reduce((s, v) => s + v, 0);
  const budgetPct = budgetTotal > 0 ? Math.min(100, Math.round((totals.expense / budgetTotal) * 100)) : 0;
  const rate = totals.income > 0 ? (totals.income - totals.expense) / totals.income : 0;
  const comment = savingsComment(rate, monthKey === currentMonthKey());
  const overCats = EXPENSE_CATEGORIES
    .map((c) => ({ cat: c, spent: monthRecords.filter((r) => r.type === 'expense' && r.category === c.id).reduce((s, r) => s + r.amount, 0), limit: state.budgets[c.id] || 0 }))
    .filter((x) => x.limit > 0 && x.spent > x.limit);

  root.innerHTML = `
    <div class="stat-grid">
      <div class="card stat-card"><div class="stat-label">本月收入</div><div class="stat-value income" data-anim="${totals.income}">¥0</div><div class="stat-foot">工资和理财都稳稳到账，是全家人一起挣来的安心。</div></div>
      <div class="card stat-card"><div class="stat-label">本月支出</div><div class="stat-value" data-anim="${totals.expense}">¥0</div><div class="stat-foot">共 ${totals.count} 笔记录在案，每一笔都花得有去处。</div></div>
      <div class="card stat-card"><div class="stat-label">本月结余</div><div class="stat-value balance" data-anim="${totals.balance}">¥0</div><div class="stat-foot">结余率 ${Math.round(rate * 100)}%，留得住的钱才是底气。</div></div>
    </div>
    <div class="warm-banner">
      <div><div class="big">${comment.big}</div><div class="small">${comment.small}</div></div>
      ${overCats.length ? `<span class="chip warn">⚠ ${overCats.map((x) => x.cat.name).join('、')} 已超预算</span>` : '<span class="chip good">✓ 各项预算都在轨道上</span>'}
    </div>
    <div class="two-col">
      <div class="card">
        <h3 class="card-title">最近的流水</h3>
        <p class="card-hint">账本上最新记下的五笔</p>
        ${monthRecords.slice(0, 5).map((r) => recordRowHtml(r)).join('') || '<div class="empty-note">这个月还没有记录<br>点右上角「记一笔」，从今天的第一笔开始。</div>'}
        <div style="margin-top:12px"><a href="#/ledger" class="chip">查看全部流水 →</a></div>
      </div>
      <div>
        <div class="card">
          <h3 class="card-title">本月预算进度</h3>
          <p class="card-hint">总预算 ${formatMoney(budgetTotal)} · 已用 ${budgetPct}%</p>
          <div class="progress" style="margin-top:14px"><div class="progress-fill ${budgetPct > 100 ? 'over' : budgetPct < 70 ? 'ok' : ''}" style="width:${budgetPct}%"></div></div>
          <p class="card-hint" style="margin-top:10px">${budgetPct > 100 ? '总盘已经超了，去预算页看看是哪一项在漏。' : `还剩 ${formatMoney(Math.max(0, budgetTotal - totals.expense))} 可以从容安排。`}</p>
        </div>
        <div class="card" style="margin-top:16px">
          <h3 class="card-title">支出都去哪儿了</h3>
          <p class="card-hint">本月分类占比</p>
          <div class="chart-wrap" style="margin-top:10px">
            <canvas id="dash-donut" class="chart" width="230" height="230"></canvas>
            <div class="legend" id="dash-legend"></div>
          </div>
        </div>
        <div class="card" style="margin-top:16px">
          <h3 class="card-title">离目标还有多远</h3>
          <p class="card-hint">正在攒的心愿</p>
          ${state.goals.slice(0, 2).map((g) => `
            <div style="margin-top:12px">
              <div style="display:flex;justify-content:space-between;font-size:13.5px"><span>${g.emoji} ${escapeHtml(g.name)}</span><span>${Math.round((g.saved / g.target) * 100)}%</span></div>
              <div class="progress" style="margin-top:6px"><div class="progress-fill ok" style="width:${Math.min(100, (g.saved / g.target) * 100)}%"></div></div>
            </div>`).join('')}
          <div style="margin-top:12px"><a href="#/goals" class="chip">去看看储蓄目标 →</a></div>
        </div>
      </div>
    </div>`;

  root.querySelectorAll('[data-anim]').forEach((el) => animateNumber(el, Number(el.dataset.anim)));
  const slices = EXPENSE_CATEGORIES
    .map((c) => ({ name: c.name, color: c.color, value: monthRecords.filter((r) => r.type === 'expense' && r.category === c.id).reduce((s, r) => s + r.amount, 0) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);
  const canvas = root.querySelector('#dash-donut');
  if (canvas) drawDonut(canvas, slices, '本月支出', formatMoney(totals.expense));
  const legend = root.querySelector('#dash-legend');
  if (legend) legend.innerHTML = slices.slice(0, 5).map((s) => `<div class="legend-row"><span class="dot" style="background:${s.color}"></span>${s.name}<span class="amt">${formatMoney(s.value)}</span></div>`).join('');
}

export function recordRowHtml(r) {
  const cat = categoryById(r.category);
  const member = memberById(r.member);
  return `
    <div class="record-row">
      <div class="record-icon" style="background:${cat.color}1f;color:${cat.color}">${cat.icon}</div>
      <div class="record-main">
        <div class="record-note">${escapeHtml(r.note || cat.name)}</div>
        <div class="record-meta">${cat.name} · ${member.name} · ${prettyDate(r.date)}</div>
      </div>
      <div class="record-amount ${r.type}">${formatSigned(r)}</div>
    </div>`;
}
