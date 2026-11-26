// 成员页：每位家人本月的支出份额与笔数，以及账本数据的导出和重置管理。
import { MEMBERS, recordsOfMonth, resetDemoData } from './store.js';
import { formatMoney } from './utils.js';

export function renderMembers(root, state, monthKey, actions) {
  const monthRecords = recordsOfMonth(state, monthKey);
  const totalExpense = monthRecords.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const rows = MEMBERS.map((m) => {
    const mine = monthRecords.filter((r) => r.member === m.id);
    const spent = mine.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
    const earned = mine.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    return { m, spent, earned, count: mine.length, pct: totalExpense > 0 ? Math.round((spent / totalExpense) * 100) : 0 };
  }).sort((a, b) => b.spent - a.spent);

  root.innerHTML = `
    <div class="card">
      <h3 class="card-title">一家人 · 本月花销</h3>
      <p class="card-hint">不是比谁花得多，是看看钱都从谁手里过，心里有个数。</p>
      ${rows.map(({ m, spent, earned, count, pct }) => `
        <div class="member-row">
          <div class="member-head">
            <div class="avatar" style="background:${m.color}">${m.name.slice(-1)}</div>
            <div><div class="member-name">${m.name}</div><div class="member-role">${m.role}</div></div>
            <div class="member-amt">${formatMoney(spent)}</div>
          </div>
          <div class="progress"><div class="progress-fill" style="width:${pct}%;background:${m.color}"></div></div>
          <p class="card-hint" style="margin-top:8px">占本月支出 ${pct}% · 记了 ${count} 笔${earned ? ` · 本月收入 ${formatMoney(earned)}，是家里的顶梁柱之一` : ''}</p>
        </div>`).join('')}
    </div>
    <div class="card" style="margin-top:16px">
      <h3 class="card-title">账本管理</h3>
      <p class="card-hint">所有数据只存在这台设备的浏览器里，不上传、不联网。换设备前记得导出一份。</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">
        <button class="small-btn" type="button" id="export-btn">导出账本（JSON）</button>
        <button class="small-btn" type="button" id="reset-btn">恢复示例数据</button>
      </div>
    </div>`;

  root.querySelector('#export-btn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'xiaoman-ledger-export.json';
    a.click();
    URL.revokeObjectURL(url);
    actions.toast('账本已导出，收好这一年的辛苦账');
  });
  root.querySelector('#reset-btn').addEventListener('click', () => {
    const fresh = resetDemoData();
    actions.replaceState(fresh);
    actions.toast('已恢复为示例数据');
    actions.rerender();
  });
}
