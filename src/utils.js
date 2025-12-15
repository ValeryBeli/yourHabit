export function debounce(callback, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

export function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function formatDate(date) {
  const day = date.getDate();
  const month = date.toLocaleString('ru', { month: 'short' });
  return `${day} ${month}`;
}