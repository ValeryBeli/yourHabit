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