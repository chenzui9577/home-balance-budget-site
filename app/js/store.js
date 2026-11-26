// 账本数据层：状态的读取、保存（localStorage）、首次打开时的示例数据与全部增删改操作。
import { currentMonthKey, shiftMonth } from './utils.js';

const STORAGE_KEY = 'xiaoman-ledger-v1';

export const MEMBERS = [
  { id: 'dad', name: '林大山', role: '爸爸 · 程序员', color: '#4a7fb5' },
  { id: 'mom', name: '苏晴', role: '妈妈 · 小学老师', color: '#e07840' },
  { id: 'kid', name: '林朵朵', role: '女儿 · 三年级', color: '#e08bb0' },
  { id: 'grandpa', name: '林根宝', role: '爷爷 · 退休在家', color: '#5d9463' },
];

export function memberById(id) {
  return MEMBERS.find((m) => m.id === id) ?? MEMBERS[0];
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `r${Date.now().toString(36)}${idCounter}`;
}

// 示例流水的剧本：[距今几个月, 几号, 类型, 分类, 金额, 成员, 备注]
const SEED_SCRIPT = [
  [0, 1, 'expense', 'housing', 4200, 'dad', '十一月房租，房东阿姨照例送了柚子'],
  [0, 2, 'income', 'salary', 16800, 'dad', '大山十一月工资到账'],
  [0, 3, 'expense', 'food', 386, 'mom', '周末菜市场：排骨、莲藕和一袋橘子'],
  [0, 4, 'expense', 'transport', 220, 'dad', '给电动车和汽车都加满了油'],
  [0, 5, 'income', 'salary', 9200, 'mom', '苏晴十一月工资到账'],
  [0, 6, 'expense', 'kids', 680, 'mom', '朵朵的秋季校外陶艺课'],
  [0, 7, 'expense', 'food', 158, 'grandpa', '爷爷买的活鲈鱼，晚上清蒸'],
  [0, 8, 'expense', 'shopping', 459, 'mom', '给朵朵添了冬天的羽绒服'],
  [0, 9, 'expense', 'medical', 96, 'grandpa', '爷爷的降压药，医保后自付'],
  [0, 10, 'expense', 'pet', 210, 'kid', '给橘猫「年糕」囤的猫粮'],
  [0, 12, 'expense', 'food', 264, 'dad', '一家四口去吃了巷口的羊肉汤'],
  [0, 13, 'expense', 'education', 320, 'dad', '朵朵的英语绘本和练习册'],
  [0, 14, 'expense', 'fun', 180, 'mom', '周末带朵朵看动画电影'],
  [0, 15, 'income', 'invest', 412, 'dad', '货币基金这个月的收益'],
  [0, 16, 'expense', 'housing', 386, 'mom', '水电燃气和物业费'],
  [0, 18, 'expense', 'food', 298, 'mom', '火锅食材，爷爷说要吃辣锅'],
  [0, 19, 'expense', 'shopping', 899, 'dad', '换了用了五年的旧手机壳和耳机'],
  [0, 20, 'expense', 'transport', 145, 'mom', '这个月的地铁和公交卡充值'],
  [0, 21, 'expense', 'food', 132, 'grandpa', '早市的豆浆油条和新鲜豆腐'],
  [0, 22, 'expense', 'fun', 260, 'dad', '订阅了一年的家庭音乐会员'],
  [1, 1, 'expense', 'housing', 4200, 'dad', '十月房租'],
  [1, 2, 'income', 'salary', 16800, 'dad', '大山十月工资到账'],
  [1, 5, 'income', 'salary', 9200, 'mom', '苏晴十月工资到账'],
  [1, 6, 'expense', 'food', 412, 'mom', '国庆聚餐，在家做了八个菜'],
  [1, 9, 'expense', 'shopping', 1280, 'mom', '换季衣物，全家一起挑的'],
  [1, 11, 'expense', 'kids', 540, 'dad', '朵朵的游泳课续费'],
  [1, 14, 'expense', 'medical', 230, 'mom', '苏晴的牙科检查'],
  [1, 15, 'income', 'invest', 388, 'dad', '货币基金十月收益'],
  [1, 17, 'expense', 'food', 356, 'grandpa', '重阳节给老伙计们备的茶点'],
  [1, 20, 'expense', 'transport', 310, 'dad', '国庆自驾去郊外摘柿子的油费'],
  [1, 23, 'expense', 'housing', 402, 'mom', '水电燃气和物业费'],
  [1, 26, 'expense', 'fun', 198, 'kid', '朵朵的乐高城市系列'],
  [2, 1, 'expense', 'housing', 4200, 'dad', '九月房租'],
  [2, 2, 'income', 'salary', 16800, 'dad', '大山九月工资到账'],
  [2, 5, 'income', 'salary', 9200, 'mom', '苏晴九月工资到账'],
  [2, 7, 'expense', 'education', 2400, 'mom', '朵朵新学期学杂费'],
  [2, 9, 'expense', 'food', 388, 'mom', '开学第一周的菜钱'],
  [2, 12, 'expense', 'shopping', 760, 'dad', '新书包和全家人的运动鞋'],
  [2, 15, 'income', 'bonus', 3000, 'mom', '苏晴的教师节慰问金'],
  [2, 18, 'expense', 'medical', 156, 'grandpa', '爷爷的体检抽血项目'],
  [2, 21, 'expense', 'food', 420, 'dad', '中秋家宴，月饼和大闸蟹'],
  [2, 25, 'expense', 'housing', 395, 'mom', '水电燃气和物业费'],
  [3, 1, 'expense', 'housing', 4200, 'dad', '八月房租'],
  [3, 2, 'income', 'salary', 16800, 'dad', '大山八月工资到账'],
  [3, 5, 'income', 'salary', 9200, 'mom', '苏晴八月工资到账'],
  [3, 8, 'expense', 'fun', 1560, 'dad', '暑假带朵朵去海边两天'],
  [3, 12, 'expense', 'food', 344, 'mom', '夏天的西瓜和绿豆汤材料'],
  [3, 16, 'expense', 'transport', 480, 'dad', '去海边的高铁票'],
  [3, 20, 'expense', 'shopping', 520, 'mom', '防晒和泳衣泳圈'],
  [3, 24, 'expense', 'housing', 468, 'mom', '八月电费高，空调开得多'],
  [4, 1, 'expense', 'housing', 4200, 'dad', '七月房租'],
  [4, 2, 'income', 'salary', 16500, 'dad', '大山七月工资到账'],
  [4, 5, 'income', 'salary', 9200, 'mom', '苏晴七月工资到账'],
  [4, 9, 'expense', 'food', 372, 'grandpa', '爷爷包了三鲜馅饺子'],
  [4, 14, 'expense', 'kids', 890, 'mom', '朵朵的暑期夏令营'],
  [4, 19, 'expense', 'medical', 88, 'kid', '朵朵换牙拔了一颗乳牙'],
  [4, 26, 'expense', 'housing', 452, 'mom', '水电燃气和物业费'],
  [5, 1, 'expense', 'housing', 4200, 'dad', '六月房租'],
  [5, 2, 'income', 'salary', 16500, 'dad', '大山六月工资到账'],
  [5, 5, 'income', 'salary', 9200, 'mom', '苏晴六月工资到账'],
  [5, 10, 'expense', 'food', 398, 'mom', '端午节包粽子的材料'],
  [5, 15, 'income', 'bonus', 5000, 'dad', '大山的半年项目奖金'],
  [5, 18, 'expense', 'shopping', 1150, 'dad', '给爷爷换了新助听器配件'],
  [5, 22, 'expense', 'housing', 410, 'mom', '水电燃气和物业费'],
];

function buildSeedState() {
  const now = currentMonthKey();
  const records = SEED_SCRIPT.map(([monthsAgo, day, type, category, amount, member, note]) => {
    const mk = shiftMonth(now, -monthsAgo);
    return { id: nextId(), date: `${mk}-${String(day).padStart(2, '0')}`, type, category, amount, member, note };
  });
  return {
    records,
    budgets: { food: 2600, transport: 700, housing: 5200, shopping: 1600, medical: 600, education: 900, fun: 800, kids: 1200, pet: 300, 'other-expense': 400 },
    goals: [
      { id: 'g1', name: '春节回老家的团圆之旅', emoji: '🧧', target: 12000, saved: 8600 },
      { id: 'g2', name: '给朵朵的教育金', emoji: '📚', target: 50000, saved: 21300 },
      { id: 'g3', name: '换一台安静的洗衣机', emoji: '🫧', target: 3600, saved: 3600 },
      { id: 'g4', name: '家庭应急小金库', emoji: '🏺', target: 30000, saved: 12750 },
    ],
    theme: 'light',
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.records)) return parsed;
    }
  } catch { /* 本地数据损坏时回退到示例数据 */ }
  const seed = buildSeedState();
  saveState(seed);
  return seed;
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function addRecord(state, record) {
  state.records.unshift({ ...record, id: nextId() });
  saveState(state);
}

export function deleteRecord(state, id) {
  state.records = state.records.filter((r) => r.id !== id);
  saveState(state);
}

export function setBudget(state, categoryId, amount) {
  state.budgets[categoryId] = amount;
  saveState(state);
}

export function addGoal(state, goal) {
  state.goals.push({ ...goal, id: nextId() });
  saveState(state);
}

export function contributeGoal(state, goalId, amount) {
  const goal = state.goals.find((g) => g.id === goalId);
  if (goal) goal.saved = Math.min(goal.target, goal.saved + amount);
  saveState(state);
  return goal;
}

export function recordsOfMonth(state, monthKey) {
  return state.records.filter((r) => r.date.startsWith(monthKey));
}

export function monthTotals(state, monthKey) {
  const list = recordsOfMonth(state, monthKey);
  const income = list.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const expense = list.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  return { income, expense, balance: income - expense, count: list.length };
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  return loadState();
}
