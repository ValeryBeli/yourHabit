import HabitCard from '../view/habit-card.js';
import ProgressSection from '../view/progress-section.js';
import ModalComponent from '../view/modal-component.js';
import SavingIndicator from '../view/saving-indicator.js';
import {render} from '../framework/render.js';
import {UserAction, UpdateType} from '../const.js';

export default class HabitsBoardPresenter {
  #habitsContainer = null;
  #progressContainer = null;
  #habitModel = null;
  #bodyContainer = null;
  #habits = [];
  #stats = {};
  #modal = null;
  #progressSection = null;
  #savingIndicator = null;
  #isSaving = false;

  constructor({habitsContainer, progressContainer, habitModel, bodyContainer}) {
    this.#habitsContainer = habitsContainer;
    this.#progressContainer = progressContainer;
    this.#habitModel = habitModel;
    this.#bodyContainer = bodyContainer;
    
    this.#savingIndicator = new SavingIndicator();
    render(this.#savingIndicator, this.#bodyContainer);
    
    this.#habitModel.addObserver(this.#handleModelEvent.bind(this));
  }

  async init() {
    await this.#habitModel.init();
  }

  #showSavingIndicator() {
    if (!this.#isSaving) {
      this.#isSaving = true;
      this.#savingIndicator.show();
    }
  }

  #hideSavingIndicator() {
    this.#isSaving = false;
    setTimeout(() => {
      if (!this.#isSaving) {
        this.#savingIndicator.hide();
      }
    }, 500);
  }

  #handleModelEvent(updateType, data) {
    
    switch (updateType) {
      case UpdateType.INIT:
        this.#habits = this.#habitModel.habits;
        this.#stats = this.#habitModel.stats;
        this.#renderHabits();
        this.#renderProgress();
        this.#setupEventListeners();
        break;
        
      case UserAction.ADD_HABIT:
      case UserAction.DELETE_HABIT:
      case UserAction.UPDATE_HABIT:
        this.#habits = this.#habitModel.habits;
        this.#stats = this.#habitModel.stats;
        this.#renderHabits();
        this.#renderProgress();
        this.#hideSavingIndicator();
        break;
        
      case UserAction.UPDATE_HABIT_PROGRESS:
        this.#updateHabitCard(data.habitId);
        this.#stats = this.#habitModel.stats;
        this.#renderProgress();
        this.#showSavingIndicator();
        setTimeout(() => this.#hideSavingIndicator(), 2000);
        break;
    }
  }

  #renderHabits() {
    const habitsListContainer = this.#habitsContainer.querySelector('.habits-list');
    if (!habitsListContainer) {
      console.error('habits-list container not found!');
      return;
    }
    
    habitsListContainer.classList.remove('loading');
    habitsListContainer.innerHTML = '';
    
    this.#habits.forEach((habit) => {
      const habitCard = new HabitCard(habit);
      render(habitCard, habitsListContainer);
    });
  }

  #renderProgress() {
    if (!this.#progressContainer) {
      console.error('progress container not found!');
      return;
    }
    
    this.#progressContainer.innerHTML = '';
    this.#progressSection = new ProgressSection(this.#stats, this.#habitModel);
    render(this.#progressSection, this.#progressContainer);
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

  async #handleHabitSubmit(habitData, habitId = null) {
    try {
      if (habitId) {
        await this.#habitModel.updateHabit(habitId, habitData);
      } else {
        await this.#habitModel.addHabit(habitData);
      }
    } catch (err) {
      console.error('Ошибка при сохранении привычки:', err);
      alert('Ошибка при сохранении привычки. Проверьте консоль для подробностей.');
    }
  }

  async #handleDeleteHabit(habitId) {
    const habitCard = this.#habitsContainer.querySelector(`[data-habit-id="${habitId}"]`);
    
    if (habitCard) {
      habitCard.classList.add('removing');
      
      setTimeout(async () => {
        try {
          await this.#habitModel.deleteHabit(habitId);
        } catch (err) {
          console.error('Ошибка при удалении привычки:', err);
          alert('Ошибка при удалении привычки. Проверьте консоль для подробностей.');
        }
      }, 300);
    }
  }

  #setupEventListeners() {
    const habitsListContainer = this.#habitsContainer.querySelector('.habits-list');
    if (!habitsListContainer) {
      console.error('Cannot setup listeners: habits-list container not found');
      return;
    }
    
    habitsListContainer.addEventListener('click', (evt) => {
      this.#handleHabitListClick(evt);
    });
    
    const addButton = this.#habitsContainer.querySelector('.add-habit-btn');
    if (addButton) {
      addButton.addEventListener('click', () => {
        this.#showModal(false);
      });
    } else {
      console.warn('add-habit-btn not found');
    }
  }

  async #handleHabitListClick(evt) {
    if (evt.target.classList.contains('progress-btn')) {
      const habitId = evt.target.dataset.habitId;
      const day = parseInt(evt.target.dataset.day);
      
      const isToday = day === 7;
      
      const currentStatus = evt.target.classList.contains('completed') ? 'completed' : 'pending';
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      
      evt.target.classList.toggle('completed', newStatus === 'completed');
      evt.target.classList.toggle('pending', newStatus === 'pending');
      
      if (isToday) {
        evt.target.style.fontWeight = newStatus === 'completed' ? 'bold' : 'normal';
      }
      
      try {
        await this.#habitModel.updateHabitProgress(habitId, day, newStatus);
      } catch (err) {
        console.error('Ошибка при обновлении прогресса:', err);
        
        evt.target.classList.toggle('completed', currentStatus === 'completed');
        evt.target.classList.toggle('pending', currentStatus === 'pending');
        if (isToday) {
          evt.target.style.fontWeight = currentStatus === 'completed' ? 'bold' : 'normal';
        }
        
        alert(`Ошибка: ${err.message}\n\nИзменения не были сохранены на сервере.`);
      }
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