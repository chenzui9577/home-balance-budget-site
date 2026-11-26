// 流水页：按月份、类型、分类、成员筛选与关键词搜索，汇总收支并支持删除记录。
import { MEMBERS, memberById, deleteRecord } from './store.js';
import { ALL_CATEGORIES, categoryById } from './categories.js';
import { formatMoney, formatSigned, prettyDate, escapeHtml } from './utils.js';

const filters = { type: 'all', category: 'all', member: 'all', keyword: '' };

export function renderLedger(root, state, monthKey, actions) {
  const monthRecords = state.records
    .filter((r) => r.date.startsWith(monthKey))
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const shown = monthRecords.filter((r) =>
    (filters.type === 'all' || r.type === filters.type) &&
    (filters.category === 'all' || r.category === filters.category) &&
    (filters.member === 'all' || r.member === filters.member) &&
    (!filters.keyword || (r.note || '').includes(filters.keyword) || categoryById(r.category).name.includes(filters.keyword)));
  const inSum = shown.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const outSum = shown.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0);

  root.innerHTML = `
    <div class="card">
      <h3 class="card-title">流水明细</h3>
      <p class="card-hint">筛选条件只影响这一页的显示，账本里的数据一笔都不会少。</p>
      <div class="filter-bar" style="margin-top:14px">
        <select id="f-type">
          <option value="all" ${filters.type === 'all' ? 'selected' : ''}>全部类型</option>
          <option value="expense" ${filters.type === 'expense' ? 'selected' : ''}>只看支出</option>
          <option value="income" ${filters.type === 'income' ? 'selected' : ''}>只看收入</option>
        </select>
        <select id="f-category">
          <option value="all">全部分类</option>
          ${ALL_CATEGORIES.map((c) => `<option value="${c.id}" ${filters.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
        <select id="f-member">
          <option value="all">全部成员</option>
          ${MEMBERS.map((m) => `<option value="${m.id}" ${filters.member === m.id ? 'selected' : ''}>${m.name}</option>`).join('')}
        </select>
        <input id="f-keyword" type="search" placeholder="搜索备注，如：菜市场" value="${escapeHtml(filters.keyword)}">
      </div>
      <div class="ledger-summary">
        <span class="chip">共 ${shown.length} 笔</span>
        <span class="chip good">收入 ${formatMoney(inSum)}</span>
        <span class="chip">支出 ${formatMoney(outSum)}</span>
        <span class="chip ${inSum - outSum >= 0 ? 'good' : 'warn'}">净额 ${formatMoney(inSum - outSum)}</span>
      </div>
      <div id="ledger-list">
        ${shown.map((r) => `
          <div class="record-row">
            <div class="record-icon" style="background:${categoryById(r.category).color}1f;color:${categoryById(r.category).color}">${categoryById(r.category).icon}</div>
            <div class="record-main">
              <div class="record-note">${escapeHtml(r.note || categoryById(r.category).name)}</div>
              <div class="record-meta">${categoryById(r.category).name} · ${memberById(r.member).name} · ${prettyDate(r.date)}</div>
            </div>
            <div class="record-amount ${r.type}">${formatSigned(r)}</div>
            <button class="delete-btn" type="button" data-delete="${r.id}" title="删除这一笔">删除</button>
          </div>`).join('') || '<div class="empty-note">没有符合条件的记录<br>换个筛选试试，或者记下新的一笔。</div>'}
      </div>
    </div>`;

  const rerender = () => actions.rerender();
  root.querySelector('#f-type').addEventListener('change', (e) => { filters.type = e.target.value; rerender(); });
  root.querySelector('#f-category').addEventListener('change', (e) => { filters.category = e.target.value; rerender(); });
  root.querySelector('#f-member').addEventListener('change', (e) => { filters.member = e.target.value; rerender(); });
  root.querySelector('#f-keyword').addEventListener('input', (e) => { filters.keyword = e.target.value; rerender(); });
  root.querySelectorAll('[data-delete]').forEach((btn) => btn.addEventListener('click', () => {
    deleteRecord(state, btn.dataset.delete);
    actions.toast('这一笔已从账本里划掉');
    rerender();
  }));
  const keywordInput = root.querySelector('#f-keyword');
  if (filters.keyword && document.activeElement !== keywordInput) {
    keywordInput.focus();
    keywordInput.setSelectionRange(keywordInput.value.length, keywordInput.value.length);
  }
}
