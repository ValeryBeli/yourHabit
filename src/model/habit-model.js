import { StatDefaults, UserAction, UpdateType, DaysOfWeek } from '../const.js';
import Observable from '../framework/observable.js';
import { debounce } from '../utils.js';

export default class HabitModel extends Observable {
  #habitsApiService = null;
  #habits = [];
  #stats = {};
  #weekProgressHistory = []; 
  #pendingUpdates = new Map();
  #saveToServerDebounced;

  constructor({habitsApiService}) {
    super();
    this.#habitsApiService = habitsApiService;
    this.#stats = { 
      today: { completed: 0, total: 0 },
      currentStreak: StatDefaults.CURRENT_STREAK,
      bestStreak: StatDefaults.BEST_STREAK
    };
    
    this.#saveToServerDebounced = debounce(this.#savePendingUpdates.bind(this), 500);
  }

  get habits() {
    return this.#habits;
  }

  get stats() {
    return this.#stats;
  }

  getHabitById(id) {
    return this.#habits.find(habit => habit.id === id);
  }

  getStatByType(type) {
    return this.#stats[type];
  }

  getWeekProgress() {
    return this.#weekProgressHistory;
  }

  async init() {
    try {
      const habits = await this.#habitsApiService.habits;
      
      this.#processHabitsData(habits);
      this._notify(UpdateType.INIT);
      
    } catch(err) {
      console.error('Ошибка загрузки привычек с API:', err);
      this.#processHabitsData([]);
      this._notify(UpdateType.INIT);
    }
  }

  #processHabitsData(habitsData) {
    this.#habits = habitsData.map(habit => {
      let progress;
      
      if (Array.isArray(habit.progress)) {
        progress = habit.progress.map(p => ({
          day: typeof p.day === 'string' ? parseInt(p.day) : (p.day || 1),
          status: p.status || 'pending'
        }));
        
        progress.sort((a, b) => a.day - b.day);
        
        if (progress.length < 7) {
          for (let i = progress.length; i < 7; i++) {
            progress.push({ day: i + 1, status: 'pending' });
          }
        }
      } else {
        progress = Array(7).fill().map((_, index) => ({
          day: index + 1,
          status: 'pending'
        }));
      }
      
      return {
        id: habit.id?.toString() || Date.now().toString(),
        title: habit.title || 'Новая привычка',
        description: habit.description || '',
        currentStreak: Number(habit.currentStreak) || 0,
        progress: progress
      };
    });
    
    this.#initializeWeekProgressHistory();
    this.#recalculateTodayStats();
    this.#habits.forEach(habit => this.#recalculateStreak(habit));
  }

  async #savePendingUpdates() {
    if (this.#pendingUpdates.size === 0) return;
    
    const updates = Array.from(this.#pendingUpdates.values());
    this.#pendingUpdates.clear();
    
    for (const update of updates) {
      try {
        await this.#habitsApiService.updateHabit(update);
      } catch (err) {
        console.warn(`Failed to save habit ${update.id}:`, err.message);
        this.#pendingUpdates.set(update.id, update);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async updateHabitProgress(habitId, day, status) {
    const habitIndex = this.#habits.findIndex(h => h.id === habitId);
    if (habitIndex === -1) return;
    
    const habit = this.#habits[habitIndex];
    const dayIndex = habit.progress.findIndex(p => p.day === day);
    if (dayIndex === -1) return;
    
    const wasCompleted = habit.progress[dayIndex].status === 'completed';
    habit.progress[dayIndex].status = status;
    
    this.#updateWeekProgressHistory(day, wasCompleted, status === 'completed');
    
    this.#recalculateStreak(habit);
    this.#recalculateTodayStats();
    
    this._notify(UserAction.UPDATE_HABIT_PROGRESS, {
      habitId,
      day,
      status,
      habit
    });
    
    const habitToSave = {
      id: habit.id,
      title: habit.title,
      description: habit.description,
      currentStreak: habit.currentStreak,
      progress: [...habit.progress]
    };
    
    this.#pendingUpdates.set(habitId, habitToSave);
    this.#saveToServerDebounced();
  }

  #initializeWeekProgressHistory() {
    this.#weekProgressHistory = [];
    const totalHabits = this.#habits.length;
    
    for (let day = 1; day <= 7; day++) {
      let completedCount = 0;
      
      this.#habits.forEach(habit => {
        const dayProgress = habit.progress.find(p => p.day === day);
        if (dayProgress && dayProgress.status === 'completed') {
          completedCount++;
        }
      });
      
      this.#weekProgressHistory.push({
        day: day,
        completed: completedCount,
        total: totalHabits
      });
    }
    
  }

  #updateWeekProgressHistory(day, wasCompleted, isNowCompleted) {
    const dayIndex = day - 1; 
    
    if (dayIndex >= 0 && dayIndex < this.#weekProgressHistory.length) {
      if (!wasCompleted && isNowCompleted) {
        this.#weekProgressHistory[dayIndex].completed += 1;
      } else if (wasCompleted && !isNowCompleted) {
        this.#weekProgressHistory[dayIndex].completed = Math.max(
          0, 
          this.#weekProgressHistory[dayIndex].completed - 1
        );
      }
      
    }
  }

  async addHabit(habitData) {
    const newHabit = {
      title: habitData.title,
      description: habitData.description,
      currentStreak: 0,
      progress: Array(7).fill().map((_, index) => ({
        day: index + 1,
        status: 'pending'
      }))
    };
    
    try {
      const createdHabit = await this.#habitsApiService.addHabit(newHabit);
      this.#habits.push(createdHabit);
      
      this.#updateWeekHistoryForNewHabit();
      
      this.#recalculateTodayStats();
      
      this._notify(UserAction.ADD_HABIT, createdHabit);
      return createdHabit;
      
    } catch (err) {
      console.error('Error adding habit:', err);
      throw err;
    }
  }

  #updateWeekHistoryForNewHabit() {
    this.#weekProgressHistory.forEach(day => {
      day.total += 1;
    });
    
    const newHabit = this.#habits[this.#habits.length - 1];
    newHabit.progress.forEach(dayProgress => {
      if (dayProgress.status === 'completed') {
        const dayIndex = dayProgress.day - 1;
        if (dayIndex >= 0 && dayIndex < this.#weekProgressHistory.length) {
          this.#weekProgressHistory[dayIndex].completed += 1;
        }
      }
    });
  }

  async updateHabit(id, habitData) {
    const index = this.#habits.findIndex(habit => habit.id === id);
    if (index !== -1) {
      const updatedHabit = {
        ...this.#habits[index],
        title: habitData.title,
        description: habitData.description
      };
      
      try {
        const savedHabit = await this.#habitsApiService.updateHabit(updatedHabit);
        this.#habits[index] = savedHabit;
        
        this._notify(UserAction.UPDATE_HABIT, savedHabit);
        return savedHabit;
      } catch (err) {
        console.error('Error updating habit:', err);
        throw err;
      }
    }
    return null;
  }

  async deleteHabit(id) {
    const index = this.#habits.findIndex(habit => habit.id === id);
    if (index !== -1) {
      try {
        const deletedHabit = this.#habits[index];
        
        this.#updateWeekHistoryForDeletedHabit(deletedHabit);
        
        await this.#habitsApiService.deleteHabit(id);
        this.#habits.splice(index, 1);
        this.#recalculateTodayStats();
        
        this._notify(UserAction.DELETE_HABIT, deletedHabit);
        return true;
      } catch (err) {
        console.error('Error deleting habit:', err);
        throw err;
      }
    }
    return false;
  }

  #updateWeekHistoryForDeletedHabit(habit) {
    this.#weekProgressHistory.forEach(day => {
      day.total -= 1;
    });
    
    habit.progress.forEach(dayProgress => {
      if (dayProgress.status === 'completed') {
        const dayIndex = dayProgress.day - 1;
        if (dayIndex >= 0 && dayIndex < this.#weekProgressHistory.length) {
          this.#weekProgressHistory[dayIndex].completed = Math.max(
            0, 
            this.#weekProgressHistory[dayIndex].completed - 1
          );
        }
      }
    });
  }

  #recalculateStreak(habit) {
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (let i = 0; i < habit.progress.length; i++) {
      if (habit.progress[i].status === 'completed') {
        currentStreak++; 
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0; 
      }
    }
    
    habit.currentStreak = maxStreak;
  }

  #recalculateTodayStats() {
    const totalHabits = this.#habits.length;
    let completedToday = 0;

    const TODAY_DAY = 7; 

    this.#habits.forEach(habit => {
      const todayProgress = habit.progress.find(p => p.day === TODAY_DAY);
      if (todayProgress && todayProgress.status === 'completed') {
        completedToday++;
      }
    });

    this.#stats.today = {
      completed: completedToday,
      total: totalHabits
    };
  }

  getTodayProgress() {
    const TODAY_DAY = 7;
    return this.#habits.map(habit => {
      const todayProgress = habit.progress.find(p => p.day === TODAY_DAY);
      return {
        habitId: habit.id,
        completed: todayProgress && todayProgress.status === 'completed'
      };
    });
  }
}