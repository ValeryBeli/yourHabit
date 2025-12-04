import {createElement} from '../framework/render.js';
import StatCard from './stat-card.js';
import ProgressChartComponent from './progress-chart-component.js';
import {render} from '../framework/render.js';
import {StatType, DaysOfWeek} from '../const.js';

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
    
    const data = this.#getRealWeekData();
    const totalHabits = this.#stats.today.total;
    
    const maxYValue = totalHabits + 1;

    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded!');
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(43, 114, 196, 0.3)');
    gradient.addColorStop(1, 'rgba(43, 114, 196, 0.05)');

    try {
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
            pointRadius: 5,
            pointHoverRadius: 7,
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
                  const isToday = dayIndex === 6; 
                  const completed = context.raw;
                  const total = data.totals[dayIndex] || totalHabits;
                  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                  const label = `Выполнено: ${completed} из ${total} привычек (${percentage}%)`;
                  return isToday ? `${label} ` : label;
                },
                title: function(tooltipItems) {
                  const dayIndex = tooltipItems[0].dataIndex;
                  const isToday = dayIndex === 6;
                  const dateLabel = tooltipItems[0].label;
                  return isToday ? `${dateLabel} ` : dateLabel;
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
                  size: 12,
                  family: '"Segoe UI", Roboto, sans-serif'
                },
                callback: function(value, index) {
                  const isToday = index === 6;
                  return isToday ? ` ${value}` : value;
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
      
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }

  #getRealWeekData() {
    if (!this.#habitModel || !this.#habitModel.getWeekProgress) {
      return this.#generateFallbackWeekData();
    }
    
    const weekProgress = this.#habitModel.getWeekProgress();
    const labels = [];
    const values = [];
    const totals = [];
    
    weekProgress.forEach((dayData, index) => {
      const dayNumber = dayData.day;
      const dayName = DaysOfWeek[dayNumber] || `День ${dayNumber}`;
      
      labels.push(dayName);
      values.push(dayData.completed);
      totals.push(dayData.total);
    });
    
    return { labels, values, totals };
  }

  #generateFallbackWeekData() {
    const totalHabits = this.#stats.today.total;
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const labels = [];
    const values = [];
    const totals = [];
    

    for (let i = 0; i < 7; i++) {
      labels.push(daysOfWeek[i]);
      values.push(0);
      totals.push(totalHabits);
    }
    
    if (this.#stats.today.completed > 0) {
      values[6] = this.#stats.today.completed;
    }
    
    return { labels, values, totals };
  }

  removeElement() {
    this.element = null;
  }
}