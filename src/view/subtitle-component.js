import {createElement} from '../framework/render.js';

function createSubtitleTemplate() {
  return `
    <p class="subtitle">Отслеживайте свои привычки и достигайте целей каждый день</p>
  `;
}

export default class SubtitleComponent {
  getTemplate() {
    return createSubtitleTemplate();
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