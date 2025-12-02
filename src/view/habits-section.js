import {createElement} from '../framework/render.js';

function createHabitsSectionTemplate() {
  return `
    <section class="habits-section">
      <h2>Список привычек</h2>
      <button class="add-habit-btn">Добавить привычку</button>
      <div class="habits-list"></div>
    </section>
  `;
}

export default class HabitsSection {
  getTemplate() {
    return createHabitsSectionTemplate();
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