import {createElement} from '../framework/render.js';

function createModalTemplate(isEdit = false, habitData = null) {
  const title = isEdit ? 'Редактировать привычку' : 'Добавить привычку';
  const buttonText = isEdit ? 'Сохранить' : 'Добавить';
  const habitTitle = habitData?.title || '';
  const habitDescription = habitData?.description || '';

  return `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" aria-label="Закрыть">×</button>
        </div>
        <div class="modal-body">
          <form class="habit-form">
            <div class="form-group">
              <label for="habit-title">Название привычки</label>
              <input 
                type="text" 
                id="habit-title" 
                name="title" 
                placeholder="Введите название привычки"
                value="${habitTitle}"
                required
              >
            </div>
            <div class="form-group">
              <label for="habit-description">Описание привычки</label>
              <textarea 
                id="habit-description" 
                name="description" 
                placeholder="Опишите вашу привычку"
                rows="3"
              >${habitDescription}</textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary modal-cancel">Отмена</button>
              <button type="submit" class="btn-primary">${buttonText}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export default class ModalComponent {
  #isEdit = false;
  #habitData = null;
  #handleSubmit = null;
  #handleClose = null;
  #handleEscapeBound = null;

  constructor({ isEdit = false, habitData = null, onSubmit, onClose }) {
    this.#isEdit = isEdit;
    this.#habitData = habitData;
    this.#handleSubmit = onSubmit;
    this.#handleClose = onClose;
    this.#handleEscapeBound = this.#handleEscape.bind(this);
  }

  getTemplate() {
    return createModalTemplate(this.#isEdit, this.#habitData);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  initEventListeners() {
    if (!this.element) {
      return;
    }

    const form = this.element.querySelector('.habit-form');
    const closeBtn = this.element.querySelector('.modal-close');
    const cancelBtn = this.element.querySelector('.modal-cancel');
    const overlay = this.element.querySelector('.modal-overlay');

    if (form) {
      form.addEventListener('submit', this.#handleFormSubmit.bind(this));
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', this.#closeModal.bind(this));
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', this.#closeModal.bind(this));
    }

    if (overlay) {
      overlay.addEventListener('click', this.#handleOverlayClick.bind(this));
    }

    document.addEventListener('keydown', this.#handleEscapeBound);
  }

  #handleFormSubmit(evt) {
    evt.preventDefault();
    const formData = new FormData(evt.target);
    const habitData = {
      title: formData.get('title'),
      description: formData.get('description')
    };
    
    if (this.#handleSubmit) {
      this.#handleSubmit(habitData);
    }
    
    this.#closeModal();
  }

  #handleOverlayClick(evt) {
    if (evt.target.classList.contains('modal-overlay')) {
      this.#closeModal();
    }
  }

  #handleEscape(evt) {
    if (evt.key === 'Escape') {
      this.#closeModal();
    }
  }

  #closeModal() {
    if (this.#handleClose) {
      this.#handleClose();
    }
    this.removeElement();
  }

  removeElement() {
    document.removeEventListener('keydown', this.#handleEscapeBound);
    
    const form = this.element?.querySelector('.habit-form');
    const closeBtn = this.element?.querySelector('.modal-close');
    const cancelBtn = this.element?.querySelector('.modal-cancel');
    const overlay = this.element?.querySelector('.modal-overlay');

    if (form) {
      form.removeEventListener('submit', this.#handleFormSubmit);
    }
    
    if (closeBtn) {
      closeBtn.removeEventListener('click', this.#closeModal);
    }
    
    if (cancelBtn) {
      cancelBtn.removeEventListener('click', this.#closeModal);
    }
    
    if (overlay) {
      overlay.removeEventListener('click', this.#handleOverlayClick);
    }

    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}