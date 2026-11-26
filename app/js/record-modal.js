// 记一笔弹窗：收支类型切换、分类随类型联动、表单校验与保存，是全站最高频的入口。
import { MEMBERS, addRecord } from './store.js';
import { categoriesForType } from './categories.js';

export function setupRecordModal(state, actions) {
  const backdrop = document.getElementById('record-modal');
  const form = document.getElementById('record-form');
  const amountInput = document.getElementById('field-amount');
  const categorySelect = document.getElementById('field-category');
  const memberSelect = document.getElementById('field-member');
  const dateInput = document.getElementById('field-date');
  const noteInput = document.getElementById('field-note');
  const expenseBtn = document.getElementById('type-expense');
  const incomeBtn = document.getElementById('type-income');
  let currentType = 'expense';

  memberSelect.innerHTML = MEMBERS.map((m) => `<option value="${m.id}">${m.name}</option>`).join('');

  function fillCategories() {
    categorySelect.innerHTML = categoriesForType(currentType)
      .map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  }
  function setType(type) {
    currentType = type;
    expenseBtn.classList.toggle('active', type === 'expense');
    incomeBtn.classList.toggle('active', type === 'income');
    fillCategories();
  }
  expenseBtn.addEventListener('click', () => setType('expense'));
  incomeBtn.addEventListener('click', () => setType('income'));

  function open() {
    setType('expense');
    form.reset();
    dateInput.value = new Date().toISOString().slice(0, 10);
    backdrop.hidden = false;
    setTimeout(() => amountInput.focus(), 30);
  }
  function close() { backdrop.hidden = true; }

  document.getElementById('add-record-btn').addEventListener('click', open);
  document.getElementById('modal-close').addEventListener('click', close);
  document.getElementById('modal-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !backdrop.hidden) close(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Math.round((Number(amountInput.value) || 0) * 100) / 100;
    if (amount <= 0) { actions.toast('金额要大于 0 哦'); return; }
    if (!dateInput.value) { actions.toast('选个日期吧'); return; }
    addRecord(state, {
      type: currentType,
      amount,
      category: categorySelect.value,
      member: memberSelect.value,
      date: dateInput.value,
      note: noteInput.value.trim(),
    });
    close();
    actions.toast(currentType === 'income' ? '进账记好了，辛苦啦' : '记好了，花钱有数，心里不慌');
    actions.afterRecord(dateInput.value);
  });

  return { open };
}
