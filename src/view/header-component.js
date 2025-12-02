import {createElement} from '../framework/render.js';

function createHeaderComponentTemplate() {
  return `
    <header>
      <div class="logo">
        <img src="media/logo.png" alt="Логотип YourHabit" />
        <span>YourHabit</span>
      </div>
      <div class="header-icons">
        <button class="profile-btn" aria-label="Профиль"></button>
        <button class="menu-btn" aria-label="Меню"></button>
      </div>
    </header>
  `;
}

export default class HeaderComponent {
  getTemplate() {
    return createHeaderComponentTemplate();
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