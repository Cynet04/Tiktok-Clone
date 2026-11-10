import ui from './ui.js';
import feed from './feed.js';
import auth from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  ui.init();
  
  ui.elements.sendMessageBtn.addEventListener('click', () => ui.handleSendMessage());
  ui.elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ui.handleSendMessage();
    }
  });
  
  console.log('TikTok Clone initialized');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

window.addEventListener('beforeunload', () => {
  feed.pauseAllVideos();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    feed.pauseAllVideos();
  }
});