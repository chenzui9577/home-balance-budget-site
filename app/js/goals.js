// 储蓄目标页：心愿清单与进度、随手存入一笔、新建目标，达成时给一句像样的祝贺。
import { addGoal, contributeGoal } from './store.js';
import { formatMoney, escapeHtml } from './utils.js';

export function renderGoals(root, state, monthKey, actions) {
  root.innerHTML = `
    <div class="goal-grid">
      ${state.goals.map((g) => {
        const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
        const done = g.saved >= g.target;
        return `
        <div class="card goal-card">
          <div class="goal-top">
            <div>
              <div class="goal-name">${escapeHtml(g.name)}</div>
              <div class="goal-nums">已攒 ${formatMoney(g.saved)} / 目标 ${formatMoney(g.target)} · ${pct}%${done ? '<br>🎉 这个心愿已经攒满了，全家都值得表扬！' : `<br>还差 ${formatMoney(g.target - g.saved)}，按每月存入的节奏，胜利在望。`}</div>
            </div>
            <div class="goal-emoji">${g.emoji}</div>
          </div>
          <div class="progress"><div class="progress-fill ok" style="width:${pct}%"></div></div>
          ${done ? '<div style="margin-top:12px"><span class="chip good">✓ 已达成</span></div>' : `
          <div class="goal-actions">
            <button class="small-btn" type="button" data-give="${g.id}" data-amt="100">存入 ¥100</button>
            <button class="small-btn" type="button" data-give="${g.id}" data-amt="500">存入 ¥500</button>
            <input type="number" min="1" step="1" placeholder="自定义金额" data-custom-input="${g.id}">
            <button class="small-btn" type="button" data-give-custom="${g.id}">存入</button>
          </div>`}
        </div>`;
      }).join('')}
    </div>
    <div class="card" style="margin-top:16px">
      <h3 class="card-title">再添一个心愿</h3>
      <p class="card-hint">目标不用宏大，一台洗衣机、一次旅行，都是日子向前的样子。</p>
      <form id="goal-form" style="margin-top:14px">
        <div class="form-grid">
          <label class="field">目标名称<input id="goal-name" required maxlength="24" placeholder="比如：全家去大理住一周"></label>
          <label class="field">小图标
            <select id="goal-emoji">
              <option>✈️</option><option>🏠</option><option>🚗</option><option>📚</option><option>🎁</option><option>🌱</option><option>💻</option><option>🐱</option>
            </select>
          </label>
          <label class="field">目标金额（元）<input id="goal-target" type="number" min="1" step="1" required placeholder="10000"></label>
          <label class="field">先存入（元）<input id="goal-seed" type="number" min="0" step="1" value="0"></label>
        </div>
        <div style="margin-top:14px"><button class="primary-btn" type="submit">把心愿钉在墙上</button></div>
      </form>
    </div>`;

  root.querySelectorAll('[data-give]').forEach((btn) => btn.addEventListener('click', () => {
    const goal = contributeGoal(state, btn.dataset.give, Number(btn.dataset.amt));
    actions.toast(goal && goal.saved >= goal.target ? '🎉 目标达成！这份坚持值得庆祝' : '已存入，离心愿又近一步');
    actions.rerender();
  }));
  root.querySelectorAll('[data-give-custom]').forEach((btn) => btn.addEventListener('click', () => {
    const input = root.querySelector(`[data-custom-input="${btn.dataset.giveCustom}"]`);
    const amount = Math.max(0, Math.round(Number(input.value) || 0));
    if (!amount) { actions.toast('先填一个金额吧'); return; }
    contributeGoal(state, btn.dataset.giveCustom, amount);
    actions.toast('已存入，积少成多');
    actions.rerender();
  }));
  root.querySelector('#goal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    addGoal(state, {
      name: root.querySelector('#goal-name').value.trim(),
      emoji: root.querySelector('#goal-emoji').value,
      target: Math.max(1, Math.round(Number(root.querySelector('#goal-target').value) || 0)),
      saved: Math.max(0, Math.round(Number(root.querySelector('#goal-seed').value) || 0)),
    });
    actions.toast('新心愿已经上墙啦');
    actions.rerender();
  });
}
