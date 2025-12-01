import HeaderComponent from './view/header-component.js';
import SubtitleComponent from './view/subtitle-component.js';
import HabitsSection from './view/habits-section.js';
import FooterComponent from './view/footer-component.js';
import {render, RenderPosition} from './framework/render.js';
import HabitModel from './model/habit-model.js';
import HabitsBoardPresenter from './presenter/habits-board-presenter.js';

const habitModel = new HabitModel();

const bodyContainer = document.querySelector('.app');
const habitsContainer = document.querySelector('.habits-section');
const progressContainer = document.querySelector('.progress-section');

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

habitsBoardPresenter.init();