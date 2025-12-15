import {createElement} from '../framework/render.js';

function createProgressChartTemplate() {
  return `
    <div class="progress-chart-container">
      <h3>График выполнения за неделю</h3>
      <div class="chart-wrapper">
        <canvas id="progressChart" width="600" height="300"></canvas>
      </div>
    </div>
  `;
}

export default class ProgressChartComponent {
  getTemplate() {
    return createProgressChartTemplate();
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