import {createElement} from '../framework/render.js';
import StatCard from './stat-card.js';
import {StatType} from '../const.js';
import {render} from '../framework/render.js';

function createProgressSectionTemplate() {
  return `
    <section class="progress-section">
      <h2>Ваш прогресс</h2>
      <div class="progress-stats"></div>
      <div class="progress-chart">
        <h3>График выполнения за последние 30 дней</h3>
        <canvas id="progressChart" width="600" height="300"></canvas>
      </div>
    </section>
  `;
}

export default class ProgressSection {
  #stats = null;

  constructor(stats) {
    this.#stats = stats;
  }

  getTemplate() {
    return createProgressSectionTemplate();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
      this.#renderStats();
    }
    return this.element;
  }

  #renderStats() {
    const statsContainer = this.element.querySelector('.progress-stats');
    
    Object.values(StatType).forEach(type => {
      const statValue = this.#stats[type] || this.#stats[type.replace('_', '')];
      const statCard = new StatCard(type, statValue);
      render(statCard, statsContainer);
    });
  }

  removeElement() {
    this.element = null;
  }
}