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
  [StatType.TODAY]: 'Мой уровень',
  [StatType.CURRENT_STREAK]: 'Текущая серия',
  [StatType.BEST_STREAK]: 'Лучшая серия'
};

export const StatDefaults = {
  CURRENT_STREAK: 1,
  BEST_STREAK: 10
};

export const UserAction = {
  UPDATE_HABIT: 'UPDATE_HABIT',
  ADD_HABIT: 'ADD_HABIT',
  DELETE_HABIT: 'DELETE_HABIT',
  UPDATE_HABIT_PROGRESS: 'UPDATE_HABIT_PROGRESS'
};

export const UpdateType = {
  INIT: 'INIT',
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR'
};

export const DaysOfWeek = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  7: 'Вс'
};