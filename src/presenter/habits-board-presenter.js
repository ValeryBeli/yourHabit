import HabitCard from '../view/habit-card.js';
import ProgressSection from '../view/progress-section.js';
import ModalComponent from '../view/modal-component.js';
import {render} from '../framework/render.js';

export default class HabitsBoardPresenter {
  #habitsContainer = null;
  #progressContainer = null;
  #habitModel = null;
  #bodyContainer = null;
  #habits = [];
  #stats = {};
  #modal = null;

  constructor({habitsContainer, progressContainer, habitModel, bodyContainer}) {
    this.#habitsContainer = habitsContainer;
    this.#progressContainer = progressContainer;
    this.#habitModel = habitModel;
    this.#bodyContainer = bodyContainer;
  }

  init() {
    this.#habits = this.#habitModel.getHabits();
    this.#stats = this.#habitModel.getStats();
    
    this.#renderHabits();
    this.#renderProgress();
    this.#setupEventListeners();
  }

  #renderHabits() {
    const habitsListContainer = this.#habitsContainer.querySelector('.habits-list');
    habitsListContainer.innerHTML = '';
    
    this.#habits.forEach((habit) => {
      const habitCard = new HabitCard(habit);
      render(habitCard, habitsListContainer);
    });
  }

  #renderProgress() {
    this.#progressContainer.innerHTML = '';
    const progressSection = new ProgressSection(this.#stats);
    render(progressSection, this.#progressContainer);
  }

  #showModal(isEdit = false, habitData = null) {
    if (this.#modal) {
      this.#modal.removeElement();
      this.#modal = null;
    }

    this.#modal = new ModalComponent({
      isEdit,
      habitData,
      onSubmit: (data) => this.#handleHabitSubmit(data, habitData?.id),
      onClose: () => {
        this.#modal = null;
      }
    });
    
    render(this.#modal, this.#bodyContainer);
    this.#modal.initEventListeners();
  }

  #handleHabitSubmit(habitData, habitId = null) {
    if (habitId) {
      this.#habitModel.updateHabit(habitId, habitData);
    } else {
      this.#habitModel.addHabit(habitData);
    }
    
    this.#habits = this.#habitModel.getHabits();
    this.#stats = this.#habitModel.getStats();
    this.#renderHabits();
    this.#renderProgress();
  }

  #handleDeleteHabit(habitId) {
    const habitCard = this.#habitsContainer.querySelector(`[data-habit-id="${habitId}"]`);

    if (habitCard) {
    habitCard.classList.add('removing');
    
    setTimeout(() => {
      const isDeleted = this.#habitModel.deleteHabit(habitId);
      if (isDeleted) {
        this.#habits = this.#habitModel.getHabits();
        this.#stats = this.#habitModel.getStats();
        this.#renderHabits();
        this.#renderProgress();
      }
    }, 300); 
  }
  }

  #setupEventListeners() {
    const habitsListContainer = this.#habitsContainer.querySelector('.habits-list');
    
    habitsListContainer.addEventListener('click', (evt) => {
      this.#handleHabitListClick(evt);
    });
    
    const addButton = this.#habitsContainer.querySelector('.add-habit-btn');
    if (addButton) {
      addButton.addEventListener('click', () => {
        this.#showModal(false);
      });
    }
  }

  #handleHabitListClick(evt) {
    if (evt.target.classList.contains('progress-btn')) {
      const habitId = evt.target.dataset.habitId;
      const day = parseInt(evt.target.dataset.day);
      
      const currentStatus = evt.target.classList.contains('completed') ? 'completed' : 'pending';
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      
      this.#habitModel.updateHabitProgress(habitId, day, newStatus);
      
      this.#updateHabitCard(habitId);
      this.#renderProgress();
      return;
    }
    
    if (evt.target.classList.contains('edit-btn')) {
      const habitCard = evt.target.closest('.habit-card');
      if (!habitCard) return;
      
      const habitId = habitCard.dataset.habitId;
      const habit = this.#habitModel.getHabitById(habitId);
      
      if (habit) {
        this.#showModal(true, habit);
      }
      return;
    }
    
    if (evt.target.classList.contains('delete-btn')) {
      const habitCard = evt.target.closest('.habit-card');
      if (!habitCard) return;
      
      const habitId = habitCard.dataset.habitId;
      this.#handleDeleteHabit(habitId);
    }
  }

  #updateHabitCard(habitId) {
    const habit = this.#habitModel.getHabitById(habitId);
    const habitCardElement = this.#habitsContainer.querySelector(`[data-habit-id="${habitId}"]`);
    
    if (habitCardElement && habit) {
      const newHabitCard = new HabitCard(habit);
      const newHabitCardElement = newHabitCard.getElement();
      habitCardElement.replaceWith(newHabitCardElement);
    }
  }
}