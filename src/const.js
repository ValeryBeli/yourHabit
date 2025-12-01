export const HabitStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  MISSED: 'missed'
};

export const StatType = {
  TODAY: 'today',
  CURRENT_STREAK: 'current_streak',
  BEST_STREAK: 'best_streak'
};

export const StatTitle = {
  [StatType.TODAY]: 'Выполнено сегодня',
  [StatType.CURRENT_STREAK]: 'Текущая серия',
  [StatType.BEST_STREAK]: 'Лучшая серия'
};

export const StatDefaults = {
  CURRENT_STREAK: 3,
  BEST_STREAK: 10
};