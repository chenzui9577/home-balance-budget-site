// 通用小工具：金额与日期格式化、月份运算、数字滚动动画和一句温暖评语的生成。
export function formatMoney(value) {
  const rounded = Math.round(value * 100) / 100;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return '¥' + text.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatSigned(record) {
  return (record.type === 'income' ? '+' : '−') + formatMoney(record.amount);
}

export function monthKeyOf(dateText) {
  return dateText.slice(0, 7);
}

export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number);
  const d = new Date(year, month - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return `${year} 年 ${month} 月`;
}

export function prettyDate(dateText) {
  const [, month, day] = dateText.split('-').map(Number);
  const weekday = '日一二三四五六'[new Date(dateText + 'T12:00:00').getDay()];
  return `${month}月${day}日 · 周${weekday}`;
}

export function animateNumber(element, target) {
  const start = performance.now();
  const duration = 650;
  const from = 0;
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    element.textContent = formatMoney(from + (target - from) * eased);
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export function savingsComment(rate, isCurrentMonth) {
  if (rate >= 0.35) return { big: '这个月攒得很漂亮', small: '结余率超过三成，年底的旅行基金又近了一步。继续保持这个节奏，日子会越过越松弛。' };
  if (rate >= 0.2) return { big: '收支平衡得刚刚好', small: '收入里有两成稳稳留了下来，像院子里慢慢攒满的米缸，不慌不忙。' };
  if (rate >= 0) return { big: '这个月稍微有点紧', small: isCurrentMonth ? '还没到月底，先看看餐饮和购物两项，小漏通常都在那里。' : '那个月花得比较满，好在没有透支，复盘一下就好。' };
  return { big: '这个月超支了，别灰心', small: '账本的意义就是早发现。把大项圈出来，下个月一点点扳回来，一家人一起想办法。' };
}

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
