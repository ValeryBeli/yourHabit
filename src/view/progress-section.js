import {createElement} from '../framework/render.js';
import StatCard from './stat-card.js';
import ProgressChartComponent from './progress-chart-component.js';
import {render} from '../framework/render.js';
import {StatType} from '../const.js';

function createProgressSectionTemplate() {
  return `
    <section class="progress-section">
      <h2>Ваш прогресс</h2>
      <div class="progress-stats"></div>
    </section>
  `;
}

export default class ProgressSection {
  #stats = null;
  #habitModel = null;

  constructor(stats, habitModel) { 
    this.#stats = stats;
    this.#habitModel = habitModel;
  }

  getTemplate() {
    return createProgressSectionTemplate();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
      this.#renderStats();
      this.#renderChart();
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

  #renderChart() {
    const chartComponent = new ProgressChartComponent();
    render(chartComponent, this.element);
    
    setTimeout(() => {
      this.#initializeChart();
    }, 50);
  }

  #initializeChart() {
    const canvas = this.element.querySelector('#progressChart');
    if (!canvas) {
      console.error('Canvas element not found!');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context!');
      return;
    }
    
    const data = this.#getChartDataFromModel();
    const totalHabits = this.#stats.today.total;

    const maxYValue = totalHabits + 1;

    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded!');
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(43, 114, 196, 0.3)');
    gradient.addColorStop(1, 'rgba(43, 114, 196, 0.05)');

   
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Выполненные привычки',
            data: data.values,
            backgroundColor: gradient,
            borderColor: '#2b72c4',
            borderWidth: 3,
            pointBackgroundColor: '#2b72c4',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.3,
            cubicInterpolationMode: 'monotone'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#ffffff',
              titleColor: '#1e3c63',
              bodyColor: '#4d5b6b',
              borderColor: '#d7e3f1',
              borderWidth: 1,
              padding: 10,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  const dayIndex = context.dataIndex;
                  const isToday = dayIndex === data.labels.length - 1;
                  const label = `Выполнено: ${context.raw} из ${totalHabits} привычек`;
                  return isToday ? `${label} (сегодня)` : label;
                },
                title: function(tooltipItems) {
                  const dayIndex = tooltipItems[0].dataIndex;
                  const isToday = dayIndex === data.labels.length - 1;
                  const dateLabel = tooltipItems[0].label;
                  return isToday ? `${dateLabel} (сегодня)` : dateLabel;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(215, 227, 241, 0.5)',
                drawBorder: false,
                lineWidth: 1,
                drawOnChartArea: true,
                drawTicks: false,
                borderDash: [3, 3]
              },
              ticks: {
                color: '#4d5b6b',
                font: {
                  size: 11,
                  family: '"Segoe UI", Roboto, sans-serif'
                },
                maxTicksLimit: 10,
                callback: function(value, index) {
                  const isToday = index === data.labels.length - 1;
                  const label = data.labels[index];
                  return isToday ? `📍 ${label}` : label;
                }
              },
              border: {
                display: false
              }
            },
            y: {
              beginAtZero: true,
              suggestedMax: maxYValue,
              max: maxYValue,
              grid: {
                color: 'rgba(215, 227, 241, 0.5)',
                drawBorder: false,
                lineWidth: 1,
                drawOnChartArea: true,
                drawTicks: false,
                borderDash: [3, 3]
              },
              ticks: {
                color: '#4d5b6b',
                font: {
                  size: 11,
                  family: '"Segoe UI", Roboto, sans-serif'
                },
                stepSize: 1,
                callback: function(value) {
                  if (Number.isInteger(value)) {
                    return value;
                  }
                }
              },
              border: {
                display: false
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          animations: {
            tension: {
              duration: 1000,
              easing: 'linear'
            }
          },
          elements: {
            point: {
              hoverBackgroundColor: '#225c9b'
            }
          }
        }
      });
    } 
  

 #getChartDataFromModel() {
    if (!this.#habitModel || !this.#habitModel.getProgressHistory) {
      console.warn('Model or getProgressHistory method not available, using fallback');
      return this.#generateFallbackData();
    }

    const progressHistory = this.#habitModel.getProgressHistory();
    
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = progressHistory.find(day => day.date === today);
    
    if (todayRecord) {
      const currentCompleted = this.#stats.today.completed;
      todayRecord.completed = currentCompleted;
    }
    
    const last30Days = progressHistory.slice(-30);
    const labels = [];
    const values = [];
    
    last30Days.forEach(day => {
      const date = new Date(day.date);
      const dayNum = date.getDate();
      const month = date.toLocaleString('ru', { month: 'short' });
      labels.push(`${dayNum} ${month}`);
      values.push(day.completed);
    });
    
    const lastValue = values[values.length - 1];
    const statsCompleted = this.#stats.today.completed;
    
    if (lastValue !== statsCompleted) {
      values[values.length - 1] = statsCompleted;
    }
    
    return { labels, values };
  }

  #generateFallbackData() {
  const totalHabits = this.#stats.today.total;
  const labels = [];
  const values = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const day = date.getDate();
    const month = date.toLocaleString('ru', { month: 'short' });
    labels.push(`${day} ${month}`);
    
    let completedToday;
    
    if (i === 29) {
      completedToday = this.#stats.today.completed;
      console.log('Fallback - Today value (real):', completedToday);
    } else {
      completedToday = Math.floor(Math.random() * (totalHabits + 1));
    }
    
    values.push(completedToday);
  }
  
  console.log('Fallback data generated. Today value:', values[values.length - 1]);
  return { labels, values };
}

  removeElement() {
    this.element = null;
  }
}