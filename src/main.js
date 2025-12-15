import HeaderComponent from './view/header-component.js';
import SubtitleComponent from './view/subtitle-component.js';
import HabitsSection from './view/habits-section.js';
import FooterComponent from './view/footer-component.js';
import {render, RenderPosition} from './framework/render.js';
import HabitModel from './model/habit-model.js';
import HabitsBoardPresenter from './presenter/habits-board-presenter.js';
import HabitsApiService from './habits-api-service.js';

const API_URL = 'https://690a07c91a446bb9cc211096.mockapi.io';


const habitsApiService = new HabitsApiService(API_URL);
const habitModel = new HabitModel({habitsApiService});

const bodyContainer = document.querySelector('.app');
const habitsContainer = document.querySelector('.habits-section');
const progressContainer = document.querySelector('.progress-section');


if (!bodyContainer || !habitsContainer || !progressContainer) {
  console.error('Error: Required DOM elements not found!');
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center; color: #e53e3e;">
      <h2>Ошибка загрузки приложения</h2>
      <p>Не найдены необходимые элементы DOM.</p>
      <p>Проверьте консоль браузера для подробностей.</p>
    </div>
  `;
} else {
  render(new HeaderComponent(), bodyContainer, RenderPosition.AFTERBEGIN);
  render(new SubtitleComponent(), habitsContainer, RenderPosition.BEFOREEND);

  const habitsSection = new HabitsSection();
  render(habitsSection, habitsContainer);

  render(new FooterComponent(), bodyContainer, RenderPosition.BEFOREEND);

  const habitsBoardPresenter = new HabitsBoardPresenter({
    habitsContainer: habitsSection.getElement(),
    progressContainer: progressContainer,
    habitModel: habitModel,
    bodyContainer: document.body
  });

  habitsBoardPresenter.init().catch(error => {
    console.error('App initialization failed:', error);
    setTimeout(() => errorDiv.remove(), 5000);
  });
}