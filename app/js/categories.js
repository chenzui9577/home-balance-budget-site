// 收支分类的定义：名称、专属颜色与内联 SVG 图标路径，全站统一从这里取。
const icon = (body) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const EXPENSE_CATEGORIES = [
  { id: 'food', name: '餐饮', color: '#e07840', icon: icon('<path d="M4 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3"/><path d="M6 3v18"/><path d="M20 15V3a5 5 0 0 0-4 5v6a2 2 0 0 0 2 2h2Zm0 0v6"/>') },
  { id: 'transport', name: '交通', color: '#4a7fb5', icon: icon('<path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11"/><rect x="3" y="11" width="18" height="6" rx="2"/><circle cx="7.5" cy="17.5" r="1.6"/><circle cx="16.5" cy="17.5" r="1.6"/>') },
  { id: 'housing', name: '居住', color: '#8a6fb8', icon: icon('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-5h4v5"/>') },
  { id: 'shopping', name: '购物', color: '#d95f8e', icon: icon('<path d="M5 8h14l-1.2 12a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10"/>') },
  { id: 'medical', name: '医疗', color: '#c4503c', icon: icon('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>') },
  { id: 'education', name: '教育', color: '#3f8f7a', icon: icon('<path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4Z"/><path d="M6 10.8V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.2"/>') },
  { id: 'fun', name: '娱乐', color: '#d9a441', icon: icon('<circle cx="12" cy="12" r="9"/><path d="M9 9.5c.6 1 1.4 1.5 3 1.5s2.4-.5 3-1.5"/><path d="M8.8 15.2c.9 1.2 2 1.8 3.2 1.8s2.3-.6 3.2-1.8"/><circle cx="9" cy="10" r="0.4" fill="currentColor"/><circle cx="15" cy="10" r="0.4" fill="currentColor"/>') },
  { id: 'kids', name: '孩子', color: '#e08bb0', icon: icon('<circle cx="12" cy="8" r="3.4"/><path d="M5 20c.8-3.4 3.6-5 7-5s6.2 1.6 7 5"/>') },
  { id: 'pet', name: '宠物', color: '#a0714f', icon: icon('<circle cx="7" cy="8" r="1.8"/><circle cx="12" cy="5.8" r="1.8"/><circle cx="17" cy="8" r="1.8"/><path d="M12 11c3 0 5.4 2.3 5.4 4.8 0 1.9-1.5 3-3.3 2.6-1.2-.3-2-.3-3.2 0C8.1 18.8 6.6 17.7 6.6 15.8 6.6 13.3 9 11 12 11Z"/>') },
  { id: 'other-expense', name: '其他支出', color: '#8a7663', icon: icon('<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>') },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', name: '工资', color: '#5d9463', icon: icon('<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18"/><path d="M7 15h4"/>') },
  { id: 'bonus', name: '奖金', color: '#d9a441', icon: icon('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v9M9.2 9.6c.6-1 1.6-1.4 2.8-1.4 1.5 0 2.7.9 2.7 2.1 0 2.9-5.6 1.7-5.6 4.4 0 1.2 1.3 2.1 2.9 2.1 1.2 0 2.3-.5 2.9-1.4"/>') },
  { id: 'invest', name: '理财收益', color: '#3f8f7a', icon: icon('<path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 15.5 11 10l3 3 4.5-6"/><path d="M15 7h3.5v3.5"/>') },
  { id: 'other-income', name: '其他收入', color: '#8a7663', icon: icon('<path d="M12 3v18"/><path d="M7 7.5C7 5.6 9.2 4.5 12 4.5s5 1.1 5 3-2 2.6-5 3.2-5 1.4-5 3.3 2.2 3 5 3 5-1.1 5-3"/>') },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function categoryById(id) {
  return ALL_CATEGORIES.find((c) => c.id === id) ?? ALL_CATEGORIES[ALL_CATEGORIES.length - 1];
}

export function categoriesForType(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
