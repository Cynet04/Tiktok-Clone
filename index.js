const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Mock video URLs for demo
const MOCK_VIDEOS = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
];

let mockVideoIndex = 0;

function getNextMockVideo() {
  const video = MOCK_VIDEOS[mockVideoIndex % MOCK_VIDEOS.length];
  mockVideoIndex++;
  return video;
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/videos', (req, res) => {
  const db = readDB();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  const videos = db.videos.slice(start, end).map(video => {
    const user = db.users.find(u => u.id === video.userId);
    return { ...video, user };
  });
  res.json({
    videos,
    page,
    limit,
    total: db.videos.length,
    hasMore: end < db.videos.length
  });
});

app.get('/api/videos/:id', (req, res) => {
  const db = readDB();
  const video = db.videos.find(v => v.id === req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }
  const user = db.users.find(u => u.id === video.userId);
  const comments = db.comments.filter(c => c.videoId === video.id).map(c => {
    const commentUser = db.users.find(u => u.id === c.userId);
    return { ...c, user: commentUser };
  });
  res.json({ ...video, user, comments });
});

app.post('/api/videos', (req, res) => {
  const db = readDB();
  const user = req.body.userId || '1';
  const caption = req.body.caption || '';
  const hashtags = caption.match(/#(\w+)/g)?.map(h => h.slice(1)) || [];
  const mentions = caption.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
  
  // Use a mock video URL for demo
  const videoUrl = getNextMockVideo();
  const thumbnail = `https://picsum.photos/seed/video${Date.now()}/400/700`;
  
  const newVideo = {
    id: String(Date.now()),
    userId: user,
    videoUrl,
    thumbnail,
    caption,
    hashtags,
    mentions,
    music: 'Original Sound',
    likes: 0,
    comments: 0,
    shares: 0,
    createdAt: new Date().toISOString()
  };
  
  db.videos.unshift(newVideo);
  writeDB(db);
  
  // Add video to user's stats
  const userObj = db.users.find(u => u.id === user);
  if (userObj) {
    userObj.likes = (userObj.likes || 0) + 0; // placeholder
  }
  
  res.status(201).json({ ...newVideo, user: userObj });
});

app.post('/api/videos/:id/like', (req, res) => {
  const db = readDB();
  const video = db.videos.find(v => v.id === req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }
  video.likes += 1;
  writeDB(db);
  res.json({ likes: video.likes });
});

app.get('/api/users/:id', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const videos = db.videos.filter(v => v.userId === user.id);
  res.json({ ...user, videos });
});

app.get('/api/users/:id/videos', (req, res) => {
  const db = readDB();
  const videos = db.videos.filter(v => v.userId === req.params.id);
  res.json(videos);
});

app.get('/api/hashtags/trending', (req, res) => {
  const db = readDB();
  res.json(db.hashtags);
});

app.get('/api/search', (req, res) => {
  const db = readDB();
  const query = req.query.q?.toLowerCase() || '';
  const users = db.users.filter(u => 
    u.username.toLowerCase().includes(query) || 
    u.displayName.toLowerCase().includes(query)
  );
  const videos = db.videos.filter(v => 
    v.caption.toLowerCase().includes(query) ||
    v.hashtags.some(h => h.toLowerCase().includes(query))
  ).map(video => {
    const user = db.users.find(u => u.id === video.userId);
    return { ...video, user };
  });
  const hashtags = db.hashtags.filter(h => h.name.toLowerCase().includes(query));
  res.json({ users, videos, hashtags });
});

app.get('/api/messages', (req, res) => {
  const db = readDB();
  const currentUserId = req.query.userId || '1';
  const conversations = {};
  
  db.messages.forEach(msg => {
    const otherId = msg.fromUserId === currentUserId ? msg.toUserId : msg.fromUserId;
    if (!conversations[otherId]) {
      const otherUser = db.users.find(u => u.id === otherId);
      conversations[otherId] = {
        user: otherUser,
        messages: [],
        unreadCount: 0
      };
    }
    conversations[otherId].messages.push(msg);
    if (msg.toUserId === currentUserId && !msg.read) {
      conversations[otherId].unreadCount++;
    }
  });
  
  Object.values(conversations).forEach(conv => {
    conv.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    conv.lastMessage = conv.messages[conv.messages.length - 1];
  });
  
  res.json(Object.values(conversations));
});

app.post('/api/messages', (req, res) => {
  const db = readDB();
  const newMessage = {
    id: String(Date.now()),
    ...req.body,
    read: false,
    createdAt: new Date().toISOString()
  };
  db.messages.push(newMessage);
  writeDB(db);
  res.status(201).json(newMessage);
});

app.put('/api/messages/:id/read', (req, res) => {
  const db = readDB();
  const message = db.messages.find(m => m.id === req.params.id);
  if (message) {
    message.read = true;
    writeDB(db);
  }
  res.json({ success: true });
});

// Draft saving endpoint
app.post('/api/drafts', (req, res) => {
  const db = readDB();
  if (!db.drafts) db.drafts = [];
  
  const draft = {
    id: String(Date.now()),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  db.drafts.unshift(draft);
  writeDB(db);
  res.status(201).json(draft);
});

app.get('/api/drafts', (req, res) => {
  const db = readDB();
  const userId = req.query.userId || '1';
  const drafts = (db.drafts || []).filter(d => d.userId === userId);
  res.json(drafts);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});