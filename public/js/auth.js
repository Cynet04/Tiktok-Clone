const AUTH_KEY = 'tiktok_clone_auth';
const USER_KEY = 'tiktok_clone_user';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.listeners = new Set();
  }

  getUser() {
    if (this.currentUser) return this.currentUser;
    
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
    }
    return null;
  }

  setUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(AUTH_KEY);
    }
    this.notifyListeners();
  }

  isAuthenticated() {
    return !!this.getUser();
  }

  async login(username, password) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const users = [
      { id: '1', username: 'tiktokuser', password: '123456', displayName: 'TikTok User' },
      { id: '2', username: 'dancestar', password: '123456', displayName: 'Dance Star' },
      { id: '3', username: 'comedyking', password: '123456', displayName: 'Comedy King' }
    ];
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      this.setUser(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid username or password' };
  }

  async signup(username, email, password, displayName) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existingUsers = JSON.parse(localStorage.getItem('tiktok_clone_users') || '[]');
    
    if (existingUsers.some(u => u.username === username)) {
      return { success: false, error: 'Username already taken' };
    }
    
    if (existingUsers.some(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    const newUser = {
      id: String(Date.now()),
      username,
      email,
      displayName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: '',
      followers: 0,
      following: 0,
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    existingUsers.push({ ...newUser, password });
    localStorage.setItem('tiktok_clone_users', JSON.stringify(existingUsers));
    
    this.setUser(newUser);
    return { success: true, user: newUser };
  }

  logout() {
    this.setUser(null);
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  updateProfile(updates) {
    if (!this.currentUser) return;
    this.currentUser = { ...this.currentUser, ...updates };
    localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
    this.notifyListeners();
  }
}

const auth = new AuthManager();

export default auth;