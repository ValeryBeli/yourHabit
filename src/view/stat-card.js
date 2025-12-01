import {createElement} from '../framework/render.js';
import {StatTitle, StatDefaults} from '../const.js';

function createStatCardTemplate(type, value) {
  let icon = '';
  let displayValue = '';
  let suffix = '';
  
  switch(type) {
    case 'today':
      icon = 'media/done.png';
      displayValue = `${value.completed} из ${value.total}`;
      break;
    case 'current_streak':
      icon = 'media/streak.png';
      const streakValue = value || StatDefaults.CURRENT_STREAK;
      displayValue = `${streakValue}`;
      suffix = streakValue === 1 ? ' день' : ' дня';
      break;
    case 'best_streak':
      icon = 'media/best.png';
      const bestValue = value || StatDefaults.BEST_STREAK;
      displayValue = `${bestValue}`;
      suffix = bestValue === 1 ? ' день' : ' дней';
      break;
  }

  return `
    <div class="stat-card" data-stat-type="${type}">
      <img src="${icon}" alt="${StatTitle[type]}" class="stat-icon">
      <div class="stat-info">
        <p>${StatTitle[type]}</p>
        <span>${displayValue}${suffix}</span>
      </div>
    </div>
  `;
}

export default class StatCard {
  #type = null;
  #value = null;

  constructor(type, value) {
    this.#type = type;
    this.#value = value;
  }

  getTemplate() {
    return createStatCardTemplate(this.#type, this.#value);
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