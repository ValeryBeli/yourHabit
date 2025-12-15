import {createElement} from '../framework/render.js';
import {DaysOfWeek} from '../const.js';

function createHabitCardTemplate(habit) {
  const progressButtons = habit.progress.map((day) => {
    const dayName = DaysOfWeek[day.day] || day.day;
    return `
      <button 
        class="progress-btn ${day.status}" 
        aria-label="${dayName}: ${day.status === 'completed' ? 'выполнено' : 'не выполнено'}"
        data-habit-id="${habit.id}"
        data-day="${day.day}"
        title="${dayName}"
      >
        ${dayName}
      </button>
    `;
  }).join('');

  return `
    <div class="habit-card" data-habit-id="${habit.id}">
      <div class="habit-header">
        <h3>${habit.title}</h3>
        <div class="habit-actions">
          <button class="edit-btn" aria-label="Редактировать привычку">✏️</button>
          <button class="delete-btn" aria-label="Удалить привычку">🗑️</button>
        </div>
      </div>
      <p>${habit.description}</p>
      <p>Текущая серия: <span class="streak">${habit.currentStreak}🔥</span></p>
      <p>Отметки за эту неделю :</p>
      <div class="habit-progress">
        ${progressButtons}
      </div>
    </div>
  `;
}

export default class HabitCard {
  #habit = null;

  constructor(habit) {
    this.#habit = habit;
  }

  getTemplate() {
    return createHabitCardTemplate(this.#habit);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}