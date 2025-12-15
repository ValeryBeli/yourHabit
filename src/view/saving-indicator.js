import {createElement} from '../framework/render.js';

function createSavingIndicatorTemplate() {
  return `
    <div class="saving-indicator hidden">
      <div class="saving-spinner"></div>
      <span>Сохранение...</span>
    </div>
  `;
}

export default class SavingIndicator {
  getTemplate() {
    return createSavingIndicatorTemplate();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  show() {
    this.getElement().classList.remove('hidden');
  }

  hide() {
    this.getElement().classList.add('hidden');
  }

  removeElement() {
    this.element = null;
  }
}