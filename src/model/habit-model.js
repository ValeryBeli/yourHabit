import { habits, stats } from '../mock/habit.js';
import { StatDefaults } from '../const.js';

export default class HabitModel {
  #habits = [];
  #stats = {};

  constructor() {
    this.#habits = [...habits];
    this.#stats = { 
      today: { completed: 0, total: 4 },
      currentStreak: StatDefaults.CURRENT_STREAK, // 3
      bestStreak: StatDefaults.BEST_STREAK // 10
    };
    this.#recalculateTodayStats();
    this.#habits.forEach(habit => this.#recalculateStreak(habit));
  }

  getHabits() {
    return this.#habits;
  }

  getHabitById(id) {
    return this.#habits.find(habit => habit.id === id);
  }

  getStats() {
    return this.#stats;
  }

  getStatByType(type) {
    return this.#stats[type];
  }

  addHabit(habitData) {
    const newHabit = {
      id: Date.now().toString(),
      title: habitData.title,
      description: habitData.description,
      currentStreak: 0,
      progress: Array(7).fill().map((_, index) => ({
        day: index + 1,
        status: 'pending'
      }))
    };
    
    this.#habits.push(newHabit);
    this.#recalculateTodayStats();
    this.#recalculateStreak(newHabit);
    return newHabit;
  }

  updateHabit(id, habitData) {
    const index = this.#habits.findIndex(habit => habit.id === id);
    if (index !== -1) {
      this.#habits[index] = {
        ...this.#habits[index],
        title: habitData.title,
        description: habitData.description
      };
      return this.#habits[index];
    }
    return null;
  }

  deleteHabit(id) {
    const index = this.#habits.findIndex(habit => habit.id === id);
    if (index !== -1) {
      this.#habits.splice(index, 1);
      this.#recalculateTodayStats();
      return true;
    }
    return false;
  }

  updateHabitProgress(habitId, day, status) {
    const habit = this.getHabitById(habitId);
    if (habit) {
      const dayProgress = habit.progress.find(p => p.day === day);
      if (dayProgress) {
        dayProgress.status = status;
        
        this.#recalculateStreak(habit);
        this.#recalculateTodayStats();
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