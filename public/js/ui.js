import feed from './feed.js';
import auth from './auth.js';
import api from './api.js';

class UIManager {
  constructor() {
    this.currentPage = 'home';
    this.modals = new Map();
    this.toastContainer = null;
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.isScrolling = false;
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.setupFeedObserver();
    this.setupAuthListener();
    this.renderInitialPage();
  }

  cacheElements() {
    this.elements = {
      app: document.getElementById('app'),
      topBar: document.getElementById('topBar'),
      sidebar: document.getElementById('sidebar'),
      mainContent: document.getElementById('mainContent'),
      bottomNav: document.getElementById('bottomNav'),
      feedContainer: document.getElementById('feedContainer'),
      videoFeed: document.getElementById('videoFeed'),
      loadingIndicator: document.getElementById('loadingIndicator'),
      endIndicator: document.getElementById('endIndicator'),
      feedTabs: document.getElementById('feedTabs'),
      discoverPage: document.getElementById('discoverPage'),
      inboxPage: document.getElementById('inboxPage'),
      profilePage: document.getElementById('profilePage'),
      uploadPage: document.getElementById('uploadPage'),
      loginPage: document.getElementById('loginPage'),
      signupPage: document.getElementById('signupPage'),
      commentModal: document.getElementById('commentModal'),
      shareModal: document.getElementById('shareModal'),
      toastContainer: document.getElementById('toastContainer'),
      createBtn: document.getElementById('createBtn'),
      searchBtn: document.getElementById('searchBtn'),
      profileBtn: document.getElementById('profileBtn'),
      cameraBtn: document.getElementById('cameraBtn'),
      topAvatar: document.getElementById('topAvatar'),
      feedTabButtons: document.querySelectorAll('.feed-tab'),
      sidebarItems: document.querySelectorAll('.sidebar-item'),
      bottomNavItems: document.querySelectorAll('.bottom-nav-item[data-page]'),
      logoutBtn: document.getElementById('logoutBtn'),
      settingsBtn: document.getElementById('settingsBtn'),
      backToInbox: document.getElementById('backToInbox'),
      editProfileBtn: document.getElementById('editProfileBtn'),
      selectVideoBtn: document.getElementById('selectVideoBtn'),
      videoFileInput: document.getElementById('videoFileInput'),
      captionInput: document.getElementById('captionInput'),
      postVideoBtn: document.getElementById('postVideo'),
      cancelUploadBtn: document.getElementById('cancelUpload'),
      loginForm: document.getElementById('loginForm'),
      signupForm: document.getElementById('signupForm'),
      switchToSignup: document.getElementById('switchToSignup'),
      switchToLogin: document.getElementById('switchToLogin'),
      discoverSearch: document.getElementById('discoverSearch'),
      trendingHashtags: document.getElementById('trendingHashtags'),
      searchResults: document.getElementById('searchResults'),
      resultsContent: document.getElementById('resultsContent'),
      resultTabs: document.querySelectorAll('.result-tab'),
      conversationsList: document.getElementById('conversationsList'),
      chatView: document.getElementById('chatView'),
      chatUserInfo: document.getElementById('chatUserInfo'),
      messagesContainer: document.getElementById('messagesContainer'),
      messageInput: document.getElementById('messageInput'),
      sendMessageBtn: document.getElementById('sendMessage'),
      profileAvatar: document.getElementById('profileAvatar'),
      profileName: document.getElementById('profileName'),
      profileBio: document.getElementById('profileBio'),
      profileStats: document.getElementById('profileStats'),
      profileVideoGrid: document.getElementById('profileVideoGrid'),
      profileTabs: document.querySelectorAll('.profile-tab'),
      closeCommentModal: document.getElementById('closeCommentModal'),
      commentList: document.getElementById('commentList'),
      commentInput: document.getElementById('commentInput'),
      postCommentBtn: document.getElementById('postComment'),
      commentAvatar: document.getElementById('commentAvatar'),
      closeShareModal: document.getElementById('closeShareModal'),
      shareOptions: document.querySelectorAll('.share-option'),
      uploadPreview: document.getElementById('uploadPreview'),
      uploadPlaceholder: document.getElementById('uploadPlaceholder'),
      thumbnailSelector: document.getElementById('thumbnailSelector'),
      hashtagSuggestions: document.getElementById('hashtagSuggestions'),
      editProfileModal: document.getElementById('editProfileModal'),
      editProfileForm: document.getElementById('editProfileForm'),
      closeEditProfileModal: document.getElementById('closeEditProfileModal'),
      cancelEditProfile: document.getElementById('cancelEditProfile'),
      editDisplayName: document.getElementById('editDisplayName'),
      editUsername: document.getElementById('editUsername'),
      editBio: document.getElementById('editBio'),
      editAvatar: document.getElementById('editAvatar')
    };

    this.toastContainer = this.elements.toastContainer;
  }

  bindEvents() {
    this.elements.bottomNavItems.forEach(item => {
      item.addEventListener('click', (e) => this.handleNavClick(e, item.dataset.page));
    });

    this.elements.sidebarItems.forEach(item => {
      item.addEventListener('click', (e) => this.handleNavClick(e, item.dataset.page));
    });

    this.elements.feedTabButtons.forEach(btn => {
      btn.addEventListener('click', () => this.switchFeedTab(btn.dataset.feed));
    });

    this.elements.createBtn.addEventListener('click', () => this.showPage('upload'));
    this.elements.cameraBtn.addEventListener('click', () => this.showPage('upload'));
    this.elements.searchBtn.addEventListener('click', () => this.showPage('discover'));
    this.elements.profileBtn.addEventListener('click', () => this.showPage('profile'));
    this.elements.topAvatar.addEventListener('click', () => this.showPage('profile'));

    this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
    this.elements.settingsBtn.addEventListener('click', () => this.showToast('Settings coming soon!', 'info'));
    this.elements.backToInbox.addEventListener('click', () => this.showInboxList());
    this.elements.editProfileBtn.addEventListener('click', () => this.openEditProfileModal());

    this.elements.selectVideoBtn.addEventListener('click', () => this.elements.videoFileInput.click());
    this.elements.videoFileInput.addEventListener('change', (e) => this.handleVideoSelect(e));
    this.elements.captionInput.addEventListener('input', () => this.updateHashtagSuggestions());
    this.elements.postVideoBtn.addEventListener('click', () => this.handlePostVideo());
    this.elements.cancelUploadBtn.addEventListener('click', () => this.resetUploadForm());

    this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    this.elements.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    this.elements.switchToSignup.addEventListener('click', (e) => { e.preventDefault(); this.showPage('signup'); });
    this.elements.switchToLogin.addEventListener('click', (e) => { e.preventDefault(); this.showPage('login'); });
    
    // Demo login buttons
    document.querySelectorAll('.demo-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handleDemoLogin(btn.dataset.user));
    });

    this.elements.discoverSearch.addEventListener('input', (e) => this.handleSearch(e.target.value));
    this.elements.resultTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchResultTab(tab.dataset.type));
    });

    this.elements.closeCommentModal.addEventListener('click', () => this.closeModal('commentModal'));
    this.elements.postCommentBtn.addEventListener('click', () => this.handlePostComment());
    this.elements.commentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handlePostComment();
      }
    });

    this.elements.closeShareModal.addEventListener('click', () => this.closeModal('shareModal'));
    this.elements.shareOptions.forEach(opt => {
      opt.addEventListener('click', () => this.handleShare(opt.dataset.platform));
    });

    this.elements.profileTabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchProfileTab(tab.dataset.tab));
    });

    // Edit profile modal events
    this.elements.closeEditProfileModal.addEventListener('click', () => this.closeModal('editProfileModal'));
    this.elements.cancelEditProfile.addEventListener('click', () => this.closeModal('editProfileModal'));
    this.elements.editProfileForm.addEventListener('submit', (e) => this.handleEditProfile(e));

    this.elements.thumbnailSelector.addEventListener('click', (e) => {
      const option = e.target.closest('.thumbnail-option');
      if (option) this.selectThumbnail(option);
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.like-btn')) this.handleLikeClick(e);
      if (e.target.closest('.comment-btn')) this.handleCommentClick(e);
      if (e.target.closest('.share-btn')) this.handleShareClick(e);
      if (e.target.closest('.follow-btn')) this.handleFollowClick(e);
      if (e.target.closest('.hashtag-suggestion')) this.handleHashtagSelect(e);
      if (e.target.closest('.conversation-item')) this.openChat(e);
      if (e.target.closest('.hashtag-item')) this.handleHashtagClick(e);
      if (e.target.closest('.video-grid-item')) this.handleVideoGridClick(e);
    });

    this.elements.videoFeed.addEventListener('scroll', () => this.handleFeedScroll());
    this.elements.videoFeed.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.elements.videoFeed.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
    this.elements.videoFeed.addEventListener('touchend', (e) => this.handleTouchEnd(e));

    window.addEventListener('hashchange', () => this.handleHashChange());
    window.addEventListener('resize', () => this.handleResize());
  }

  setupFeedObserver() {
    feed.subscribe({
      onVideosChanged: (videos) => this.renderVideoFeed(videos),
      onVideoUpdate: (videoId) => this.updateVideoCard(videoId),
      onLoadingChanged: (loading) => this.toggleLoading(loading),
      onError: (message) => this.showToast(message, 'error')
    });
  }

  setupAuthListener() {
    auth.subscribe((user) => this.updateAuthUI(user));
  }

  renderInitialPage() {
    const hash = window.location.hash.slice(1) || 'home';
    this.showPage(hash);
    
    if (this.currentPage === 'home') {
      feed.loadVideos(1);
    }
  }

  handleHashChange() {
    const hash = window.location.hash.slice(1) || 'home';
    const protectedPages = ['upload', 'profile', 'inbox'];
    const user = auth.getUser();
    
    if (protectedPages.includes(hash) && !user) {
      window.location.hash = 'login';
      this.showPage('login');
      return;
    }
    
    this.showPage(hash);
  }

  handleNavClick(e, page) {
    e.preventDefault();
    const protectedPages = ['upload', 'profile', 'inbox'];
    const user = auth.getUser();
    
    if (protectedPages.includes(page) && !user) {
      this.showToast('Please log in to access this page', 'info');
      this.showPage('login');
      window.location.hash = 'login';
      return;
    }
    
    this.showPage(page);
    window.location.hash = page;
  }

  showPage(page) {
    const protectedPages = ['upload', 'profile', 'inbox'];
    const user = auth.getUser();
    
    if (protectedPages.includes(page) && !user) {
      this.showToast('Please log in to access this page', 'info');
      this.showPage('login');
      window.location.hash = 'login';
      return;
    }
    
    const pages = ['home', 'discover', 'inbox', 'profile', 'upload', 'login', 'signup'];
    
    pages.forEach(p => {
      const el = this.elements[`${p}Page`] || this.elements.feedContainer;
      if (el) el.classList.toggle('hidden', p !== page);
    });

    this.elements.bottomNavItems.forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    this.elements.sidebarItems.forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    this.currentPage = page;

    if (page === 'home' && feed.getVideos().length === 0) {
      feed.loadVideos(1);
    } else if (page === 'discover') {
      this.loadTrendingHashtags();
    } else if (page === 'inbox') {
      this.loadConversations();
    } else if (page === 'profile') {
      this.loadProfile();
    }
  }

  switchFeedTab(feedType) {
    this.elements.feedTabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.feed === feedType);
    });
    feed.loadVideos(1);
  }

  async renderVideoFeed(videos) {
    if (videos.length === 0) {
      this.elements.videoFeed.innerHTML = '<div class="empty-state">No videos yet</div>';
      return;
    }

    this.elements.videoFeed.innerHTML = videos.map((video, index) => this.createVideoCard(video, index)).join('');
    
    this.setupVideoPlayers();
    this.setupIntersectionObserver();
  }

  createVideoCard(video, index) {
    const user = video.user || {};
    const isLiked = video.likedByCurrentUser;
    
    return `
      <div class="video-card" data-index="${index}" data-video-id="${video.id}" style="height: 100vh;">
        <div class="video-player-container">
          <video 
            class="video-player" 
            data-src="${video.videoUrl}"
            playsinline 
            muted 
            loop
            preload="metadata"
            poster="${video.thumbnail}"
          ></video>
          <div class="video-loading">
            <div class="spinner"></div>
          </div>
        </div>
        
        <div class="video-username">
          <div class="video-avatar">${user.displayName?.charAt(0) || 'U'}</div>
          <div class="video-user-info">
            <span class="video-user-name">@${user.username || 'user'}</span>
            <button class="video-user-follow ${video.isFollowing ? 'following' : ''}" data-user-id="${user.id}">
              ${video.isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        <div class="video-caption">
          <div class="video-caption-content">
            <div class="caption-text">${this.formatCaption(video.caption)}</div>
            <div class="caption-music">
              <svg class="music-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              <span>${video.music || 'Original Sound'}</span>
            </div>
          </div>
        </div>

        <div class="video-actions">
          <button class="video-action-btn like-btn ${isLiked ? 'liked' : ''}" data-action="like" aria-label="Like">
            <div class="icon-wrapper">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="${isLiked ? 'var(--accent-secondary)' : 'none'}" stroke="currentColor" stroke-width="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <span class="count">${this.formatCount(video.likes)}</span>
          </button>
          
          <button class="video-action-btn comment-btn" data-action="comment" aria-label="Comments">
            <div class="icon-wrapper">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span class="count">${this.formatCount(video.comments)}</span>
          </button>
          
          <button class="video-action-btn share-btn" data-action="share" aria-label="Share">
            <div class="icon-wrapper">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </div>
            <span class="count">${this.formatCount(video.shares)}</span>
          </button>
          
          <div class="video-action-btn" style="width: 48px; height: 48px;">
            <div class="icon-wrapper">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"></path>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
          </div>
        </div>

        <div class="progress-bar"></div>
      </div>
    `;
  }

  formatCaption(caption) {
    return caption
      .replace(/#(\w+)/g, '<span class="caption-hashtag">#$1</span>')
      .replace(/@(\w+)/g, '<span class="caption-username">@$1</span>');
  }

  formatCount(count) {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  }

  setupVideoPlayers() {
    const videos = this.elements.videoFeed.querySelectorAll('.video-player');
    videos.forEach((video, index) => {
      const card = video.closest('.video-card');
      const videoId = card.dataset.videoId;
      
      // Try to use preloaded video
      const preloadedVideo = feed.getPreloadedVideo(videoId);
      if (preloadedVideo && preloadedVideo.readyState >= 2) {
        // Use preloaded video source
        video.src = preloadedVideo.src;
      }
      
      feed.registerVideoElement(index, { video, card });
      
      video.addEventListener('loadeddata', () => {
        card.querySelector('.video-loading').style.display = 'none';
      });
      
      video.addEventListener('error', () => {
        card.querySelector('.video-loading').style.display = 'none';
        card.querySelector('.video-player-container').innerHTML += `
          <div class="video-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M23 7 16 12 23 17 23 7"></path>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <p>Unable to load video</p>
            <button onclick="location.reload()">Retry</button>
          </div>
        `;
      });
      
      video.addEventListener('timeupdate', () => {
        const progressBar = card.querySelector('.progress-bar');
        if (progressBar && video.duration) {
          progressBar.style.transform = `scaleX(${video.currentTime / video.duration})`;
        }
      });
      
      video.addEventListener('ended', () => {
        const progressBar = card.querySelector('.progress-bar');
        if (progressBar) progressBar.style.transform = 'scaleX(0)';
      });
    });
  }

  setupIntersectionObserver() {
    const cards = this.elements.videoFeed.querySelectorAll('.video-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const index = parseInt(entry.target.dataset.index);
        const { video } = feed.getVideoElement(index) || {};
        
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          if (video) video.play().catch(() => {});
          feed.setCurrentIndex(index);
          
          // Preload next videos when current video is visible
          feed.preloadNextVideos();
        } else {
          if (video) video.pause();
        }
      });
    }, {
      root: this.elements.videoFeed,
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    cards.forEach(card => observer.observe(card));
  }

  handleFeedScroll() {
    const { scrollTop, scrollHeight, clientHeight } = this.elements.videoFeed;
    
    if (scrollTop + clientHeight >= scrollHeight - 200) {
      feed.loadMore();
    }
    
    this.elements.loadingIndicator.classList.toggle('visible', feed.loading);
    this.elements.endIndicator.classList.toggle('visible', !feed.hasMore && feed.getVideos().length > 0);
  }

  handleTouchStart(e) {
    this.touchStartY = e.touches[0].clientY;
    this.touchStartX = e.touches[0].clientX;
    this.isScrolling = false;
  }

  handleTouchMove(e) {
    const deltaY = Math.abs(e.touches[0].clientY - this.touchStartY);
    const deltaX = Math.abs(e.touches[0].clientX - this.touchStartX);
    this.isScrolling = deltaY > deltaX && deltaY > 10;
  }

  handleTouchEnd(e) {
    if (!this.isScrolling) return;
    
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;
    
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        feed.prevVideo();
        this.scrollToVideo(feed.currentVideoIndex);
      } else {
        feed.nextVideo();
        this.scrollToVideo(feed.currentVideoIndex);
      }
    }
  }

  scrollToVideo(index) {
    const card = this.elements.videoFeed.querySelector(`[data-index="${index}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handleLikeClick(e) {
    const btn = e.target.closest('.like-btn');
    const card = btn.closest('.video-card');
    const videoId = card.dataset.videoId;
    const index = parseInt(card.dataset.index);
    
    const isLiked = btn.classList.toggle('liked');
    btn.querySelector('svg').setAttribute('fill', isLiked ? 'var(--accent-secondary)' : 'none');
    btn.querySelector('svg').setAttribute('stroke', isLiked ? 'var(--accent-secondary)' : 'currentColor');
    
    const countEl = btn.querySelector('.count');
    let count = parseInt(countEl.textContent.replace(/[KM]/, ''));
    count = isLiked ? count + 1 : count - 1;
    countEl.textContent = this.formatCount(count);
    
    this.createHeartParticles(btn);
    feed.likeVideo(videoId).catch(() => {
      btn.classList.toggle('liked');
      btn.querySelector('svg').setAttribute('fill', !isLiked ? 'var(--accent-secondary)' : 'none');
      countEl.textContent = this.formatCount(isLiked ? count - 1 : count + 1);
    });
  }

  createHeartParticles(btn) {
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      particle.className = 'heart-particle';
      particle.style.left = centerX + 'px';
      particle.style.top = centerY + 'px';
      particle.innerHTML = `<svg viewBox="0 0 24 24" fill="var(--accent-secondary)"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
      
      const angle = (i / 6) * Math.PI * 2;
      const distance = 50 + Math.random() * 50;
      particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
      particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
      
      document.body.appendChild(particle);
      
      setTimeout(() => particle.remove(), 1500);
    }
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = centerX + 'px';
    ripple.style.top = centerY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  handleCommentClick(e) {
    const btn = e.target.closest('.comment-btn');
    const card = btn.closest('.video-card');
    const videoId = card.dataset.videoId;
    this.openCommentModal(videoId);
  }

  handleShareClick(e) {
    const btn = e.target.closest('.share-btn');
    const card = btn.closest('.video-card');
    const videoId = card.dataset.videoId;
    this.openShareModal(videoId);
  }

  handleFollowClick(e) {
    const btn = e.target.closest('.follow-btn, .video-user-follow');
    if (!btn) return;
    
    const isFollowing = btn.classList.toggle('following');
    btn.textContent = isFollowing ? 'Following' : 'Follow';
    this.showToast(isFollowing ? 'Now following' : 'Unfollowed', 'info');
  }

  handleHashtagSelect(e) {
    const suggestion = e.target.closest('.hashtag-suggestion');
    if (!suggestion) return;
    
    const hashtag = suggestion.textContent.trim();
    const input = this.elements.captionInput;
    const cursorPos = input.selectionStart;
    const text = input.value;
    
    input.value = text.slice(0, cursorPos) + hashtag + ' ' + text.slice(cursorPos);
    input.focus();
    this.updateHashtagSuggestions();
  }

  handleHashtagClick(e) {
    const item = e.target.closest('.hashtag-item');
    if (item) {
      const hashtag = item.querySelector('.hashtag-name').textContent;
      this.elements.discoverSearch.value = hashtag;
      this.handleSearch(hashtag);
    }
  }

  handleVideoGridClick(e) {
    const item = e.target.closest('.video-grid-item');
    if (item) {
      const videoId = item.dataset.videoId;
      this.showPage('home');
      feed.loadVideos(1);
    }
  }

  openCommentModal(videoId) {
    this.currentCommentVideoId = videoId;
    this.loadComments(videoId);
    this.elements.commentModal.classList.remove('hidden');
    this.elements.commentInput.focus();
    
    const user = auth.getUser();
    if (user) {
      this.elements.commentAvatar.textContent = user.displayName?.charAt(0) || user.username?.charAt(0) || 'U';
    }
  }

  closeModal(modalId) {
    this.elements[modalId].classList.add('hidden');
    this.elements.commentInput.value = '';
    
    if (modalId === 'editProfileModal') {
      this.elements.editProfileForm.reset();
    }
  }

  openEditProfileModal() {
    const user = auth.getUser();
    if (!user) return;
    
    this.elements.editDisplayName.value = user.displayName || '';
    this.elements.editUsername.value = user.username || '';
    this.elements.editBio.value = user.bio || '';
    this.elements.editAvatar.value = user.avatar || '';
    
    this.elements.editProfileModal.classList.remove('hidden');
  }

  async handleEditProfile(e) {
    e.preventDefault();
    
    const updates = {
      displayName: this.elements.editDisplayName.value,
      username: this.elements.editUsername.value,
      bio: this.elements.editBio.value,
      avatar: this.elements.editAvatar.value
    };
    
    auth.updateProfile(updates);
    this.showToast('Profile updated!', 'success');
    this.closeModal('editProfileModal');
    this.loadProfile();
  }

  async loadComments(videoId) {
    try {
      const video = await api.getVideo(videoId);
      this.renderComments(video.comments || []);
    } catch (error) {
      this.showToast('Failed to load comments', 'error');
    }
  }

  renderComments(comments) {
    this.elements.commentList.innerHTML = comments.map(comment => `
      <div class="comment-item">
        <div class="comment-item-avatar">${comment.user?.displayName?.charAt(0) || comment.user?.username?.charAt(0) || 'U'}</div>
        <div class="comment-item-content">
          <div class="comment-item-header">
            <span class="comment-item-username">@${comment.user?.username || 'user'}</span>
            <span class="comment-item-time">${this.formatTime(comment.createdAt)}</span>
          </div>
          <div class="comment-item-text">${comment.text}</div>
          <div class="comment-item-actions">
            <button class="comment-action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>${this.formatCount(comment.likes)}</span>
            </button>
            <button class="comment-action-btn">Reply</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  async handlePostComment() {
    const text = this.elements.commentInput.value.trim();
    if (!text || !this.currentCommentVideoId) return;
    
    this.elements.postCommentBtn.disabled = true;
    
    try {
      await api.post(`/videos/${this.currentCommentVideoId}/comments`, { text });
      this.elements.commentInput.value = '';
      this.loadComments(this.currentCommentVideoId);
      this.showToast('Comment posted!', 'success');
    } catch (error) {
      this.showToast('Failed to post comment', 'error');
    } finally {
      this.elements.postCommentBtn.disabled = false;
    }
  }

  openShareModal(videoId) {
    this.currentShareVideoId = videoId;
    this.elements.shareModal.classList.remove('hidden');
  }

  async handleShare(platform) {
    const video = feed.getVideos().find(v => v.id === this.currentShareVideoId);
    if (!video) return;
    
    const url = `${window.location.origin}/video/${video.id}`;
    
    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(url);
        this.showToast('Link copied!', 'success');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'instagram':
        this.showToast('Instagram sharing requires mobile app', 'info');
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(url)}`, '_blank');
        break;
    }
    
    this.closeModal('shareModal');
  }

  async handleVideoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      this.showToast('Please select a video file', 'error');
      return;
    }
    
    const url = URL.createObjectURL(file);
    this.elements.uploadPreview.src = url;
    this.elements.uploadPreview.style.display = 'block';
    this.elements.uploadPlaceholder.classList.add('hidden');
    
    this.selectedVideoFile = file;
    this.generateThumbnails(url);
  }

  generateThumbnails(videoUrl) {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    video.preload = 'metadata';
    
    video.addEventListener('loadedmetadata', () => {
      const times = [0, 1, 2, 3, 5];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      times.forEach((time, index) => {
        video.currentTime = time;
      });
      
      video.addEventListener('seeked', () => {
        canvas.width = 160;
        canvas.height = 90;
        ctx.drawImage(video, 0, 0, 160, 90);
        
        const option = this.elements.thumbnailSelector.querySelector(`[data-time="${video.currentTime}"]`);
        if (option) {
          option.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg', 0.8)})`;
        }
        
        const nextIndex = times.indexOf(video.currentTime) + 1;
        if (nextIndex < times.length) {
          video.currentTime = times[nextIndex];
        }
      });
    });
  }

  selectThumbnail(option) {
    this.elements.thumbnailSelector.querySelectorAll('.thumbnail-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    option.classList.add('selected');
    this.selectedThumbnailTime = parseFloat(option.dataset.time);
  }

  updateHashtagSuggestions() {
    const text = this.elements.captionInput.value;
    const lastHashIndex = text.lastIndexOf('#');
    
    if (lastHashIndex === -1 || lastHashIndex !== text.length - 1 - (text.slice(lastHashIndex).match(/\s/) ? 1 : 0)) {
      this.elements.hashtagSuggestions.innerHTML = '';
      return;
    }
    
    const query = text.slice(lastHashIndex + 1).toLowerCase();
    
    api.getTrendingHashtags().then(response => {
      const matches = response
        .filter(h => h.name.toLowerCase().startsWith(query))
        .slice(0, 5);
      
      this.elements.hashtagSuggestions.innerHTML = matches.map(h => `
        <span class="hashtag-suggestion">#${h.name}</span>
      `).join('');
    });
  }

  async handlePostVideo() {
    const caption = this.elements.captionInput.value.trim();
    if (!caption) {
      this.showToast('Please add a caption', 'error');
      return;
    }
    
    this.elements.postVideoBtn.disabled = true;
    this.elements.postVideoBtn.textContent = 'Posting...';
    
    try {
      const user = auth.getUser();
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          userId: user?.id
        })
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      this.showToast('Video posted successfully!', 'success');
      this.resetUploadForm();
      this.showPage('profile');
      window.location.hash = 'profile';
    } catch (error) {
      this.showToast('Failed to post video', 'error');
    } finally {
      this.elements.postVideoBtn.disabled = false;
      this.elements.postVideoBtn.textContent = 'Post';
    }
  }

  resetUploadForm() {
    this.elements.uploadPreview.src = '';
    this.elements.uploadPreview.style.display = 'none';
    this.elements.uploadPlaceholder.classList.remove('hidden');
    this.elements.captionInput.value = '';
    this.elements.hashtagSuggestions.innerHTML = '';
    this.selectedVideoFile = null;
    this.selectedThumbnailTime = 0;
    
    this.elements.thumbnailSelector.querySelectorAll('.thumbnail-option').forEach(opt => {
      opt.classList.remove('selected');
      opt.style.backgroundImage = '';
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = await auth.login(username, password);
    if (result.success) {
      this.showToast('Welcome back!', 'success');
      this.showPage('home');
      window.location.hash = 'home';
    } else {
      this.showToast(result.error, 'error');
    }
  }

  handleDemoLogin(username) {
    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = '123456';
    this.handleLogin({ preventDefault: () => {} });
  }

  async handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const displayName = document.getElementById('signupDisplayName').value;
    
    const result = await auth.signup(username, email, password, displayName);
    if (result.success) {
      this.showToast('Account created!', 'success');
      this.showPage('home');
      window.location.hash = 'home';
    } else {
      this.showToast(result.error, 'error');
    }
  }

  handleLogout() {
    auth.logout();
    this.showToast('Logged out', 'info');
    this.showPage('home');
    window.location.hash = 'home';
  }

  updateAuthUI(user) {
    if (user) {
      this.elements.topAvatar.textContent = user.displayName?.charAt(0) || user.username?.charAt(0) || 'U';
      this.elements.loginPage.classList.add('hidden');
      this.elements.signupPage.classList.add('hidden');
      this.elements.uploadPage.classList.remove('hidden');
      this.elements.profilePage.classList.remove('hidden');
      
      // Show protected nav items
      document.querySelectorAll('[data-page="upload"], [data-page="profile"], [data-page="inbox"]').forEach(el => {
        el.style.display = '';
      });
    } else {
      this.elements.topAvatar.textContent = 'U';
      this.elements.uploadPage.classList.add('hidden');
      this.elements.profilePage.classList.add('hidden');
      
      // Hide protected nav items (but keep them in DOM for layout)
      document.querySelectorAll('[data-page="upload"], [data-page="profile"], [data-page="inbox"]').forEach(el => {
        if (el.tagName === 'A') el.style.display = 'none';
        if (el.tagName === 'BUTTON') el.style.display = 'none';
      });
    }
  }

  async loadTrendingHashtags() {
    try {
      const hashtags = await api.getTrendingHashtags();
      this.elements.trendingHashtags.innerHTML = hashtags.map(h => `
        <div class="hashtag-item" data-hashtag="${h.name}">
          <div class="hashtag-info">
            <span class="hashtag-name">#${h.name}</span>
            <span class="hashtag-count">${this.formatCount(h.count)} posts</span>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Failed to load hashtags:', error);
    }
  }

  async handleSearch(query) {
    if (!query.trim()) {
      this.elements.searchResults.classList.add('hidden');
      return;
    }
    
    try {
      const results = await api.search(query);
      this.elements.searchResults.classList.remove('hidden');
      this.renderSearchResults(results, 'users');
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  switchResultTab(type) {
    this.elements.resultTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.type === type);
    });
    this.renderSearchResults(this.lastSearchResults, type);
  }

  renderSearchResults(results, type) {
    this.lastSearchResults = results;
    
    let html = '';
    if (type === 'users') {
      html = (results.users || []).map(user => `
        <div class="search-result-item" data-user-id="${user.id}">
          <div class="search-result-avatar">${user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}</div>
          <div class="search-result-info">
            <span class="search-result-name">${user.displayName || user.username}</span>
            <span class="search-result-username">@${user.username}</span>
          </div>
        </div>
      `).join('');
    } else if (type === 'videos') {
      html = (results.videos || []).map(video => `
        <div class="search-result-item" data-video-id="${video.id}">
          <div class="search-result-thumb" style="background-image: url(${video.thumbnail})"></div>
          <div class="search-result-info">
            <span class="search-result-caption">${video.caption.slice(0, 50)}...</span>
            <span class="search-result-username">@${video.user?.username || 'user'}</span>
          </div>
        </div>
      `).join('');
    } else if (type === 'hashtags') {
      html = (results.hashtags || []).map(h => `
        <div class="search-result-item" data-hashtag="${h.name}">
          <div class="search-result-info">
            <span class="search-result-name">#${h.name}</span>
            <span class="search-result-count">${this.formatCount(h.count)} posts</span>
          </div>
        </div>
      `).join('');
    }
    
    this.elements.resultsContent.innerHTML = html || '<p class="no-results">No results found</p>';
  }

  async loadConversations() {
    const user = auth.getUser();
    if (!user) return;
    
    try {
      const conversations = await api.getMessages(user.id);
      this.renderConversations(conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  renderConversations(conversations) {
    this.elements.conversationsList.innerHTML = conversations.map(conv => `
      <div class="conversation-item ${conv.unreadCount > 0 ? 'unread' : ''}" data-user-id="${conv.user.id}">
        <div class="conversation-avatar">${conv.user.displayName?.charAt(0) || conv.user.username?.charAt(0) || 'U'}</div>
        <div class="conversation-info">
          <div class="conversation-name">${conv.user.displayName || conv.user.username}</div>
          <div class="conversation-preview">
            ${conv.lastMessage ? `
              <span>${conv.lastMessage.fromUserId === auth.getUser()?.id ? 'You: ' : ''}${conv.lastMessage.text}</span>
              <span class="conversation-time">${this.formatTime(conv.lastMessage.createdAt)}</span>
            ` : ''}
          </div>
        </div>
        ${conv.unreadCount > 0 ? `<span class="unread-badge">${conv.unreadCount}</span>` : ''}
      </div>
    `).join('');
  }

  openChat(e) {
    const item = e.target.closest('.conversation-item');
    if (!item) return;
    
    const userId = item.dataset.userId;
    const user = auth.getUser();
    const conversations = this.elements.conversationsList.querySelectorAll('.conversation-item');
    
    conversations.forEach(c => c.classList.remove('active'));
    item.classList.add('active');
    
    this.elements.conversationsList.style.display = 'none';
    this.elements.chatView.classList.remove('hidden');
    
    const otherUser = Array.from(conversations).find(c => c.dataset.userId === userId);
    // Load messages for this conversation
    this.loadMessages(userId);
  }

  showInboxList() {
    this.elements.conversationsList.style.display = 'block';
    this.elements.chatView.classList.add('hidden');
    this.elements.conversationsList.querySelectorAll('.conversation-item').forEach(c => c.classList.remove('active'));
  }

  async loadMessages(otherUserId) {
    // Mock implementation
    this.elements.chatUserInfo.innerHTML = `
      <div class="chat-user-name">User ${otherUserId}</div>
      <div class="chat-user-status">Active now</div>
    `;
    
    this.elements.messagesContainer.innerHTML = `
      <div class="message">
        <div class="message-avatar">U</div>
        <div class="message-content">
          <div class="message-text">Hey! Love your content!</div>
          <div class="message-time">10:00 AM</div>
        </div>
      </div>
      <div class="message own">
        <div class="message-content">
          <div class="message-text">Thanks! Means a lot 😊</div>
          <div class="message-time">10:05 AM</div>
        </div>
        <div class="message-avatar">${auth.getUser()?.displayName?.charAt(0) || 'U'}</div>
      </div>
    `;
  }

  async handleSendMessage() {
    const text = this.elements.messageInput.value.trim();
    if (!text) return;
    
    this.elements.messageInput.value = '';
    
    const messageEl = document.createElement('div');
    messageEl.className = 'message own';
    messageEl.innerHTML = `
      <div class="message-content">
        <div class="message-text">${text}</div>
        <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      </div>
      <div class="message-avatar">${auth.getUser()?.displayName?.charAt(0) || 'U'}</div>
    `;
    
    this.elements.messagesContainer.appendChild(messageEl);
    this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
  }

  async loadProfile() {
    const user = auth.getUser();
    if (!user) {
      this.showPage('login');
      return;
    }
    
    this.elements.profileAvatar.textContent = user.displayName?.charAt(0) || user.username?.charAt(0) || 'U';
    this.elements.profileName.textContent = user.displayName || user.username;
    this.elements.profileBio.textContent = user.bio || 'No bio yet';
    
    this.elements.profileStats.innerHTML = `
      <div class="profile-stat">
        <span class="profile-stat-value">${this.formatCount(user.followers)}</span>
        <span class="profile-stat-label">Followers</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-value">${this.formatCount(user.following)}</span>
        <span class="profile-stat-label">Following</span>
      </div>
      <div class="profile-stat">
        <span class="profile-stat-value">${this.formatCount(user.likes)}</span>
        <span class="profile-stat-label">Likes</span>
      </div>
    `;
    
    this.loadProfileVideos(user.id);
  }

  async loadProfileVideos(userId) {
    try {
      const videos = await api.getUserVideos(userId);
      this.renderProfileVideoGrid(videos);
    } catch (error) {
      console.error('Failed to load profile videos:', error);
    }
  }

  renderProfileVideoGrid(videos) {
    this.elements.profileVideoGrid.innerHTML = videos.map(video => `
      <div class="video-grid-item" data-video-id="${video.id}">
        <video src="${video.videoUrl}" muted loop playsinline preload="metadata" poster="${video.thumbnail}"></video>
        <div class="video-grid-overlay">
          <div class="video-grid-stats">
            <div class="video-grid-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>${this.formatCount(video.likes)}</span>
            </div>
            <div class="video-grid-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>${this.formatCount(video.comments)}</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    this.setupProfileVideoPlayers();
  }

  setupProfileVideoPlayers() {
    const videos = this.elements.profileVideoGrid.querySelectorAll('video');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.5 });
    
    videos.forEach(video => observer.observe(video));
  }

  switchProfileTab(tab) {
    this.elements.profileTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    
    const user = auth.getUser();
    if (!user) return;
    
    if (tab === 'videos') {
      this.loadProfileVideos(user.id);
    } else if (tab === 'likes') {
      this.loadLikedVideos(user.id);
    }
  }

  async loadLikedVideos(userId) {
    try {
      const db = await fetch('/api/videos').then(r => r.json());
      const likedVideos = db.videos.filter(v => v.likedByCurrentUser);
      this.renderProfileVideoGrid(likedVideos);
    } catch (error) {
      console.error('Failed to load liked videos:', error);
      this.elements.profileVideoGrid.innerHTML = '<p class="no-content">No liked videos yet</p>';
    }
  }

  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    
    return date.toLocaleDateString();
  }

  toggleLoading(loading) {
    this.elements.loadingIndicator.classList.toggle('visible', loading);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-message">${message}</span>
      <button class="toast-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    
    this.toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  updateVideoCard(videoId) {
    const card = this.elements.videoFeed.querySelector(`[data-video-id="${videoId}"]`);
    if (!card) return;
    
    const video = feed.getVideos().find(v => v.id === videoId);
    if (!video) return;
    
    const likeBtn = card.querySelector('.like-btn');
    const countEl = likeBtn.querySelector('.count');
    countEl.textContent = this.formatCount(video.likes);
  }

  handleResize() {
    // Handle responsive adjustments
  }
}

const ui = new UIManager();

export default ui;