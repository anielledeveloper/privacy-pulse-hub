import { Popup } from './components/Popup';
import './styles/popup.css';

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');
  if (container) {
    new Popup(container);
  }
});
