import {createElement} from '../framework/render.js';
import {StatTitle, StatDefaults} from '../const.js';

function createStatCardTemplate(type, value) {
  let icon = '';
  let displayValue = '';
  let suffix = '';
  
  switch(type) {
    case 'today':
      icon = 'media/done.png';
      displayValue = `5`;
      suffix = ` ( 72% )`;
      break;
  case 'current_streak':
    icon = 'media/streak.png';
    const streakValue = value || StatDefaults.CURRENT_STREAK;
    displayValue = `${streakValue}`;
    
    const streakLastDigit = streakValue % 10;
    const streakLastTwoDigits = streakValue % 100;
    
    if (streakLastTwoDigits >= 11 && streakLastTwoDigits <= 14) {
      suffix = ' дней';
    } else if (streakLastDigit === 1) {
      suffix = ' день';
    } else if (streakLastDigit >= 2 && streakLastDigit <= 4) {
      suffix = ' дня';
    } else {
      suffix = ' дней';
    }
    break;
    case 'best_streak':
      icon = 'media/best.png';
      const bestValue = value || StatDefaults.BEST_STREAK;
      displayValue = `${bestValue}`;
      
      const bestLastDigit = bestValue % 10;
      const bestLastTwoDigits = bestValue % 100;
      
      if (bestLastTwoDigits >= 11 && bestLastTwoDigits <= 14) {
        suffix = ' дней';
      } else if (bestLastDigit === 1) {
        suffix = ' день';
      } else if (bestLastDigit >= 2 && bestLastDigit <= 4) {
        suffix = ' дня';
      } else {
        suffix = ' дней';
      }
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