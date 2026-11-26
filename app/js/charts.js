// 图表绘制：用 Canvas 手绘分类支出环形图与近六个月收支柱状图，带高清屏缩放适配。
function setupCanvas(canvas, width, height) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  return ctx;
}

export function drawDonut(canvas, slices, centerLabel, centerValue) {
  const size = 230;
  const ctx = setupCanvas(canvas, size, size);
  const cx = size / 2, cy = size / 2, radius = 88, thickness = 30;
  const total = slices.reduce((s, x) => s + x.value, 0);
  ctx.clearRect(0, 0, size, size);
  if (total <= 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#eadfca';
    ctx.lineWidth = thickness;
    ctx.stroke();
  } else {
    let angle = -Math.PI / 2;
    for (const slice of slices) {
      const sweep = (slice.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, angle + 0.02, angle + sweep - 0.02);
      ctx.strokeStyle = slice.color;
      ctx.lineWidth = thickness;
      ctx.lineCap = 'round';
      ctx.stroke();
      angle += sweep;
    }
  }
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#3d2f23';
  const soft = getComputedStyle(document.documentElement).getPropertyValue('--ink-soft') || '#8a7663';
  ctx.fillStyle = soft;
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(centerLabel, cx, cy - 8);
  ctx.fillStyle = ink;
  ctx.font = 'bold 21px sans-serif';
  ctx.fillText(centerValue, cx, cy + 18);
}

export function drawBars(canvas, months) {
  const width = Math.min(640, canvas.parentElement ? canvas.parentElement.clientWidth - 4 : 640);
  const height = 250;
  const ctx = setupCanvas(canvas, width, height);
  const max = Math.max(...months.flatMap((m) => [m.income, m.expense]), 1);
  const padLeft = 8, padBottom = 30, padTop = 16;
  const plotH = height - padBottom - padTop;
  const groupW = (width - padLeft * 2) / months.length;
  const barW = Math.min(26, groupW / 3.4);
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#3d2f23';
  const soft = getComputedStyle(document.documentElement).getPropertyValue('--ink-soft') || '#8a7663';
  ctx.clearRect(0, 0, width, height);
  months.forEach((m, i) => {
    const gx = padLeft + i * groupW + groupW / 2;
    const incomeH = (m.income / max) * plotH;
    const expenseH = (m.expense / max) * plotH;
    ctx.fillStyle = '#5d9463';
    roundRect(ctx, gx - barW - 3, padTop + plotH - incomeH, barW, incomeH, 5);
    ctx.fill();
    ctx.fillStyle = '#e07840';
    roundRect(ctx, gx + 3, padTop + plotH - expenseH, barW, expenseH, 5);
    ctx.fill();
    ctx.fillStyle = soft;
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, gx, height - 10);
    ctx.fillStyle = ink;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, 0);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
