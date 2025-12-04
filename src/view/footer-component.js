import {createElement} from '../framework/render.js';

function createFooterTemplate() {
  return `
    <footer>
      <div class="footer-icons">
        <a href="https://github.com/ValeryBeli" target="_blank" aria-label="GitHub">
          <img src="media/github.svg" alt="GitHub" height="24">
        </a>
        <a href="https://t.me/vikrr0" target="_blank" aria-label="Telegram">
          <img src="media/telegram.svg" alt="Telegram" height="24">
        </a>
      </div>
    </footer>
  `;
}

export default class FooterComponent {
  getTemplate() {
    return createFooterTemplate();
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