import {createElement} from '../framework/render.js';

function createHabitCardTemplate(habit) {
  const progressButtons = habit.progress.map((day, index) => {
    const dayNumber = index + 1;
    return `
      <button 
        class="progress-btn ${day.status}" 
        aria-label="День ${dayNumber}: ${day.status === 'completed' ? 'выполнено' : 'не выполнено'}"
        data-habit-id="${habit.id}"
        data-day="${dayNumber}"
      ></button>
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
      <p>Текущая серия: <span class="streak">🔥${habit.currentStreak} ${habit.currentStreak === 1 ? 'день' : 'дня'}</span></p>
      <p>Последние 7 дней:</p>
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