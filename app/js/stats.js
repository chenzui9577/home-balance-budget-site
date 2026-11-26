// 统计页：本月支出分类环形图、近六个月收支柱状图，以及从数据里读出来的几句实在话。
import { monthTotals, recordsOfMonth } from './store.js';
import { EXPENSE_CATEGORIES } from './categories.js';
import { formatMoney, shiftMonth } from './utils.js';
import { drawDonut, drawBars } from './charts.js';

export function renderStats(root, state, monthKey, actions) {
  const totals = monthTotals(state, monthKey);
  const monthRecords = recordsOfMonth(state, monthKey);
  const slices = EXPENSE_CATEGORIES
    .map((c) => ({ name: c.name, color: c.color, value: monthRecords.filter((r) => r.type === 'expense' && r.category === c.id).reduce((s, r) => s + r.amount, 0) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value);
  const daysElapsed = monthKey === new Date().toISOString().slice(0, 7) ? new Date().getDate() : 30;
  const dailyAvg = totals.expense / Math.max(1, daysElapsed);
  const top = slices[0];
  const rate = totals.income > 0 ? Math.round(((totals.income - totals.expense) / totals.income) * 100) : 0;
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const mk = shiftMonth(monthKey, -i);
    const t = monthTotals(state, mk);
    months.push({ label: `${Number(mk.slice(5))}月`, income: t.income, expense: t.expense });
  }

  root.innerHTML = `
    <div class="two-col" style="margin-top:0">
      <div class="card">
        <h3 class="card-title">近六个月收支</h3>
        <p class="card-hint">绿色是收入，橙色是支出；柱子挨得越近，这个月过得越紧。</p>
        <div style="margin-top:14px"><canvas id="stats-bars" class="chart"></canvas></div>
        <div class="legend" style="flex-direction:row;gap:18px;margin-top:6px">
          <span class="legend-row"><span class="dot" style="background:#5d9463"></span>收入</span>
          <span class="legend-row"><span class="dot" style="background:#e07840"></span>支出</span>
        </div>
      </div>
      <div class="card">
        <h3 class="card-title">本月支出构成</h3>
        <p class="card-hint">钱花在哪儿，一张图说清。</p>
        <div class="chart-wrap" style="margin-top:12px">
          <canvas id="stats-donut" class="chart" width="230" height="230"></canvas>
          <div class="legend">${slices.map((s) => `<div class="legend-row"><span class="dot" style="background:${s.color}"></span>${s.name}<span class="amt">${formatMoney(s.value)}</span></div>`).join('') || '<span class="card-hint">本月暂无支出</span>'}</div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3 class="card-title">账本里的小发现</h3>
      <p class="card-hint">不是报表腔，是把数字翻译成过日子的话。</p>
      <ul class="insight-list" style="margin-top:10px">
        ${top ? `<li>本月花得最多的是「${top.name}」，共 ${formatMoney(top.value)}，占全部支出的 ${Math.round((top.value / Math.max(1, totals.expense)) * 100)}%。</li>` : '<li>本月还没有支出记录。</li>'}
        <li>平均每天花 ${formatMoney(dailyAvg)}，差不多是一家人两顿饭钱的水平。</li>
        <li>本月结余率 ${rate}%。理财师常说留住两成算健康，咱家这个数${rate >= 20 ? '已经达标，值得表扬。' : '还差一点，下个月从最大项开始收一收。'}</li>
        <li>近六个月收入最稳的是工资，偶尔的奖金和理财收益像生活里的小惊喜，别拿它们当固定盘子花。</li>
      </ul>
    </div>`;

  const bars = root.querySelector('#stats-bars');
  if (bars) drawBars(bars, months);
  const donut = root.querySelector('#stats-donut');
  if (donut) drawDonut(donut, slices, '本月支出', formatMoney(totals.expense));
}
