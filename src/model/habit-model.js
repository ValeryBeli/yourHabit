import { habits, stats } from '../mock/habit.js';
import { StatDefaults, UserAction, UpdateType } from '../const.js';
import Observable from '../framework/observable.js';

export default class HabitModel extends Observable {
  #habitsApiService = null;
  #habits = [];
  #stats = {};
  #progressHistory = [];

  constructor({habitsApiService}) {
    super();
    this.#habitsApiService = habitsApiService;
    this.#stats = { 
      today: { completed: 0, total: 0 },
      currentStreak: StatDefaults.CURRENT_STREAK,
      bestStreak: StatDefaults.BEST_STREAK
    };
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

  getProgressHistory() {
    return this.#progressHistory;
  }

  async init() {
    try {
      const habits = await this.#habitsApiService.habits;
        
        this.#habits = habits.map(habit => ({
          id: habit.id,
          title: habit.title,
          description: habit.description || '',
          currentStreak: habit.currentStreak || 0,
          progress: habit.progress || Array(7).fill().map((_, index) => ({
            day: index + 1,
            status: 'pending'
          }))
        }));
        
        this.#initializeProgressHistory();
        this.#recalculateTodayStats();
        this.#habits.forEach(habit => this.#recalculateStreak(habit));
        
        this._notify(UpdateType.INIT);
      } catch(err) {
        console.error('Ошибка загрузки привычек:', err);
        this.#habits = [];
        this._notify(UpdateType.INIT);
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
      this.#recalculateTodayStats();
      this.#updateProgressHistoryForNewHabit();
      
      this._notify(UserAction.ADD_HABIT, createdHabit);
      return createdHabit;
    } catch (err) {
      console.error('Ошибка при добавлении привычки на сервер:', err);
      throw err;
    }
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
        console.error('Ошибка при обновлении привычки на сервер:', err);
        throw err;
      }
    }
    return null;
  }

  async deleteHabit(id) {
    const index = this.#habits.findIndex(habit => habit.id === id);
    if (index !== -1) {
      try {
        await this.#habitsApiService.deleteHabit(id);
        const deletedHabit = this.#habits[index];
        
        this.#updateProgressHistoryForDeletedHabit(deletedHabit);
        this.#habits.splice(index, 1);
        this.#recalculateTodayStats();
        
        this._notify(UserAction.DELETE_HABIT, deletedHabit);
        return true;
      } catch (err) {
        console.error('Ошибка при удалении привычки с сервера:', err);
        throw err;
      }
    }
    return false;
  }

  async updateHabitProgress(habitId, day, status) {
    const habit = this.getHabitById(habitId);
    if (habit) {
      const dayProgress = habit.progress.find(p => p.day === day);
      if (dayProgress) {
        const wasCompleted = dayProgress.status === 'completed';
        dayProgress.status = status;
        
        try {
          const updatedHabit = await this.#habitsApiService.updateHabit(habit);
          const index = this.#habits.findIndex(h => h.id === habitId);
          this.#habits[index] = updatedHabit;
          
          if (day === 1) {
            this.#updateTodayInProgressHistory(wasCompleted, status === 'completed');
          }
          
          this.#recalculateStreak(habit);
          this.#recalculateTodayStats();
          
          this._notify(UserAction.UPDATE_HABIT_PROGRESS, {
            habitId,
            day,
            status,
            habit: updatedHabit
          });
        } catch (err) {
          console.error('Ошибка при обновлении прогресса на сервере:', err);
          throw err;
        }
      }
    }
  }

  #initializeProgressHistory() {
    this.#progressHistory = [];
    const totalHabits = this.#habits.length;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      let completedToday;
      
      if (i === 29) {
        completedToday = this.#calculateTodayCompleted();
      } else {
        completedToday = this.#generateRealisticPastData(i, totalHabits);
      }
      
      this.#progressHistory.push({
        date: date.toISOString().split('T')[0],
        completed: completedToday,
        total: totalHabits
      });
    }
  }

  #calculateTodayCompleted() {
    const TODAY_DAY = 1;
    let completedToday = 0;
    
    this.#habits.forEach(habit => {
      const todayProgress = habit.progress.find(p => p.day === TODAY_DAY);
      if (todayProgress && todayProgress.status === 'completed') {
        completedToday++;
      }
    });
    
    return completedToday;
  }

  #generateRealisticPastData(dayOffset, totalHabits) {
    const randomFactor = Math.random();
    const dayOfWeek = (new Date().getDay() - dayOffset + 7) % 7;
    
    if (dayOfWeek <= 2) {
      if (randomFactor < 0.4) return totalHabits;
      if (randomFactor < 0.7) return Math.floor(totalHabits * 0.8);
      return Math.floor(totalHabits * 0.6);
    } else if (dayOfWeek <= 4) {
      if (randomFactor < 0.3) return totalHabits;
      if (randomFactor < 0.6) return Math.floor(totalHabits * 0.7);
      return Math.floor(totalHabits * 0.5);
    } else {
      if (randomFactor < 0.2) return totalHabits;
      if (randomFactor < 0.5) return Math.floor(totalHabits * 0.6);
      return Math.floor(totalHabits * 0.4);
    }
  }

  #updateProgressHistoryForNewHabit() {
    this.#progressHistory.forEach(day => {
      day.total += 1;
    });
  }

  #updateProgressHistoryForDeletedHabit(habit) {
    const TODAY_DAY = 1;
    const todayProgress = habit.progress.find(p => p.day === TODAY_DAY);
    const wasCompletedToday = todayProgress && todayProgress.status === 'completed';
    
    this.#progressHistory.forEach(day => {
      day.total -= 1;
      if (day.date === this.#getTodayDate() && wasCompletedToday) {
        day.completed = Math.max(0, day.completed - 1);
      }
    });
  }

  #getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  #updateTodayInProgressHistory(wasCompleted, isNowCompleted) {
    const today = this.#getTodayDate();
    const todayRecord = this.#progressHistory.find(day => day.date === today);
    
    if (todayRecord) {
      if (!wasCompleted && isNowCompleted) {
        todayRecord.completed += 1;
      } else if (wasCompleted && !isNowCompleted) {
        todayRecord.completed = Math.max(0, todayRecord.completed - 1);
      }
    }
  }

  #recalculateStreak(habit) {
    let streak = 0;
    
    for (let i = 0; i < habit.progress.length; i++) {
      if (habit.progress[i].status === 'completed') {
        streak++;
      } else {
        break;
      }
    }
    
    habit.currentStreak = streak;
  }

  #recalculateTodayStats() {
    const totalHabits = this.#habits.length;
    let completedToday = 0;

    const TODAY_DAY = 1;

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
    const TODAY_DAY = 1;
    return this.#habits.map(habit => {
      const todayProgress = habit.progress.find(p => p.day === TODAY_DAY);
      return {
        habitId: habit.id,
        completed: todayProgress && todayProgress.status === 'completed'
      };
    });
  }
}