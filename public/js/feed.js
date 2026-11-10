import api from './api.js';
import auth from './auth.js';

class FeedManager {
  constructor() {
    this.videos = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.loading = false;
    this.currentVideoIndex = 0;
    this.videoElements = new Map();
    this.observers = new Set();
    this.preloadCache = new Map();
    this.maxPreload = 3;
  }

  async loadVideos(page = 1, append = false) {
    if (this.loading) return;
    this.loading = true;
    this.notifyLoading(true);

    try {
      const response = await api.getVideos(page, 10);
      
      if (append) {
        this.videos = [...this.videos, ...response.videos];
      } else {
        this.videos = response.videos;
        this.currentPage = 1;
      }
      
      this.currentPage = response.page;
      this.hasMore = response.hasMore;
      this.notifyVideosChanged();
      
      // Preload next videos
      if (append) {
        this.preloadNextVideos();
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
      this.notifyError('Failed to load videos');
    } finally {
      this.loading = false;
      this.notifyLoading(false);
    }
  }

  preloadNextVideos() {
    const currentIndex = this.currentVideoIndex;
    const videosToPreload = this.videos.slice(currentIndex + 1, currentIndex + 1 + this.maxPreload);
    
    videosToPreload.forEach((video, offset) => {
      if (!this.preloadCache.has(video.id)) {
        const videoEl = document.createElement('video');
        videoEl.src = video.videoUrl;
        videoEl.preload = 'metadata';
        videoEl.muted = true;
        videoEl.playsInline = true;
        this.preloadCache.set(video.id, videoEl);
      }
    });
  }

  getPreloadedVideo(videoId) {
    return this.preloadCache.get(videoId);
  }

  async loadMore() {
    if (!this.hasMore || this.loading) return;
    await this.loadVideos(this.currentPage + 1, true);
  }

  getVideos() {
    return this.videos;
  }

  getVideo(index) {
    return this.videos[index];
  }

  getCurrentVideo() {
    return this.videos[this.currentVideoIndex];
  }

  setCurrentIndex(index) {
    this.currentVideoIndex = Math.max(0, Math.min(index, this.videos.length - 1));
  }

  nextVideo() {
    if (this.currentVideoIndex < this.videos.length - 1) {
      this.currentVideoIndex++;
      return true;
    }
    return false;
  }

  prevVideo() {
    if (this.currentVideoIndex > 0) {
      this.currentVideoIndex--;
      return true;
    }
    return false;
  }

  async likeVideo(videoId) {
    const video = this.videos.find(v => v.id === videoId);
    if (!video) return;

    const wasLiked = video.likedByCurrentUser;
    video.likedByCurrentUser = !wasLiked;
    video.likes += wasLiked ? -1 : 1;

    try {
      await api.likeVideo(videoId);
    } catch (error) {
      video.likedByCurrentUser = wasLiked;
      video.likes += wasLiked ? 1 : -1;
      throw error;
    }

    this.notifyVideoUpdate(videoId);
  }

  registerVideoElement(index, element) {
    this.videoElements.set(index, element);
  }

  unregisterVideoElement(index) {
    this.videoElements.delete(index);
  }

  getVideoElement(index) {
    return this.videoElements.get(index);
  }

  playVideo(index) {
    const element = this.videoElements.get(index);
    if (element?.video) {
      element.video.play().catch(() => {});
    }
  }

  pauseVideo(index) {
    const element = this.videoElements.get(index);
    if (element?.video) {
      element.video.pause();
    }
  }

  pauseAllVideos() {
    this.videoElements.forEach(({ video }) => {
      if (video) video.pause();
    });
  }

  subscribe(observer) {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  notifyVideosChanged() {
    this.observers.forEach(obs => obs.onVideosChanged?.(this.videos));
  }

  notifyVideoUpdate(videoId) {
    this.observers.forEach(obs => obs.onVideoUpdate?.(videoId));
  }

  notifyLoading(loading) {
    this.observers.forEach(obs => obs.onLoadingChanged?.(loading));
  }

  notifyError(message) {
    this.observers.forEach(obs => obs.onError?.(message));
  }
}

const feed = new FeedManager();

export default feed;